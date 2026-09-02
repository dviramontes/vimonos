# Vimonos / Vimo

Vimo is a small conversational Vim tutor built on the Pi agent framework. It is tuned for learning Vim through **Zed editor Vim mode** rather than terminal Vim configuration.

![Vimo explaining the `ciw` command](docs/images/vimo-ciw.png)

## What Vimo does

- Answers natural-language Vim questions
- Suggests relevant shortcuts and commands
- Explains modes, motions, operators, and text objects concisely
- Adds small ASCII charts or examples when helpful
- Offers short exercises for practice
- Renders markdown responses in the terminal, including code blocks and tables
- Decorates each speaker with colorful `👤 You ❯` and `🧭 Vimo ❯` labels
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
- `src/vimoPrompt.ts` contains Vimo's system instructions.
- `src/markdown.ts` renders markdown responses for terminal display.
- `src/decorators.ts` provides TTY-aware speaker labels and colors.
- Vimo keeps Pi's read-only built-in tools (`read`, `grep`, `find`, `ls`) available and avoids edit/write/shell powers by default.
