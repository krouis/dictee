import type { GradeStatus } from './types';

export function normaliseBasic(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function gradeAnswer(expected: string, answer: string): GradeStatus {
  const expectedBasic = normaliseBasic(expected);
  const answerBasic = normaliseBasic(answer);
  if (answerBasic === expectedBasic) return 'correct';
  if (stripAccents(answerBasic) === stripAccents(expectedBasic)) return 'almost_correct';
  return 'incorrect';
}

// Ratchet: a grade can only improve across rounds, never worsen.
export function mergeGrade(prev: GradeStatus | undefined, next: GradeStatus): GradeStatus {
  if (prev === 'correct') return 'correct';
  if (next === 'correct') return 'correct';
  if (prev === 'almost_correct' || next === 'almost_correct') return 'almost_correct';
  return 'incorrect';
}
