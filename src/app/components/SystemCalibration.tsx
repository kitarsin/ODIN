import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Zap, Brain, Code, Target, Shield } from 'lucide-react';

// Types
type CalibrationPhase = 'intro' | 'assessment' | 'calculating' | 'results';

interface Question {
  id: number;
  category: 'Logic' | 'Syntax' | 'Optimization';
  query: string;
  code?: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number; // in seconds
}

interface AssessmentResult {
  rank: string;
  level: string;
  scores: {
    logic: number;
    syntax: number;
    optimization: number;
  };
  totalCorrect: number;
  totalQuestions: number;
}

// C# focused questions for the calibration test
const CALIBRATION_QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'Syntax',
    query: 'Which declaration correctly creates a constant in C#?',
    options: [
      'var PI = 3.14;',
      'const double PI = 3.14;',
      'let PI = 3.14;',
      'final PI = 3.14;'
    ],
    correctAnswer: 1,
    timeLimit: 15
  },
  {
    id: 2,
    category: 'Logic',
    query: 'What will this C# code output?',
    code: `for (int i = 0; i < 3; i++) 
{
    Console.WriteLine(i * 2);
}`,
    options: [
      '0, 1, 2',
      '0\n2\n4',
      '2, 4, 6',
      '0, 2, 4'
    ],
    correctAnswer: 1,
    timeLimit: 20
  },
  {
    id: 3,
    category: 'Optimization',
    query: 'Which C# collection provides O(1) average-case lookup time?',
    options: [
      'List<T>',
      'LinkedList<T>',
      'Dictionary<TKey, TValue>',
      'Stack<T>'
    ],
    correctAnswer: 2,
    timeLimit: 25
  },
  {
    id: 4,
    category: 'Syntax',
    query: 'What is the correct way to declare a method that returns an integer in C#?',
    options: [
      'int GetValue() { return 5; }',
      'function int GetValue() { return 5; }',
      'def GetValue() -> int: return 5',
      'GetValue() : int { return 5; }'
    ],
    correctAnswer: 0,
    timeLimit: 15
  },
  {
    id: 5,
    category: 'Logic',
    query: 'What is the value of result after this C# code executes?',
    code: `int x = 10;
int y = 5;
int result = x > y ? x : y;`,
    options: [
      '5',
      '10',
      '15',
      'true'
    ],
    correctAnswer: 1,
    timeLimit: 20
  },
  {
    id: 6,
    category: 'Optimization',
    query: 'Which loop is most efficient for iterating over a C# array when you need the index?',
    code: `// Option A: for (int i = 0; i < arr.Length; i++)
// Option B: foreach (var item in arr)
// Option C: arr.ToList().ForEach(item => {...})`,
    options: [
      'Option A - Standard for loop',
      'Option B - foreach loop',
      'Option C - LINQ ForEach',
      'All are equally efficient'
    ],
    correctAnswer: 0,
    timeLimit: 25
  },
  {
    id: 7,
    category: 'Logic',
    query: 'What will this C# code output?',
    code: `string text = null;
Console.WriteLine(text?.Length ?? 0);`,
    options: [
      'null',
      '0',
      'NullReferenceException',
      'Compilation error'
    ],
    correctAnswer: 1,
    timeLimit: 20
  },
  {
    id: 8,
    category: 'Syntax',
    query: 'Which is the correct way to declare a property with automatic getter and setter in C#?',
    options: [
      'public int Age { get; set; }',
      'public int Age { get => set; }',
      'int Age { get, set }',
      'property int Age;'
    ],
    correctAnswer: 0,
    timeLimit: 15
  },
  {
    id: 9,
    category: 'Optimization',
    query: 'Which LINQ method is most efficient for checking if any element matches a condition?',
    options: [
      'list.Where(x => x > 5).Count() > 0',
      'list.Any(x => x > 5)',
      'list.FirstOrDefault(x => x > 5) != null',
      'list.Count(x => x > 5) > 0'
    ],
    correctAnswer: 1,
    timeLimit: 25
  },
  {
    id: 10,
    category: 'Logic',
    query: 'What will be the output of this C# code?',
    code: `int[] numbers = { 1, 2, 3 };
int[] copy = numbers;
copy[0] = 10;
Console.WriteLine(numbers[0]);`,
    options: [
      '1',
      '10',
      'null',
      'Compilation error'
    ],
    correctAnswer: 1,
    timeLimit: 20
  }
];

