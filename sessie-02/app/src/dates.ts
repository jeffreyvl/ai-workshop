import type { Friend } from "./api";

const MS_DAY = 1000 * 60 * 60 * 24;

function atMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Aantal dagen tot de eerstvolgende verjaardag (0 = vandaag). */
export function daysUntil(birthdate: string, today = new Date()): number {
  const b = new Date(birthdate);
  const t = atMidnight(today);
  let next = new Date(t.getFullYear(), b.getMonth(), b.getDate());
  if (next < t) next = new Date(t.getFullYear() + 1, b.getMonth(), b.getDate());
  return Math.round((next.getTime() - t.getTime()) / MS_DAY);
}

export function isBirthdayToday(birthdate: string, today = new Date()): boolean {
  return daysUntil(birthdate, today) === 0;
}

/** Leeftijd die hij/zij wordt op de eerstvolgende verjaardag. */
export function turningAge(birthdate: string, today = new Date()): number {
  const b = new Date(birthdate);
  const t = atMidnight(today);
  let age = t.getFullYear() - b.getFullYear();
  // Als de verjaardag dit jaar nog moet komen, telt die nog niet mee... behalve vandaag.
  const days = daysUntil(birthdate, today);
  if (days > 0) age += 1;
  return age;
}

const MAANDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

export function formatDate(birthdate: string): string {
  const b = new Date(birthdate);
  return `${b.getDate()} ${MAANDEN[b.getMonth()]}`;
}

export function countdownLabel(days: number): string {
  if (days === 0) return "Vandaag! 🎉";
  if (days === 1) return "Morgen";
  return `Over ${days} dagen`;
}

export function sortByUpcoming(friends: Friend[]): Friend[] {
  return [...friends].sort((a, b) => daysUntil(a.birthdate) - daysUntil(b.birthdate));
}
