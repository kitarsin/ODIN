import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth, PretestResponse } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useKeystrokeTracker } from '../../hooks/useKeystrokeTracker';
import { Button } from '../components/ui/button';

const QUESTIONS = [
  {
    id: 'q1',
    prompt: 'What does the following code output?',
    code: 'int[] arr = {10, 20, 30};\nConsole.WriteLine(arr[1]);',
  },
  {
    id: 'q2',
    prompt: 'Write the C# syntax to declare an integer array of size 5.',
    code: null,
  },
  {
    id: 'q3',
    prompt: 'What happens when you try to access arr[5] on an array that was declared with size 5?',
    code: null,
  },
  {
    id: 'q4',
    prompt: 'Write a for loop that prints every element of an int[] array called "nums".',
    code: null,
  },
  {
    id: 'q5',
    prompt: 'What is the output of the following code?',
    code: 'int[] arr = new int[3];\nConsole.WriteLine(arr[0]);',
  },
  {
    id: 'q6',
    prompt: 'How do you get the number of elements in a C# array called "data"?',
    code: null,
  },
  {
    id: 'q7',
    prompt: 'What is wrong with the following code?',
    code: 'int[] arr = new int[5];\narr[5] = 10;',
  },
  {
    id: 'q8',
    prompt: 'Write the expression to access the last element of an int[] called "items" with length n.',
    code: null,
  },
];

type Phase = 'intro' | 'question' | 'submitting' | 'thankyou';

