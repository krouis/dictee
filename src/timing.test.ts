import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptiveAnswerTimeSeconds, resolveAnswerTimeSeconds } from './timing';

test('adaptiveAnswerTimeSeconds gives short words the minimum time', () => {
  assert.equal(adaptiveAnswerTimeSeconds('chat'), 6);
});

test('adaptiveAnswerTimeSeconds scales with phrase length', () => {
  const wordTime = adaptiveAnswerTimeSeconds('parapluie');
  const phraseTime = adaptiveAnswerTimeSeconds('la belle journée');
  const sentenceTime = adaptiveAnswerTimeSeconds('le petit chat dort tranquillement sur le canapé');

  assert.ok(phraseTime > wordTime);
  assert.ok(sentenceTime > phraseTime);
});

test('adaptiveAnswerTimeSeconds caps very long sentences', () => {
  assert.equal(adaptiveAnswerTimeSeconds('mot '.repeat(200)), 45);
});

test('resolveAnswerTimeSeconds keeps fixed and manual settings unchanged', () => {
  assert.equal(resolveAnswerTimeSeconds(10, 'un long texte'), 10);
  assert.equal(resolveAnswerTimeSeconds(0, 'un long texte'), 0);
});

test('resolveAnswerTimeSeconds computes adaptive settings from the expected answer', () => {
  assert.equal(resolveAnswerTimeSeconds('adaptive', 'la belle journée'), adaptiveAnswerTimeSeconds('la belle journée'));
});
