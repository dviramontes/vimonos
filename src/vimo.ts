#!/usr/bin/env node
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  createAgentSession,
  DefaultResourceLoader,
  getAgentDir,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";
import { userPrompt, vimoHeading } from "./decorators.js";
import { renderMarkdown } from "./markdown.js";
import { buildWelcomeMessage, VIMO_SYSTEM_PROMPT } from "./vimoPrompt.js";

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function printHelp(): void {
  console.log(`VIMo — conversational Vim tutor for Zed Vim mode

Usage:
  npm run vimo             Start the conversation loop
  npm run vimo -- --help   Show this help
  npm run smoke            Validate local harness wiring without calling a model

Markdown:
  VIMo renders markdown responses in the terminal, including code blocks and tables.

Environment/auth:
  VIMo uses the Pi SDK and your normal Pi model/auth configuration.
  Run \`pi /login\` first, or set a supported provider API key such as ANTHROPIC_API_KEY.
`);
}

async function createVIMoSession() {
  const cwd = process.cwd();
  const agentDir = getAgentDir();
  const settingsManager = SettingsManager.create(cwd, agentDir);

  const loader = new DefaultResourceLoader({
    cwd,
    agentDir,
    settingsManager,
    systemPromptOverride: () => VIMO_SYSTEM_PROMPT,
    appendSystemPromptOverride: () => [],
  });
  await loader.reload();

  return createAgentSession({
    cwd,
    agentDir,
    resourceLoader: loader,
    settingsManager,
    sessionManager: SessionManager.create(cwd),
    // VIMo is a tutor, not a coding agent. Keep Pi's safe read-only built-ins available
    // for future repo/local-note lookup without giving the tutor edit/write/shell powers.
    tools: ["read", "grep", "find", "ls"],
  });
}

async function runSmoke(): Promise<void> {
  if (!VIMO_SYSTEM_PROMPT.includes("Zed editor") || !VIMO_SYSTEM_PROMPT.includes("potentially destructive")) {
    throw new Error("VIMo system prompt is missing required tutoring constraints");
  }
  const rendered = renderMarkdown("| Command | Selects |\n|---|---|\n| `viw` | just `hello` |");
  if (!rendered.includes("viw") || !rendered.includes("hello")) {
    throw new Error("Markdown renderer failed smoke test");
  }
  if (!userPrompt(false).includes("You") || !vimoHeading(false).includes("VIMo")) {
    throw new Error("Conversation decorators failed smoke test");
  }
  console.log("VIMo smoke OK: prompt, markdown, decorators, and CLI wiring loaded.");
}

async function main(): Promise<void> {
  if (hasFlag("--help") || hasFlag("-h")) {
    printHelp();
    return;
  }

  if (hasFlag("--smoke")) {
    await runSmoke();
    return;
  }

  console.log(buildWelcomeMessage());
  console.log("");

  const { session, modelFallbackMessage } = await createVIMoSession();
  if (modelFallbackMessage) console.warn(`Note: ${modelFallbackMessage}`);

  let assistantMarkdown = "";
  session.subscribe((event) => {
    if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
      assistantMarkdown += event.assistantMessageEvent.delta;
    }
  });

  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      const question = (await rl.question(`\n${userPrompt()}`)).trim();
      if (!question) continue;
      if (["exit", "quit", ":q", ":qa"].includes(question.toLowerCase())) break;

      assistantMarkdown = "";
      output.write(`${vimoHeading()} thinking…\n`);
      await session.prompt(question);
      if (assistantMarkdown.trim()) {
        output.write(`${vimoHeading()}\n${renderMarkdown(assistantMarkdown)}\n`);
      }
    }
  } finally {
    rl.close();
    session.dispose();
  }
}

main().catch((error) => {
  console.error(`VIMo error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