export function Pretest() {
  const { user, completePretest } = useAuth();
  const { isGameMode } = useTheme();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [questionDisplayTime, setQuestionDisplayTime] = useState(Date.now());

  const responses = useRef<PretestResponse[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getSnapshot, reset } = useKeystrokeTracker(textareaRef);

  // Already completed — skip straight to dashboard
  if (user?.pretestCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  const question = QUESTIONS[questionIndex];
  const isLast = questionIndex === QUESTIONS.length - 1;

  const advanceQuestion = () => {
    const snap = getSnapshot();
    responses.current.push({
      questionId: question.id,
      sequenceNumber: questionIndex,
      response: answer.trim(),
      timeToFirstKeyMs: snap.initialLatencyMs,
      totalTimeMs: Date.now() - questionDisplayTime,
      avgFlightTimeMs: snap.averageFlightTimeMs,
      avgDwellTimeMs: snap.averageDwellTimeMs,
    });

    if (isLast) {
      handleSubmit();
    } else {
      setAnswer('');
      reset();
      setQuestionIndex(i => i + 1);
      setQuestionDisplayTime(Date.now());
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleSubmit = async () => {
    setPhase('submitting');
    setSubmitError('');
    try {
      await completePretest(responses.current);
      setPhase('thankyou');
    } catch (err: any) {
      setSubmitError(err?.message || 'Submission failed. Please try again.');
      setPhase('question');
    }
  };

  // Style helpers (mirrors Register/Login pattern)
  const bg = isGameMode ? 'bg-[#1a1a2e]' : 'bg-background';
  const cardBg = isGameMode ? 'bg-[#16213e] border-[#00ff41] border-4 shadow-[0_0_30px_rgba(0,255,65,0.3)]' : 'bg-card border-2 border-border rounded-lg';
  const text = isGameMode ? 'text-[#00ff41]' : 'text-foreground';
  const muted = isGameMode ? 'text-[#4ecdc4]' : 'text-muted-foreground';
  const inputCls = isGameMode
    ? 'bg-[#1a1a2e] border-2 border-[#00ff41] text-[#00ff41] placeholder:text-[#0f3460] focus:outline-none focus:ring-1 focus:ring-[#00ff41]'
    : 'bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring';
  const codeBg = isGameMode ? 'bg-[#0f1a2e] border border-[#00ff41]/40 text-[#00ff41]' : 'bg-muted border border-border text-foreground';
  const pixelFont = isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {};
  const monoFont = { fontFamily: 'var(--font-mono)' };

  // ── Intro screen ──────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-all ${bg}`}>
        <div className={`w-full max-w-lg border p-8 shadow-2xl transition-all ${cardBg}`}>
          <h1 className={`text-xl font-semibold mb-3 ${text}`} style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '16px' } : monoFont}>
            {isGameMode ? '> SYSTEM_CALIBRATION' : 'System Calibration'}
          </h1>
          <p className={`text-sm mb-2 ${muted}`} style={pixelFont}>
            {isGameMode
              ? 'Before accessing ODIN you must complete a short calibration assessment.'
              : 'Before you access ODIN, please complete a short baseline assessment.'}
          </p>
          <p className={`text-sm mb-6 ${muted}`} style={pixelFont}>
            {isGameMode
              ? `${QUESTIONS.length} questions — type your answers. Take your time.`
              : `There are ${QUESTIONS.length} questions. Type your answers in the text area provided. Take your time.`}
          </p>
          <Button
            className={`w-full font-semibold ${isGameMode ? 'bg-[#00ff41] hover:bg-[#00cc33] text-[#1a1a2e] border-2 border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.5)]' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
            style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '12px' } : {}}
            onClick={() => {
              setPhase('question');
              setQuestionDisplayTime(Date.now());
              setTimeout(() => textareaRef.current?.focus(), 50);
            }}
          >
            {isGameMode ? '> BEGIN_CALIBRATION_' : 'Begin Assessment'}
          </Button>
        </div>
      </div>
    );
  }

  // ── Thank-you screen ──────────────────────────────────────────
  if (phase === 'thankyou') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-all ${bg}`}>
        <div className={`w-full max-w-lg border p-10 shadow-2xl text-center transition-all ${cardBg}`}>
          <div className={`text-5xl mb-6 ${text}`}>{isGameMode ? '✓' : '🎉'}</div>
          <h1 className={`text-xl font-semibold mb-3 ${text}`} style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '14px' } : monoFont}>
            {isGameMode ? '> CALIBRATION_COMPLETE' : 'Thank you for participating!'}
          </h1>
          <p className={`text-sm mb-8 ${muted}`} style={pixelFont}>
            {isGameMode
              ? 'Your baseline data has been recorded. ODIN is now calibrated for your session.'
              : 'Your responses have been recorded. You may now access the platform.'}
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

  // ── Question screen (also covers 'submitting' phase visually) ─
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all ${bg}`}>
      <div className={`w-full max-w-2xl border p-8 shadow-2xl transition-all ${cardBg}`}>
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <span className={`text-xs ${muted}`} style={pixelFont}>
            {isGameMode
              ? `QUESTION ${questionIndex + 1}/${QUESTIONS.length}`
              : `Question ${questionIndex + 1} of ${QUESTIONS.length}`}
          </span>
          <div className="flex gap-1">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-all ${
                  i < questionIndex
                    ? isGameMode ? 'bg-[#00ff41]' : 'bg-primary'
                    : i === questionIndex
                    ? isGameMode ? 'bg-[#4ecdc4]' : 'bg-primary/50'
                    : isGameMode ? 'bg-[#0f3460]' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question prompt */}
        <p className={`text-sm font-medium mb-3 ${text}`} style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px', lineHeight: '1.8' } : monoFont}>
          {question.prompt}
        </p>

        {/* Optional code block */}
        {question.code && (
          <pre className={`text-xs rounded p-4 mb-4 overflow-x-auto whitespace-pre ${codeBg}`} style={monoFont}>
            {question.code}
          </pre>
        )}

        {/* Answer textarea */}
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          disabled={phase === 'submitting'}
          rows={4}
          placeholder={isGameMode ? 'TYPE_ANSWER_HERE...' : 'Type your answer here...'}
          className={`w-full rounded p-3 text-sm resize-none mb-5 ${inputCls}`}
          style={monoFont}
        />

        {submitError && (
          <div className={`border rounded p-3 text-sm mb-4 ${isGameMode ? 'bg-[#ff6b6b]/10 border-[#ff6b6b] text-[#ff6b6b]' : 'bg-destructive/10 border-destructive/50 text-destructive'}`} style={pixelFont}>
            {isGameMode ? '! ERROR: ' + submitError : submitError}
          </div>
        )}

        <Button
          disabled={phase === 'submitting' || answer.trim().length === 0}
          className={`w-full font-semibold ${isGameMode ? 'bg-[#00ff41] hover:bg-[#00cc33] text-[#1a1a2e] border-2 border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.5)] disabled:opacity-40' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
          style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '12px' } : {}}
          onClick={advanceQuestion}
        >
          {phase === 'submitting'
            ? (isGameMode ? 'SUBMITTING...' : 'Submitting...')
            : isLast
            ? (isGameMode ? '> SUBMIT_' : 'Submit')
            : (isGameMode ? '> NEXT_' : 'Next')}
        </Button>
      </div>
    </div>
  );
}
