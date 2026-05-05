import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Play, ChevronRight, AlertCircle, CheckCircle, ClipboardCopy } from 'lucide-react';
import { useAuth, PretestResponse } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { compilePretestCode, CompileResult } from '../../lib/odinApi';
import { Button } from '../components/ui/button';

// ── Event log types ──────────────────────────────────────────────────────────

export type EventType =
  | 'question_shown'
  | 'keydown'
  | 'keyup'
  | 'paste'
  | 'idle_start'
  | 'idle_end'
  | 'run_click'
  | 'run_result'
  | 'advance';

export type EventEntry = {
  /** Milliseconds since question was shown */
  t: number;
  type: EventType;
  key?: string;    // keydown / keyup
  dwell?: number;  // keyup — ms the key was held
  flight?: number; // keydown — ms since previous keyup
  chars?: number;  // paste — character count of pasted text
  idle?: number;   // idle_end — ms the user was idle
  pass?: boolean;  // run_result
  diag?: string;   // run_result — diagnosticCategory
};

// ── Problem bank ─────────────────────────────────────────────────────────────

const PROBLEMS = [
  {
    id: 'p1',
    skillType: 'ArrayInitialization',
    title: 'Declare and Print',
    description:
      'Declare an integer array named scores with five values: 85, 92, 78, 95, 88. ' +
      'Then print the element at index 2.',
    starterCode:
      '// Declare an int[] called scores with the five values above\n' +
      '// Then print scores[2]\n',
  },
  {
    id: 'p2',
    skillType: 'ArrayAccess',
    title: 'Fix the Out-of-Bounds Error',
    description:
      'The code below crashes at runtime because the index is wrong. ' +
      'Fix it so it correctly prints the last element of the array.',
    starterCode:
      'int[] arr = {10, 20, 30, 40, 50};\nConsole.WriteLine(arr[5]); // fix this line\n',
  },
  {
    id: 'p3',
    skillType: 'ArrayIteration',
    title: 'Sum the Elements',
    description:
      'Complete the code so it loops through the array, adds every element to sum, ' +
      'and prints the total.',
    starterCode:
      'int[] nums = {3, 7, 2, 9, 4};\nint sum = 0;\n// write your loop here\n\nConsole.WriteLine(sum);\n',
  },
  {
    id: 'p4',
    skillType: 'ArrayOperations',
    title: 'Double Each Value',
    description:
      'Multiply every element of the array by 2 and print each result on its own line.',
    starterCode: 'int[] data = {1, 2, 3, 4, 5};\n// write your loop here\n',
  },
  {
    id: 'p5',
    skillType: 'ArrayOperations',
    title: 'Count Values Above Five',
    description:
      'Count how many elements in the array are greater than 5 and print the count.',
    starterCode:
      'int[] values = {4, 7, 2, 9, 1, 8, 3};\nint count = 0;\n// write your loop here\n\nConsole.WriteLine(count);\n',
  },
];

const IDLE_THRESHOLD_MS = 2_000;

type Phase = 'intro' | 'question' | 'submitting' | 'thankyou';

// ── Component ─────────────────────────────────────────────────────────────────

