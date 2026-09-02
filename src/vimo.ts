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
import { buildWelcomeMessage, VIMO_SYSTEM_PROMPT } from "./vimoPrompt.js";

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function printHelp(): void {
  console.log(`Vimo — conversational Vim tutor for Zed Vim mode

Usage:
  npm run vimo             Start the conversation loop
  npm run vimo -- --help   Show this help
  npm run smoke            Validate local harness wiring without calling a model

Environment/auth:
  Vimo uses the Pi SDK and your normal Pi model/auth configuration.
  Run \`pi /login\` first, or set a supported provider API key such as ANTHROPIC_API_KEY.
`);
}

async function createVimoSession() {
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
    // Vimo is a tutor, not a coding agent. Keep Pi's safe read-only built-ins available
    // for future repo/local-note lookup without giving the tutor edit/write/shell powers.
    tools: ["read", "grep", "find", "ls"],
  });
}

async function runSmoke(): Promise<void> {
  if (!VIMO_SYSTEM_PROMPT.includes("Zed editor") || !VIMO_SYSTEM_PROMPT.includes("potentially destructive")) {
    throw new Error("Vimo system prompt is missing required tutoring constraints");
  }
  console.log("Vimo smoke OK: prompt and CLI wiring loaded.");
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

  const { session, modelFallbackMessage } = await createVimoSession();
  if (modelFallbackMessage) console.warn(`Note: ${modelFallbackMessage}`);

  let sawText = false;
  session.subscribe((event) => {
    if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
      sawText = true;
      output.write(event.assistantMessageEvent.delta);
    }
  });

  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      const question = (await rl.question("\nYou: ")).trim();
      if (!question) continue;
      if (["exit", "quit", ":q", ":qa"].includes(question.toLowerCase())) break;

      sawText = false;
      output.write("Vimo: ");
      await session.prompt(question);
      if (sawText) output.write("\n");
    }
  } finally {
    rl.close();
    session.dispose();
  }
}

main().catch((error) => {
  console.error(`Vimo error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
