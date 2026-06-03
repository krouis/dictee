import { useCallback, useRef, useState } from 'react';
import {
  isSpeechRecognitionSupported,
  parseFrenchSpellingAlternatives,
  type ParsedSpelling,
} from '../spellingRecognition';

type RecognitionStatus = 'unsupported' | 'idle' | 'listening' | 'processing' | 'result' | 'error';

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionResultEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: { transcript: string };
    };
  };
};

type SpeechRecognitionErrorEventLike = {
  error?: string;
};

type SpeechRecognitionConstructor = new () => RecognitionLike;

function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  const candidate = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition ?? null;
}

function collectAlternatives(event: SpeechRecognitionResultEventLike): {
  interimTranscript: string;
  finalTranscripts: string[];
} {
  const finalTranscripts: string[] = [];
  let interimTranscript = '';

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];
    for (let j = 0; j < result.length; j++) {
      const transcript = result[j]?.transcript.trim();
      if (!transcript) continue;
      if (result.isFinal) finalTranscripts.push(transcript);
      else if (j === 0) interimTranscript = transcript;
    }
  }

  return { interimTranscript, finalTranscripts };
}

export function useSpeechRecognition(language: string) {
  const supported = isSpeechRecognitionSupported(typeof window === 'undefined' ? undefined : window);
  const [status, setStatus] = useState<RecognitionStatus>(supported ? 'idle' : 'unsupported');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<ParsedSpelling | null>(null);
  const [error, setError] = useState('');
  const recognitionRef = useRef<RecognitionLike | null>(null);

  const reset = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setTranscript('');
    setResult(null);
    setError('');
    setStatus(supported ? 'idle' : 'unsupported');
  }, [supported]);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    setStatus('processing');
    recognition.stop();
  }, []);

  const start = useCallback(() => {
    const Recognition = getRecognitionConstructor();
    if (!supported || !Recognition) {
      setStatus('unsupported');
      setError('Reconnaissance vocale indisponible sur ce navigateur.');
      return;
    }

    recognitionRef.current?.abort();

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.onresult = (event) => {
      const { interimTranscript, finalTranscripts } = collectAlternatives(event);
      if (interimTranscript) setTranscript(interimTranscript);

      if (finalTranscripts.length > 0) {
        setTranscript(finalTranscripts[0]);
        const parsed = parseFrenchSpellingAlternatives(finalTranscripts);
        if (parsed) {
          setResult(parsed);
          setStatus('result');
          setError('');
        } else {
          setResult(null);
          setStatus('error');
          setError("Je n'ai pas reconnu une épellation complète.");
        }
      }
    };
    recognition.onerror = (event) => {
      setStatus('error');
      setResult(null);
      setError(event.error === 'not-allowed'
        ? 'Micro refusé. Utilisez la correction manuelle.'
        : 'Reconnaissance vocale interrompue.');
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setStatus((current) => {
        if (current === 'listening' || current === 'processing') return 'idle';
        return current;
      });
    };

    setTranscript('');
    setResult(null);
    setError('');
    setStatus('listening');
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setStatus('error');
      setError('Impossible de démarrer le micro. Réessayez ou utilisez la correction manuelle.');
    }
  }, [language, supported]);

  return {
    supported,
    status,
    transcript,
    result,
    error,
    start,
    stop,
    reset,
  };
}
