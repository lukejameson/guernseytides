// export function formatDateToString(date: Date): string {
//   return date.toISOString().slice(0, 10).replace("T", " ");
// }

// export function getYearDay(date: Date): number {
//   const start = new Date(date.getFullYear(), 0, 0);
//   const diff = date.getTime() - start.getTime();
//   const oneDay = 1000 * 60 * 60 * 24;
//   return Math.floor(diff / oneDay);
// }

// export function getDateFromYearDay(year: number, dayOfYear: number) {
//   const date = new Date(year, 0);
//   date.setDate(dayOfYear);
//   return date;
// }
