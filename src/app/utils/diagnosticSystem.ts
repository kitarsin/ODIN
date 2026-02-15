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
