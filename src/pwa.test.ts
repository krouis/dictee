import test from 'node:test';
import assert from 'node:assert/strict';
import { pwaIconSet, pwaIconSrc } from './pwa';

test('pwaIconSrc returns manifest-safe relative public paths', () => {
  assert.equal(pwaIconSrc('/icon-192.png'), 'icon-192.png');
  assert.equal(pwaIconSrc('nested/icon.svg'), 'nested/icon.svg');
});

test('pwaIconSet does not use root-relative icon URLs', () => {
  const icons = pwaIconSet();

  assert.deepEqual(icons, [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ]);
  assert.ok(icons.every((icon) => !icon.src.startsWith('/')));
});
