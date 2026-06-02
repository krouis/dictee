import { useState } from 'react';
import { useSpeech } from './hooks/useSpeech';
import { gradeAnswer, mergeGrade } from './grading';
import type { State, WordEntry, DicteeConfig, GradeStatus } from './types';
import { DEFAULT_CONFIG } from './types';
import HomeScreen from './screens/HomeScreen';
import WordListScreen from './screens/WordListScreen';
import ConfigScreen from './screens/ConfigScreen';
import CountdownScreen from './screens/CountdownScreen';
import DicteeScreen from './screens/DicteeScreen';
import CongratsScreen from './screens/CongratsScreen';
import CorrectionScreen from './screens/CorrectionScreen';
import ScoreScreen from './screens/ScoreScreen';

export default function App() {
  const { voices, initVoices, speak, fallbackAlert } = useSpeech();

  const [screen, setScreen] = useState<State>('home');
  const [rawWords, setRawWords] = useState('');
  const [allWords, setAllWords] = useState<WordEntry[]>([]);
  const [config, setConfig] = useState<DicteeConfig>(DEFAULT_CONFIG);
  const [roundWords, setRoundWords] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundAnswers, setRoundAnswers] = useState<Record<string, string>>({});
  const [bestResults, setBestResults] = useState<Record<string, GradeStatus>>({});

  function handleStart() {
    initVoices();
    setScreen('editing_words');
  }

  function handleWordsSubmit(raw: string, words: WordEntry[]) {
    setRawWords(raw);
    setAllWords(words);
    setScreen('configuring');
  }

  function handleConfigSubmit(cfg: DicteeConfig) {
    setConfig(cfg);
    setRoundWords(allWords);
    setCurrentIndex(0);
    setRoundAnswers({});
    setBestResults({});
    setScreen('countdown');
  }

  function handleCountdownDone() {
    setScreen('dictating');
  }

  function handleAnswer(wordId: string, answer: string) {
    const newAnswers = { ...roundAnswers, [wordId]: answer };
    setRoundAnswers(newAnswers);

    if (currentIndex + 1 < roundWords.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      const newBest = { ...bestResults };
      for (const word of roundWords) {
        const ans = newAnswers[word.id] ?? '';
        const grade = gradeAnswer(word.expected, ans);
        newBest[word.id] = mergeGrade(newBest[word.id], grade);
      }
      setBestResults(newBest);
      setScreen('congrats');
    }
  }

  function handleCongratsNext() {
    setScreen('reviewing');
  }

  function handleReviewDone() {
    setScreen('score');
  }

  function handleReplayMissed() {
    const missed = allWords.filter((w) => bestResults[w.id] !== 'correct');
    setRoundWords(missed);
    setCurrentIndex(0);
    setRoundAnswers({});
    setScreen('countdown');
  }

  function handleNewDictee() {
    setScreen('home');
    setRawWords('');
    setAllWords([]);
    setRoundWords([]);
    setCurrentIndex(0);
    setRoundAnswers({});
    setBestResults({});
  }

  const allCorrect = allWords.length > 0 && allWords.every((w) => bestResults[w.id] === 'correct');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {fallbackAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-amber-100 border border-amber-300 text-amber-800 text-sm px-4 py-2 rounded-xl shadow z-50">
          Voix française introuvable — voix par défaut utilisée.
        </div>
      )}

      {screen === 'home' && <HomeScreen onStart={handleStart} />}

      {screen === 'editing_words' && (
        <WordListScreen initialValue={rawWords} onSubmit={handleWordsSubmit} />
      )}

      {screen === 'configuring' && (
        <ConfigScreen
          voices={voices}
          initial={config}
          wordCount={allWords.length}
          onSubmit={handleConfigSubmit}
          onBack={() => setScreen('editing_words')}
        />
      )}

      {screen === 'countdown' && <CountdownScreen onDone={handleCountdownDone} />}

      {screen === 'dictating' && roundWords[currentIndex] && (
        <DicteeScreen
          word={roundWords[currentIndex]}
          wordIndex={currentIndex}
          totalWords={roundWords.length}
          config={config}
          speak={speak}
          onAnswer={handleAnswer}
        />
      )}

      {screen === 'congrats' && <CongratsScreen onNext={handleCongratsNext} />}

      {screen === 'reviewing' && (
        <CorrectionScreen
          words={roundWords}
          answers={roundAnswers}
          onDone={handleReviewDone}
        />
      )}

      {screen === 'score' && (
        <ScoreScreen
          allWords={allWords}
          bestResults={bestResults}
          allCorrect={allCorrect}
          onReplayMissed={handleReplayMissed}
          onNewDictee={handleNewDictee}
        />
      )}
    </div>
  );
}
