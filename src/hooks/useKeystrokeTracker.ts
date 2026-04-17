import { useEffect, useRef, useState } from 'react';

export function useKeystrokeTracker(textareaRef: React.RefObject<HTMLTextAreaElement>) {
  const flightTimes = useRef<number[]>([]);
  const dwellTimes = useRef<number[]>([]);
  const lastKeyUp = useRef<number>(0);
  const keyDowns = useRef<Map<string, number>>(new Map());
  const startTime = useRef<number>(Date.now());
  const firstKeystroke = useRef<number | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = performance.now();
      keyDowns.current.set(e.code, now);
      if (firstKeystroke.current === null) firstKeystroke.current = now;
      if (lastKeyUp.current > 0) flightTimes.current.push(now - lastKeyUp.current);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const now = performance.now();
      const downTime = keyDowns.current.get(e.code);
      if (downTime) dwellTimes.current.push(now - downTime);
      lastKeyUp.current = now;
      keyDowns.current.delete(e.code);
    };

    el.addEventListener('keydown', handleKeyDown);
    el.addEventListener('keyup', handleKeyUp);
    return () => {
      el.removeEventListener('keydown', handleKeyDown);
      el.removeEventListener('keyup', handleKeyUp);
    };
  }, [textareaRef]);

  const getSnapshot = () => {
    const avg = (arr: number[]) => arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : 0;
    return {
      averageFlightTimeMs: avg(flightTimes.current),
      averageDwellTimeMs: avg(dwellTimes.current),
      initialLatencyMs: firstKeystroke.current ?? 0,
      totalTimeSeconds: (Date.now() - startTime.current) / 1000
    };
  };

  const reset = () => {
    flightTimes.current = [];
    dwellTimes.current = [];
    startTime.current = Date.now();
    firstKeystroke.current = null;
  };

  return { getSnapshot, reset };
}