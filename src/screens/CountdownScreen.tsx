import { useEffect, useState } from 'react';

type Props = { onDone: () => void };

const STEPS = ['3', '2', '1', "C'est parti !"];

export default function CountdownScreen({ onDone }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length - 1) {
      const id = setTimeout(onDone, 900);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(id);
  }, [step, onDone]);

  const isFinal = step === STEPS.length - 1;

  return (
    <div className="w-full max-w-card flex flex-col items-center justify-center gap-4">
      <div
        key={step}
        className={`fluid-heading font-black text-center transition-all duration-300 ${
          isFinal ? 'text-indigo-600 text-5xl' : 'text-slate-800 text-8xl'
        }`}
        style={{ animation: 'countPop 0.3s ease-out' }}
      >
        {STEPS[step]}
      </div>
      <style>{`
        @keyframes countPop {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
