import { useEffect } from 'react';

type Props = { onNext: () => void };

export default function CongratsScreen({ onNext }: Props) {
  useEffect(() => {
    const id = setTimeout(onNext, 2200);
    return () => clearTimeout(id);
  }, [onNext]);

  return (
    <div className="w-full max-w-card bg-white rounded-3xl p-12 shadow-xl shadow-slate-100 text-center">
      <div className="text-7xl mb-4">🎉</div>
      <h2 className="fluid-heading font-bold text-slate-800 mb-3">Bravo !</h2>
      <p className="text-slate-500 text-lg">Dictée terminée. Voyons les résultats…</p>
    </div>
  );
}
