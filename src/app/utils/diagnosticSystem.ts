/**
 * Diagnostic System for Code Issues
 * Analyzes student code and provides personalized feedback from "Odin"
 */

export interface DiagnosticResult {
  diagnosticTitle: string;
  diagnosticMessage: string;
  suggestions: string[];
  severity: 'minor' | 'moderate' | 'critical';
}

type SyntaxCheckResult = {
  isValid: boolean;
  message: string;
};

const CSHARP_KEYWORD_PATTERN = /\b(using|namespace|class|public|private|protected|internal|static|void|int|string|bool|double|float|decimal|var|if|else|for|foreach|while|switch|case|return|new|try|catch|finally)\b/;
const JS_ONLY_PATTERN = /\bfunction\b|console\.log/i;
const REQUIRED_CLASS_PATTERN = /\bclass\s+\w+/;
const REQUIRED_MAIN_PATTERN = /\bstatic\s+void\s+Main\s*\(\s*string\s*\[\]\s*\w*\s*\)/;

const hasBalancedSymbols = (code: string) => {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  for (const char of code) {
    if (char === '(' || char === '[' || char === '{') stack.push(char);
    if (char === ')' || char === ']' || char === '}') {
      const expected = pairs[char];
      if (!expected || stack.pop() !== expected) return false;
    }
  }
  return stack.length === 0;
};

const checkCSharpSyntax = (code: string): SyntaxCheckResult => {
  const trimmedCode = code.trim();
  if (!trimmedCode) {
    return { isValid: false, message: 'No code detected. Write some C# first.' };
  }

  if (!hasBalancedSymbols(code)) {
    return { isValid: false, message: 'Brackets, parentheses, or braces are unbalanced.' };
  }

  if (JS_ONLY_PATTERN.test(code)) {
    return { isValid: false, message: 'This looks like JavaScript, not C#.' };
  }

  if (!CSHARP_KEYWORD_PATTERN.test(code) && !/Console\.Write(Line)?/i.test(code)) {
    return { isValid: false, message: 'No C# keywords or structures detected.' };
  }

  const nonEmptyLines = code
    .split('\n')
    .map((line) => line.split('//')[0].trim())
    .filter((line) => line.length > 0);

  const hasClass = REQUIRED_CLASS_PATTERN.test(code);
  const hasMain = REQUIRED_MAIN_PATTERN.test(code);
  const isSingleLineTopLevel = nonEmptyLines.length === 1;

  if (!hasClass || !hasMain) {
    if (!isSingleLineTopLevel) {
      return { isValid: false, message: 'Missing a class declaration or Main method.' };
    }
    const oneLine = nonEmptyLines[0];
    if (!oneLine.endsWith(';')) {
      return { isValid: false, message: 'Single-line code must end with a semicolon.' };
    }
    if (!CSHARP_KEYWORD_PATTERN.test(oneLine) && !/Console\.Write(Line)?/i.test(oneLine)) {
      return { isValid: false, message: 'Single-line code must use valid C# syntax.' };
    }
  }

  const lines = code.split('\n');
  for (const line of lines) {
    const cleanedLine = line.split('//')[0].trim();
    if (!cleanedLine) continue;
    if (cleanedLine.endsWith('{') || cleanedLine.endsWith('}') || cleanedLine.endsWith(':')) continue;
    if (/^(if|for|foreach|while|switch|catch|else|do|try|namespace|class|struct|enum)\b/i.test(cleanedLine)) {
      continue;
    }
    if (cleanedLine.includes('=>') && cleanedLine.endsWith(';')) continue;
    if (cleanedLine.endsWith(';')) continue;
    if (cleanedLine.endsWith(')')) {
      return { isValid: false, message: 'Missing semicolon at end of statement.' };
    }
  }

  return { isValid: true, message: 'C# syntax looks valid.' };
};

export const diagnoseCSharpSyntax = (code: string): DiagnosticResult | null => {
  const check = checkCSharpSyntax(code);
  if (check.isValid) return null;

  return {
    diagnosticTitle: 'C# Syntax Error',
    diagnosticMessage: check.message,
    suggestions: [
      'Check for missing semicolons at the end of statements',
      'Make sure braces and parentheses are balanced',
      'Use C# keywords like class, static, void, and return',
    ],
    severity: 'critical',
  };
};

