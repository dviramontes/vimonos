import { stripVTControlCharacters } from "node:util";
import { Marked } from "marked";
import { markedTerminal } from "marked-terminal";

const markdownRenderer = new Marked(markedTerminal({
  tab: 2,
}));

export interface MarkdownRenderOptions {
  color?: boolean;
}

export function renderMarkdown(
  markdown: string,
  { color = Boolean(process.stdout.isTTY) && process.env.NO_COLOR === undefined }: MarkdownRenderOptions = {},
): string {
  const rendered = markdownRenderer.parse(markdown).toString();
  return (color ? rendered : stripVTControlCharacters(rendered)).trimEnd();
}
