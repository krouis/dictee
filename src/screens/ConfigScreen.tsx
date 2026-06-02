import { useState } from 'react';
import type { DicteeConfig } from '../types';

type Props = {
  voices: SpeechSynthesisVoice[];
  initial: DicteeConfig;
  wordCount: number;
  onSubmit: (cfg: DicteeConfig) => void;
  onBack: () => void;
};

const TIME_OPTIONS = [
  { label: '5 s', value: 5 },
  { label: '10 s', value: 10 },
  { label: '15 s', value: 15 },
  { label: '20 s', value: 20 },
  { label: 'Manuel', value: 0 },
];

const RATE_OPTIONS = [
  { label: 'Lent', value: 0.7 },
  { label: 'Normal', value: 1.0 },
  { label: 'Rapide', value: 1.2 },
];

function ToggleGroup<T extends number | string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
            value === o.value
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function ConfigScreen({ voices, initial, wordCount, onSubmit, onBack }: Props) {
  const [cfg, setCfg] = useState<DicteeConfig>(initial);

  const frVoices = voices.filter((v) => v.lang.startsWith('fr'));
  const displayVoices = frVoices.length > 0 ? frVoices : voices;

  return (
    <div className="w-full max-w-card bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-100">
      <h2 className="fluid-heading font-bold text-slate-800 mb-1">Configuration</h2>
      <p className="text-slate-500 mb-8">{wordCount} mot{wordCount > 1 ? 's' : ''} · Personnalisez votre dictée.</p>

      <div className="space-y-7">
        <div>
          <label className="block text-slate-700 font-semibold mb-2">Répétitions</label>
          <ToggleGroup
            options={[{ label: '1×', value: 1 }, { label: '2×', value: 2 }, { label: '3×', value: 3 }]}
            value={cfg.repetitions}
            onChange={(v) => setCfg({ ...cfg, repetitions: v as 1 | 2 | 3 })}
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-2">Temps par mot</label>
          <ToggleGroup
            options={TIME_OPTIONS}
            value={cfg.answerTimeSeconds}
            onChange={(v) => setCfg({ ...cfg, answerTimeSeconds: v })}
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-2">Vitesse de lecture</label>
          <ToggleGroup
            options={RATE_OPTIONS}
            value={cfg.speechRate}
            onChange={(v) => setCfg({ ...cfg, speechRate: v })}
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-2">Mode de saisie</label>
          <ToggleGroup
            options={[
              { label: '⌨️ Clavier', value: 'keyboard' },
              { label: '🗣️ Oral / Autonome', value: 'oral' },
            ]}
            value={cfg.mode}
            onChange={(v) => setCfg({ ...cfg, mode: v as 'keyboard' | 'oral' })}
          />
        </div>

        {displayVoices.length > 0 && (
          <div>
            <label className="block text-slate-700 font-semibold mb-2">Voix</label>
            <select
              value={cfg.voiceURI ?? ''}
              onChange={(e) => setCfg({ ...cfg, voiceURI: e.target.value || undefined })}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 bg-white focus:border-indigo-400 outline-none"
            >
              <option value="">Voix par défaut</option>
              {displayVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-lg py-4 rounded-2xl transition-colors"
        >
          ← Retour
        </button>
        <button
          onClick={() => onSubmit(cfg)}
          className="flex-[2] bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold text-lg py-4 rounded-2xl transition-colors shadow-md shadow-indigo-200"
        >
          C'est parti !
        </button>
      </div>
    </div>
  );
}
