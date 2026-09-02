declare module "marked-terminal" {
  import type { MarkedExtension } from "marked";

  export interface TerminalRendererOptions {
    tab?: number | string;
  }

  export function markedTerminal(options?: TerminalRendererOptions): MarkedExtension;
}
