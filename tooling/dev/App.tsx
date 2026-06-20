import React, { useEffect, useMemo, useState } from "react";
import { Box, Text, useApp, useInput, useStdout } from "ink";
import type { LogFilter, LogLine, PlaygroundMeta, PlaygroundState } from "./types.js";
import { PLAYGROUNDS, useProcesses } from "./use-processes.js";

// ─── Git branch ──────────────────────────────────────────────────────────────

function readGitBranch(): string {
  try {
    const proc = Bun.spawnSync(["git", "rev-parse", "--abbrev-ref", "HEAD"], {
      stdout: "pipe", stderr: "pipe",
    });
    const b = new TextDecoder().decode(proc.stdout).trim();
    return b && b !== "HEAD" ? b : "";
  } catch { return ""; }
}

const GIT_BRANCH = readGitBranch();

// ─── Spinner ─────────────────────────────────────────────────────────────────

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;

function useSpinner() {
  const [f, setF] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setF(n => (n + 1) % FRAMES.length), 80);
    return () => clearInterval(id);
  }, []);
  return FRAMES[f];
}

// ─── Status card ─────────────────────────────────────────────────────────────

function StatusCard({
  meta, state, spinner, errorCount,
}: {
  meta: PlaygroundMeta; state: PlaygroundState; spinner: string; errorCount: number;
}) {
  const { status, readyMs, url } = state;
  const time = readyMs == null ? "" : readyMs < 1000 ? `${readyMs}ms` : `${(readyMs / 1000).toFixed(1)}s`;
  const hasError = errorCount > 0 || status === "error";

  const dot =
    status === "starting" ? <Text color="yellow">{spinner}</Text> :
    hasError              ? <Text color="red">●</Text> :
                            <Text color="green">●</Text>;

  return (
    <Box flexGrow={1} justifyContent="center" gap={1}>
      {dot}
      <Text color={meta.color as Parameters<typeof Text>[0]["color"]} bold>{meta.label}</Text>
      <Text dimColor>{url ?? `:${meta.port}`}</Text>
      {time ? <Text dimColor>{time}</Text> : null}
      {hasError && errorCount > 0 ? <Text color="red" dimColor>({errorCount})</Text> : null}
    </Box>
  );
}

// ─── Log row ─────────────────────────────────────────────────────────────────

function LogRow({ log, textWidth }: { log: LogLine; textWidth: number }) {
  const meta = PLAYGROUNDS.find(p => p.name === log.source)!;
  const textColor = log.isError ? "red" : log.isHmr ? "yellow" : undefined;
  const ts = new Date(log.ts).toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  return (
    <Box>
      <Box width={9}><Text dimColor>{ts}</Text></Box>
      <Box width={8}>
        <Text color={meta.color as Parameters<typeof Text>[0]["color"]} dimColor>
          {log.source}
        </Text>
      </Box>
      {/* Fixed width + wrap so long error paths are never silently cut */}
      <Box width={textWidth}>
        <Text color={textColor} wrap="wrap">{log.text}</Text>
      </Box>
    </Box>
  );
}

// ─── Filter tab ──────────────────────────────────────────────────────────────

function FilterTab({ label, active, error }: { label: string; active: boolean; error?: boolean }) {
  const bg = active ? (error ? "red" : "blue") : undefined;
  const fg = active ? "white" : error ? "red" : "gray";
  return <Text bold={active} color={fg} backgroundColor={bg}>{label}</Text>;
}

// ─── App ─────────────────────────────────────────────────────────────────────

