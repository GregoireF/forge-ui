import path from "node:path";
import { useEffect, useRef, useState } from "react";
import type { LogLine, PlaygroundMeta, PlaygroundName, PlaygroundState } from "./types.js";

const ROOT = process.cwd();

export const PLAYGROUNDS: readonly PlaygroundMeta[] = [
  { name: "react", label: "React", port: 3000, cwd: path.join(ROOT, "apps/playground-react"), color: "cyan"    },
  { name: "vue",   label: "Vue",   port: 3001, cwd: path.join(ROOT, "apps/playground-vue"),   color: "green"   },
  { name: "nuxt",  label: "Nuxt",  port: 3002, cwd: path.join(ROOT, "apps/playground-nuxt"),  color: "magenta" },
] as const;

const RESTART_KEY: Record<PlaygroundName, string> = { react: "R", vue: "V", nuxt: "N" };

// ── Port cleanup ─────────────────────────────────────────────────────────────
export function killPorts(ports: readonly number[]): void {
  if (process.platform !== "win32") {
    for (const port of ports) {
      try { Bun.spawnSync(["fuser", "-k", `${port}/tcp`], { stdout: "pipe", stderr: "pipe" }); } catch {}
    }
    return;
  }
  try {
    const result = Bun.spawnSync(["netstat", "-ano"], { stdout: "pipe", stderr: "pipe" });
    const lines = new TextDecoder().decode(result.stdout).split(/\r?\n/);
    const wanted = new Set(ports.map(p => `:${p}`));
    const pids = new Set<string>();
    for (const line of lines) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const addr = parts[1] ?? "";
      const colonPort = addr.slice(addr.lastIndexOf(":"));
      if (!wanted.has(colonPort)) continue;
      const pid = parts.at(-1);
      if (pid && /^\d+$/.test(pid) && pid !== "0") pids.add(pid);
    }
    for (const pid of pids) {
      Bun.spawnSync(["taskkill", "/F", "/PID", pid], { stdout: "pipe", stderr: "pipe" });
    }
  } catch {}
}

