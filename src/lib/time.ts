export function formatMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.floor(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours && remainingMinutes) return `${hours}h ${remainingMinutes}m`;
  if (hours) return `${hours}h`;
  return `${remainingMinutes}m`;
}

export function parseTimeInput(value: string): number | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return 0;

  const timePattern = /(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/;
  const match = normalized.match(timePattern);

  if (!match || match[0].trim() !== normalized) return null;

  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = match[2] ? Number(match[2]) : 0;

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  return hours * 60 + minutes;
}
