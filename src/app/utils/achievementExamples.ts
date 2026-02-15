/**
 * ODIN Achievement System - Usage Examples & Demo
 * 
 * This file demonstrates how to use the achievement system
 * for displaying success/failure screens and persisting achievements to user profiles.
 */

import { AchievementData } from '../components/AchievementModal';
import { diagnoseCode } from '../utils/diagnosticSystem';

// ============================================================================
// EXAMPLE 1: Success Achievement - Code Executed Correctly
// ============================================================================

export const successAchievementExample: AchievementData = {
  status: 'success',
  badgeName: 'First Victory',
  badgeEmoji: '⚔️',
  title: 'Code Executed',
  description: 'Your code ran without errors!',
  successMessage: 'Excellent work! Your array solution is correct.',
};

// ============================================================================
// EXAMPLE 2: Failure Achievement - Diagnostic for Incomplete Syntax
// ============================================================================

export const failureAchievementExample: AchievementData = {
  status: 'failure',
  badgeName: 'Debugging Session',
  badgeEmoji: '🔍',
  title: 'Syntax Error Detected',
  description: 'Your code needs some work. Let Odin help!',
  diagnosticTitle: 'Missing Closing Bracket',
  diagnosticMessage:
    'You opened a bracket [ but forgot to close it with ]. Every opening bracket needs a matching closing bracket!',
  suggestions: [
    'Count your opening [ and closing ] brackets',
    'Use automated bracket matching in your editor',
    'Check the end of your array declaration',
  ],
};

// ============================================================================
// EXAMPLE 3: Using Diagnostic System in Code Validation
// ============================================================================

export function validateCodeAndShowAchievement(userCode: string): AchievementData {
  // Determine if code is correct (in real scenario, run tests against it)
  const isCodeCorrect = true; // This would be based on actual test results

  if (isCodeCorrect) {
    return successAchievementExample;
  } else {
    // Get diagnostic for incorrect code
    const diagnostic = diagnoseCode(userCode, 'loop');

    return {
      status: 'failure',
      badgeName: 'Debugging Session',
      badgeEmoji: '🔍',
      title: 'Error Detected',
      description: 'Your code needs some work. Let Odin help!',
      diagnosticTitle: diagnostic.diagnosticTitle,
      diagnosticMessage: diagnostic.diagnosticMessage,
      suggestions: diagnostic.suggestions,
    };
  }
}

// ============================================================================
// EXAMPLE 4: Specific Achievement Types
// ============================================================================

export const achievementTypes = {
  // First code success
  firstVictory: {
    status: 'success' as const,
    badgeName: 'First Victory',
    badgeEmoji: '⚔️',
    title: 'First Success',
    description: 'You ran your first correct code!',
    successMessage: 'Welcome to the programming world!',
  },

  // Array mastery
  arrayMastery: {
    status: 'success' as const,
    badgeName: 'Array Master',
    badgeEmoji: '📦',
    title: 'Array Mastery',
    description: 'You mastered array operations!',
    successMessage: 'Arrays are now second nature to you!',
  },

  // Loop expert
  loopExpert: {
    status: 'success' as const,
    badgeName: 'Loop Expert',
    badgeEmoji: '🔄',
    title: 'Loop Mastery',
    description: 'You perfected loop structures!',
    successMessage: 'You can loop with your eyes closed!',
  },

  // Debugging pro
  debuggingPro: {
    status: 'success' as const,
    badgeName: 'Debugging Pro',
    badgeEmoji: '🐛',
    title: 'Bug Slayer',
    description: 'You fixed 10 errors!',
    successMessage: 'Bugs don\'t stand a chance against you!',
  },

  // Grid wizard
  gridWizard: {
    status: 'success' as const,
    badgeName: 'Grid Wizard',
    badgeEmoji: '🧙',
    title: '2D Grid Expert',
    description: 'You mastered 2D grid algorithms!',
    successMessage: 'Two dimensions are your playground!',
  },
};

// ============================================================================
// EXAMPLE 5: Integration with useAuth Hook
// ============================================================================

