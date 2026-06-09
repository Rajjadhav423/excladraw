/** In-memory cache of decoded HTMLImageElements keyed by dataURL. */
const cache = new Map<string, HTMLImageElement>();

/**
 * Returns a cached HTMLImageElement for the given dataURL.
 * Loads and caches on first call; subsequent calls are synchronous cache hits.
 */
export function loadImage(dataURL: string): Promise<HTMLImageElement> {
  const hit = cache.get(dataURL);
  if (hit) return Promise.resolve(hit);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      cache.set(dataURL, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataURL;
  });
}

export function getCachedImage(dataURL: string): HTMLImageElement | undefined {
  return cache.get(dataURL);
}
