import { Marked } from "marked";
import { markedTerminal } from "marked-terminal";

const markdownRenderer = new Marked(markedTerminal({
  tab: 2,
}) as never);

export function renderMarkdown(markdown: string): string {
  return markdownRenderer.parse(markdown).toString().trimEnd();
}
