const publicPath = (path: string) => path.replace(/^\/+/, '');

export function pwaIconSrc(path: string): string {
  return publicPath(path);
}

export function pwaIconSet() {
  return [
    { src: pwaIconSrc('icon-192.png'), sizes: '192x192', type: 'image/png' },
    { src: pwaIconSrc('icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ];
}