interface SystemCalibrationProps {
  onComplete: (result: AssessmentResult) => void;
}

export function SystemCalibration({ onComplete }: SystemCalibrationProps) {
  const [phase, setPhase] = useState<CalibrationPhase>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(CALIBRATION_QUESTIONS.length).fill(null)
  );
  const [timeRemaining, setTimeRemaining] = useState(CALIBRATION_QUESTIONS[0].timeLimit);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  const currentQuestion = CALIBRATION_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / CALIBRATION_QUESTIONS.length) * 100;

  // Timer countdown
  useEffect(() => {
    if (phase !== 'assessment') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, currentQuestionIndex]);

  const handleTimeOut = () => {
    // Auto-advance to next question when time runs out
    if (currentQuestionIndex < CALIBRATION_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeRemaining(CALIBRATION_QUESTIONS[currentQuestionIndex + 1].timeLimit);
      setAnswerFeedback(null);
    } else {
      calculateResults();
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (answerFeedback !== null) return; // Already answered

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);

    // Show feedback
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setCorrectStreak(correctStreak + 1);
    } else {
      setCorrectStreak(0);
    }

    // Auto-advance after brief delay
    setTimeout(() => {
      if (currentQuestionIndex < CALIBRATION_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeRemaining(CALIBRATION_QUESTIONS[currentQuestionIndex + 1].timeLimit);
        setAnswerFeedback(null);
      } else {
        calculateResults();
      }
    }, 1000);
  };

  const calculateResults = () => {
    setPhase('calculating');

    // Calculate scores by category
    const scores = { logic: 0, syntax: 0, optimization: 0 };
    const categoryTotals = { logic: 0, syntax: 0, optimization: 0 };
    let totalCorrect = 0;

    CALIBRATION_QUESTIONS.forEach((question, index) => {
      const category = question.category.toLowerCase() as keyof typeof scores;
      categoryTotals[category]++;
      
      if (selectedAnswers[index] === question.correctAnswer) {
        scores[category]++;
        totalCorrect++;
      }
    });

    // Normalize scores to percentages
    const normalizedScores = {
      logic: categoryTotals.logic > 0 ? Math.round((scores.logic / categoryTotals.logic) * 100) : 0,
      syntax: categoryTotals.syntax > 0 ? Math.round((scores.syntax / categoryTotals.syntax) * 100) : 0,
      optimization: categoryTotals.optimization > 0 ? Math.round((scores.optimization / categoryTotals.optimization) * 100) : 0
    };

    // Determine rank based on overall performance
    const percentage = (totalCorrect / CALIBRATION_QUESTIONS.length) * 100;
    let rank = 'RECRUIT';
    let level = 'Novice';

    if (percentage >= 90) {
      rank = 'ARCHITECT';
      level = 'Elite';
    } else if (percentage >= 75) {
      rank = 'ENGINEER';
      level = 'Advanced';
    } else if (percentage >= 60) {
      rank = 'SCRIPTER';
      level = 'Intermediate';
    } else if (percentage >= 40) {
      rank = 'CODER';
      level = 'Basic';
    }

    const result: AssessmentResult = {
      rank,
      level,
      scores: normalizedScores,
      totalCorrect,
      totalQuestions: CALIBRATION_QUESTIONS.length
    };

    setAssessmentResult(result);

    // Show calculating animation for 3 seconds
    setTimeout(() => {
      setPhase('results');
    }, 3000);
  };

  const handleStartCalibration = () => {
    setPhase('assessment');
    setTimeRemaining(CALIBRATION_QUESTIONS[0].timeLimit);
  };

  const handleEnterMainframe = () => {
    if (assessmentResult) {
      onComplete(assessmentResult);
    }
  };

  // Render phases
  if (phase === 'intro') {
    return <IntroScreen onStart={handleStartCalibration} />;
  }

  if (phase === 'assessment') {
    return (
      <AssessmentScreen
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={CALIBRATION_QUESTIONS.length}
        progress={progress}
        timeRemaining={timeRemaining}
        selectedAnswer={selectedAnswers[currentQuestionIndex]}
        answerFeedback={answerFeedback}
        correctStreak={correctStreak}
        onAnswerSelect={handleAnswerSelect}
      />
    );
  }

  if (phase === 'calculating') {
    return <CalculatingScreen />;
  }

  if (phase === 'results' && assessmentResult) {
    return (
      <ResultsScreen
        result={assessmentResult}
        onEnterMainframe={handleEnterMainframe}
      />
    );
  }

  return null;
}

