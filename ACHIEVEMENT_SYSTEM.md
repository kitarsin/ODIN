# ODIN Achievement System - Implementation Guide

## Overview

The achievement system provides a complete solution for:
- **Success/Victory Screens**: Display when students correctly code and run solutions
- **Failure Diagnostics**: Show "Odin's" diagnostic feedback when code has errors
- **Achievement Persistence**: Save achievements to user profiles
- **Profile Integration**: Display achievements on student dashboards

---

## Components

### 1. **AchievementModal** (`src/app/components/AchievementModal.tsx`)

A reusable modal component that displays achievements with animations.

**Props:**
```typescript
interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AchievementData;
}

interface AchievementData {
  status: 'success' | 'failure';
  badgeName: string;
  badgeEmoji: string;
  title: string;
  description: string;
  successMessage?: string;        // For success achievements
  diagnosticTitle?: string;       // For failure diagnostics
  diagnosticMessage?: string;     // For failure diagnostics
  suggestions?: string[];         // For failure diagnostics
}
```

**Features:**
- Auto-closes after 3.5 seconds
- Animated entrance/exit
- Color-coded (green for success, amber for failure)
- Progress bar showing time remaining
- Backdrop blur effect

---

### 2. **Diagnostic System** (`src/app/utils/diagnosticSystem.ts`)

Analyzes student code and provides personalized "Odin" feedback.

**Key Function:**
```typescript
diagnoseCode(code: string, expectedPattern?: string): DiagnosticResult
```

**Detects:**
- Empty or missing code
- Incomplete syntax (mismatched brackets)
- Common typos (iff, forr, whille, etc.)
- Missing loop structures
- Missing conditional logic
- Infinite loops
- Unused variables
- Logic errors

**Example:**
```typescript
const diagnostic = diagnoseCode(userCode, 'loop');
console.log(diagnostic.diagnosticTitle);    // "Missing Loop Structure"
console.log(diagnostic.suggestions);        // Array of helpful tips
```

---

### 3. **AuthContext - Achievement Management** (`src/app/context/AuthContext.tsx`)

Extended to support achievement persistence.

**New Method:**
```typescript
addAchievement(achievement: Omit<Achievement, 'id'>): Promise<void>
```

**Usage:**
```typescript
const { user, addAchievement } = useAuth();

await addAchievement({
  name: 'First Victory',
  emoji: '⚔️',
  description: 'Successfully executed code without errors',
  unlockedAt: new Date().toISOString(),
  type: 'success',
});
```

---

## Integration Example

### In GameContainer.tsx

```typescript
import { AchievementModal, AchievementData } from '../components/AchievementModal';
import { diagnoseCode } from '../utils/diagnosticSystem';
import { useAuth } from '../context/AuthContext';

export function GameContainer() {
  const { user, addAchievement } = useAuth();
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);

  const handleRun = () => {
    const isSuccess = validateCode(code);  // Your validation logic

    if (isSuccess) {
      // Show success modal
      const successData: AchievementData = {
        status: 'success',
        badgeName: 'First Victory',
        badgeEmoji: '⚔️',
        title: 'Code Executed',
        description: 'Your code ran without errors!',
        successMessage: 'Great job! Your logic is correct!',
      };
      setAchievementData(successData);
      setShowAchievement(true);

      // Add to user profile
      if (user && addAchievement) {
        addAchievement({
          name: 'First Victory',
          emoji: '⚔️',
          description: 'Successfully executed code without errors',
          unlockedAt: new Date().toISOString(),
          type: 'success',
        });
      }
    } else {
      // Show diagnostic
      const diagnostic = diagnoseCode(code, 'loop');
      const failureData: AchievementData = {
        status: 'failure',
        badgeName: 'Debugging Session',
        badgeEmoji: '🔍',
        title: 'Error Detected',
        description: 'Your code needs some work. Let Odin help!',
        diagnosticTitle: diagnostic.diagnosticTitle,
        diagnosticMessage: diagnostic.diagnosticMessage,
        suggestions: diagnostic.suggestions,
      };
      setAchievementData(failureData);
      setShowAchievement(true);
    }
  };

  return (
    <>
      <AchievementModal
        isOpen={showAchievement}
        onClose={() => setShowAchievement(false)}
        data={achievementData!}
      />
      {/* Rest of component */}
    </>
  );
}
```