export function App() {
  const { exit }   = useApp();
  const { stdout } = useStdout();
  const [filter, setFilter]             = useState<LogFilter>("all");
  const [scrollOffset, setScrollOffset] = useState(0);
  const [searchMode, setSearchMode]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const spinner = useSpinner();
  const { states, logs, restart, clearLogs } = useProcesses();

  // Per-playground error counts derived from logs
  const errorsByPlayground = useMemo(() => {
    const counts: Record<string, number> = { react: 0, vue: 0, nuxt: 0 };
    for (const log of logs) { if (log.isError) counts[log.source]++; }
    return counts;
  }, [logs]);

  const errorCount = errorsByPlayground.react + errorsByPlayground.vue + errorsByPlayground.nuxt;

  useEffect(() => {
    if (filter === "errors" && errorCount === 0) setFilter("all");
  }, [filter, errorCount]);

  useEffect(() => { setScrollOffset(0); }, [filter, searchQuery]);

  const cols     = stdout?.columns ?? 80;
  const rows     = stdout?.rows    ?? 24;
  // Chrome: header(1) + div(1) + status(1) + div(1) + tabs(1) + div(1) = 6 rows
  const LOG_ROWS = Math.max(2, rows - 6 - 1);
  const div      = "─".repeat(cols);
  // Available width for log text: cols - paddingX(2) - timestamp(9) - source(8)
  const textWidth = Math.max(20, cols - 2 - 9 - 8);

  const byFilter =
    filter === "all"    ? logs :
    filter === "errors" ? logs.filter(l => l.isError) :
                          logs.filter(l => l.source === filter);

  // Apply search query on top of filter
  const allVisible = searchQuery
    ? byFilter.filter(l => l.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : byFilter;

  const total         = allVisible.length;
  const clampedOffset = Math.min(scrollOffset, Math.max(0, total - LOG_ROWS));
  const endIdx        = total - clampedOffset;
  const startIdx      = Math.max(0, endIdx - LOG_ROWS);
  const visible       = allVisible.slice(startIdx, endIdx);
  const isLive        = clampedOffset === 0;

  useInput((input, key) => {
    // ctrl+c always exits, even in search mode
    if (key.ctrl && input === "c") { exit(); return; }

    // Search mode captures all input
    if (searchMode) {
      if (key.escape)                       { setSearchMode(false); setSearchQuery(""); return; }
      if (key.return)                       { setSearchMode(false); return; }
      if (key.backspace || key.delete)      { setSearchQuery(prev => prev.slice(0, -1)); return; }
      if (input && !key.ctrl && !key.meta)  { setSearchQuery(prev => prev + input); return; }
      return;
    }

    if (input === "q")                  exit();
    // Enter search
    if (input === "/")                  { setSearchMode(true); return; }
    // Clear search (esc outside search mode)
    if (key.escape && searchQuery)      { setSearchQuery(""); return; }
    // Filter
    if (input === "a" || input === "0") setFilter("all");
    if (input === "1")                  setFilter("react");
    if (input === "2")                  setFilter("vue");
    if (input === "3")                  setFilter("nuxt");
    if (input === "e")                  setFilter("errors");
    // Clear logs
    if (input === "c")                  { clearLogs(); setScrollOffset(0); }
    // Scroll — k/j (vim) + arrows
    if (key.upArrow   || input === "k") setScrollOffset(prev => prev + 1);
    if (key.downArrow || input === "j") setScrollOffset(prev => Math.max(0, prev - 1));
    if (key.pageUp)                     setScrollOffset(prev => prev + Math.floor(LOG_ROWS / 2));
    if (key.pageDown)                   setScrollOffset(prev => Math.max(0, prev - Math.floor(LOG_ROWS / 2)));
    if (input === "f")                  setScrollOffset(0);
    // Restart — uppercase avoids AZERTY digit conflicts
    if (input === "R") restart("react");
    if (input === "V") restart("vue");
    if (input === "N") restart("nuxt");
  });

  const FILTERS: { key: LogFilter; label: string; error?: boolean }[] = [
    { key: "all",    label: " all "          },
    { key: "react",  label: " 1 react "      },
    { key: "vue",    label: " 2 vue "        },
    { key: "nuxt",   label: " 3 nuxt "       },
    { key: "errors", label: ` ! ${errorCount} `, error: errorCount > 0 },
  ];

  return (
    <Box flexDirection="column">
      {/* ── Header ── */}
      <Box paddingX={1}>
        <Text bold color="white">◆ </Text>
        <Text bold color="blueBright">forge-ui</Text>
        <Text bold color="white"> dev</Text>
        {GIT_BRANCH ? <Text dimColor>  [{GIT_BRANCH}]</Text> : null}
        <Box flexGrow={1} />
        <Text dimColor>1-3 e · / search · k/j · f live · c clear · R/V/N restart · q</Text>
      </Box>

      <Text dimColor>{div}</Text>

      {/* ── Status row ── */}
      <Box paddingX={1}>
        {PLAYGROUNDS.map((pg, i) => (
          <React.Fragment key={pg.name}>
            <StatusCard
              meta={pg}
              state={states[pg.name]}
              spinner={spinner}
              errorCount={errorsByPlayground[pg.name] ?? 0}
            />
            {i < PLAYGROUNDS.length - 1 && <Text dimColor> │ </Text>}
          </React.Fragment>
        ))}
      </Box>

      <Text dimColor>{div}</Text>

      {/* ── Log filter tabs / search bar ── */}
      <Box paddingX={1} gap={1}>
        {searchMode || searchQuery ? (
          /* Search mode: replace tabs with inline search input */
          <>
            <Text color="yellow">/</Text>
            <Text>{searchQuery}</Text>
            {searchMode && <Text backgroundColor="yellow" color="black"> </Text>}
            <Text dimColor>
              {searchQuery ? `  ${allVisible.length} match${allVisible.length !== 1 ? "es" : ""}` : ""}
              {searchMode  ? "  esc cancel · enter lock" : "  / edit · esc clear"}
            </Text>
          </>
        ) : (
          /* Normal mode: filter tabs */
          <>
            <Text dimColor>logs</Text>
            {FILTERS.map(f => (
              <FilterTab key={f.key} label={f.label} active={filter === f.key} error={f.error} />
            ))}
          </>
        )}
        <Box flexGrow={1} />
        {isLive
          ? <Text color="green" dimColor>● live</Text>
          : <Text color="yellow">⏸ {clampedOffset} lines · j↓ · f live</Text>
        }
      </Box>

      <Text dimColor>{div}</Text>

      {/* ── Log lines ── */}
      <Box flexDirection="column" paddingX={1}>
        {visible.map(log => <LogRow key={log.id} log={log} textWidth={textWidth} />)}
      </Box>
    </Box>
  );
}
