import { useState } from 'react';
import type { WordEntry } from '../types';

type Props = {
  initialValue: string;
  onSubmit: (raw: string, words: WordEntry[]) => void;
};

let _nextId = 0;
function makeId() {
  return `w${++_nextId}`;
}

export default function WordListScreen({ initialValue, onSubmit }: Props) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  function handleSubmit() {
    const words: WordEntry[] = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((expected) => ({ id: makeId(), expected }));

    if (words.length === 0) {
      setError('Veuillez saisir au moins un mot.');
      return;
    }
    setError('');
    onSubmit(value, words);
  }

  return (
    <div className="w-full max-w-card bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-100">
      <h2 className="fluid-heading font-bold text-slate-800 mb-2">Mots de la dictée</h2>
      <p className="text-slate-500 mb-6">Un mot ou une expression par ligne.</p>

      <textarea
        value={value}
        onChange={(e) => { setValue(e.target.value); setError(''); }}
        placeholder={'maison\nparapluie\nla belle journée\n...'}
        rows={10}
        className="w-full border-3 border-slate-200 focus:border-indigo-400 rounded-2xl p-4 text-lg text-slate-800 resize-none outline-none transition-colors"
        style={{ border: '3px solid', borderColor: error ? '#fca5a5' : undefined }}
        autoFocus
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        onClick={handleSubmit}
        className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold text-xl py-4 rounded-2xl transition-colors shadow-md shadow-indigo-200"
      >
        Continuer →
      </button>
    </div>
  );
}