export function diagnoseCode(code: string, expectedPattern?: string): DiagnosticResult {
  const trimmedCode = code.trim();

  // Check 1: Empty or No Code
  if (!trimmedCode) {
    return {
      diagnosticTitle: 'No Code Detected',
      diagnosticMessage:
        "You haven't written any code yet. Don't worry, everyone starts somewhere! Begin by writing a simple solution to the problem.",
      suggestions: [
        'Start with a basic approach - what do you need to do first?',
        'Break down the problem into smaller steps',
        'Write one line at a time and test',
      ],
      severity: 'critical',
    };
  }

  // Check 2: Incomplete Syntax
  if (
    (code.includes('[') && !code.includes(']')) ||
    (code.includes('(') && !code.includes(')')) ||
    (code.includes('{') && !code.includes('}'))
  ) {
    return {
      diagnosticTitle: 'Syntax Incomplete',
      diagnosticMessage:
        "Your brackets, parentheses, or braces don't match up. Every opening symbol needs a closing pair!",
      suggestions: [
        'Count your opening and closing brackets',
        'Use an editor with bracket matching to help',
        'Check each function call has matching parentheses',
      ],
      severity: 'critical',
    };
  }

  // Check 3: Common Mistakes - Typos in Keywords
  const commonMistakes = ['if', 'for', 'while', 'function', 'return', 'var', 'let', 'const'];
  const codeWords = trimmedCode.toLowerCase().split(/\W+/);

  const typoKeywords = ['iff', 'forr', 'whille', 'funtion', 'retrun', 'lett', 'conts'];
  const detectedTypo = typoKeywords.find((typo) => codeWords.includes(typo));

  if (detectedTypo) {
    const correctKeyword = commonMistakes[typoKeywords.indexOf(detectedTypo)];
    return {
      diagnosticTitle: 'Typo Detected',
      diagnosticMessage: `You typed "${detectedTypo}" but the correct keyword is "${correctKeyword}". These small typos can break everything!`,
      suggestions: [
        `Did you mean "${correctKeyword}"?`,
        'Enable spell-check in your editor',
        'Test character by character',
      ],
      severity: 'moderate',
    };
  }

  // Check 4: Logic Issues - Missing Loop or Condition
  if (expectedPattern === 'loop' && !code.match(/\b(for|while)\b/i)) {
    return {
      diagnosticTitle: 'Missing Loop Structure',
      diagnosticMessage:
        "This problem requires a loop to process multiple items, but I don't see one in your code. You need to repeat an action multiple times!",
      suggestions: [
        'Use a "for" loop to iterate through array elements',
        'Think about what you want to repeat',
        'Decide your loop condition carefully',
      ],
      severity: 'critical',
    };
  }

  // Check 5: Logic Issues - Missing Condition
  if (expectedPattern === 'condition' && !code.match(/\b(if|else|switch)\b/i)) {
    return {
      diagnosticTitle: 'Missing Conditional Logic',
      diagnosticMessage:
        "Your solution needs decision-making logic (if/else), but I don't see any conditions. You need to check something and branch accordingly!",
      suggestions: [
        'Add an "if" statement to check a condition',
        'Think about what needs to be tested',
        'Consider what happens when it\'s true vs false',
      ],
      severity: 'critical',
    };
  }

  // Check 6: Possible Logic Error - Infinite Loop Detection
  if (code.match(/while\s*\(\s*true\s*\)/i)) {
    return {
      diagnosticTitle: 'Infinite Loop Detected',
      diagnosticMessage:
        'You have a "while(true)" loop, which will run forever! You need a way to break out or a proper exit condition.',
      suggestions: [
        'Add a break statement or exit condition',
        'Consider using a for loop instead',
        'Make sure your loop variable changes',
      ],
      severity: 'critical',
    };
  }

  // Check 7: Variable Not Used
  const varMatches = code.match(/\b(let|const|var)\s+(\w+)/g);
  if (varMatches && varMatches.length > 0) {
    const variables = varMatches.map((m) => m.split(/\s+/)[1]);
    const unused = variables.filter(
      (v) => !code.replace(new RegExp(`\\b${v}\\s*=`, 'g'), '').includes(v)
    );

    if (unused.length > 0) {
      return {
        diagnosticTitle: 'Unused Variables',
        diagnosticMessage: `You declared variable(s) "${unused[0]}" but never used them. In programming, we avoid creating things we don't need.`,
        suggestions: [
          `Remove the unused variable or use it in your logic`,
          'Double-check your variable names match where you use them',
          'Think about what each variable should do',
        ],
        severity: 'minor',
      };
    }
  }

  // Check 8: Too Complex or Potential Logic Issue
  if (code.length > 500) {
    return {
      diagnosticTitle: 'Complex Solution',
      diagnosticMessage:
        "Your code is quite long! There might be a simpler way to solve this. Sometimes complexity hides logic errors.",
      suggestions: [
        'Can you break this into smaller functions?',
        'Is there a simpler approach?',
        'Remove any redundant code',
      ],
      severity: 'moderate',
    };
  }

  // Check 9: Generic Logic Error
  return {
    diagnosticTitle: 'Logic Error',
    diagnosticMessage:
      "I detected an issue with your code logic. The syntax looks okay, but the results aren't what we expected. Think about your algorithm step-by-step.",
    suggestions: [
      'Trace through your code with a simple example',
      'Check if you\'re returning the right value',
      'Verify your conditions and loop logic',
    ],
    severity: 'moderate',
  };
}

/**
 * Generate helpful tips based on code analysis
 */
export function generateHelpTips(code: string): string[] {
  const tips: string[] = [];

  if (!code.includes('console.log') && !code.includes('print')) {
    tips.push('💡 Add logging statements to debug your code');
  }

  if (!code.includes('//') && !code.includes('/*')) {
    tips.push('💡 Add comments to explain your logic');
  }

  if (code.split('function').length < 2) {
    tips.push('💡 Consider breaking your code into functions');
  }

  if (!code.includes('test') && !code.includes('expect')) {
    tips.push('💡 Write test cases to verify your solution');
  }

  return tips.slice(0, 3);
}
