import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFrenchSpellingPhrases,
  gradeSpelledCharacter,
  isSpeechRecognitionSupported,
  parseAutonomousSpellingAlternatives,
  parseAutonomousSpellingTranscript,
  parseFrenchSpellingAlternatives,
  parseFrenchSpellingTranscript,
  splitExpectedCharacters,
} from './spellingRecognition';
import { gradeAnswer } from './grading';

test('parseFrenchSpellingTranscript parses French letter names', () => {
  assert.equal(parseFrenchSpellingTranscript('a bé cé')?.parsed, 'abc');
  assert.equal(parseFrenchSpellingTranscript('pé a erre a pé elle u i e')?.parsed, 'parapluie');
  assert.equal(parseFrenchSpellingTranscript('em a i esse o n')?.parsed, 'maison');
});

test('parseFrenchSpellingTranscript parses multi-token French letters', () => {
  assert.equal(parseFrenchSpellingTranscript('double vé i grec')?.parsed, 'wy');
});

test('parseFrenchSpellingTranscript parses accents and cedilla', () => {
  assert.equal(parseFrenchSpellingTranscript('e accent aigu té e accent aigu')?.parsed, 'été');
  assert.equal(parseFrenchSpellingTranscript('c cédille a')?.parsed, 'ça');
});

test('parseFrenchSpellingTranscript parses phrase separators', () => {
  assert.equal(parseFrenchSpellingTranscript('l apostrophe a erre bé erre e')?.parsed, "l'arbre");
  assert.equal(parseFrenchSpellingTranscript('pé o erre te e tiret cé elle e accent aigu')?.parsed, 'porte-clé');
  assert.equal(parseFrenchSpellingTranscript('elle a espace aime a i esse o enne')?.parsed, 'la maison');
});

test('parseFrenchSpellingTranscript fails instead of guessing unknown tokens', () => {
  assert.equal(parseFrenchSpellingTranscript('a complètement inconnu'), null);
});

test('parseFrenchSpellingAlternatives returns the most complete parseable transcript', () => {
  assert.deepEqual(parseFrenchSpellingAlternatives(['bé', 'bé o', 'bé o enne']), {
    transcript: 'bé o enne',
    parsed: 'bon',
  });
});

test('parseAutonomousSpellingTranscript accepts explicit letter names but rejects word-like transcripts', () => {
  assert.equal(parseAutonomousSpellingTranscript('em a i esse o n')?.parsed, 'maison');
  assert.equal(parseAutonomousSpellingTranscript('maison'), null);
  assert.equal(parseAutonomousSpellingTranscript('MAIF'), null);
});

test('parseAutonomousSpellingAlternatives prefers the most complete spelled transcript', () => {
  assert.deepEqual(parseAutonomousSpellingAlternatives(['a', 'a bé', 'a bé cé']), {
    transcript: 'a bé cé',
    parsed: 'abc',
  });
});

test('parsed spelling uses existing grading semantics', () => {
  assert.equal(gradeAnswer('été', parseFrenchSpellingTranscript('e accent aigu té e accent aigu')?.parsed ?? ''), 'correct');
  assert.equal(gradeAnswer('été', parseFrenchSpellingTranscript('e té e')?.parsed ?? ''), 'almost_correct');
  assert.equal(gradeAnswer('été', parseFrenchSpellingTranscript('a bé cé')?.parsed ?? ''), 'incorrect');
});

test('isSpeechRecognitionSupported checks standard and webkit constructors', () => {
  assert.equal(isSpeechRecognitionSupported({ SpeechRecognition: function Recognition() {} }), true);
  assert.equal(isSpeechRecognitionSupported({ webkitSpeechRecognition: function Recognition() {} }), true);
  assert.equal(isSpeechRecognitionSupported({}), false);
});

test('buildFrenchSpellingPhrases creates recognition hints from expected text', () => {
  assert.deepEqual(buildFrenchSpellingPhrases('Maison'), ['em a i esse o enne']);
  assert.deepEqual(buildFrenchSpellingPhrases("l'arbre"), ['elle apostrophe a erre bé erre e']);
  assert.deepEqual(buildFrenchSpellingPhrases('été'), ['e accent aigu té e accent aigu']);
});

test('gradeSpelledCharacter grades exact, accent-only, and wrong letters', () => {
  assert.equal(gradeSpelledCharacter('m', 'm'), 'correct');
  assert.equal(gradeSpelledCharacter('é', 'e'), 'almost_correct');
  assert.equal(gradeSpelledCharacter('m', 'n'), 'incorrect');
});

test('splitExpectedCharacters preserves accents and separators as individual slots', () => {
  assert.deepEqual(splitExpectedCharacters("l'été"), ['l', "'", 'é', 't', 'é']);
});
