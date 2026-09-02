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
    assert.match(promptSource, /Whenever possible, finish with one tiny/);
    assert.match(promptSource, /Pista:/);
    assert.match(promptSource, /¡Ojo!/);
    assert.match(promptSource, /Práctica rápida:/);
    assert.match(promptSource, /try rx, then undo with u/);
  });

  it("renders markdown responses through the CLI", () => {
    assert.match(cliSource, /renderMarkdown/);
    assert.match(cliSource, /Markdown renderer failed smoke test/);
  });

  it("decorates both conversation participants", () => {
    assert.match(decoratorsSource, /👤 nos\(otros\) ❯/);
    assert.match(decoratorsSource, /🧭 VIMo\(nos\) ❯/);
    assert.match(cliSource, /userPrompt/);
    assert.match(cliSource, /vimoHeading/);
  });

  it("defaults to fast inference with low reasoning", () => {
    assert.match(cliSource, /openai-codex\/gpt-5\.4-mini/);
    assert.match(cliSource, /VIMO_MODEL/);
    assert.match(cliSource, /VIMO_THINKING/);
    assert.match(cliSource, /\?\? "low"/);
  });

  it("reports empty responses and model errors", () => {
    assert.match(cliSource, /session\.agent\.state\.errorMessage/);
    assert.match(cliSource, /No response was returned/);
  });
});
