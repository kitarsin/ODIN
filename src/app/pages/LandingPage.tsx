import { Braces, Code2, Keyboard, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { isMobileDevice } from '../utils/mobileDevice';
import { LandingSplash } from '../components/LandingSplash';
import { HoverClip } from '../components/HoverClip';
import { PixelGlyph, RollLabel } from '../components/PixelGlyph';
import odinHead from '../../img/landing/odin-head-1x.png';
import odinHeadLarge from '../../img/landing/odin-head-4x.png';
import odinBlink from '../../img/landing/odin-head-blink.gif';
import gameplayPreview from '../../img/landing/odin-gameplay.png';
import syntaxErrorClip from '../../img/landing/battle-syntax-error.gif';
import syntaxErrorStill from '../../img/landing/battle-syntax-error-still.png';
import syntaxErrorPoster from '../../img/landing/battle-syntax-error-poster.webp';
import odinHintClip from '../../img/landing/battle-odin-hint.gif';
import odinHintStill from '../../img/landing/battle-odin-hint-still.png';
import odinHintPoster from '../../img/landing/battle-odin-hint-poster.webp';
import encounterClip from '../../img/landing/overworld-encounter.gif';
import encounterStill from '../../img/landing/overworld-encounter-still.png';
import encounterPoster from '../../img/landing/overworld-encounter-poster.webp';
import playerMWalk from '../../img/landing/playerm-walk.gif';
import playerMIdle from '../../img/landing/playerm-idle.png';
import playerFWalk from '../../img/landing/playerf-walk.gif';
import playerFIdle from '../../img/landing/playerf-idle.png';
import jersonStill from '../../img/landing/team/jerson-still.png';
import johanStill from '../../img/landing/team/johan-still.png';
import russellStill from '../../img/landing/team/russell-still.png';
import ianStill from '../../img/landing/team/ian-still.png';
import jersonIdle from '../../img/landing/team/jerson-idle.gif';
import johanIdle from '../../img/landing/team/johan-idle.gif';
import russellIdle from '../../img/landing/team/russell-idle.gif';
import ianIdle from '../../img/landing/team/ian-idle.gif';
import docShaneStill from '../../img/landing/team/doc-shane-still.png';
import docShaneIdle from '../../img/landing/team/doc-shane-idle.gif';
import docJelloStill from '../../img/landing/team/doc-jello-still.png';
import docJelloIdle from '../../img/landing/team/doc-jello-idle.gif';
import classroomScene from '../../img/landing/bg/team-classroom.png';
import '../../styles/odin-public.css';
import './LandingPage.css';

const processSteps = [
  {
    number: '01',
    icon: <Code2 aria-hidden="true" />,
    title: 'Read the code',
    text: 'Roslyn-based analysis looks at the structure of a C# solution, including common array logic errors.',
    color: 'cyan',
  },
  {
    number: '02',
    icon: <Braces aria-hidden="true" />,
    title: 'Notice the pattern',
    text: 'A transparent set of rules reads observable work patterns alongside each attempt.',
    color: 'amber',
  },
  {
    number: '03',
    icon: <Sparkles aria-hidden="true" />,
    title: 'Offer a next step',
    text: 'ODIN selects a prewritten hint through the game world, so the student can keep solving.',
    color: 'mint',
  },
];

// spot: where each sprite stands in the classroom scene, in the scene's own pixels (256 x 128).
// Students stand in the floor lane on the left; faculty stand on the teacher's platform right of the
// pillar, mirrored so the two groups face each other.
// The sprite files are drawn at 4x, so every member is 21 x 34 scene pixels.
const students = [
  { tag: 'P1', name: 'Jerson Angelo B. Bautista', still: jersonStill, idle: jersonIdle, spot: [21, 78] },
  { tag: 'P2', name: 'Ken Johan Liwanag', still: johanStill, idle: johanIdle, spot: [55, 74] },
  { tag: 'P3', name: 'Russell D. Magdaong', still: russellStill, idle: russellIdle, spot: [89, 78] },
  { tag: 'P4', name: 'Kristian Lawrence R. Villaraza', still: ianStill, idle: ianIdle, spot: [123, 74] },
];

const faculty = [
  { tag: 'MENTOR', name: 'Dr. Angelo C. Arguson', role: 'Thesis mentor', still: docJelloStill, idle: docJelloIdle, spot: [180, 50] },
  { tag: 'ADVISER', name: 'Dr. Shaneth C. Ambat', role: 'Course adviser', still: docShaneStill, idle: docShaneIdle, spot: [224, 50] },
];

// Everyone in the classroom, back row first so nearer sprites overlap farther ones.
const partyInRoom = [
  ...faculty.map((m) => ({ tag: m.tag, still: m.still, idle: m.idle, spot: m.spot, w: 21, h: 34, flip: true })),
  ...students.map((m) => ({ tag: m.tag, still: m.still, idle: m.idle, spot: m.spot, w: 21, h: 34, flip: false })),
].sort((a, b) => a.spot[1] - b.spot[1]);

// The game's 20 enemies, in level order, drawn as tonal silhouettes behind the hero.
const enemies = Object.entries(
  import.meta.glob<string>('../../img/landing/enemies/*.png', { eager: true, import: 'default' }),
).sort(([a], [b]) => a.localeCompare(b)).map(([, src]) => src);

/** Section label: pixel steps + the section's kicker text. */
function Kicker({ children, className = '' }: { children: string; className?: string }) {
  return <p className={`o-kicker ${className}`}><PixelGlyph name="steps" /> {children}</p>;
}

/** Pixel crosses pinned to the four corners of the parent. */
function Corners() {
  return (
    <span className="corners" aria-hidden="true">
      <PixelGlyph name="cross" className="tl" /><PixelGlyph name="cross" className="tr" />
      <PixelGlyph name="cross" className="bl" /><PixelGlyph name="cross" className="br" />
    </span>
  );
}

/** Counts a revealed number up from zero, e.g. <strong data-count="1.14" data-decimals="2" data-prefix="+">. */
function countUp(el: HTMLElement) {
  const node = el.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const target = Number(el.dataset.count);
  const decimals = Number(el.dataset.decimals ?? 0);
  const prefix = el.dataset.prefix ?? '';
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / 900);
    node.textContent = prefix + (target * (1 - (1 - t) ** 3)).toFixed(decimals);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// The in-game footage, in the order a player meets it: the encounter on the map, a first
// attempt in battle, then ODIN's hint. Shown one at a time in FootageReel.
const footage = [
  { step: '01', name: 'Encounter', bar: 'MAP // ENCOUNTER', gif: encounterClip, poster: encounterPoster, still: encounterStill,
    alt: 'The player walks through the Fast Food Maze until the Infinite Striker comes up and stops them, starting a battle' },
  { step: '02', name: 'Attempt', bar: 'BATTLE // ATTEMPT', gif: syntaxErrorClip, poster: syntaxErrorPoster, still: syntaxErrorStill,
    alt: "A player types a C# nested loop in the game's code editor until a syntax error is reported on line 12" },
  { step: '03', name: 'Next step', bar: 'BATTLE // NEXT STEP', gif: odinHintClip, poster: odinHintPoster, still: odinHintStill,
    alt: "ODIN's dialogue box types out a hint suggesting the player try a different approach" },
];

/** A game-style command menu of numbered steps beside one large window; the chosen step's clip
    plays in the window on hover, like the other footage. */
function FootageReel() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (i: number) => {
    const next = (i + footage.length) % footage.length;
    setActive(next);
    tabs.current[next]?.focus();
  };
  const clip = footage[active];
  return (
    <div className="footage">
      <div className="footage-steps" role="tablist" aria-label="In-game footage" aria-orientation="vertical">
        {footage.map((f, i) => (
          <button
            key={f.step}
            ref={(el) => { tabs.current[i] = el; }}
            type="button"
            role="tab"
            id={`footage-tab-${f.step}`}
            aria-selected={i === active}
            aria-controls="footage-panel"
            tabIndex={i === active ? 0 : -1}
            className="footage-step"
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select(i + 1); }
              if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select(i - 1); }
            }}
          >
            <PixelGlyph name="chevron" scale={3} className="footage-step-cursor" />
            <span className="footage-step-num">{f.step}</span>
            <span className="footage-step-name">{f.name}</span>
          </button>
        ))}
      </div>
      <figure className="o-panel footage-window" role="tabpanel" id="footage-panel" aria-labelledby={`footage-tab-${clip.step}`}>
        <div className="o-panel-bar"><span>{clip.bar}</span><small>{clip.step} / {String(footage.length).padStart(2, '0')}</small></div>
        <HoverClip key={clip.step} gif={clip.gif} poster={clip.poster} still={clip.still} alt={clip.alt} />
      </figure>
    </div>
  );
}

