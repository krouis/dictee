import type { AnswerTimeSetting } from './types';

const MIN_ADAPTIVE_SECONDS = 5;
const MAX_ADAPTIVE_SECONDS = 45;
const BASE_SECONDS = 3;
const SECONDS_PER_CHARACTER = 0.35;
const SECONDS_PER_WORD = 1.2;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function countWords(value: string): number {
  const matches = value.trim().match(/\S+/g);
  return matches?.length ?? 0;
}

export function adaptiveAnswerTimeSeconds(expected: string): number {
  const normalised = expected.trim().replace(/\s+/g, ' ');
  const estimated = BASE_SECONDS
    + normalised.length * SECONDS_PER_CHARACTER
    + countWords(normalised) * SECONDS_PER_WORD;

  return Math.ceil(clamp(estimated, MIN_ADAPTIVE_SECONDS, MAX_ADAPTIVE_SECONDS));
}

export function resolveAnswerTimeSeconds(setting: AnswerTimeSetting, expected: string): number {
  if (setting === 'adaptive') return adaptiveAnswerTimeSeconds(expected);
  return setting;
}