---

## Achievement Types

### Success Achievements (Victory Screen)
- 🎉 Achievement Unlocked!
- Green color scheme
- Success message displayed
- Auto-closes + bouncing badge animation

### Failure Achievements (Diagnostic Screen)
- ⚠️ Time to Debug
- Amber color scheme
- Diagnostic title & message
- Personalized suggestions from Odin
- Badge with alert indicator

---

## Profile Integration

### Achievements Section

The Profile page displays all user achievements with:
- **Achievement Grid**: 4 columns showing all unlocked achievements
- **Hover Details**: Shows description on hover
- **Unlock Date**: Displays when achievement was unlocked
- **Type Filtering**: Separates success vs. diagnosis achievements

### Statistics Dashboard

Updated stats showing:
- **Total Achievements**: Sum of all unlocked achievements
- **Victories**: Count of successful code executions
- **Debug Sessions**: Count of diagnostic moments

---

## Database Schema

Add achievements column to Supabase profiles table:

```sql
ALTER TABLE profiles ADD COLUMN achievements TEXT DEFAULT '[]';
```

Achievements are stored as JSON:
```json
[
  {
    "id": "1707905400000-abc123def",
    "name": "First Victory",
    "emoji": "⚔️",
    "description": "Successfully executed code without errors",
    "unlockedAt": "2026-02-15T14:30:00.000Z",
    "type": "success"
  },
  {
    "id": "1707905450000-xyz789uvw",
    "name": "Debugging Session",
    "emoji": "🔍",
    "description": "Odin diagnosed your code issues",
    "unlockedAt": "2026-02-15T14:35:00.000Z",
    "type": "diagnosis"
  }
]
```

---

## Best Practices

1. **Check for Duplicates**
   ```typescript
   const alreadyUnlocked = user.achievements.some(a => a.name === 'First Victory');
   if (!alreadyUnlocked) {
     addAchievement(...);
   }
   ```

2. **Timing**: Achievement modals auto-close after 3.5 seconds, giving users time to read

3. **Diagnostics**: Run `diagnoseCode()` before showing failure modal to get real feedback

4. **User Feedback**: Achievements are visible immediately in the profile after being unlocked

5. **Demo Mode**: The current GameContainer shows a 70/30 success ratio for demo purposes

---

## Customization

### Add New Achievement Types

In `achievementExamples.ts`:

```typescript
export const myCustomAchievement: AchievementData = {
  status: 'success',
  badgeName: 'Array Master',
  badgeEmoji: '📦',
  title: 'Array Mastery',
  description: 'You mastered array operations!',
  successMessage: 'Arrays are now second nature to you!',
};
```

### Customize Diagnostics

Edit `diagnosticSystem.ts` to add new error detection patterns:

```typescript
if (code.includes('debugError')) {
  return {
    diagnosticTitle: 'Custom Error',
    diagnosticMessage: 'Your specific error message',
    suggestions: ['Tip 1', 'Tip 2', 'Tip 3'],
    severity: 'critical',
  };
}
```

---

## Files Created/Modified

### Created:
- `src/app/components/AchievementModal.tsx` - Achievement display component
- `src/app/utils/diagnosticSystem.ts` - Code analysis engine
- `src/app/utils/achievementExamples.ts` - Usage examples and reference

### Modified:
- `src/app/context/AuthContext.tsx` - Added achievement persistence
- `src/app/pages/GameContainer.tsx` - Integrated achievement system
- `src/app/pages/Profile.tsx` - Display achievements on profile

---

## Testing

The GameContainer is set up for demo with a 70% success rate:

```typescript
const isSuccess = Math.random() > 0.3; // 70% success
```

This means:
- ~70% of runs trigger success achievements
- ~30% of runs trigger diagnostic feedback

To toggle this for testing, adjust the probability or set it to specific conditions.

---

## Future Enhancements

- [ ] Achievement milestones (unlock at X achievements)
- [ ] Streak tracking (consecutive successes)
- [ ] Difficulty scaling
- [ ] Achievement sharing/bragging rights
- [ ] Leaderboards by achievement count
- [ ] Time-based achievements (solved in under X seconds)
- [ ] Specific diagnostic sessions saved to history
