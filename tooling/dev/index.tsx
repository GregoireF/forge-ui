#!/usr/bin/env bun
import React from "react";
import { render } from "ink";
import { App } from "./App.js";
import { killPorts, PLAYGROUNDS } from "./use-processes.js";

if (!process.stdin.isTTY) {
  console.error(
    "\n  forge-ui dev requires an interactive terminal.\n" +
    "  Use bun dev:react / bun dev:vue / bun dev:nuxt for a single playground.\n",
  );
  process.exit(1);
}

// Kill any leftover processes on our ports before React starts.
// Must run synchronously here — Bun.spawnSync inside useEffect crashes React 19
// because blocking the event loop during the commit phase is forbidden.
killPorts(PLAYGROUNDS.map(pg => pg.port));

const { unmount } = render(<App />, {
  exitOnCtrlC: true,
  patchConsole: true,
});

process.on("SIGTERM", unmount);