export function Pretest() {
  const { user, completePretest } = useAuth();
  const { isGameMode } = useTheme();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [pasteDetected, setPasteDetected] = useState(false);

  const responses    = useRef<PretestResponse[]>([]);

  // ── Per-question tracking (all refs — no re-renders) ─────────────────────
  const eventLog          = useRef<EventEntry[]>([]);
  const flightTimes       = useRef<number[]>([]);
  const dwellTimes        = useRef<number[]>([]);
  const keyDownTimes      = useRef<Map<string, number>>(new Map());
  const lastKeyUp         = useRef<number>(0);
  const firstKeyAt        = useRef<number | null>(null);
  const questionShownAt   = useRef<number>(0);
  const pasteCount        = useRef<number>(0);
  const pasteCharCount    = useRef<number>(0);
  const typedCharCount    = useRef<number>(0);
  const lastIsCorrect     = useRef<boolean>(false);
  const idleTimer         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleStartT        = useRef<number | null>(null);  // t (ms from question) when idle began

  if (user?.pretestCompleted) return <Navigate to="/dashboard" replace />;

  const problem = PROBLEMS[questionIndex];
  const isLast  = questionIndex === PROBLEMS.length - 1;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const elapsed = () => performance.now() - questionShownAt.current;

  const pushEvent = (entry: EventEntry) => { eventLog.current.push(entry); };

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const clearIdle = () => {
    if (idleTimer.current) { clearTimeout(idleTimer.current); idleTimer.current = null; }
  };

  const scheduleIdle = () => {
    clearIdle();
    idleTimer.current = setTimeout(() => {
      const t = elapsed();
      idleStartT.current = t;
      pushEvent({ t, type: 'idle_start' });
    }, IDLE_THRESHOLD_MS);
  };

  const resetTracking = () => {
    clearIdle();
    eventLog.current       = [];
    flightTimes.current    = [];
    dwellTimes.current     = [];
    keyDownTimes.current.clear();
    lastKeyUp.current      = 0;
    firstKeyAt.current     = null;
    pasteCount.current     = 0;
    pasteCharCount.current = 0;
    typedCharCount.current = 0;
    lastIsCorrect.current  = false;
    idleStartT.current     = null;
  };

  // ── Keystroke / paste handlers ────────────────────────────────────────────

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta  = e.currentTarget;

    // ── Auto-indentation ────────────────────────────────────────────────────

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;

      if (e.shiftKey) {
        // Shift+Tab: remove up to 4 leading spaces from the current line
        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        const removed   = code.slice(lineStart).match(/^( {1,4})/)?.[1] ?? '';
        if (removed) {
          const next = code.slice(0, lineStart) + code.slice(lineStart + removed.length);
          setCode(next);
          const newPos = Math.max(lineStart, start - removed.length);
          requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = newPos; });
        }
      } else {
        // Tab: insert 4 spaces at cursor (replacing any selection)
        const next = code.slice(0, start) + '    ' + code.slice(end);
        setCode(next);
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 4; });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const start       = ta.selectionStart;
      const currentLine = code.slice(0, start).split('\n').pop() ?? '';
      const indent      = currentLine.match(/^(\s*)/)?.[1] ?? '';
      // Extra indent level when the line ends with an opening brace
      const extra       = currentLine.trimEnd().endsWith('{') ? '    ' : '';
      const insertion   = '\n' + indent + extra;
      const next        = code.slice(0, start) + insertion + code.slice(ta.selectionEnd);
      setCode(next);
      const newPos = start + insertion.length;
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = newPos; });
    } else if (e.key === '}') {
      // De-indent closing brace if the line is only whitespace before the cursor
      const start     = ta.selectionStart;
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const before    = code.slice(lineStart, start);
      if (/^ {4,}$/.test(before)) {
        e.preventDefault();
        const next   = code.slice(0, lineStart) + before.slice(4) + '}' + code.slice(ta.selectionEnd);
        setCode(next);
        const newPos = start - 4 + 1;
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = newPos; });
      }
    }

    // ── Keystroke tracking (always runs, even for handled keys) ────────────

    const now      = performance.now();
    const t        = now - questionShownAt.current;
    const flightMs = lastKeyUp.current > 0 ? now - lastKeyUp.current : undefined;

    keyDownTimes.current.set(e.code, now);

    if (idleStartT.current !== null) {
      pushEvent({ t, type: 'idle_end', idle: t - idleStartT.current });
      idleStartT.current = null;
    }

    if (firstKeyAt.current === null) firstKeyAt.current = now;
    if (flightMs !== undefined) flightTimes.current.push(flightMs);

    pushEvent({ t, type: 'keydown', key: e.key, ...(flightMs !== undefined ? { flight: flightMs } : {}) });
    scheduleIdle();
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const now    = performance.now();
    const t      = now - questionShownAt.current;
    const down   = keyDownTimes.current.get(e.code);
    const dwell  = down !== undefined ? now - down : undefined;

    if (dwell !== undefined) dwellTimes.current.push(dwell);
    lastKeyUp.current = now;
    keyDownTimes.current.delete(e.code);
    typedCharCount.current += 1;

    pushEvent({ t, type: 'keyup', key: e.key, ...(dwell !== undefined ? { dwell } : {}) });
  };

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const t      = elapsed();
    const chars  = e.clipboardData.getData('text').length;
    pasteCount.current     += 1;
    pasteCharCount.current += chars;
    pushEvent({ t, type: 'paste', chars });
    setPasteDetected(true);
    scheduleIdle();
  };

  // ── Run code ──────────────────────────────────────────────────────────────

  const handleRun = async () => {
    setCompiling(true);
    setCompileError('');
    setCompileResult(null);
    const t = elapsed();
    pushEvent({ t, type: 'run_click' });
    try {
      const result = await compilePretestCode(code, problem.skillType, problem.id);
      setCompileResult(result);
      lastIsCorrect.current = result.isCorrect;
      pushEvent({ t: elapsed(), type: 'run_result', pass: result.isCorrect, diag: result.diagnosticCategory });
    } catch (err: any) {
      setCompileError(err?.message || 'Could not reach the compile server.');
    } finally {
      setCompiling(false);
    }
  };

  // ── Capture & advance ─────────────────────────────────────────────────────

  const captureResponse = (): PretestResponse => {
    clearIdle();
    const t       = elapsed();
    const latency = firstKeyAt.current !== null ? firstKeyAt.current - questionShownAt.current : 0;
    pushEvent({ t, type: 'advance' });
    return {
      questionId:       problem.id,
      sequenceNumber:   questionIndex,
      response:         code,
      timeToFirstKeyMs: Math.max(0, latency),
      totalTimeMs:      t,
      avgFlightTimeMs:  avg(flightTimes.current),
      avgDwellTimeMs:   avg(dwellTimes.current),
      pasteCount:       pasteCount.current,
      pasteCharCount:   pasteCharCount.current,
      typedCharCount:   typedCharCount.current,
      isCorrect:        lastIsCorrect.current,
      events:           [...eventLog.current],
    };
  };

  const handleNext = async () => {
    responses.current.push(captureResponse());

    if (isLast) {
      setPhase('submitting');
      setSubmitError('');
      try {
        await completePretest(responses.current);
        setPhase('thankyou');
      } catch (err: any) {
        setSubmitError(err?.message || 'Submission failed. Please try again.');
        setPhase('question');
        responses.current.pop();
      }
    } else {
      resetTracking();
      const next = PROBLEMS[questionIndex + 1];
      setCode(next.starterCode);
      setCompileResult(null);
      setCompileError('');
      setPasteDetected(false);
      setQuestionIndex(i => i + 1);
      questionShownAt.current = performance.now();
      pushEvent({ t: 0, type: 'question_shown' });
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────

  const bg      = isGameMode ? 'bg-[#1a1a2e]' : 'bg-background';
  const cardCls = isGameMode
    ? 'bg-[#16213e] border-[#00ff41] border-4 shadow-[0_0_30px_rgba(0,255,65,0.3)]'
    : 'bg-card border-2 border-border rounded-lg';
  const text    = isGameMode ? 'text-[#00ff41]' : 'text-foreground';
  const muted   = isGameMode ? 'text-[#4ecdc4]' : 'text-muted-foreground';
  const codeBg  = isGameMode
    ? 'bg-[#0d1117] border border-[#00ff41]/30 text-[#00ff41] caret-[#00ff41]'
    : 'bg-muted border border-border text-foreground caret-foreground';
  const mono    = { fontFamily: 'var(--font-mono)' };
  const pixel   = isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {};

  // ── Intro ─────────────────────────────────────────────────────────────────

  if (phase === 'intro') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${bg}`}>
        <div className={`w-full max-w-lg border p-8 shadow-2xl ${cardCls}`}>
          <h1 className={`text-xl font-semibold mb-3 ${text}`} style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '16px' } : mono}>
            {isGameMode ? '> SYSTEM_CALIBRATION' : 'System Calibration'}
          </h1>
          <p className={`text-sm mb-2 ${muted}`} style={pixel}>
            Before accessing ODIN, complete a short coding assessment to calibrate the system.
          </p>
          <ul className={`text-sm space-y-1 mb-6 list-disc list-inside ${muted}`} style={pixel}>
            <li>{PROBLEMS.length} C# array problems</li>
            <li>Write real code — a "Run Code" button checks your solution</li>
            <li>You can move on without a passing solution</li>
            <li>Your score will not be shown</li>
          </ul>
          <Button
            className={`w-full font-semibold ${isGameMode ? 'bg-[#00ff41] hover:bg-[#00cc33] text-[#1a1a2e] border-2 border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.5)]' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
            style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '12px' } : {}}
            onClick={() => {
              const starter = PROBLEMS[0].starterCode;
              setCode(starter);
              setPhase('question');
              questionShownAt.current = performance.now();
              pushEvent({ t: 0, type: 'question_shown' });
            }}
          >
            {isGameMode ? '> BEGIN_' : 'Begin Assessment'}
          </Button>
        </div>
      </div>
    );
  }

  // ── Thank you ─────────────────────────────────────────────────────────────

  if (phase === 'thankyou') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${bg}`}>
        <div className={`w-full max-w-md border p-10 shadow-2xl text-center ${cardCls}`}>
          <CheckCircle className={`w-14 h-14 mx-auto mb-5 ${isGameMode ? 'text-[#00ff41]' : 'text-primary'}`} />
          <h1 className={`text-xl font-semibold mb-3 ${text}`} style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '14px' } : mono}>
            {isGameMode ? '> CALIBRATION_COMPLETE' : 'Thank you for participating!'}
          </h1>
          <p className={`text-sm mb-8 ${muted}`} style={pixel}>
            Your responses have been recorded. You may now access the platform.
          </p>
          <Button
            className={`w-full font-semibold ${isGameMode ? 'bg-[#00ff41] hover:bg-[#00cc33] text-[#1a1a2e] border-2 border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.5)]' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
            style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '12px' } : {}}
            onClick={() => navigate('/dashboard', { replace: true })}
          >
            {isGameMode ? '> ENTER_ODIN_' : 'Continue to Dashboard'}
          </Button>
        </div>
      </div>
    );
  }

  // ── Question ──────────────────────────────────────────────────────────────

  const passed    = compileResult?.isCorrect === true;
  const hasErrors = compileResult && compileResult.compilerDiagnostics.length > 0;

  return (
    <div className={`min-h-screen flex flex-col p-4 md:p-6 ${bg}`}>
      <div className={`w-full max-w-4xl mx-auto border shadow-2xl flex flex-col ${cardCls}`} style={{ minHeight: '80vh' }}>

        {/* Header bar */}
        <div className={`flex items-center justify-between px-6 py-3 border-b ${isGameMode ? 'border-[#00ff41]/30' : 'border-border'}`}>
          <span className={`text-xs font-medium ${muted}`} style={pixel}>
            {isGameMode ? `PROBLEM ${questionIndex + 1}/${PROBLEMS.length}` : `Problem ${questionIndex + 1} of ${PROBLEMS.length}`}
          </span>
          <div className="flex gap-1.5">
            {PROBLEMS.map((_, i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${
                i < questionIndex  ? (isGameMode ? 'bg-[#00ff41]'    : 'bg-primary')
                : i === questionIndex ? (isGameMode ? 'bg-[#4ecdc4]' : 'bg-primary/50')
                :                       (isGameMode ? 'bg-[#0f3460]' : 'bg-muted')
              }`} />
            ))}
          </div>
          <span className={`text-xs ${muted}`} style={pixel}>{problem.skillType}</span>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-6 gap-5">

          <div>
            <h2 className={`text-base font-semibold mb-1 ${text}`} style={mono}>
              {isGameMode ? `> ${problem.title.toUpperCase().replace(/ /g, '_')}` : problem.title}
            </h2>
            <p className={`text-sm ${muted}`} style={pixel}>{problem.description}</p>
          </div>

          {/* Editor */}
          <div className="flex flex-col flex-1">
            <div className={`flex items-center justify-between px-3 py-1.5 rounded-t text-xs font-medium ${
              isGameMode
                ? 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30 border-b-0'
                : 'bg-muted text-muted-foreground border border-border border-b-0'
            }`} style={mono}>
              <span>{isGameMode ? 'EDITOR.cs' : 'Solution.cs'}</span>
              {pasteDetected && (
                <span className="flex items-center gap-1 text-amber-400 text-xs">
                  <ClipboardCopy className="w-3 h-3" />paste detected
                </span>
              )}
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={onKeyDown}
              onKeyUp={onKeyUp}
              onPaste={onPaste}
              disabled={phase === 'submitting'}
              spellCheck={false}
              rows={12}
              className={`w-full rounded-b p-4 text-sm resize-none focus:outline-none leading-relaxed ${codeBg}`}
              style={{ ...mono, tabSize: 4 }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRun}
              disabled={compiling || phase === 'submitting' || code.trim().length === 0}
              variant="outline"
              className={`flex items-center gap-2 font-medium ${isGameMode ? 'border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41]/10 disabled:opacity-40' : ''}`}
              style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '11px' } : {}}
            >
              <Play className="w-4 h-4" />
              {compiling ? (isGameMode ? 'RUNNING...' : 'Running...') : (isGameMode ? '> RUN_CODE' : 'Run Code')}
            </Button>

            <Button
              onClick={handleNext}
              disabled={phase === 'submitting'}
              className={`ml-auto flex items-center gap-2 font-semibold ${
                isGameMode
                  ? 'bg-[#00ff41] hover:bg-[#00cc33] text-[#1a1a2e] border-2 border-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.4)] disabled:opacity-40'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
              style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '11px' } : {}}
            >
              {phase === 'submitting'
                ? (isGameMode ? 'SUBMITTING...' : 'Submitting...')
                : isLast
                ? (isGameMode ? '> SUBMIT_' : 'Submit Assessment')
                : (isGameMode ? '> NEXT_' : 'Next Problem')}
              {phase !== 'submitting' && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>

          {submitError && (
            <div className={`text-sm rounded p-3 border ${isGameMode ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-destructive/10 border-destructive/50 text-destructive'}`} style={pixel}>
              {submitError}
            </div>
          )}

          {compileError && (
            <div className={`text-sm rounded p-3 border ${isGameMode ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-destructive/10 border-destructive/50 text-destructive'}`} style={pixel}>
              {compileError}
            </div>
          )}

          {/* Compile result */}
          {compileResult && (
            <div className={`rounded border text-sm ${
              passed
                ? isGameMode ? 'bg-[#00ff41]/5 border-[#00ff41]/50' : 'bg-green-500/10 border-green-500/50'
                : isGameMode ? 'bg-red-500/10 border-red-500/40'    : 'bg-destructive/10 border-destructive/40'
            }`}>
              <div className={`flex items-center gap-2 px-4 py-2 border-b font-medium ${
                passed
                  ? isGameMode ? 'border-[#00ff41]/30 text-[#00ff41]' : 'border-green-500/30 text-green-600'
                  : isGameMode ? 'border-red-500/30 text-red-400'      : 'border-destructive/30 text-destructive'
              }`} style={pixel}>
                {passed
                  ? <><CheckCircle className="w-4 h-4" />{isGameMode ? 'PASS — NO_ERRORS_DETECTED' : 'Passed — no errors detected'}</>
                  : <><AlertCircle className="w-4 h-4" />{compileResult.diagnosticMessage || 'Errors found'}</>}
              </div>
              {hasErrors && (
                <div className="px-4 py-3 space-y-2">
                  {compileResult.compilerDiagnostics.map((d, i) => (
                    <div key={i} className={`flex items-start gap-2 text-xs ${isGameMode ? 'text-red-400' : 'text-destructive'}`} style={mono}>
                      <span className="shrink-0 opacity-60">{d.severity === 'Error' ? '✗' : '⚠'} L{d.line}:{d.column}</span>
                      <span className="break-words">{d.message}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Actual output (always shown when available) */}
              {compileResult.actualOutput !== null && compileResult.actualOutput !== undefined && (
                <div className={`px-4 py-3 border-t text-xs ${passed ? isGameMode ? 'border-[#00ff41]/20' : 'border-green-500/20' : isGameMode ? 'border-red-500/20' : 'border-destructive/20'}`}>
                  <span className={`font-medium ${muted}`} style={pixel}>Output: </span>
                  <code className={`${text}`} style={mono}>
                    {compileResult.actualOutput.trim() || <span className={muted}>(no output)</span>}
                  </code>
                </div>
              )}

              {!passed && !hasErrors && (
                <p className={`px-4 py-3 text-xs ${muted}`} style={pixel}>
                  {compileResult.diagnosticMessage || 'Logic error — check your approach.'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
