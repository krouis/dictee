export type State =
  | 'home'
  | 'editing_words'
  | 'configuring'
  | 'countdown'
  | 'dictating'
  | 'congrats'
  | 'reviewing'
  | 'score';

export type GradeStatus = 'correct' | 'almost_correct' | 'incorrect';

export type WordEntry = { id: string; expected: string };

export type AnswerTimeSetting = 0 | 5 | 10 | 15 | 20 | 'adaptive';

export type DicteeConfig = {
  repetitions: 1 | 2 | 3;
  answerTimeSeconds: AnswerTimeSetting; // 0 = manual Next button
  speechRate: number;
  voiceURI?: string;
  language: string;
  mode: 'keyboard' | 'oral';
};

export const DEFAULT_CONFIG: DicteeConfig = {
  repetitions: 2,
  answerTimeSeconds: 10,
  speechRate: 1.0,
  language: 'fr-FR',
  mode: 'keyboard',
};
