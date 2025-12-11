export function makeNameKey(name: string | undefined | null): string {
  return (name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " "); // collapse multiple spaces
}
