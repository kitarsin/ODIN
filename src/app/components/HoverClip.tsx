import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A GIF that rests on its first frame and plays from the start while hovered or focused
 * (tap toggles it on touch screens). GIFs can't be paused, so each play swaps in a fresh
 * object URL of the downloaded file, which restarts the animation without refetching.
 * With reduced motion it only ever shows `still`.
 */
export function HoverClip({ gif, poster, still, alt }: { gif: string; poster: string; still: string; alt: string }) {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [url, setUrl] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const wantedRef = useRef(false);
  const urlRef = useRef<string | null>(null);
  const pointerRef = useRef('mouse');

  const swap = useCallback((next: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next;
    setUrl(next);
  }, []);

  const play = useCallback(async () => {
    wantedRef.current = true;
    if (!blobRef.current) {
      try {
        blobRef.current = await (await fetch(gif)).blob();
      } catch {
        return;
      }
    }
    if (wantedRef.current) swap(URL.createObjectURL(blobRef.current));
  }, [gif, swap]);

  const stop = useCallback(() => {
    wantedRef.current = false;
    swap(null);
  }, [swap]);

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  if (reduced) {
    return <img className="clip" src={still} alt={alt} width={1152} height={648} loading="lazy" decoding="async" />;
  }

  const playing = url !== null;
  return (
    <button
      type="button"
      className={`clip-button${playing ? ' is-playing' : ''}`}
      aria-pressed={playing}
      onPointerDown={(e) => { pointerRef.current = e.pointerType; }}
      onPointerEnter={(e) => { if (e.pointerType !== 'touch') play(); }}
      onPointerLeave={(e) => { if (e.pointerType !== 'touch') stop(); }}
      onFocus={() => { if (pointerRef.current !== 'touch') play(); }}
      onBlur={stop}
      onClick={() => {
        if (pointerRef.current === 'touch') {
          if (playing) stop(); else play();
        }
        pointerRef.current = 'mouse';
      }}
    >
      <img className="clip" src={url ?? poster} alt={alt} width={1152} height={648} loading="lazy" decoding="async" />
    </button>
  );
}