const ANSI_RE = /\x1b\[[0-9;]*[A-Za-z]|\x1b[^[]/g;
const strip = (s: string) => s.replace(ANSI_RE, "").replace(/\r/g, "").trim();

// ── Signal detection ──────────────────────────────────────────────────────────
const READY_RE = /ready in \d+|Nitro server built in \d+|Listening on http/i;
const URL_RE   = /Local:?\s+(http:\/\/localhost:\d+\/?)/i;
const HMR_RE   = /\[vite\]\s+(hmr update|page reload|full reload)/i;
const ERROR_RE = /\b(EADDRINUSE|Build failed|Failed to compile)\b/;

// ── Noise filter ──────────────────────────────────────────────────────────────
const NOISE_RE = new RegExp(
  [
    "use --host to expose",
    "press h \\+ enter",
    "Local:\\s+http",
    "Vite (client|server) (built|warmed).*in \\d+",
    "DevTools: press Shift",
  ].join("|"),
  "i",
);

const BUN_ECHO_RE = /^\$\s/;

const MAX_LOGS = 2000;
const TRIM_TO  = 1800;
let uid = 0;

function syntheticLog(source: PlaygroundName, text: string): LogLine {
  return { id: ++uid, source, text, isError: true, isHmr: false, ts: Date.now() };
}

export function useProcesses() {
  const [states, setStates] = useState<Record<PlaygroundName, PlaygroundState>>({
    react: { status: "starting" },
    vue:   { status: "starting" },
    nuxt:  { status: "starting" },
  });
  const [logs, setLogs] = useState<LogLine[]>([]);
  const t0              = useRef<Record<string, number>>({});
  const procMap         = useRef<Partial<Record<PlaygroundName, ReturnType<typeof Bun.spawn>>>>({});
  const restartRef      = useRef<(name: PlaygroundName) => void>(() => {});
  // Tracks intentional kills (manual restart) so exit handler doesn't auto-restart
  const intentionalKill = useRef<Set<PlaygroundName>>(new Set());
  // Tracks last crash time per playground to detect crash loops
  const crashTime       = useRef<Partial<Record<PlaygroundName, number>>>({});

  useEffect(() => {
    let mounted = true;

    // ── Helpers ───────────────────────────────────────────────────────────────
    const markReady = (name: PlaygroundName) =>
      setStates(prev => ({
        ...prev,
        [name]: { ...prev[name], status: "ready", readyMs: Date.now() - (t0.current[name] ?? 0) },
      }));

    const markUrl = (name: PlaygroundName, url: string) =>
      setStates(prev => ({ ...prev, [name]: { ...prev[name], url } }));

    const markError = (name: PlaygroundName) =>
      setStates(prev => ({ ...prev, [name]: { ...prev[name], status: "error" } }));

    async function drain(stream: ReadableStream<Uint8Array>, name: PlaygroundName, isErr: boolean) {
      const reader = stream.getReader();
      const dec = new TextDecoder();
      let buf = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const parts = buf.split("\n");
          buf = parts.pop() ?? "";

          const batch: LogLine[] = [];
          for (const raw of parts) {
            const text = strip(raw);
            if (!text || text.length <= 1 || BUN_ECHO_RE.test(text)) continue;

            // URL match → capture + secondary ready signal (robust vs READY_RE format changes)
            const urlMatch = URL_RE.exec(text);
            if (urlMatch) {
              markUrl(name, urlMatch[1]);
              markReady(name);
            }

            if (NOISE_RE.test(text)) continue;

            const isHmr   = HMR_RE.test(text);
            const isError = isErr && ERROR_RE.test(text);

            batch.push({ id: ++uid, source: name, text, isError, isHmr, ts: Date.now() });

            if (READY_RE.test(text)) markReady(name);
            if (isError) markError(name);
          }

          if (batch.length) {
            setLogs(prev => {
              const base = prev.length + batch.length > MAX_LOGS ? prev.slice(-TRIM_TO) : prev;
              return [...base, ...batch];
            });
          }
        }
      } catch { /* process killed */ }
    }

    function spawnOne(name: PlaygroundName) {
      const pg = PLAYGROUNDS.find(p => p.name === name)!;
      t0.current[name] = Date.now();
      const proc = Bun.spawn(["bun", "run", "dev"], {
        cwd: pg.cwd,
        stdout: "pipe",
        stderr: "pipe",
        env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
      });
      procMap.current[name] = proc;
      drain(proc.stdout, name, false);
      drain(proc.stderr, name, true);

      // ── Crash detection ───────────────────────────────────────────────────
      proc.exited.then(code => {
        if (!mounted) return;
        // Intentional kill (manual restart via R/V/N) — skip auto-restart
        if (intentionalKill.current.has(name)) {
          intentionalKill.current.delete(name);
          return;
        }
        const now  = Date.now();
        const last = crashTime.current[name] ?? 0;
        crashTime.current[name] = now;

        markError(name);

        const isCrashLoop = now - last < 5000;
        const msg = isCrashLoop
          ? `● exited (code ${code ?? "?"}) — crash loop detected, press ${RESTART_KEY[name]} to restart manually`
          : `● exited (code ${code ?? "?"}) — restarting in 2s…`;

        setLogs(prev => [...prev, syntheticLog(name, msg)]);

        if (!isCrashLoop) {
          setTimeout(() => {
            if (!mounted) return;
            setStates(prev => ({ ...prev, [name]: { status: "starting" } }));
            setLogs(prev => prev.filter(l => l.source !== name || l.text.startsWith("●")));
            spawnOne(name);
          }, 2000);
        }
      });
    }

    // Expose restart to App — marks kill as intentional to suppress auto-restart
    restartRef.current = (name: PlaygroundName) => {
      const pg = PLAYGROUNDS.find(p => p.name === name)!;
      const existing = procMap.current[name];
      if (existing) {
        intentionalKill.current.add(name);
        try { existing.kill(); } catch {}
      }
      killPorts([pg.port]);
      setStates(prev => ({ ...prev, [name]: { status: "starting" } }));
      setLogs(prev => prev.filter(l => l.source !== name));
      spawnOne(name);
    };

    for (const pg of PLAYGROUNDS) spawnOne(pg.name);

    return () => {
      mounted = false;
      for (const proc of Object.values(procMap.current)) {
        if (proc) try { proc.kill(); } catch {}
      }
    };
  }, []);

  const restart   = (name: PlaygroundName) => restartRef.current(name);
  const clearLogs = () => setLogs([]);

  return { states, logs, restart, clearLogs };
}
