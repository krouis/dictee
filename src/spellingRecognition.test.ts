import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isSpeechRecognitionSupported,
  parseFrenchSpellingAlternatives,
  parseFrenchSpellingTranscript,
} from './spellingRecognition';
import { gradeAnswer } from './grading';

test('parseFrenchSpellingTranscript parses French letter names', () => {
  assert.equal(parseFrenchSpellingTranscript('a bé cé')?.parsed, 'abc');
  assert.equal(parseFrenchSpellingTranscript('pé a erre a pé elle u i e')?.parsed, 'parapluie');
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

test('parseFrenchSpellingAlternatives returns the first parseable transcript', () => {
  assert.deepEqual(parseFrenchSpellingAlternatives(['inconnu', 'bé o enne']), {
    transcript: 'bé o enne',
    parsed: 'bon',
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
