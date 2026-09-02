import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderMarkdown } from "../src/markdown.js";

describe("renderMarkdown", () => {
  it("renders tables instead of returning their markdown source", () => {
    const rendered = renderMarkdown("| Command | Selects |\n|---|---|\n| `viw` | word |", { color: false });

    assert.match(rendered, /[┌┬┐]/);
    assert.match(rendered, /viw/);
    assert.doesNotMatch(rendered, /\|---\|/);
  });

  it("renders fenced code blocks", () => {
    const rendered = renderMarkdown("```js\nconsole.log('hello')\n```", { color: false });

    assert.match(rendered, /console\.log\('hello'\)/);
    assert.doesNotMatch(rendered, /```/);
  });

  it("removes terminal control sequences when color is disabled", () => {
    const rendered = renderMarkdown("| A | B |\n|---|---|\n| x | y |", { color: false });

    assert.doesNotMatch(rendered, /\u001B/);
  });
});
