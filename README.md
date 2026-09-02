# VIMonos / VIMo

VIMo is a small conversational Vim tutor built on the Pi agent framework. It is tuned for learning Vim through **Zed editor Vim mode** rather than terminal Vim configuration.

![VIMo explaining the `ciw` command](docs/images/vimo-ciw.png)

## What VIMo does

- Answers natural-language Vim questions
- Suggests relevant shortcuts and commands
- Explains modes, motions, operators, and text objects concisely
- Adds small ASCII charts or examples when helpful
- Offers short exercises for practice
- Renders markdown responses in the terminal, including code blocks and tables
- Decorates each speaker with colorful `👤 You ❯` and `🧭 VIMo ❯` labels
- Warns before potentially destructive commands

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Pi model access using your normal Pi setup:

   ```bash
   pi /login
   ```

   Or set a supported provider key such as `ANTHROPIC_API_KEY`.

## Run

```bash
npm run vimo
```

Then ask questions like:

```text
How do I move faster by words?
Explain ciw vs diw.
Give me a 2-minute Zed Vim practice drill.
```

Type `exit`, `quit`, `:q`, or `:qa` to leave the loop.

### Model and reasoning

VIMo defaults to the fast `openai-codex/gpt-5.4-mini` model with `low` reasoning. Override either setting for one run:

```bash
vimo --model anthropic/claude-haiku-4-5 --thinking minimal
```

Or configure environment defaults:

```bash
export VIMO_MODEL=anthropic/claude-haiku-4-5
export VIMO_THINKING=low
```

Command-line flags take precedence over environment variables. VIMo accepts reasoning levels `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, and `max`.

## Link the command globally

Create a global `vimo` command linked to this working copy:

```bash
npm link
```

The `prelink` script builds VIMo automatically. You can then launch it from any directory:

```bash
vimo
```

After changing the source, rebuild it with `npm run build`. For continuous rebuilding during development, run:

```bash
npm run build -- --watch
```

Remove the global link with `npm unlink --global vimonos`.

## Verify

Local smoke check without a model call:

```bash
npm run smoke
npm test
```

Build TypeScript:

```bash
npm run build
```

## Implementation notes

- `src/vimo.ts` creates a Pi SDK agent session and a command-line conversation loop.
- `src/vimoPrompt.ts` contains VIMo's system instructions.
- `src/markdown.ts` renders markdown responses for terminal display.
- `src/decorators.ts` provides TTY-aware speaker labels and colors.
- VIMo keeps Pi's read-only built-in tools (`read`, `grep`, `find`, `ls`) available and avoids edit/write/shell powers by default.
