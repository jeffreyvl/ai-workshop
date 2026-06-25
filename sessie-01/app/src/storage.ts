// Eenvoudige opslag in de browser (localStorage). Alles draait op deze pc,
// dus dit is genoeg: vragen en stemmen blijven bewaard, ook na herladen.
import type { Question } from './types';

const KEY = 'menti-vragen-v1';

export function loadQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Question[];
  } catch {
    return [];
  }
}

export function saveQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(questions));
  } catch {
    // opslag vol of geblokkeerd — stilletjes negeren in een demo
  }
}

export function newId(): string {
  // crypto.randomUUID is beschikbaar in moderne browsers
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.floor(Math.random() * 1e9).toString(36);
}
