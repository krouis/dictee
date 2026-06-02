import type { WordEntry, GradeStatus } from '../types';

type Props = {
  allWords: WordEntry[];
  bestResults: Record<string, GradeStatus>;
  allCorrect: boolean;
  onReplayMissed: () => void;
  onNewDictee: () => void;
};

const GRADE_DOT: Record<GradeStatus, string> = {
  correct: 'bg-green-400',
  almost_correct: 'bg-amber-400',
  incorrect: 'bg-purple-400',
};

const GRADE_TEXT: Record<GradeStatus, string> = {
  correct: 'text-green-700',
  almost_correct: 'text-amber-700',
  incorrect: 'text-purple-700',
};

export default function ScoreScreen({ allWords, bestResults, allCorrect, onReplayMissed, onNewDictee }: Props) {
  const correct = allWords.filter((w) => bestResults[w.id] === 'correct').length;
  const total = allWords.length;
  const pct = Math.round((correct / total) * 100);

  return (
    <div className="w-full max-w-card bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-100">
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">{allCorrect ? '🏆' : pct >= 70 ? '⭐' : '💪'}</div>
        <h2 className="fluid-heading font-black text-slate-800">
          {correct} <span className="text-slate-400 font-light">/</span> {total}
        </h2>
        <p className="text-slate-500 text-lg">{pct}% de réussite</p>
      </div>

      <ul className="space-y-2 mb-8 max-h-64 overflow-y-auto pr-1">
        {allWords.map((w) => {
          const grade = bestResults[w.id] ?? 'incorrect';
          return (
            <li key={w.id} className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${GRADE_DOT[grade]}`} />
              <span className={`font-medium ${GRADE_TEXT[grade]}`}>{w.expected}</span>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3">
        {!allCorrect && (
          <button
            onClick={onReplayMissed}
            className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold text-lg py-4 rounded-2xl transition-colors shadow-md shadow-indigo-200"
          >
            🔄 Rejouer les mots manqués
          </button>
        )}
        <button
          onClick={onNewDictee}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-lg py-4 rounded-2xl transition-colors"
        >
          ✨ Nouvelle dictée
        </button>
      </div>
    </div>
  );
}
