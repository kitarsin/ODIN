import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Play, ChevronRight, AlertCircle, CheckCircle, ClipboardCopy } from 'lucide-react';
import { useAuth, PretestResponse } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { compilePretestCode, CompileResult } from '../../lib/odinApi';
import { Button } from '../components/ui/button';

// ── Problem bank ────────────────────────────────────────────────────────────

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
    starterCode:
      'int[] data = {1, 2, 3, 4, 5};\n// write your loop here\n',
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

// ── Types ────────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'question' | 'submitting' | 'thankyou';

// ── Component ────────────────────────────────────────────────────────────────

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

  // ── Collected responses ────────────────────────────────────────────────────
  const responses = useRef<PretestResponse[]>([]);

  // ── Per-question keystroke state (all in refs to avoid re-renders) ─────────
  const flightTimes = useRef<number[]>([]);
  const dwellTimes = useRef<number[]>([]);
  const keyDownTimes = useRef<Map<string, number>>(new Map());
  const lastKeyUp = useRef<number>(0);
  const firstKeyAt = useRef<number | null>(null);   // performance.now() of first key
  const questionShownAt = useRef<number>(0);         // performance.now() when question appeared
  const pasteCount = useRef<number>(0);
  const pasteCharCount = useRef<number>(0);
  const typedCharCount = useRef<number>(0);
  // Track the last known compile correctness for the current question
  const lastIsCorrect = useRef<boolean>(false);

  // Already finished — skip pretest
  if (user?.pretestCompleted) return <Navigate to="/dashboard" replace />;

  const problem = PROBLEMS[questionIndex];
  const isLast = questionIndex === PROBLEMS.length - 1;

  // ── Keystroke handlers (inline — fixes null-ref bug with the hook) ──────────

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const now = performance.now();
    keyDownTimes.current.set(e.code, now);
    if (firstKeyAt.current === null) firstKeyAt.current = now;
    if (lastKeyUp.current > 0) flightTimes.current.push(now - lastKeyUp.current);
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const now = performance.now();
    const down = keyDownTimes.current.get(e.code);
    if (down !== undefined) dwellTimes.current.push(now - down);
    lastKeyUp.current = now;
    keyDownTimes.current.delete(e.code);
    typedCharCount.current += 1;
  };

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    pasteCount.current += 1;
    pasteCharCount.current += e.clipboardData.getData('text').length;
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const resetTracking = () => {
    flightTimes.current = [];
    dwellTimes.current = [];
    keyDownTimes.current.clear();
    lastKeyUp.current = 0;
    firstKeyAt.current = null;
    pasteCount.current = 0;
    pasteCharCount.current = 0;
    typedCharCount.current = 0;
    lastIsCorrect.current = false;
  };

  const captureResponse = (): PretestResponse => {
    const latency =
      firstKeyAt.current !== null
        ? firstKeyAt.current - questionShownAt.current
        : 0;
    return {
      questionId: problem.id,
      sequenceNumber: questionIndex,
      response: code,
      timeToFirstKeyMs: Math.max(0, latency),
      totalTimeMs: performance.now() - questionShownAt.current,
      avgFlightTimeMs: avg(flightTimes.current),
      avgDwellTimeMs: avg(dwellTimes.current),
      pasteCount: pasteCount.current,
      pasteCharCount: pasteCharCount.current,
      typedCharCount: typedCharCount.current,
      isCorrect: lastIsCorrect.current,
    };
  };

  // ── Run code ───────────────────────────────────────────────────────────────

  const handleRun = async () => {
    setCompiling(true);
    setCompileError('');
    setCompileResult(null);
    try {
      const result = await compilePretestCode(code, problem.skillType);
      setCompileResult(result);
      lastIsCorrect.current = result.isCorrect;
    } catch (err: any) {
      setCompileError(err?.message || 'Could not reach the compile server.');
    } finally {
      setCompiling(false);
    }
  };

  // ── Advance / submit ───────────────────────────────────────────────────────

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
        // pop so we don't double-save this question
        responses.current.pop();
      }
    } else {
      resetTracking();
      setCode(PROBLEMS[questionIndex + 1].starterCode);
      setCompileResult(null);
      setCompileError('');
      setQuestionIndex(i => i + 1);
      questionShownAt.current = performance.now();
    }
  };

  // ── Shared style vars ──────────────────────────────────────────────────────

  const bg = isGameMode ? 'bg-[#1a1a2e]' : 'bg-background';
  const cardCls = isGameMode
    ? 'bg-[#16213e] border-[#00ff41] border-4 shadow-[0_0_30px_rgba(0,255,65,0.3)]'
    : 'bg-card border-2 border-border rounded-lg';
  const text = isGameMode ? 'text-[#00ff41]' : 'text-foreground';
  const muted = isGameMode ? 'text-[#4ecdc4]' : 'text-muted-foreground';
  const codeBg = isGameMode
    ? 'bg-[#0d1117] border border-[#00ff41]/30 text-[#00ff41] caret-[#00ff41]'
    : 'bg-muted border border-border text-foreground caret-foreground';
  const monoFont = { fontFamily: 'var(--font-mono)' };
  const pixelStyle = isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {};

  // ── Intro ──────────────────────────────────────────────────────────────────

  if (phase === 'intro') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${bg}`}>
        <div className={`w-full max-w-lg border p-8 shadow-2xl ${cardCls}`}>
          <h1 className={`text-xl font-semibold mb-3 ${text}`} style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '16px' } : monoFont}>
            {isGameMode ? '> SYSTEM_CALIBRATION' : 'System Calibration'}
          </h1>
          <p className={`text-sm mb-2 ${muted}`} style={pixelStyle}>
            Before accessing ODIN, complete a short coding assessment to calibrate the system.
          </p>
          <ul className={`text-sm space-y-1 mb-6 list-disc list-inside ${muted}`} style={pixelStyle}>
            <li>{PROBLEMS.length} C# array problems</li>
            <li>Write real code — a "Run Code" button checks your solution</li>
            <li>You can move on without a passing solution</li>
            <li>Your score will not be shown</li>
          </ul>
          <Button
            className={`w-full font-semibold ${isGameMode ? 'bg-[#00ff41] hover:bg-[#00cc33] text-[#1a1a2e] border-2 border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.5)]' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
            style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '12px' } : {}}
            onClick={() => {
              setCode(PROBLEMS[0].starterCode);
              setPhase('question');
              questionShownAt.current = performance.now();
            }}
          >
            {isGameMode ? '> BEGIN_' : 'Begin Assessment'}
          </Button>
        </div>
      </div>
    );
  }

  // ── Thank you ──────────────────────────────────────────────────────────────

  if (phase === 'thankyou') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${bg}`}>
        <div className={`w-full max-w-md border p-10 shadow-2xl text-center ${cardCls}`}>
          <CheckCircle className={`w-14 h-14 mx-auto mb-5 ${isGameMode ? 'text-[#00ff41]' : 'text-primary'}`} />
          <h1 className={`text-xl font-semibold mb-3 ${text}`} style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '14px' } : monoFont}>
            {isGameMode ? '> CALIBRATION_COMPLETE' : 'Thank you for participating!'}
          </h1>
          <p className={`text-sm mb-8 ${muted}`} style={pixelStyle}>
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

  // ── Question ───────────────────────────────────────────────────────────────

  const hasErrors = compileResult && compileResult.compilerDiagnostics.length > 0;
  const passed = compileResult?.isCorrect === true;

  return (
    <div className={`min-h-screen flex flex-col p-4 md:p-6 ${bg}`}>
      <div className={`w-full max-w-4xl mx-auto border shadow-2xl flex flex-col ${cardCls}`} style={{ minHeight: '80vh' }}>

        {/* ── Header bar ── */}
        <div className={`flex items-center justify-between px-6 py-3 border-b ${isGameMode ? 'border-[#00ff41]/30' : 'border-border'}`}>
          <span className={`text-xs font-medium ${muted}`} style={pixelStyle}>
            {isGameMode ? `PROBLEM ${questionIndex + 1}/${PROBLEMS.length}` : `Problem ${questionIndex + 1} of ${PROBLEMS.length}`}
          </span>
          <div className="flex gap-1.5">
            {PROBLEMS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-all ${
                  i < questionIndex
                    ? isGameMode ? 'bg-[#00ff41]' : 'bg-primary'
                    : i === questionIndex
                    ? isGameMode ? 'bg-[#4ecdc4]' : 'bg-primary/50'
                    : isGameMode ? 'bg-[#0f3460]' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <span className={`text-xs ${muted}`} style={pixelStyle}>
            {isGameMode ? problem.skillType.toUpperCase() : problem.skillType}
          </span>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 p-6 gap-5">

          {/* Problem title + description */}
          <div>
            <h2 className={`text-base font-semibold mb-1 ${text}`} style={monoFont}>
              {isGameMode ? `> ${problem.title.toUpperCase().replace(/ /g, '_')}` : problem.title}
            </h2>
            <p className={`text-sm ${muted}`} style={pixelStyle}>
              {problem.description}
            </p>
          </div>

          {/* Code editor */}
          <div className="flex flex-col flex-1">
            <div className={`flex items-center justify-between px-3 py-1.5 rounded-t text-xs font-medium ${isGameMode ? 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30 border-b-0' : 'bg-muted text-muted-foreground border border-border border-b-0 rounded-t'}`} style={monoFont}>
              <span>{isGameMode ? 'EDITOR.cs' : 'Solution.cs'}</span>
              {pasteCount.current > 0 && (
                <span className="flex items-center gap-1 text-amber-400">
                  <ClipboardCopy className="w-3 h-3" />
                  paste detected
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
              style={{ ...monoFont, tabSize: 4 }}
            />
          </div>

          {/* Action row */}
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
              className={`ml-auto flex items-center gap-2 font-semibold ${isGameMode ? 'bg-[#00ff41] hover:bg-[#00cc33] text-[#1a1a2e] border-2 border-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.4)] disabled:opacity-40' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
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

          {/* Submit error */}
          {submitError && (
            <div className={`text-sm rounded p-3 border ${isGameMode ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-destructive/10 border-destructive/50 text-destructive'}`} style={pixelStyle}>
              {submitError}
            </div>
          )}

          {/* Compile error (API unreachable) */}
          {compileError && (
            <div className={`text-sm rounded p-3 border ${isGameMode ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-destructive/10 border-destructive/50 text-destructive'}`} style={pixelStyle}>
              {compileError}
            </div>
          )}

          {/* Compile result panel */}
          {compileResult && (
            <div className={`rounded border text-sm ${
              passed
                ? isGameMode ? 'bg-[#00ff41]/5 border-[#00ff41]/50' : 'bg-green-500/10 border-green-500/50'
                : isGameMode ? 'bg-red-500/10 border-red-500/40' : 'bg-destructive/10 border-destructive/40'
            }`}>
              {/* Status bar */}
              <div className={`flex items-center gap-2 px-4 py-2 border-b font-medium ${
                passed
                  ? isGameMode ? 'border-[#00ff41]/30 text-[#00ff41]' : 'border-green-500/30 text-green-600'
                  : isGameMode ? 'border-red-500/30 text-red-400' : 'border-destructive/30 text-destructive'
              }`} style={pixelStyle}>
                {passed
                  ? <><CheckCircle className="w-4 h-4" />{isGameMode ? 'PASS — NO_ERRORS_DETECTED' : 'Passed — no errors detected'}</>
                  : <><AlertCircle className="w-4 h-4" />{compileResult.diagnosticMessage || 'Errors found'}</>
                }
              </div>

              {/* Diagnostics list */}
              {hasErrors && (
                <div className="px-4 py-3 space-y-2">
                  {compileResult.compilerDiagnostics.map((d, i) => (
                    <div key={i} className={`flex items-start gap-2 ${isGameMode ? 'text-red-400' : 'text-destructive'}`} style={monoFont}>
                      <span className="shrink-0 text-xs opacity-60">
                        {d.severity === 'Error' ? '✗' : '⚠'} L{d.line}:{d.column}
                      </span>
                      <span className="text-xs break-words">{d.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* No specific diagnostics but not correct */}
              {!passed && !hasErrors && (
                <p className={`px-4 py-3 text-xs ${muted}`} style={pixelStyle}>
                  {compileResult.diagnosticCategory !== 'None'
                    ? `Category: ${compileResult.diagnosticCategory}`
                    : 'Logic error detected — check your approach.'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