/**
 * Usage in a React component:
 * 
 * 1. Import the hook and components:
 *    - useAuth from context/AuthContext
 *    - AchievementModal from components/AchievementModal
 *    - diagnoseCode from utils/diagnosticSystem
 * 
 * 2. Set up state for showing achievements:
 *    const [showAchievement, setShowAchievement] = useState(false);
 *    const [achievementData, setAchievementData] = useState<AchievementData | null>(null);
 * 
 * 3. In your handleCodeRun function:
 *    - Validate the user's code
 *    - If correct: Show success modal and add achievement
 *    - If incorrect: Show diagnostic modal
 * 
 * 4. Render the modal component
 * 
 * See achievementExamples.ts for implementation details.
 */

// ============================================================================
// EXAMPLE 6: Database Schema for Achievements
// ============================================================================

/**
 * Add this to your Supabase profiles table migration (if not already present):
 * 
 * ALTER TABLE profiles ADD COLUMN achievements TEXT DEFAULT '[]';
 * 
 * The achievements are stored as JSON array in the profiles table.
 * Each achievement has: id, name, emoji, description, unlockedAt, type
 */

// ============================================================================
// EXAMPLE 7: Preventing Duplicate Achievements
// ============================================================================

export function checkIfAchievementAlreadyUnlocked(
  userAchievements: any[],
  achievementName: string
): boolean {
  return userAchievements.some((a) => a.name === achievementName);
}

/**
 * Usage:
 * 
 * const alreadyUnlocked = checkIfAchievementAlreadyUnlocked(
 *   user.achievements,
 *   'First Victory'
 * );
 * 
 * if (!alreadyUnlocked) {
 *   addAchievement({
 *     name: 'First Victory',
 *     emoji: '⚔️',
 *     description: 'Successfully executed code without errors',
 *     unlockedAt: new Date().toISOString(),
 *     type: 'success',
 *   });
 * }
 */

// ============================================================================
// EXAMPLE 8: Stats Calculation from Achievements
// ============================================================================

export function calculateAchievementStats(achievements: any[]) {
  return {
    totalAchievements: achievements.length,
    successCount: achievements.filter((a) => a.type === 'success').length,
    diagnosisCount: achievements.filter((a) => a.type === 'diagnosis').length,
    recentAchievement: achievements[achievements.length - 1] || null,
    unlockedToday: achievements.filter((a) =>
      new Date(a.unlockedAt).toDateString() === new Date().toDateString()
    ).length,
  };
}

// ============================================================================
// EXAMPLE 9: Diagnostic Examples for Different Error Types
// ============================================================================

export const diagnosticExamples = {
  emptySyntax: {
    diagnosticTitle: 'No Code Detected',
    diagnosticMessage:
      "You haven't written any code yet. Don't worry, everyone starts somewhere!",
    suggestions: [
      'Start with a basic approach',
      'Break down the problem step by step',
      'Write one line at a time',
    ],
  },

  incompleteBrackets: {
    diagnosticTitle: 'Syntax Incomplete',
    diagnosticMessage:
      "Your brackets, parentheses, or braces don't match up. Every opening symbol needs a closing pair!",
    suggestions: [
      'Count your opening and closing brackets',
      'Use an editor with bracket matching',
      'Check each function call has matching parentheses',
    ],
  },

  infiniteLoop: {
    diagnosticTitle: 'Infinite Loop Detected',
    diagnosticMessage:
      'You have a "while(true)" loop, which will run forever! You need a way to break out.',
    suggestions: [
      'Add a break statement or exit condition',
      'Consider using a for loop instead',
      'Make sure your loop variable changes',
    ],
  },

  missingLoop: {
    diagnosticTitle: 'Missing Loop Structure',
    diagnosticMessage:
      'This problem requires a loop to process multiple items, but I don\'t see one in your code.',
    suggestions: [
      'Use a "for" loop to iterate through array elements',
      'Think about what you want to repeat',
      'Decide your loop condition carefully',
    ],
  },
};
