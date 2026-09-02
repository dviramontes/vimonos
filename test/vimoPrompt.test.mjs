import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const promptSource = readFileSync(new URL("../src/vimoPrompt.ts", import.meta.url), "utf8");

describe("Vimo prompt", () => {
  it("targets Zed Vim mode", () => {
    assert.match(promptSource, /Zed editor/);
    assert.match(promptSource, /Vim mode/);
  });

  it("requires conversational, safe Vim tutoring", () => {
    assert.match(promptSource, /conversational Vim tutor/);
    assert.match(promptSource, /small number of related commands/);
    assert.match(promptSource, /potentially destructive commands/);
  });
});
