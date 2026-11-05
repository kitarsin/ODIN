import { useEffect, useState } from 'react';
import odinBlink from '../../img/landing/odin-head-blink.gif';
import { PixelGlyph } from './PixelGlyph';

// Everything on the splash is ODIN speaking: its opening line from level 0
// (odin-gdscript/scenes/levels/level0.tscn), with "I am ODIN." as the headline.
const HELLO = 'I AM ODIN.';
const HELLO_SOLID = 5; // "I AM " is solid, "ODIN." is outlined
const GREETING = 'You are the Runtime Compiler. Fix the code, or the simulation crashes';

const ASSET_WAIT_MS = 700;   // longest we wait for the pixel fonts and ODIN's sprite
const TYPE_START_MS = 650;   // the dialogue starts typing after the headline is in
const TYPE_MS_PER_CHAR = 18; // about 55 letters a second
const HOLD_MS = 450;         // pause after the line finishes
const COUNT_MS = 1800;       // the corner counter runs 000 → 100 in this time
const EXIT_MS = 420;
const LINE_DONE_MS = TYPE_START_MS + GREETING.length * TYPE_MS_PER_CHAR + HOLD_MS;

// The splash plays on every full page load (including a refresh), but not again when the
// visitor comes back to the landing page through the app's own links in the same load.
let playedThisLoad = false;

function shouldSkip() {
  return playedThisLoad || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function assetsReady() {
  const sprite = new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = odinBlink;
  });
  const fonts = document.fonts
    ? Promise.all([document.fonts.load('160px "ODIN Pixel"'), document.fonts.load('16px "Dedicool"')])
    : Promise.resolve();
  return Promise.race([
    Promise.all([sprite, fonts]),
    new Promise((resolve) => setTimeout(resolve, ASSET_WAIT_MS)),
  ]);
}

/** A short greeting splash shown when the landing page loads. Any click or key skips it. */
export function LandingSplash({ onDone }: { onDone: () => void }) {
  const [skip] = useState(shouldSkip);
  const [started, setStarted] = useState(false);
  const [typed, setTyped] = useState(0);
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(skip);

  useEffect(() => {
    if (skip) {
      onDone();
      return;
    }
    playedThisLoad = true;
    const root = document.documentElement;
    root.classList.add('odin-preloading');

    let frame = 0;
    let exitTimer = 0;
    let exited = false;

    const exit = () => {
      if (exited) return;
      exited = true;
      cancelAnimationFrame(frame);
      setTyped(GREETING.length);
      setCount(100);
      setLeaving(true);
      root.classList.remove('odin-preloading');
      onDone();
      exitTimer = window.setTimeout(() => setGone(true), EXIT_MS);
    };

    assetsReady().then(() => {
      if (exited) return;
      setStarted(true);
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / COUNT_MS);
        setCount(Math.round(100 * (1 - (1 - t) ** 2)));
        setTyped(Math.max(0, Math.min(GREETING.length, Math.floor((elapsed - TYPE_START_MS) / TYPE_MS_PER_CHAR))));
        if (elapsed >= LINE_DONE_MS) exit();
        else frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });

    window.addEventListener('keydown', exit);
    window.addEventListener('pointerdown', exit);

    return () => {
      exited = true;
      cancelAnimationFrame(frame);
      clearTimeout(exitTimer);
      window.removeEventListener('keydown', exit);
      window.removeEventListener('pointerdown', exit);
      root.classList.remove('odin-preloading');
    };
  }, [skip, onDone]);

  if (gone) return null;

  return (
    <div className={`landing-splash${leaving ? ' is-leaving' : ''}`} aria-hidden="true">
      <div className="splash-frame">
        <PixelGlyph name="cross" scale={3} className="corner tl" />
        <PixelGlyph name="cross" scale={3} className="corner tr" />
        <PixelGlyph name="cross" scale={3} className="corner bl" />
        <PixelGlyph name="cross" scale={3} className="corner br" />
        <p className="splash-top">ARRAY QUEST // 01</p>
        {started && (
          <div className="splash-center">
            <p className="splash-hello">
              {HELLO.split('').map((ch, i) => (
                <span key={i} className={i < HELLO_SOLID ? 'px-solid' : 'px-outline'} style={{ animationDelay: `${i * 45}ms` }}>{ch}</span>
              ))}
            </p>
            <div className="splash-odin">
              <img className="px" src={odinBlink} alt="" width={128} height={128} />
              <div className="o-panel o-dialog">
                <span className="o-dialog-speaker">ODIN</span>
                <p className="o-dialog-body">{GREETING.slice(0, typed)}<i className="splash-caret" /></p>
              </div>
            </div>
          </div>
        )}
        <p className="splash-readout">LOADING {String(count).padStart(3, '0')}</p>
        <p className="splash-skip">CLICK OR PRESS ANY KEY</p>
      </div>
    </div>
  );
}