// Intro Screen Component
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(41, 121, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(41, 121, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Scan Lines Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 230, 118, 0.03) 1px, transparent 1px)',
          backgroundSize: '100% 4px'
        }}
        animate={{ y: ['0%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-3xl px-8">
        {/* ODIN Orb */}
        <motion.div
          className="relative mb-12"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {/* Outer Glow Ring */}
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(255, 171, 0, 0.3) 0%, transparent 70%)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          {/* Middle Ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-warning-amber/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Core Orb */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-warning-amber/20 to-warning-amber/5 flex items-center justify-center relative backdrop-blur-sm border border-warning-amber/40">
            <Shield className="w-16 h-16 text-warning-amber" />
            
            {/* Inner Pulse */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-warning-amber/50"
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut'
              }}
            />
          </div>
        </motion.div>

        {/* Glitch Text Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            <span className="text-danger-red">UNIDENTIFIED</span>{' '}
            <span className="text-foreground">OPERATIVE</span>{' '}
            <span className="text-warning-amber">DETECTED</span>
          </h1>
          
          <motion.div
            className="h-1 w-64 mx-auto bg-gradient-to-r from-transparent via-warning-amber to-transparent"
            animate={{
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xl text-muted-foreground text-center mb-12 max-w-2xl leading-relaxed"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          INITIATE SKILL CALIBRATION PROTOCOL TO SYNCHRONIZE DIFFICULTY LEVELS
          <br />
          <span className="text-cyber-blue">NEURAL PATTERN ASSESSMENT REQUIRED</span>
        </motion.p>

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="relative group"
        >
          {/* Button Glow */}
          <motion.div
            className="absolute -inset-2 rounded-lg blur-xl opacity-50 group-hover:opacity-75 transition-opacity"
            style={{
              background: 'linear-gradient(90deg, #00E676, #2979FF, #00E676)',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
          
          {/* Button Content */}
          <div className="relative px-16 py-6 bg-gradient-to-r from-neon-green/10 to-cyber-blue/10 border-2 border-neon-green rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <Zap className="w-6 h-6 text-neon-green" />
              <span className="text-2xl font-bold tracking-widest text-neon-green" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                INITIALIZE SCAN
              </span>
              <Activity className="w-6 h-6 text-neon-green animate-pulse" />
            </div>
          </div>
        </motion.button>

        {/* Warning Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-sm text-warning-amber/70 text-center mt-8 uppercase tracking-wider"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          &gt;&gt; 10 QUESTIONS • TIMED ASSESSMENT • ADAPTIVE DIFFICULTY
        </motion.p>
      </div>
    </div>
  );
}

// Assessment Screen Component
interface AssessmentScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  progress: number;
  timeRemaining: number;
  selectedAnswer: number | null;
  answerFeedback: 'correct' | 'incorrect' | null;
  correctStreak: number;
  onAnswerSelect: (index: number) => void;
}

function AssessmentScreen({
  question,
  questionNumber,
  totalQuestions,
  progress,
  timeRemaining,
  selectedAnswer,
  answerFeedback,
  correctStreak,
  onAnswerSelect
}: AssessmentScreenProps) {
  const isLowTime = timeRemaining <= 5;

  return (
    <div className="w-full h-full flex flex-col bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(41, 121, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(41, 121, 255, 0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Streak Glow Effect */}
      {correctStreak >= 3 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          style={{
            boxShadow: 'inset 0 0 100px rgba(0, 230, 118, 0.3)'
          }}
        />
      )}

      {/* Top Bar */}
      <div className="relative z-10 px-12 py-8 border-b border-border/50">
        <div className="max-w-5xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Signal Strength
              </span>
              <span className="text-sm font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {questionNumber} / {totalQuestions}
              </span>
            </div>
            
            <div className="h-2 bg-card rounded-full overflow-hidden relative">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, 
                    ${progress < 33 ? '#FF5252' : progress < 66 ? '#FFAB00' : '#00E676'} 0%, 
                    ${progress < 33 ? '#FFAB00' : progress < 66 ? '#00E676' : '#2979FF'} 100%)`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              isLowTime ? 'border-danger-red/50 bg-danger-red/10' : 'border-cyber-blue/30 bg-cyber-blue/5'
            }`}>
              <Target className={`w-4 h-4 ${isLowTime ? 'text-danger-red animate-pulse' : 'text-cyber-blue'}`} />
              <span className={`text-sm font-bold uppercase tracking-wider ${
                isLowTime ? 'text-danger-red' : 'text-cyber-blue'
              }`} style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Time to Lock
              </span>
              <span className={`text-lg font-bold tabular-nums ${
                isLowTime ? 'text-danger-red' : 'text-foreground'
              }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {timeRemaining}s
              </span>
            </div>

            {/* Category Badge */}
            <div className="px-4 py-2 rounded-lg border border-warning-amber/30 bg-warning-amber/5">
              <span className="text-sm font-bold text-warning-amber uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {question.category}
              </span>
            </div>

            {/* Streak Indicator */}
            {correctStreak >= 3 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="px-4 py-2 rounded-lg border border-neon-green/50 bg-neon-green/10"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-neon-green" />
                  <span className="text-sm font-bold text-neon-green uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {correctStreak}x Streak
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex items-center justify-center px-12 py-12 relative z-10">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question Card */}
              <div className="mb-8 p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg relative overflow-hidden">
                {/* Scan Line Effect */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(41, 121, 255, 0.1) 50%, transparent 100%)',
                    height: '100px'
                  }}
                  animate={{ y: ['-100px', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />

                {/* Question Text */}
                <h2 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {question.query}
                </h2>

                {/* Code Block (if present) */}
                {question.code && (
                  <div className="relative">
                    {/* Holographic Grid Effect */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                      backgroundImage: 'linear-gradient(rgba(0, 230, 118, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 230, 118, 0.3) 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }} />
                    
                    <pre className="bg-background/90 p-6 rounded-lg border border-neon-green/30 overflow-x-auto relative">
                      <code className="text-neon-green" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {question.code}
                      </code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Answer Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = answerFeedback === 'correct' && isSelected;
                  const isIncorrect = answerFeedback === 'incorrect' && isSelected;
                  const isDisabled = answerFeedback !== null;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => !isDisabled && onAnswerSelect(index)}
                      disabled={isDisabled}
                      className={`
                        relative p-6 rounded-lg border-2 text-left transition-all
                        ${isSelected 
                          ? isCorrect 
                            ? 'border-neon-green bg-neon-green/10' 
                            : isIncorrect
                            ? 'border-danger-red bg-danger-red/10'
                            : 'border-cyber-blue bg-cyber-blue/10'
                          : 'border-card bg-card/30 hover:border-cyber-blue/50 hover:bg-cyber-blue/5'
                        }
                        ${isDisabled && !isSelected ? 'opacity-40' : ''}
                      `}
                      whileHover={!isDisabled ? { scale: 1.02 } : {}}
                      whileTap={!isDisabled ? { scale: 0.98 } : {}}
                      animate={isSelected ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Glow Effect */}
                      {isSelected && (
                        <motion.div
                          className="absolute -inset-1 rounded-lg blur-md"
                          style={{
                            background: isCorrect 
                              ? 'rgba(0, 230, 118, 0.3)' 
                              : isIncorrect 
                              ? 'rgba(255, 82, 82, 0.3)'
                              : 'rgba(41, 121, 255, 0.3)'
                          }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}

                      {/* Option Letter */}
                      <div className="relative flex items-start gap-4">
                        <div className={`
                          w-8 h-8 rounded flex items-center justify-center font-bold flex-shrink-0
                          ${isSelected
                            ? isCorrect
                              ? 'bg-neon-green text-background'
                              : isIncorrect
                              ? 'bg-danger-red text-background'
                              : 'bg-cyber-blue text-background'
                            : 'bg-muted text-muted-foreground'
                          }
                        `} style={{ fontFamily: 'Orbitron, sans-serif' }}>
                          {String.fromCharCode(65 + index)}
                        </div>

                        {/* Option Text */}
                        <span className="flex-1 text-base" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {option}
                        </span>

                        {/* Feedback Icon */}
                        {isSelected && answerFeedback && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="flex-shrink-0"
                          >
                            {isCorrect ? (
                              <div className="w-6 h-6 rounded-full bg-neon-green flex items-center justify-center">
                                <div className="w-3 h-1.5 border-l-2 border-b-2 border-background transform rotate-[-45deg] translate-y-[-1px]" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-danger-red flex items-center justify-center">
                                <div className="text-background text-lg leading-none">×</div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Calculating Screen Component
function CalculatingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Grid Animation */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(41, 121, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(41, 121, 255, 0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px']
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      {/* Radial Scan Effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 230, 118, 0.1) 0%, transparent 70%)'
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Central Processing Icon */}
        <motion.div
          className="relative mb-12"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          {/* Outer Rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-cyber-blue/30"
            animate={{
              scale: [1, 1.3],
              opacity: [1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut'
            }}
          />
          
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-neon-green/30"
            animate={{
              scale: [1, 1.3],
              opacity: [1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.75
            }}
          />

          {/* Core */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyber-blue/20 to-neon-green/20 flex items-center justify-center backdrop-blur-sm border-2 border-cyber-blue/50">
            <Brain className="w-16 h-16 text-cyber-blue" />
          </div>
        </motion.div>

        {/* Text */}
        <motion.h2
          className="text-4xl font-bold mb-6 tracking-widest"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <span className="text-cyber-blue">ANALYZING</span>{' '}
          <span className="text-neon-green">NEURAL PATTERNS</span>
        </motion.h2>

        {/* Hex Code Stream */}
        <div className="w-96 h-32 overflow-hidden relative">
          <motion.div
            className="absolute inset-0 flex flex-col gap-1"
            animate={{ y: [0, -1000] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="text-xs text-neon-green/30 tabular-nums" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {`0x${Math.random().toString(16).substring(2, 10).toUpperCase()} : ${Math.random().toString(16).substring(2, 10).toUpperCase()}`}
              </div>
            ))}
          </motion.div>
          
          {/* Fade Overlays */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Progress Dots */}
        <div className="flex gap-3 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-cyber-blue"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Results Screen Component
interface ResultsScreenProps {
  result: AssessmentResult;
  onEnterMainframe: () => void;
}

function ResultsScreen({ result, onEnterMainframe }: ResultsScreenProps) {
  const percentage = Math.round((result.totalCorrect / result.totalQuestions) * 100);

  // Radar chart points
  const radarSize = 200;
  const centerX = radarSize / 2;
  const centerY = radarSize / 2;
  const maxRadius = radarSize / 2 - 20;

  const calculatePoint = (value: number, angle: number) => {
    const radius = (value / 100) * maxRadius;
    const x = centerX + radius * Math.cos(angle - Math.PI / 2);
    const y = centerY + radius * Math.sin(angle - Math.PI / 2);
    return { x, y };
  };

  const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
  const labels = ['Logic', 'Syntax', 'Optimization'];
  const values = [result.scores.logic, result.scores.syntax, result.scores.optimization];

  const dataPoints = values.map((value, i) => calculatePoint(value, angles[i]));
  const pathData = `M ${dataPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  const backgroundLevels = [25, 50, 75, 100];

  return (
    <div className="w-full h-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0, 230, 118, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 230, 118, 0.2) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Success Glow */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 230, 118, 0.2) 0%, transparent 70%)'
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-5xl px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <div className="inline-block px-6 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-4">
            <span className="text-sm text-neon-green uppercase tracking-widest font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Access Granted
            </span>
          </div>
          <h1 className="text-3xl text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Neural Synchronization Complete
          </h1>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-12 mb-12 w-full max-w-4xl">
          {/* Left: Rank Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col items-center justify-center"
          >
            {/* Badge Container */}
            <div className="relative">
              {/* Outer Glow Rings */}
              <motion.div
                className="absolute inset-0 rounded-full blur-2xl"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 230, 118, 0.4) 0%, transparent 70%)'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />

              {/* Rotating Hexagon */}
              <motion.div
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <svg width="280" height="280" viewBox="0 0 280 280" className="absolute inset-0">
                  <defs>
                    <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00E676" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#2979FF" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="140,20 240,80 240,200 140,260 40,200 40,80"
                    fill="url(#hexGradient)"
                    stroke="#00E676"
                    strokeWidth="2"
                  />
                </svg>
              </motion.div>

              {/* Center Badge Content */}
              <div className="relative w-72 h-72 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                  className="text-center"
                >
                  {/* Rank Title */}
                  <div className="mb-4">
                    <div className="text-6xl font-bold text-neon-green mb-2" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0, 230, 118, 0.5)' }}>
                      {result.rank}
                    </div>
                    <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-neon-green to-transparent" />
                  </div>

                  {/* Level Badge */}
                  <div className="inline-block px-6 py-2 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30">
                    <span className="text-lg text-cyber-blue uppercase tracking-widest font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      {result.level}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="mt-6">
                    <div className="text-5xl font-bold text-foreground tabular-nums" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {percentage}%
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      {result.totalCorrect} / {result.totalQuestions} Correct
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right: Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col items-center justify-center"
          >
            <h3 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Skill Breakdown
            </h3>

            <svg width={radarSize} height={radarSize} className="mb-6">
              <defs>
                <radialGradient id="radarGradient" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#2979FF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00E676" stopOpacity="0.1" />
                </radialGradient>
              </defs>

              {/* Background Levels */}
              {backgroundLevels.map((level, i) => {
                const points = angles.map(angle => calculatePoint(level, angle));
                const bgPath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
                return (
                  <path
                    key={i}
                    d={bgPath}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Axis Lines */}
              {angles.map((angle, i) => {
                const point = calculatePoint(100, angle);
                return (
                  <line
                    key={i}
                    x1={centerX}
                    y1={centerY}
                    x2={point.x}
                    y2={point.y}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data Area */}
              <motion.path
                d={pathData}
                fill="url(#radarGradient)"
                stroke="#00E676"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
              />

              {/* Data Points */}
              {dataPoints.map((point, i) => (
                <motion.circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill="#00E676"
                  stroke="#00E676"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                />
              ))}

              {/* Labels */}
              {angles.map((angle, i) => {
                const labelPoint = calculatePoint(115, angle);
                return (
                  <text
                    key={i}
                    x={labelPoint.x}
                    y={labelPoint.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#E0E0E0"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="Rajdhani, sans-serif"
                  >
                    {labels[i]}
                  </text>
                );
              })}
            </svg>

            {/* Score Values */}
            <div className="grid grid-cols-3 gap-6 w-full">
              {['Logic', 'Syntax', 'Optimization'].map((skill, i) => {
                const score = values[i];
                const color = score >= 75 ? 'text-neon-green' : score >= 50 ? 'text-warning-amber' : 'text-danger-red';
                
                return (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className={`text-3xl font-bold tabular-nums ${color}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {score}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      {skill}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEnterMainframe}
          className="relative group"
        >
          {/* Button Glow */}
          <motion.div
            className="absolute -inset-2 rounded-lg blur-xl opacity-50 group-hover:opacity-75 transition-opacity"
            style={{
              background: 'linear-gradient(90deg, #00E676, #2979FF, #00E676)',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
          
          {/* Button Content */}
          <div className="relative px-12 py-4 bg-gradient-to-r from-neon-green/10 to-cyber-blue/10 border-2 border-neon-green rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-neon-green" />
              <span className="text-xl font-bold tracking-widest text-neon-green" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                ENTER MAINFRAME
              </span>
            </div>
          </div>
        </motion.button>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="text-sm text-muted-foreground text-center mt-6 uppercase tracking-wider"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          &gt;&gt; Difficulty adjusted to {result.level} level • Profile synchronized
        </motion.p>
      </div>
    </div>
  );
}
