import { normaliseBasic } from './grading';

export type ParsedSpelling = {
  transcript: string;
  parsed: string;
};

export type CharacterGrade = 'correct' | 'almost_correct' | 'incorrect';

type BrowserSpeechRecognitionWindow = {
  SpeechRecognition?: unknown;
  webkitSpeechRecognition?: unknown;
};

const LETTERS: Record<string, string> = {
  a: 'a',
  ah: 'a',
  be: 'b',
  bee: 'b',
  b: 'b',
  bé: 'b',
  ces: 'c',
  c: 'c',
  cé: 'c',
  de: 'd',
  d: 'd',
  dé: 'd',
  e: 'e',
  eu: 'e',
  f: 'f',
  effe: 'f',
  ef: 'f',
  ge: 'g',
  g: 'g',
  gé: 'g',
  h: 'h',
  ache: 'h',
  i: 'i',
  j: 'j',
  ji: 'j',
  k: 'k',
  ka: 'k',
  l: 'l',
  elle: 'l',
  m: 'm',
  aime: 'm',
  em: 'm',
  eme: 'm',
  ème: 'm',
  n: 'n',
  en: 'n',
  haine: 'n',
  enne: 'n',
  ène: 'n',
  o: 'o',
  eau: 'o',
  p: 'p',
  pe: 'p',
  pé: 'p',
  q: 'q',
  qu: 'q',
  cul: 'q',
  r: 'r',
  erre: 'r',
  s: 's',
  es: 's',
  esse: 's',
  t: 't',
  te: 't',
  té: 't',
  u: 'u',
  v: 'v',
  ve: 'v',
  vé: 'v',
  w: 'w',
  x: 'x',
  ix: 'x',
  y: 'y',
  z: 'z',
  zed: 'z',
  zède: 'z',
};

const LETTER_HINTS: Record<string, string> = {
  a: 'a',
  b: 'bé',
  c: 'cé',
  d: 'dé',
  e: 'e',
  f: 'effe',
  g: 'gé',
  h: 'ache',
  i: 'i',
  j: 'ji',
  k: 'ka',
  l: 'elle',
  m: 'em',
  n: 'enne',
  o: 'o',
  p: 'pé',
  q: 'qu',
  r: 'erre',
  s: 'esse',
  t: 'té',
  u: 'u',
  v: 'vé',
  w: 'double vé',
  x: 'ix',
  y: 'i grec',
  z: 'zède',
  à: 'a accent grave',
  â: 'a accent circonflexe',
  ç: 'c cédille',
  é: 'e accent aigu',
  è: 'e accent grave',
  ê: 'e accent circonflexe',
  ë: 'e tréma',
  î: 'i accent circonflexe',
  ï: 'i tréma',
  ô: 'o accent circonflexe',
  ù: 'u accent grave',
  û: 'u accent circonflexe',
  ü: 'u tréma',
};

const ACCENTS: Record<string, Record<string, string>> = {
  aigu: { e: 'é' },
  grave: { a: 'à', e: 'è', u: 'ù' },
  circonflexe: { a: 'â', e: 'ê', i: 'î', o: 'ô', u: 'û' },
  trema: { e: 'ë', i: 'ï', u: 'ü', y: 'ÿ' },
  tréma: { e: 'ë', i: 'ï', u: 'ü', y: 'ÿ' },
};

const SEPARATORS: Record<string, string> = {
  espace: ' ',
  apostrophe: "'",
  tiret: '-',
};

function tokenize(transcript: string): string[] {
  return normaliseBasic(transcript)
    .replace(/[.,;:!?()[\]{}"]/g, ' ')
    .split(' ')
    .filter(Boolean);
}

function parseLetter(tokens: string[], index: number): { value: string; next: number } | null {
  const token = tokens[index];
  const next = tokens[index + 1];
  const third = tokens[index + 2];

  if (!token) return null;
  if (token === 'i' && next === 'grec') return { value: 'y', next: index + 2 };
  if (token === 'y' && next === 'grec') return { value: 'y', next: index + 2 };
  if (token === 'double' && next && (next === 've' || next === 'vé' || next === 'v')) {
    return { value: 'w', next: index + 2 };
  }
  if (token === 'trait' && next === 'd' && third === 'union') {
    return { value: '-', next: index + 3 };
  }
  if (token === 'c' && (next === 'cedille' || next === 'cédille')) {
    return { value: 'ç', next: index + 2 };
  }
  if (SEPARATORS[token]) return { value: SEPARATORS[token], next: index + 1 };
  if (LETTERS[token]) return { value: LETTERS[token], next: index + 1 };

  return null;
}

function applyAccent(letter: string, tokens: string[], index: number): { value: string; next: number } {
  if (tokens[index] !== 'accent') return { value: letter, next: index };

  const accent = tokens[index + 1];
  if (!accent) return { value: letter, next: index };

  const accented = ACCENTS[accent]?.[letter];
  if (!accented) return { value: letter, next: index };

  return { value: accented, next: index + 2 };
}

export function parseFrenchSpellingTranscript(transcript: string): ParsedSpelling | null {
  const tokens = tokenize(transcript);
  let index = 0;
  let parsed = '';

  while (index < tokens.length) {
    const letter = parseLetter(tokens, index);
    if (!letter) return null;

    const accented = applyAccent(letter.value, tokens, letter.next);
    parsed += accented.value;
    index = accented.next;
  }

  return parsed ? { transcript, parsed } : null;
}

export function parseFrenchSpellingAlternatives(transcripts: string[]): ParsedSpelling | null {
  for (const transcript of transcripts) {
    const parsed = parseFrenchSpellingTranscript(transcript);
    if (parsed) return parsed;
  }
  return null;
}

export function gradeSpelledCharacter(expected: string, actual: string): CharacterGrade {
  if (actual === expected) return 'correct';
  if (normaliseBasic(actual).normalize('NFD').replace(/[̀-ͯ]/g, '')
    === normaliseBasic(expected).normalize('NFD').replace(/[̀-ͯ]/g, '')) {
    return 'almost_correct';
  }
  return 'incorrect';
}

export function splitExpectedCharacters(expected: string): string[] {
  return Array.from(expected);
}

export function buildFrenchSpellingPhrases(expected: string): string[] {
  const letters = normaliseBasic(expected)
    .split('')
    .map((char) => {
      if (char === ' ') return 'espace';
      if (char === "'") return 'apostrophe';
      if (char === '-') return 'tiret';
      return LETTER_HINTS[char] ?? '';
    })
    .filter(Boolean);

  if (letters.length === 0) return [];

  const phrase = letters.join(' ');
  const compact = phrase.replace(/\s+/g, ' ');
  return Array.from(new Set([phrase, compact]));
}

export function isSpeechRecognitionSupported(source: unknown = globalThis): boolean {
  const candidate = (source ?? {}) as BrowserSpeechRecognitionWindow;
  return typeof candidate.SpeechRecognition === 'function'
    || typeof candidate.webkitSpeechRecognition === 'function';
}
