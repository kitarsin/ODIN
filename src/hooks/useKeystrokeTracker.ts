import { useEffect, useRef } from 'react';

export function useKeystrokeTracker(textareaRef: React.RefObject<HTMLTextAreaElement>) {
  const flightTimes = useRef<number[]>([]);
  const dwellTimes = useRef<number[]>([]);
  const lastKeyUp = useRef(0);
  const keyDowns = useRef<Map<string, number>>(new Map());
  const perfStart = useRef(performance.now());
  const firstKeystrokePerf = useRef<number | null>(null);
  const keyDownCount = useRef(0);
  const backspaceDownCount = useRef(0);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = performance.now();
      keyDownCount.current += 1;
      if (e.code === 'Backspace' || e.code === 'Delete') {
        backspaceDownCount.current += 1;
      }
      keyDowns.current.set(e.code, now);
      if (firstKeystrokePerf.current === null) firstKeystrokePerf.current = now;
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
    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const first = firstKeystrokePerf.current;
    return {
      averageFlightTimeMs: avg(flightTimes.current),
      averageDwellTimeMs: avg(dwellTimes.current),
      initialLatencyMs: first != null ? first - perfStart.current : 0,
      totalTimeSeconds: (performance.now() - perfStart.current) / 1000,
      pasteDetected: false,
      inactivityDuration: 0,
      timeSinceLastSubmit: 0,
      errorLog: [] as { category: string; message: string }[],
      isFirstSubmission: false,
      typingBurstCoverage: 0,
      selfCorrectionCount: backspaceDownCount.current,
      systemCheckCount: 0,
      postErrorInactivitySeconds: -1,
      keyDownCount: keyDownCount.current,
    };
  };

  const reset = () => {
    flightTimes.current = [];
    dwellTimes.current = [];
    perfStart.current = performance.now();
    firstKeystrokePerf.current = null;
    keyDownCount.current = 0;
    backspaceDownCount.current = 0;
  };

  return { getSnapshot, reset };
}
