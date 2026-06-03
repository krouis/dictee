export type SpeechRunToken = { value: boolean };

export function createSpeechRunToken(): SpeechRunToken {
  return { value: false };
}

export function cancelSpeechRun(token: SpeechRunToken | null | undefined) {
  if (token) token.value = true;
}

export function isSpeechRunCancelled(token: SpeechRunToken): boolean {
  return token.value;
}
