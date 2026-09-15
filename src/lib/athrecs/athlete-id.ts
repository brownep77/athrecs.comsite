// Keep Postgres bigint references as strings so large IDs never lose precision.
export function formatAthleteId(number: string): string {
  return `ATH-${number.padStart(6, "0")}`;
}

export function parseAthleteId(value: string | null | undefined): string | null {
  const match = value?.trim().match(/^ATH-(\d{1,19})$/i);
  if (!match) return null;
  const number = match[1].replace(/^0+/, "");
  return number || null;
}
