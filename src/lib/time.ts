export function formatTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours && minutes && remainingSeconds)
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;

  if (minutes && remainingSeconds)
    return `${minutes}m ${remainingSeconds}s`;
  if (minutes) return `${minutes}m`;

  return `${remainingSeconds}s`;
}

export function parseTimeInput(value: string): number | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return 0;

  const timePattern = /(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?/;
  const match = normalized.match(timePattern);

  if (!match || match[0].trim() !== normalized) return null;

  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = match[2] ? Number(match[2]) : 0;
  const seconds = match[3] ? Number(match[3]) : 0;

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    !Number.isInteger(seconds)
  ) return null;

  return hours * 3600 + minutes * 60 + seconds;
}