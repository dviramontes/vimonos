import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const promptSource = readFileSync(new URL("../src/vimoPrompt.ts", import.meta.url), "utf8");
const cliSource = readFileSync(new URL("../src/vimo.ts", import.meta.url), "utf8");
const decoratorsSource = readFileSync(new URL("../src/decorators.ts", import.meta.url), "utf8");

describe("VIMo prompt", () => {
  it("targets Zed Vim mode", () => {
    assert.match(promptSource, /Zed editor/);
    assert.match(promptSource, /Vim mode/);
  });

  it("requires conversational, safe Vim tutoring", () => {
    assert.match(promptSource, /conversational Vim tutor/);
    assert.match(promptSource, /small number of related commands/);
    assert.match(promptSource, /potentially destructive commands/);
  });

  it("renders markdown responses through the CLI", () => {
    assert.match(cliSource, /renderMarkdown/);
    assert.match(cliSource, /Markdown renderer failed smoke test/);
  });

  it("decorates both conversation participants", () => {
    assert.match(decoratorsSource, /👤 You  ❯/);
    assert.match(decoratorsSource, /🧭 VIMo ❯/);
    assert.match(cliSource, /userPrompt/);
    assert.match(cliSource, /vimoHeading/);
  });
});
