/** Display helpers for the admin area. Times are always shown in UK time. */

const TZ = "Europe/London";

export function money(pounds: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: Number.isInteger(pounds) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(pounds);
}

export function shortDate(date: Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** ISO yyyy-mm-dd in UK time, for the CSV export. */
export function isoDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
}

function londonParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), second: get("second") };
}

/** Midnight on the 1st of the current month, UK time. */
export function startOfLondonMonth(now = new Date()): Date {
  const { year, month } = londonParts(now);
  const guess = Date.UTC(year, month - 1, 1);
  const p = londonParts(new Date(guess));
  const offset = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - guess;
  return new Date(guess - offset);
}

export function monthName(now = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, month: "long" }).format(now);
}

/** Whole UK calendar days from today until `date` (0 = today, negative = past). */
export function daysUntil(date: Date, now = new Date()): number {
  const a = londonParts(now);
  const b = londonParts(date);
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86_400_000);
}

/** "Today", "Tomorrow", "In 12 days". */
export function inDays(days: number): string {
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}
