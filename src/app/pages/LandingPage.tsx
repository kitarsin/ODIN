import { ArrowDown, ArrowRight, Braces, Code2, Keyboard, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { isMobileDevice } from '../utils/mobileDevice';
import odinMark from '../../img/brand/new-logo.png';
import odinPortrait128 from '../../img/brand/odin-logo-transparent-128.png';
import odinPortrait256 from '../../img/brand/odin-logo-transparent-256.png';
import odinPortrait512 from '../../img/brand/odin-logo-transparent-512.png';
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

export function LandingPage() {
  const noticeRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!isMobileDevice()) return;
    try {
      if (sessionStorage.getItem('odin-mobile-notice-seen')) return;
      sessionStorage.setItem('odin-mobile-notice-seen', '1');
    } catch {
      // The notice still works if browser storage is unavailable.
    }
    noticeRef.current?.showModal();
  }, []);

  return (
    <main className="odin-landing">
      <dialog ref={noticeRef} className="mobile-notice" aria-labelledby="mobile-notice-title" aria-describedby="mobile-notice-description">
        <div className="mobile-notice-icon"><Keyboard aria-hidden="true" /></div>
        <p className="mobile-notice-kicker">ODIN // DEVICE NOTICE</p>
        <h2 id="mobile-notice-title">Your quest is best on a bigger screen.</h2>
        <p id="mobile-notice-description">ODIN is optimized for a desktop or laptop with a physical keyboard. Feel free to explore this page on your phone, then switch to a computer to enter the portal.</p>
        <form method="dialog"><button className="pixel-button primary-button" autoFocus>Explore the website <ArrowRight aria-hidden="true" /></button></form>
      </dialog>
      <header className="landing-header">
        <Link to="/" className="landing-brand" aria-label="ODIN home">
          <img src={odinMark} alt="" />
          <span>ODIN</span>
          <i>INSOMNICODE</i>
        </Link>
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#scope">The experience</a>
          <a href="#research">The research</a>
          <Link className="landing-nav-cta" to="/login">Enter the portal <ArrowRight aria-hidden="true" /></Link>
        </nav>
      </header>
      <nav className="mobile-section-nav" aria-label="Explore this page">
        <a href="#how-it-works">How it works</a>
        <a href="#scope">The experience</a>
        <a href="#research">Research</a>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> A coding adventure by InsomniCode</div>
          <h1>Learn to code.<br /><span>Keep going.</span></h1>
          <p className="hero-lede">A little guidance can change the game. Explore C# arrays in an 8-bit RPG where thoughtful hints help you find your own way forward.</p>
          <div className="hero-actions">
            <Link className="pixel-button primary-button" to="/login">Enter the ODIN portal <ArrowRight aria-hidden="true" /></Link>
            <a className="text-button" href="#how-it-works">Explore the system <ArrowDown aria-hidden="true" /></a>
          </div>
          <div className="hero-meta">
            <span><Keyboard aria-hidden="true" /> Desktop + physical keyboard</span>
            <span><ShieldCheck aria-hidden="true" /> Hints, never answers</span>
          </div>
          <div className="mobile-callout" role="note">
            <Keyboard aria-hidden="true" />
            <span><strong>Best on desktop</strong> — open ODIN on a laptop or desktop with a physical keyboard.</span>
          </div>
        </div>

        <div className="hero-art" aria-label="Illustrative preview of the ODIN game and code editor">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="scanline" />
          <div className="hero-signal signal-top"><span className="signal-led" /> SYSTEM READY <b>01</b></div>
          <img
            className="hero-mascot"
            src={odinPortrait512}
            srcSet={`${odinPortrait128} 128w, ${odinPortrait256} 256w, ${odinPortrait512} 512w`}
            sizes="220px"
            alt="ODIN pixel robot mascot"
          />
          <div className="game-window">
            <div className="window-bar"><span><i /><i /><i /></span><b>ARRAY QUEST // 01</b><span className="window-live">LIVE</span></div>
            <div className="window-content">
              <div className="window-scene">
                <div className="scene-stars">✦　·　✧　　　✦</div>
                <div className="scene-platform" />
                <div className="scene-hero"><span /></div>
                <div className="scene-monster"><i /><i /></div>
                <div className="scene-caption">A new challenge appears</div>
              </div>
              <div className="window-editor">
                <div className="editor-heading">CODE EDITOR <span>C#</span></div>
                <div className="code-lines" aria-hidden="true">
                  <span><b>01</b> <i>int</i>[] scores = {'{'} 8, 5, 9 {'}'};</span>
                  <span><b>02</b> <i>for</i> (<em>int</em> i = 0; i &lt; scores.Length; i++)</span>
                  <span className="code-focus"><b>03</b> {'{'} total += scores[i]; {'}'}</span>
                  <span><b>04</b> <strong>// check the array bounds</strong></span>
                </div>
                <div className="hint-strip"><span className="hint-spark">✦</span> Try tracing the last valid index.</div>
              </div>
            </div>
            <div className="window-footer"><span><i /> ODIN GUIDANCE ACTIVE</span><span>ILLUSTRATIVE PREVIEW</span></div>
          </div>
          <div className="hero-signal signal-bottom"><span>FIELD NOTE</span><b>Support the process.<br />Let the student solve.</b></div>
        </div>
        <a className="scroll-cue" href="#how-it-works" aria-label="Scroll to how it works"><span /> SCROLL TO EXPLORE</a>
      </section>

      <section className="landing-section system-section" id="how-it-works">
        <div className="section-heading">
          <div className="section-kicker">01 / THE ODIN LOOP</div>
          <h2>More than an error message.</h2>
          <p>When code gets stuck, ODIN brings together code structure and observable work patterns to offer a useful next step.</p>
        </div>
        <div className="process-grid">
          {processSteps.map((step) => (
            <article className={`process-card ${step.color}`} key={step.number}>
              <div className="card-top"><span>{step.number}</span><div className="step-icon">{step.icon}</div></div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <div className="card-rail" />
            </article>
          ))}
        </div>
        <div className="loop-note"><span className="note-mark">↳</span><p><strong>The student stays in control.</strong> ODIN provides scaffolding, not a generated solution.</p></div>
      </section>

      <section className="landing-section scope-section" id="scope">
        <div className="scope-mark"><img src={odinMark} alt="" /></div>
        <div className="scope-copy">
          <div className="section-kicker">02 / BUILT WITH INTENTION</div>
          <h2>A game world with a learning purpose.</h2>
          <p>ODIN combines an 8-bit role-playing game with a code editor and a rule-based tutoring system. The game supports the work; it does not replace it.</p>
          <div className="scope-tags"><span>C# arrays</span><span>Rule-based support</span><span>Desktop browser</span></div>
        </div>
        <div className="scope-principles">
          <div><span>01</span><p><b>Observable signals</b> guide timely support; they are not a clinical diagnosis.</p></div>
          <div><span>02</span><p><b>Prewritten hints</b> point to a next step without giving away answers.</p></div>
          <div><span>03</span><p><b>Readable code</b> stays clear while pixel art belongs to the game world.</p></div>
        </div>
      </section>

      <section className="landing-section research-section" id="research">
        <div className="research-intro">
          <div className="section-kicker">03 / THE RESEARCH</div>
          <h2>Built to make the next attempt feel possible.</h2>
          <p>ODIN was developed at FEU Institute of Technology to explore how timely, interpretable support can help students learning to program.</p>
          <span className="research-label"><span className="status-dot" /> CS EXPO 2026 · INSOMNICODE</span>
        </div>
        <div className="research-results">
          <article><span className="result-index">01 / LEARNING</span><strong>+1.14</strong><h3>mean score change</h3><p>On a 0–5 C# array assessment across 21 students in the pretest–posttest study.</p></article>
          <article><span className="result-index">02 / ACCEPTANCE</span><strong>4.25<span>/5</span></strong><h3>perceived usefulness</h3><p>Student technology acceptance rating, based on responses from 20 students.</p></article>
          <p className="research-caveat">These are early prototype findings. The study used one group without a control, so the results do not establish cause and effect.</p>
        </div>
      </section>

      <section className="landing-section faq-section">
        <div><div className="section-kicker">04 / PLAYER GUIDE</div><h2>A few things to know.</h2><p>Everything you need before starting your first quest.</p></div>
        <div className="faq-list">
          <details><summary>Who is ODIN for?<span>+</span></summary><p>ODIN is designed as supplementary support for college students learning C# array concepts.</p></details>
          <details><summary>Will ODIN give me the answer?<span>+</span></summary><p>No. ODIN offers prewritten hints to help you think through a problem while you remain in control of the solution.</p></details>
          <details><summary>What do I need to play?<span>+</span></summary><p>Use a laptop or desktop browser with a physical keyboard. The coding game uses keyboard timing as one of its learning-support signals.</p></details>
        </div>
      </section>

      <section className="landing-cta">
        <div className="cta-pixel">ODIN<span>://</span>READY</div>
        <div><div className="section-kicker">YOUR NEXT QUEST STARTS HERE</div><h2>Ready to enter the system?</h2></div>
        <Link to="/login" className="pixel-button primary-button">Open the portal <ArrowRight aria-hidden="true" /></Link>
      </section>

      <footer className="landing-footer">
        <Link to="/" className="footer-brand"><img src={odinMark} alt="" /> ODIN <span>INSOMNICODE</span></Link>
        <p>Behavioral indicators guide learning support. ODIN does not diagnose a student’s mental or clinical state.</p>
        <span className="footer-coordinates">FEU INSTITUTE OF TECHNOLOGY <i>•</i> CS EXPO 2026</span>
      </footer>
    </main>
  );
}

