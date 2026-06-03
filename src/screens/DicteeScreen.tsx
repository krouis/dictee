import { useEffect, useRef, useState, useCallback } from 'react';
import type { WordEntry, DicteeConfig } from '../types';
import type { SpeakOptions } from '../hooks/useSpeech';
import { gradeAnswer, stripAccents, normaliseBasic } from '../grading';
import {
  cancelSpeechRun,
  createSpeechRunToken,
  isSpeechRunCancelled,
  type SpeechRunToken,
} from '../speechRun';
import { resolveAnswerTimeSeconds } from '../timing';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

type Props = {
  word: WordEntry;
  wordIndex: number;
  totalWords: number;
  config: DicteeConfig;
  speak: (text: string, opts?: SpeakOptions) => Promise<void>;
  onAnswer: (wordId: string, answer: string) => void;
};

type Phase = 'speaking' | 'answering' | 'paused';

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function DicteeScreen({ word, wordIndex, totalWords, config, speak, onAnswer }: Props) {
  const answerTimeSeconds = resolveAnswerTimeSeconds(config.answerTimeSeconds, word.expected);
  const recognition = useSpeechRecognition(config.language);
  const [phase, setPhase] = useState<Phase>('speaking');
  const [timeLeft, setTimeLeft] = useState(answerTimeSeconds);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [manualCorrection, setManualCorrection] = useState(false);
  const [oralNotice, setOralNotice] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const answerRef = useRef('');
  const speechRunRef = useRef<SpeechRunToken | null>(null);
  answerRef.current = answer;

  // Speak the current word, then start the timer.
  const doSpeak = useCallback(async (token: SpeechRunToken) => {
    setPhase('speaking');
    for (let i = 0; i < config.repetitions; i++) {
      if (isSpeechRunCancelled(token)) return;
      await speak(word.expected, {
        rate: config.speechRate,
        voiceURI: config.voiceURI,
        language: config.language,
      });
      if (isSpeechRunCancelled(token)) return;
      if (i < config.repetitions - 1) {
        await new Promise<void>((r) => setTimeout(r, 500));
      }
    }
    if (!isSpeechRunCancelled(token) && speechRunRef.current === token) {
      setTimeLeft(answerTimeSeconds);
      setPhase('answering');
    }
  }, [word.expected, config, speak, answerTimeSeconds]);

  useEffect(() => {
    cancelSpeechRun(speechRunRef.current);
    const token = createSpeechRunToken();
    speechRunRef.current = token;
    setAnswer('');
    setRevealed(false);
    setManualCorrection(false);
    setOralNotice('');
    setTimeLeft(answerTimeSeconds);
    recognition.reset();
    doSpeak(token);
    return () => {
      cancelSpeechRun(token);
      if (speechRunRef.current === token) speechRunRef.current = null;
      window.speechSynthesis?.cancel();
    };
  }, [word.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus keyboard input when answering phase begins.
  useEffect(() => {
    if (phase === 'answering' && config.mode === 'keyboard') {
      inputRef.current?.focus();
    }
  }, [phase, config.mode]);

  // Countdown timer.
  useEffect(() => {
    if (phase !== 'answering' || answerTimeSeconds === 0) return;
    if (config.mode === 'oral' && (recognition.result || manualCorrection)) return;
    if (timeLeft <= 0) {
      if (config.mode === 'oral') {
        recognition.stop();
        setOralNotice('Temps écoulé. Réessayez ou utilisez la correction manuelle.');
        return;
      }
      onAnswer(word.id, answerRef.current);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft, answerTimeSeconds, config.mode, recognition.result, manualCorrection]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit() {
    window.speechSynthesis?.cancel();
    onAnswer(word.id, answerRef.current);
  }

  function handleRelisten() {
    if (config.mode === 'oral') recognition.reset();
    cancelSpeechRun(speechRunRef.current);
    const token = createSpeechRunToken();
    speechRunRef.current = token;
    doSpeak(token);
    if (answerTimeSeconds > 0) setTimeLeft(answerTimeSeconds);
  }

  function handlePause() {
    window.speechSynthesis?.pause();
    setPhase('paused');
  }

  function handleResume() {
    window.speechSynthesis?.resume();
    setPhase('answering');
  }

  function handleManualCorrection() {
    recognition.stop();
    setManualCorrection(true);
    setOralNotice('');
  }

  function handleRecognitionStart() {
    setOralNotice('');
    recognition.start();
  }

  function handleRecognitionRetry() {
    recognition.reset();
    setOralNotice('');
  }

  const timerPct = answerTimeSeconds > 0 ? timeLeft / answerTimeSeconds : 1;
  const timerColor = timerPct > 0.5 ? 'bg-emerald-400' : timerPct > 0.25 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="w-full max-w-card bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-100">
      {/* Progress */}
      <div className="flex justify-between items-center mb-6 text-slate-500 font-medium">
        <span>Mot {wordIndex + 1} / {totalWords}</span>
        {answerTimeSeconds > 0 && phase !== 'speaking' && (
          <span className={`font-mono text-lg font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-slate-700'}`}>
            {formatTime(timeLeft)}
          </span>
        )}
      </div>

      {/* Timer bar */}
      {answerTimeSeconds > 0 && (
        <div className="h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${timerColor}`}
            style={{ width: `${timerPct * 100}%` }}
          />
        </div>
      )}

      {/* Speaking indicator */}
      {phase === 'speaking' && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4 animate-bounce">🔊</div>
          <p className="text-slate-500">Écoute…</p>
        </div>
      )}

      {/* Keyboard mode */}
      {phase !== 'speaking' && config.mode === 'keyboard' && (
        <input
          ref={inputRef}
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          autoComplete="off"
          placeholder="Écris le mot ici…"
          disabled={phase === 'paused'}
          className="dictee-input mb-6"
        />
      )}

      {/* Oral mode */}
      {phase !== 'speaking' && config.mode === 'oral' && (
        <div className="mb-6">
          {!manualCorrection ? (
            <div className="space-y-4">
              {recognition.result ? (
                <div className="border-2 border-slate-200 rounded-2xl p-5 bg-slate-50">
                  <div className="flex justify-between items-center gap-3 mb-4">
                    <span className="text-sm font-semibold text-slate-500">Épellation reconnue</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      gradeAnswer(word.expected, recognition.result.parsed) === 'correct'
                        ? 'bg-green-100 text-green-700'
                        : gradeAnswer(word.expected, recognition.result.parsed) === 'almost_correct'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                    }`}>
                      {gradeAnswer(word.expected, recognition.result.parsed) === 'correct'
                        ? 'Correct'
                        : gradeAnswer(word.expected, recognition.result.parsed) === 'almost_correct'
                          ? 'Presque'
                          : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">Entendu : {recognition.result.transcript}</p>
                  <p className="text-4xl font-bold text-slate-800">{recognition.result.parsed}</p>
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={handleRecognitionRetry}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg py-4 rounded-2xl transition-colors"
                    >
                      Réessayer
                    </button>
                    <button
                      onClick={() => onAnswer(word.id, recognition.result?.parsed ?? '')}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-lg py-4 rounded-2xl transition-colors"
                    >
                      Valider
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {!recognition.supported && (
                    <div className="bg-amber-50 border-2 border-amber-100 text-amber-800 rounded-2xl p-4 font-medium">
                      Micro indisponible sur ce navigateur.
                    </div>
                  )}
                  {(recognition.error || oralNotice) && (
                    <div className="bg-amber-50 border-2 border-amber-100 text-amber-800 rounded-2xl p-4 font-medium">
                      {oralNotice || recognition.error}
                    </div>
                  )}
                  {recognition.transcript && (
                    <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4">
                      <p className="text-sm font-semibold text-slate-400 mb-1">Entendu</p>
                      <p className="text-2xl font-bold text-slate-700">{recognition.transcript}</p>
                    </div>
                  )}
                  {recognition.status === 'listening' ? (
                    <button
                      onClick={recognition.stop}
                      className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-bold text-2xl py-10 rounded-2xl transition-colors"
                    >
                      Arrêter le micro
                    </button>
                  ) : (
                    <button
                      onClick={handleRecognitionStart}
                      disabled={!recognition.supported}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-2xl py-10 rounded-2xl transition-colors"
                    >
                      🎙️ Épeler le mot
                    </button>
                  )}
                </>
              )}
              <button
                onClick={handleManualCorrection}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-lg py-4 rounded-2xl transition-colors"
              >
                Corriger manuellement
              </button>
            </div>
          ) : (
            <>
              {!revealed ? (
                <button
                  onClick={() => setRevealed(true)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-2xl py-10 rounded-2xl transition-colors"
                >
                  🔍 Afficher la réponse
                </button>
              ) : (
                <div className="text-center">
                  <div className="text-5xl font-bold text-slate-800 mb-6 py-4 bg-slate-50 rounded-2xl">
                    {word.expected}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => onAnswer(word.id, word.expected)}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-bold text-lg py-4 rounded-2xl transition-colors"
                    >
                      ✓ Correct
                    </button>
                    <button
                      onClick={() => onAnswer(word.id, stripAccents(normaliseBasic(word.expected)))}
                      className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold text-lg py-4 rounded-2xl transition-colors"
                    >
                      ~ Presque
                    </button>
                    <button
                      onClick={() => onAnswer(word.id, '')}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-lg py-4 rounded-2xl transition-colors"
                    >
                      ✗ Incorrect
                    </button>
                  </div>
                </div>
              )}
              <div className="mt-3">
                <button
                  onClick={() => { setManualCorrection(false); setRevealed(false); recognition.reset(); }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-lg py-4 rounded-2xl transition-colors"
                >
                  Retour au micro
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={handleRelisten}
          className="flex-1 min-w-[100px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-colors"
        >
          🔊 Réécouter
        </button>

        {phase === 'paused' ? (
          <button
            onClick={handleResume}
            className="flex-1 min-w-[100px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-colors"
          >
            ▶️ Reprendre
          </button>
        ) : (
          <button
            onClick={handlePause}
            disabled={phase === 'speaking'}
            className="flex-1 min-w-[100px] bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 font-medium py-3 rounded-xl transition-colors"
          >
            ⏸️ Pause
          </button>
        )}

        <button
          onClick={() => onAnswer(word.id, '')}
          className="flex-1 min-w-[100px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-colors"
        >
          ⏭️ Passer
        </button>
      </div>

      {/* Submit button (keyboard mode, manual or answering) */}
      {config.mode === 'keyboard' && phase !== 'speaking' && (
        <button
          onClick={handleSubmit}
          disabled={phase === 'paused'}
          className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white font-semibold text-lg py-4 rounded-2xl transition-colors shadow-md shadow-indigo-200"
        >
          {answerTimeSeconds === 0 ? 'Suivant →' : 'Valider ✓'}
        </button>
      )}
    </div>
  );
}
