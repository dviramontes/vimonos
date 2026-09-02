#!/usr/bin/env node
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  createAgentSession,
  DefaultResourceLoader,
  getAgentDir,
  ModelRuntime,
  resolveCliModel,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";
import { userPrompt, vimoHeading } from "./decorators.js";
import { renderMarkdown } from "./markdown.js";
import { buildWelcomeMessage, VIMO_SYSTEM_PROMPT } from "./vimoPrompt.js";

type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

const THINKING_LEVELS = new Set<ThinkingLevel>(["off", "minimal", "low", "medium", "high", "xhigh", "max"]);
const DEFAULT_MODEL = "openai-codex/gpt-5.4-mini";

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function optionValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value`);
  return value;
}

function requestedThinking(): ThinkingLevel {
  const value = optionValue("--thinking") ?? process.env.VIMO_THINKING ?? "low";
  if (!THINKING_LEVELS.has(value as ThinkingLevel)) throw new Error(`Invalid thinking level: ${value}`);
  return value as ThinkingLevel;
}

function printHelp(): void {
  console.log(`VIMo — conversational Vim tutor for Zed Vim mode

Usage:
  npm run vimo             Start the conversation loop
  npm run vimo -- --help   Show this help
  npm run smoke            Validate local harness wiring without calling a model
  vimo --model PROVIDER/ID Choose a model for this run
  vimo --thinking LEVEL    Set reasoning (default: low)

Configuration:
  VIMO_MODEL               Default model override
  VIMO_THINKING            Default reasoning override
  Defaults to openai-codex/gpt-5.4-mini for fast inference.

Markdown:
  VIMo renders markdown responses in the terminal, including code blocks and tables.

Environment/auth:
  VIMo uses the Pi SDK and your normal Pi model/auth configuration.
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

  const modelRuntime = await ModelRuntime.create();
  const requestedModel = optionValue("--model") ?? process.env.VIMO_MODEL ?? DEFAULT_MODEL;
  const resolved = resolveCliModel({ cliModel: requestedModel, modelRuntime });
  if (resolved.error || !resolved.model) throw new Error(resolved.error ?? `Model not found: ${requestedModel}`);
  const model = resolved.model;

  return createAgentSession({
    cwd,
    model,
    thinkingLevel: requestedThinking(),
    modelRuntime,
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
  if (!userPrompt(false).includes("nos(otros)") || !vimoHeading(false).includes("VIMo(nos)")) {
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

  const { session, modelFallbackMessage } = await createVimoSession();
  if (modelFallbackMessage) console.warn(`Note: ${modelFallbackMessage}`);
  if (session.model) {
    console.log(`⚡ ${session.model.provider}/${session.model.id} · reasoning ${session.thinkingLevel}`);
  }

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
      if (["exit", "quit", ":q", ":qa"].includes(question.toLowerCase())) {
        console.log("¡Hasta luego!");
        break;
      }

      assistantMarkdown = "";
      output.write(`${vimoHeading()} thinking…\n`);
      await session.prompt(question);
      if (assistantMarkdown.trim()) {
        output.write(`${vimoHeading()}\n${renderMarkdown(assistantMarkdown)}\n`);
      } else {
        const modelError = session.agent.state.errorMessage;
        const message = modelError
          ? `Model error: ${modelError}`
          : "No response was returned. Try again or choose another model with `--model`.";
        output.write(`${vimoHeading()} ⚠️ ${message}\n`);
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
