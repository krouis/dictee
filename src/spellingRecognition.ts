import { normaliseBasic } from './grading';

export type ParsedSpelling = {
  transcript: string;
  parsed: string;
};

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
  n: 'n',
  haine: 'n',
  enne: 'n',
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

export function isSpeechRecognitionSupported(source: unknown = globalThis): boolean {
  const candidate = (source ?? {}) as BrowserSpeechRecognitionWindow;
  return typeof candidate.SpeechRecognition === 'function'
    || typeof candidate.webkitSpeechRecognition === 'function';
}
