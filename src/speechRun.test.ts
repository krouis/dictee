import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cancelSpeechRun,
  createSpeechRunToken,
  isSpeechRunCancelled,
  type SpeechRunToken,
} from './speechRun';

test('speech run tokens start active and become cancelled', () => {
  const token = createSpeechRunToken();

  assert.equal(isSpeechRunCancelled(token), false);
  cancelSpeechRun(token);
  assert.equal(isSpeechRunCancelled(token), true);
});

test('cancelling a new run leaves previous run state intact', () => {
  const first = createSpeechRunToken();
  const second = createSpeechRunToken();

  cancelSpeechRun(first);

  assert.equal(isSpeechRunCancelled(first), true);
  assert.equal(isSpeechRunCancelled(second), false);
});

test('cancelSpeechRun accepts an empty active token reference', () => {
  assert.doesNotThrow(() => cancelSpeechRun(null));
  assert.doesNotThrow(() => cancelSpeechRun(undefined));
});

test('only the latest uncancelled token should be treated as active', () => {
  let active: SpeechRunToken | null = createSpeechRunToken();
  const first = active;
  cancelSpeechRun(active);
  active = createSpeechRunToken();
  const second = active;

  assert.equal(!isSpeechRunCancelled(first) && active === first, false);
  assert.equal(!isSpeechRunCancelled(second) && active === second, true);
});
