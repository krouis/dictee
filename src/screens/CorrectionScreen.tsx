import { useState } from 'react';
import type { WordEntry } from '../types';
import { gradeAnswer } from '../grading';

type Props = {
  words: WordEntry[];
  answers: Record<string, string>;
  onDone: () => void;
};

const GRADE_STYLE = {
  correct: {
    card: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
    label: '✓ Correct',
  },
  almost_correct: {
    card: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    label: '~ Accent',
  },
  incorrect: {
    card: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    label: '✗ Incorrect',
  },
};

export default function CorrectionScreen({ words, answers, onDone }: Props) {
  const [index, setIndex] = useState(0);

  const word = words[index];
  const answer = answers[word.id] ?? '';
  const grade = gradeAnswer(word.expected, answer);
  const style = GRADE_STYLE[grade];
  const isLast = index === words.length - 1;

  return (
    <div className="w-full max-w-card bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-100">
      <div className="flex justify-between items-center mb-6 text-slate-500 font-medium">
        <span>Correction {index + 1} / {words.length}</span>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${style.badge}`}>{style.label}</span>
      </div>

      <div className={`border-2 rounded-2xl p-6 mb-6 ${style.card}`}>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Attendu</p>
          <p className="text-3xl font-bold text-slate-800">{word.expected}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Ta réponse</p>
          <p className={`text-3xl font-bold ${grade === 'correct' ? 'text-green-700' : grade === 'almost_correct' ? 'text-amber-700' : 'text-purple-700'}`}>
            {answer || <span className="italic opacity-50">(sans réponse)</span>}
          </p>
        </div>
      </div>

      <button
        onClick={() => (isLast ? onDone() : setIndex((i) => i + 1))}
        className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold text-xl py-4 rounded-2xl transition-colors shadow-md shadow-indigo-200"
      >
        {isLast ? 'Voir le score →' : 'Suivant →'}
      </button>
    </div>
  );
}
