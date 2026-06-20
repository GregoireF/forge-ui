export type PlaygroundName = "react" | "vue" | "nuxt";
export type Status = "starting" | "ready" | "error";
export type LogFilter = "all" | PlaygroundName | "errors";

export interface PlaygroundMeta {
  readonly name: PlaygroundName;
  readonly label: string;
  readonly port: number;
  readonly cwd: string;
  readonly color: string;
}

export interface PlaygroundState {
  status: Status;
  readyMs?: number;
  url?: string;
}

export interface LogLine {
  readonly id: number;
  readonly source: PlaygroundName;
  readonly text: string;
  readonly isError: boolean;
  readonly isHmr: boolean;
  readonly ts: number;
}
