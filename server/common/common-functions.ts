export function formatDateToString(date: Date): string {
  return date.toISOString().slice(0, 10).replace('T', ' ');
}
