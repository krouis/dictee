import { useState, useCallback } from 'react';

export type SpeakOptions = {
  rate?: number;
  voiceURI?: string;
  language?: string;
};

export function useSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [fallbackAlert, setFallbackAlert] = useState(false);

  // Call this once on the first user gesture (e.g. button click) to unlock TTS.
  const initVoices = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const speak = useCallback((text: string, opts: SpeakOptions = {}): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = opts.rate ?? 1.0;
      utt.lang = opts.language ?? 'fr-FR';

      const allVoices = window.speechSynthesis.getVoices();
      let voice: SpeechSynthesisVoice | undefined;

      if (opts.voiceURI) {
        voice = allVoices.find((v) => v.voiceURI === opts.voiceURI);
      }
      if (!voice) {
        voice = allVoices.find((v) => v.lang.startsWith(opts.language?.slice(0, 2) ?? 'fr'));
      }
      if (!voice && allVoices.length > 0) {
        voice = allVoices[0];
        setFallbackAlert(true);
      }
      if (voice) utt.voice = voice;

      utt.onend = () => resolve();
      utt.onerror = () => resolve();
      window.speechSynthesis.speak(utt);
    });
  }, []);

  return { voices, initVoices, speak, fallbackAlert };
}