// The game's 20 enemies split into a far row (all of them, small) and a near row (every other one, large).
const nearEnemies = enemies.filter((_, i) => i % 2 === 0);

export function LandingPage() {
  const noticeRef = useRef<HTMLDialogElement>(null);
  const meterRef = useRef<HTMLElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  // The party member under the pointer, in the classroom or the party bar.
  const [partyFocus, setPartyFocus] = useState<string | null>(null);
  const handleSplashDone = useCallback(() => setReady(true), []);

  // The phone notice waits for the preloader so the two don't stack.
  useEffect(() => {
    if (!ready || !isMobileDevice()) return;
    try {
      if (sessionStorage.getItem('odin-mobile-notice-seen')) return;
      sessionStorage.setItem('odin-mobile-notice-seen', '1');
    } catch {
      // The notice still works if browser storage is unavailable.
    }
    noticeRef.current?.showModal();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = document.querySelectorAll<HTMLElement>('[data-odin-reveal]');
    if (prefersReduced || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            entry.target.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ready]);

  // "Why use ODIN?" entries open while the pointer rests on them and close when it leaves, on
  // devices with a real hover. Clicking and the keyboard still toggle them as usual.
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const items = [...document.querySelectorAll<HTMLDetailsElement>('.faq-list details')];
    const open = (e: Event) => { (e.currentTarget as HTMLDetailsElement).open = true; };
    const close = (e: Event) => { (e.currentTarget as HTMLDetailsElement).open = false; };
    items.forEach((d) => { d.addEventListener('mouseenter', open); d.addEventListener('mouseleave', close); });
    return () => items.forEach((d) => { d.removeEventListener('mouseenter', open); d.removeEventListener('mouseleave', close); });
  }, []);

  // Scroll-linked effects. The header's progress meter fills in 16px steps; the enemies in section
  // 01 drift at two depths; the hero gets --hero (0 at the top, 1 once scrolled past); and every
  // [data-scroll] element gets --e, its entry (0 with its top at the bottom of the screen, 1 once
  // the top is halfway up, or as high as the page can scroll), and --p, its whole trip through the
  // screen. LandingPage.css turns those numbers into motion. Scene backgrounds stay still.
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const meter = meterRef.current;
      if (meter) {
        const width = meter.parentElement?.clientWidth ?? 0;
        const filled = Math.floor(((max > 0 ? y / max : 0) * width) / 16) * 16;
        meter.style.clipPath = `inset(0 ${Math.max(0, width - filled)}px 0 0)`;
      }
      if (prefersReduced) return;
      // The enemies in section 01 drift at two depths relative to their own section, always
      // computed from its live position so the layers never jump when they come into view.
      const section = farRef.current?.parentElement;
      if (section) {
        const top = section.getBoundingClientRect().top;
        const shift = Math.max(-1, Math.min(1, top / window.innerHeight));
        if (farRef.current) farRef.current.style.transform = `translate3d(0, ${shift * 36}px, 0)`;
        if (nearRef.current) nearRef.current.style.transform = `translate3d(0, ${shift * 14}px, 0)`;
      }
      const vh = window.innerHeight;
      const hero = heroRef.current;
      if (hero) hero.style.setProperty('--hero', Math.min(1, Math.max(0, y / hero.offsetHeight)).toFixed(3));
      document.querySelectorAll<HTMLElement>('[data-scroll]').forEach((el) => {
        const box = el.getBoundingClientRect();
        if (box.bottom < -200 || box.top > vh + 200) return;
        const p = Math.min(1, Math.max(0, (vh - box.top) / (vh + box.height)));
        // Blocks near the end of the page can't reach halfway up, so they finish where the page stops.
        const reach = Math.max(80, Math.min(vh * 0.5, vh - (box.top - (max - y))));
        const e = Math.min(1, Math.max(0, (vh - box.top) / reach));
        el.style.setProperty('--p', p.toFixed(3));
        el.style.setProperty('--e', e.toFixed(3));
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <main className="odin-public odin-landing">
      <LandingSplash onDone={handleSplashDone} />

      <dialog ref={noticeRef} className="mobile-notice" aria-labelledby="mobile-notice-title" aria-describedby="mobile-notice-description">
        <div className="o-panel mobile-notice-inner">
          <div className="mobile-notice-icon"><Keyboard aria-hidden="true" /></div>
          <p className="mobile-notice-kicker">ODIN // DEVICE NOTICE</p>
          <h2 id="mobile-notice-title">Your quest is best on a bigger screen.</h2>
          <p id="mobile-notice-description">ODIN is optimized for a desktop or laptop with a physical keyboard. Feel free to explore this page on your phone, then switch to a computer to enter the portal.</p>
          <form method="dialog"><button className="pixel-button primary-button" autoFocus><RollLabel>Explore the website</RollLabel> <PixelGlyph name="chevron" /></button></form>
        </div>
      </dialog>

      <header className="landing-header">
        <Link to="/" className="landing-brand" aria-label="ODIN home">
          <img className="px" src={odinHead} alt="" width={32} height={32} />
          <span>ODIN</span>
          <i>INSOMNICODE</i>
        </Link>
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#how-it-works"><RollLabel>How it works</RollLabel></a>
          <a href="#scope"><RollLabel>The experience</RollLabel></a>
          <a href="#research"><RollLabel>The research</RollLabel></a>
          <a href="#team"><RollLabel>The team</RollLabel></a>
          <Link className="landing-nav-cta" to="/login"><RollLabel>Enter the portal</RollLabel> <PixelGlyph name="chevron" /></Link>
        </nav>
        <span className="scroll-meter" aria-hidden="true"><i ref={meterRef} /></span>
      </header>
      <nav className="mobile-section-nav" aria-label="Explore this page">
        <a href="#how-it-works">How it works</a>
        <a href="#scope">The experience</a>
        <a href="#research">Research</a>
        <a href="#team">Team</a>
      </nav>

      <section className="sheet sheet-deep landing-hero" ref={heroRef}>
        <div className="scene-bg scene-sim" aria-hidden="true" />
        <Corners />
        <div className="hero-display">
          <p className="o-kicker eyebrow" data-odin-reveal><span className="o-dot" /> A coding adventure by InsomniCode</p>
          <h1 data-odin-reveal data-odin-delay="1"><span className="px-solid">Learn to code.</span><br /><span className="px-outline">Keep going.<i className="pixel-caret" aria-hidden="true" /></span></h1>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-lede" data-odin-reveal data-odin-delay="2">A little guidance can change the game. Explore C# arrays in an 8-bit RPG where thoughtful hints help you find your own way forward.</p>
            <div className="hero-actions" data-odin-reveal data-odin-delay="3">
              <Link className="pixel-button primary-button" to="/login"><RollLabel>Enter the ODIN portal</RollLabel> <PixelGlyph name="chevron" /></Link>
              <a className="text-button" href="#how-it-works">Explore the system <PixelGlyph name="down" /></a>
            </div>
            <ul className="hero-meta" data-odin-reveal data-odin-delay="3">
              <li><Keyboard aria-hidden="true" /> Desktop + physical keyboard</li>
              <li><ShieldCheck aria-hidden="true" /> Hints, never answers</li>
            </ul>
            <div className="o-panel o-dialog field-note" data-odin-reveal data-odin-delay="3">
              <span className="o-dialog-speaker">FIELD NOTE</span>
              <p className="o-dialog-body">Support the process.<br />Let the student solve.</p>
            </div>
            <div className="mobile-callout" role="note">
              <Keyboard aria-hidden="true" />
              <span><strong>Best on desktop</strong> — open ODIN on a laptop or desktop with a physical keyboard.</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Preview of the ODIN game and code editor" data-odin-reveal data-odin-delay="2">
            <div className="hero-tilt">
              <div className="hero-signal"><span className="o-dot" /> SYSTEM READY <b>01</b></div>
              <picture className="hero-mascot">
                <source media="(prefers-reduced-motion: reduce)" srcSet={odinHeadLarge} />
                <img className="px" src={odinBlink} alt="ODIN pixel robot mascot" width={128} height={128} />
              </picture>
              <div className="o-panel game-window">
                <div className="o-panel-bar window-bar">
                  <span className="window-lights" aria-hidden="true"><i /><i /><i /></span>
                  <span>ARRAY QUEST // 01</span>
                  <span className="window-live">LIVE</span>
                </div>
                <img className="gameplay-preview" src={gameplayPreview} alt="ODIN guides a player through a coding challenge in the game" width={1152} height={648} />
                <div className="window-footer"><span><i /> ODIN GUIDANCE ACTIVE</span><span>IN-GAME PREVIEW</span></div>
              </div>
            </div>
          </div>
        </div>
        <a className="scroll-cue" href="#how-it-works" aria-label="Scroll to how it works"><PixelGlyph name="down" /> SCROLL TO EXPLORE <PixelGlyph name="down" /></a>
      </section>

      <section className="sheet sheet-light system-section" id="how-it-works">
        <div className="hero-enemies far" ref={farRef} aria-hidden="true">
          {enemies.map((src) => (
            <span key={src} style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}><img src={src} alt="" /></span>
          ))}
        </div>
        <div className="hero-enemies near" ref={nearRef} aria-hidden="true">
          {nearEnemies.map((src) => (
            <span key={src} style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}><img src={src} alt="" /></span>
          ))}
        </div>
        <div className="sheet-inner">
          <div className="section-heading split" data-odin-reveal data-scroll>
            <div><Kicker>01 / THE ODIN LOOP</Kicker><h2>More than an error message.</h2></div>
            <p>When code gets stuck, ODIN brings together code structure and observable work patterns to offer a useful next step.</p>
          </div>
          <div className="process-grid" data-scroll>
            {processSteps.map((step, idx) => (
              <article
                className={`process-card ${step.color}`}
                key={step.number}
                data-odin-reveal
                data-odin-delay={(idx + 1).toString()}
              >
                <div className="card-top"><div className="step-icon">{step.icon}</div></div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <span className="card-number">{step.number}</span>
              </article>
            ))}
          </div>
          <div className="footage-band" data-odin-reveal data-scroll>
            <div className="scene-bg scene-diner" aria-hidden="true" />
            <span className="edge-crosses left" aria-hidden="true"><PixelGlyph name="cross" scale={3} /><PixelGlyph name="cross" scale={3} /><PixelGlyph name="cross" scale={3} /></span>
            <FootageReel />
            <span className="edge-crosses right" aria-hidden="true"><PixelGlyph name="cross" scale={3} /><PixelGlyph name="cross" scale={3} /><PixelGlyph name="cross" scale={3} /></span>
          </div>
          <div className="loop-note" data-odin-reveal data-scroll><span className="note-mark" aria-hidden="true">↳</span><p><strong>The student stays in control.</strong> ODIN provides scaffolding, not a generated solution.</p></div>
        </div>
      </section>

      <section className="sheet sheet-deep scope-section" id="scope">
        <div className="scene-bg scene-lab" aria-hidden="true" />
        <div className="sheet-inner scope-grid" data-scroll>
          <div className="scope-mark" data-odin-reveal><img className="px" src={odinHeadLarge} alt="" width={128} height={128} /></div>
          <div className="scope-copy" data-odin-reveal data-odin-delay="1">
            <Kicker>02 / BUILT WITH INTENTION</Kicker>
            <h2>A game world with a learning purpose.</h2>
            <p>ODIN combines an 8-bit role-playing game with a code editor and a rule-based tutoring system. The game supports the work; it does not replace it.</p>
            <div className="scope-tags"><span>C# arrays</span><span>Rule-based support</span><span>Desktop browser</span></div>
          </div>
          <div className="o-panel scope-principles" data-odin-reveal data-odin-delay="2">
            <div><span>01</span><p><b>Observable signals</b> guide timely support; they are not a clinical diagnosis.</p></div>
            <div><span>02</span><p><b>Prewritten hints</b> point to a next step without giving away answers.</p></div>
            <div><span>03</span><p><b>Readable code</b> stays clear while pixel art belongs to the game world.</p></div>
          </div>
        </div>
      </section>

      <div className="sheet sheet-light study-block">
        <div className="scene-bg scene-library" aria-hidden="true" />
      <section className="research-section" id="research">
        <div className="sheet-inner research-grid" data-scroll>
          <div className="research-intro" data-odin-reveal>
            <Kicker>03 / THE RESEARCH</Kicker>
            <h2>Built to make the next attempt feel possible.</h2>
            <p>ODIN was developed at FEU Institute of Technology to explore how timely, interpretable support can help students learning to program.</p>
            <span className="research-label"><span className="o-dot" /> CS EXPO 2026 · INSOMNICODE</span>
          </div>
          <div className="research-results" data-odin-reveal data-odin-delay="1">
            <article><span className="result-index">01 / LEARNING</span><strong className="px-solid" data-count="1.14" data-decimals="2" data-prefix="+">+1.14</strong><h3>mean score change</h3><p>On a 0–5 C# array assessment across 21 students in the pretest–posttest study.</p></article>
            <article><span className="result-index">02 / ACCEPTANCE</span><strong className="px-outline" data-count="4.25" data-decimals="2">4.25<span>/5</span></strong><h3>perceived usefulness</h3><p>Student technology acceptance rating, based on responses from 20 students.</p></article>
            <p className="research-caveat">These are early prototype findings. The study used one group without a control, so the results do not establish cause and effect.</p>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="sheet-inner faq-grid" data-scroll>
          <div data-odin-reveal><Kicker>04 / WHY ODIN</Kicker><h2>Why use ODIN?</h2><p>Five reasons it fits the way you learn to code.</p></div>
          <div className="faq-list" data-odin-reveal data-odin-delay="1">
            <details><summary>It helps without giving the answer away.<span aria-hidden="true"><PixelGlyph name="chevron" scale={3} /></span></summary><p>ODIN offers prewritten hints that point to a next step, so you still write the solution yourself and keep the understanding.</p></details>
            <details><summary>It steps in when you are stuck.<span aria-hidden="true"><PixelGlyph name="chevron" scale={3} /></span></summary><p>ODIN reads the structure of your C# code and how you are working, such as keyboard timing, to offer support at the moment it can help.</p></details>
            <details><summary>You can see why it suggests something.<span aria-hidden="true"><PixelGlyph name="chevron" scale={3} /></span></summary><p>Its hints come from a transparent set of rules rather than a black box, so the guidance is easy to follow and check.</p></details>
            <details><summary>Practice feels like an adventure.<span aria-hidden="true"><PixelGlyph name="chevron" scale={3} /></span></summary><p>You learn C# arrays by exploring an 8-bit RPG, from the tutorial through the Library Maze, the Fast Food Maze and the Billiards Hall.</p></details>
            <details><summary>Early results are encouraging.<span aria-hidden="true"><PixelGlyph name="chevron" scale={3} /></span></summary><p>In a pretest–posttest study with 21 students, the mean score on a 0–5 C# array assessment rose by 1.14 points. It is an early prototype result without a control group.</p></details>
          </div>
        </div>
      </section>
      </div>

      <section className="sheet sheet-deep team-section" id="team" aria-labelledby="team-title">
        <div className="scene-bg scene-dusk" aria-hidden="true" />
        <div className="sheet-inner">
          <div className="team-heading split" data-odin-reveal data-scroll>
            <div><Kicker>05 / MEET THE TEAM</Kicker><h2 id="team-title">The party behind ODIN.</h2></div>
            <p>InsomniCode is a team of four students at FEU Institute of Technology, guided by a course adviser and a thesis mentor.</p>
          </div>
          <div className="team-party" data-scroll>
            {/* The whole party in one classroom. Hovering a sprite or a name plays that member's idle animation.
                The highlight is a data attribute, not a class: the scroll reveal adds .is-revealed to these
                elements itself, and a changing className would wipe it and hide them again. */}
            <div className="o-panel team-room-window" data-odin-reveal>
              <div className="o-panel-bar window-bar">
                <span className="window-lights" aria-hidden="true"><i /><i /><i /></span>
                <span>SAVE POINT // CLASSROOM</span>
              </div>
              <div className="team-room" aria-hidden="true" style={{ backgroundImage: `url(${classroomScene})` }}>
                {partyInRoom.map((m) => (
                  <span
                    key={m.tag}
                    className={m.flip ? 'room-sprite is-flipped' : 'room-sprite'}
                    data-active={partyFocus === m.tag || undefined}
                    style={{ '--x': m.spot[0], '--y': m.spot[1], '--w': m.w, '--h': m.h } as CSSProperties}
                    onMouseEnter={() => setPartyFocus(m.tag)}
                    onMouseLeave={() => setPartyFocus(null)}
                  >
                    <PixelGlyph name="down" className="room-cursor" />
                    <img className="px still" src={m.still} alt="" loading="lazy" />
                    {m.idle && <img className="px idle" src={m.idle} alt="" loading="lazy" />}
                  </span>
                ))}
              </div>
            </div>
            <div className="party-bar">
              <div className="party-group">
                <p className="team-group-label" data-odin-reveal><PixelGlyph name="steps" /> INSOMNICODE</p>
                <ul>
                  {students.map((member, idx) => (
                    <li
                      className="party-slot"
                      data-active={partyFocus === member.tag || undefined}
                      key={member.tag}
                      data-odin-reveal
                      data-odin-delay={(idx % 4).toString()}
                      onMouseEnter={() => setPartyFocus(member.tag)}
                      onMouseLeave={() => setPartyFocus(null)}
                    >
                      <span className="team-tag">{member.tag}</span>
                      <p className="team-name">{member.name}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="party-group faculty">
                <p className="team-group-label" data-odin-reveal><PixelGlyph name="steps" /> FACULTY</p>
                <ul>
                  {faculty.map((member, idx) => (
                    <li
                      className="party-slot faculty"
                      data-active={partyFocus === member.tag || undefined}
                      key={member.tag}
                      data-odin-reveal
                      data-odin-delay={(idx + 1).toString()}
                      onMouseEnter={() => setPartyFocus(member.tag)}
                      onMouseLeave={() => setPartyFocus(null)}
                    >
                      <span className="team-tag">{member.tag}</span>
                      <p className="team-name">{member.name}</p>
                      <p className="team-role">{member.role}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sheet sheet-cyan landing-cta">
        <div className="sheet-inner cta-grid" data-odin-reveal data-scroll>
          <div className="cta-pixel">
            <span className="sr-only">ODIN://READY</span>
            <span aria-hidden="true">
              {[...'ODIN', ...'://'].map((ch, i) => <span key={i} className="px-solid cta-letter" style={{ '--i': i } as CSSProperties}>{ch}</span>)}
              {[...'READY'].map((ch, i) => <span key={i} className="px-outline cta-letter" style={{ '--i': i + 7 } as CSSProperties}>{ch}</span>)}
            </span>
          </div>
          <div className="cta-copy">
            <Kicker>YOUR NEXT QUEST STARTS HERE</Kicker>
            <h2>Ready to enter the system?</h2>
          </div>
          <Link to="/login" className="pixel-button dark-button"><RollLabel>Open the portal</RollLabel> <PixelGlyph name="chevron" /></Link>
        </div>
        <div className="cta-road" aria-hidden="true">
          <picture className="walker walker-m">
            <source media="(prefers-reduced-motion: reduce)" srcSet={playerMIdle} />
            <img className="px" src={playerMWalk} alt="" width={64} height={128} loading="lazy" />
          </picture>
          <picture className="walker walker-f">
            <source media="(prefers-reduced-motion: reduce)" srcSet={playerFIdle} />
            <img className="px" src={playerFWalk} alt="" width={64} height={128} loading="lazy" />
          </picture>
        </div>
      </section>

      <footer className="sheet landing-footer">
        <div className="sheet-inner footer-row">
          <Link to="/" className="footer-brand"><img className="px" src={odinHead} alt="" width={32} height={32} /> ODIN <span>INSOMNICODE</span></Link>
          <p>Behavioral indicators guide learning support. ODIN does not diagnose a student’s mental or clinical state.</p>
          <span className="footer-coordinates">FEU INSTITUTE OF TECHNOLOGY <i>•</i> CS EXPO 2026</span>
        </div>
      </footer>
    </main>
  );
}
