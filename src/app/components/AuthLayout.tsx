import { useEffect, useState, type ReactNode } from 'react';
import '../../styles/odin-public.css';

// Lines from the world of the game, typed out one after another over the sky.
const LINES = [
  'Bring the world back to normal.',
  'The simulation is crashing. Only your code can fix it.',
  'Every bug you squash restores a piece of the world.',
  'ODIN is waiting for the Runtime Compiler.',
  'Debug the maze. Outsmart the glitches. Keep going.',
  'One fixed array at a time.',
];
const TYPE_MS = 42; // per character
const HOLD_MS = 2800; // once a line is complete

/** ODIN's transmission: each line types itself out, holds, then the next one starts. */
function Transmission() {
  const [line, setLine] = useState(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const text = LINES[line];
    if (reduced || shown >= text.length) {
      // Whole line on screen: wait, then move on (with reduced motion the line appears at once).
      if (reduced && shown < text.length) { setShown(text.length); return; }
      const timer = window.setTimeout(() => { setLine((i) => (i + 1) % LINES.length); setShown(0); }, HOLD_MS);
      return () => clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setShown((n) => n + 1), TYPE_MS);
    return () => clearTimeout(timer);
  }, [line, shown]);

  const text = LINES[line];
  return (
    <div className="cine">
      <div className="cine-card">
        <p className="cine-kicker">ODIN // TRANSMISSION {String(line + 1).padStart(2, '0')}</p>
        <p className="cine-name">
          {/* The full line holds the space so the layout does not jump while typing. */}
          <span className="cine-ghost">{text}</span>
          <span className="cine-typed">{text.slice(0, shown)}<i className="cine-caret" /></span>
        </p>
      </div>
    </div>
  );
}

/** Frame for the sign-in pages: one sky-and-hedge scene behind the whole page, ODIN's transmission
    on the left and the page's own card on the right. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="odin-public odin-auth">
      <div className="auth-scene" aria-hidden="true" />
      <aside className="auth-art" aria-hidden="true">
        <Transmission />
      </aside>
      <main className="auth-main">
        <div className="auth-slot">{children}</div>
      </main>
    </div>
  );
}
