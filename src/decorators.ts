const RESET = "\u001b[0m";
const BOLD = "\u001b[1m";
const CYAN = "\u001b[36m";
const MAGENTA = "\u001b[35m";

export function userPrompt(color = process.stdout.isTTY): string {
  const label = "👤 You  ❯ ";
  return color ? `${BOLD}${CYAN}${label}${RESET}` : label;
}

export function vimoHeading(color = process.stdout.isTTY): string {
  const label = "🧭 Vimo ❯";
  return color ? `${BOLD}${MAGENTA}${label}${RESET}` : label;
}
