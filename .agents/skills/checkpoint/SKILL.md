---
name: checkpoint
description: Run the Vimonos compiler and tests, then commit all local changes with a simple checkpoint message. Use when the user asks for a local checkpoint, save point, or quick commit after verification.
---

# Checkpoint

Use this skill to create a verified local git checkpoint for this repository.

## What to do

1. Inspect the working tree:

   ```bash
   git status --short
   ```

2. Run the compiler:

   ```bash
   npm run build
   ```

3. Run tests:

   ```bash
   npm test
   ```

4. If either build or tests fail, stop. Report the failure and do not commit.

5. If checks pass, commit all local changes with a simple message:

   ```bash
   .agents/skills/checkpoint/scripts/checkpoint.sh
   ```

   To use a user-provided message:

   ```bash
   .agents/skills/checkpoint/scripts/checkpoint.sh "message here"
   ```

## Rules

- Do not push.
- Do not amend existing commits unless the user explicitly asks.
- Include untracked files in the checkpoint commit.
- Use the default commit message `checkpoint` unless the user gives a different simple message.
- If there are no changes to commit, report that the working tree is clean.
