/**
 * Shared wiki content data — single source of truth for the Wiki page
 * and the in-game WikiSidebar. Covers C# fundamentals through the
 * study scope (arrays, loops, 2D grids).
 */

export interface CodeExample {
  label: string;
  code: string;
}

export interface WikiTopic {
  title: string;
  description: string;
  codeExamples: CodeExample[];
  tips?: string[];
}

export interface WikiSection {
  id: string;
  title: string;
  icon: string;        // lucide icon name
  color: string;       // tailwind color token
  topics: WikiTopic[];
}

export const WIKI_SECTIONS: WikiSection[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. C# BASICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'basics',
    title: 'C# Basics',
    icon: 'Code',
    color: 'text-blue-400',
    topics: [
      {
        title: 'Variables & Data Types',
        description: 'Variables store values. Each variable has a type that determines what kind of data it can hold.',
        codeExamples: [
          { label: 'Common types', code: 'int age = 21;\ndouble gpa = 3.85;\nstring name = "Alex";\nbool enrolled = true;\nchar grade = \'A\';' },
          { label: 'var keyword', code: 'var count = 10;      // compiler infers int\nvar price = 9.99;    // compiler infers double\nvar label = "hello"; // compiler infers string' },
        ],
        tips: ['Use meaningful variable names', 'C# is strongly typed — you cannot store a string in an int variable'],
      },
      {
        title: 'Console Input / Output',
        description: 'Use Console.WriteLine() to print output and Console.ReadLine() to read user input.',
        codeExamples: [
          { label: 'Printing output', code: 'Console.WriteLine("Hello, World!");\nConsole.WriteLine("Score: " + 95);\nConsole.WriteLine($"Name: {name}, Age: {age}");' },
          { label: 'Reading input', code: 'string input = Console.ReadLine();\nint number = int.Parse(Console.ReadLine());' },
        ],
      },
      {
        title: 'Operators',
        description: 'Arithmetic, comparison, and logical operators for building expressions.',
        codeExamples: [
          { label: 'Arithmetic', code: 'int sum = 10 + 5;    // 15\nint diff = 10 - 5;   // 5\nint prod = 10 * 5;   // 50\nint quot = 10 / 3;   // 3 (integer division)\nint rem = 10 % 3;    // 1 (remainder)' },
          { label: 'Comparison & Logical', code: '// Comparison: ==  !=  <  >  <=  >=\nbool isEqual = (5 == 5);  // true\n\n// Logical: &&  ||  !\nbool both = (true && false); // false\nbool either = (true || false); // true' },
        ],
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. CONTROL FLOW
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'control-flow',
    title: 'Control Flow',
    icon: 'GitBranch',
    color: 'text-violet-400',
    topics: [
      {
        title: 'If / Else',
        description: 'Execute code conditionally based on boolean expressions.',
        codeExamples: [
          { label: 'Basic if/else', code: 'int score = 85;\n\nif (score >= 90) {\n    Console.WriteLine("Excellent!");\n} else if (score >= 75) {\n    Console.WriteLine("Good job!");\n} else {\n    Console.WriteLine("Keep trying!");\n}' },
        ],
      },
      {
        title: 'Switch Statement',
        description: 'Select one of many code blocks to execute based on a value.',
        codeExamples: [
          { label: 'Switch on a value', code: 'int day = 3;\nswitch (day) {\n    case 1: Console.WriteLine("Monday"); break;\n    case 2: Console.WriteLine("Tuesday"); break;\n    case 3: Console.WriteLine("Wednesday"); break;\n    default: Console.WriteLine("Other"); break;\n}' },
        ],
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. ARRAYS (study scope)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'arrays',
    title: 'Arrays',
    icon: 'Database',
    color: 'text-primary',
    topics: [
      {
        title: 'Declaring Arrays',
        description: 'Arrays are fixed-size, ordered collections. Every element must be the same type.',
        codeExamples: [
          { label: 'Inline initialization', code: 'int[] scores = { 85, 92, 78, 95, 88 };' },
          { label: 'With new keyword', code: 'int[] numbers = new int[5]; // all default to 0\nstring[] names = new string[3]; // all default to null' },
        ],
        tips: ['Array size is fixed after creation — you cannot add or remove slots'],
      },
      {
        title: 'Accessing Elements',
        description: 'Use a zero-based index inside square brackets to read or write a specific element.',
        codeExamples: [
          { label: 'Read & write', code: 'int[] arr = { 10, 20, 30, 40, 50 };\n\nConsole.WriteLine(arr[0]); // 10 (first)\nConsole.WriteLine(arr[4]); // 50 (last)\n\narr[2] = 99; // change third element\nConsole.WriteLine(arr[2]); // 99' },
          { label: 'Last element', code: '// Access the last element safely:\nint last = arr[arr.Length - 1];' },
        ],
        tips: ['Indices go from 0 to Length - 1', 'Accessing arr[arr.Length] causes an IndexOutOfRangeException'],
      },
      {
        title: 'Array .Length Property',
        description: 'Every array has a .Length property that returns the number of elements.',
        codeExamples: [
          { label: 'Using Length', code: 'int[] data = { 3, 7, 2, 9, 4 };\nConsole.WriteLine(data.Length); // 5' },
        ],
      },
      {
        title: 'Common Array Patterns',
        description: 'Useful patterns you will frequently need when working with arrays.',
        codeExamples: [
          { label: 'Find the maximum', code: 'int[] nums = { 4, 9, 2, 7, 1 };\nint max = nums[0];\nfor (int i = 1; i < nums.Length; i++) {\n    if (nums[i] > max) max = nums[i];\n}\nConsole.WriteLine(max); // 9' },
          { label: 'Reverse an array', code: 'int[] arr = { 1, 2, 3, 4, 5 };\nfor (int i = 0; i < arr.Length / 2; i++) {\n    int temp = arr[i];\n    arr[i] = arr[arr.Length - 1 - i];\n    arr[arr.Length - 1 - i] = temp;\n}' },
          { label: 'Copy an array', code: 'int[] original = { 10, 20, 30 };\nint[] copy = new int[original.Length];\nfor (int i = 0; i < original.Length; i++) {\n    copy[i] = original[i];\n}' },
        ],
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. LOOPS (study scope)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'loops',
    title: 'Loops',
    icon: 'Repeat',
    color: 'text-secondary',
    topics: [
      {
        title: 'For Loop',
        description: 'Repeats a block a known number of times. Has an initializer, condition, and iterator.',
        codeExamples: [
          { label: 'Count 0 to 4', code: 'for (int i = 0; i < 5; i++) {\n    Console.WriteLine(i);\n}\n// Output: 0 1 2 3 4' },
          { label: 'Count backwards', code: 'for (int i = 4; i >= 0; i--) {\n    Console.WriteLine(i);\n}\n// Output: 4 3 2 1 0' },
        ],
        tips: ['The loop variable i starts at the initializer and runs while the condition is true'],
      },
      {
        title: 'While Loop',
        description: 'Repeats as long as a condition is true. Check happens before each iteration.',
        codeExamples: [
          { label: 'Basic while', code: 'int i = 0;\nwhile (i < 5) {\n    Console.WriteLine(i);\n    i++;\n}' },
        ],
        tips: ['Make sure the condition eventually becomes false, or you get an infinite loop'],
      },
      {
        title: 'Do-While Loop',
        description: 'Like while, but the body runs at least once because the check is at the end.',
        codeExamples: [
          { label: 'Runs at least once', code: 'int x = 10;\ndo {\n    Console.WriteLine(x);\n    x++;\n} while (x < 5);\n// Output: 10 (runs once even though 10 < 5 is false)' },
        ],
      },
      {
        title: 'Foreach Loop',
        description: 'Iterates over each element in a collection without needing an index variable.',
        codeExamples: [
          { label: 'Iterate an array', code: 'int[] scores = { 85, 92, 78 };\nforeach (int s in scores) {\n    Console.WriteLine(s);\n}' },
        ],
        tips: ['You cannot modify array elements inside a foreach — use a for loop instead'],
      },
      {
        title: 'Break & Continue',
        description: 'break exits the loop immediately. continue skips to the next iteration.',
        codeExamples: [
          { label: 'Break on condition', code: 'for (int i = 0; i < 10; i++) {\n    if (i == 5) break;\n    Console.WriteLine(i);\n}\n// Output: 0 1 2 3 4' },
          { label: 'Skip even numbers', code: 'for (int i = 0; i < 6; i++) {\n    if (i % 2 == 0) continue;\n    Console.WriteLine(i);\n}\n// Output: 1 3 5' },
        ],
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. ARRAYS + LOOPS (study scope)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'arrays-loops',
    title: 'Arrays + Loops',
    icon: 'Layers',
    color: 'text-emerald-400',
    topics: [
      {
        title: 'Iterating with For',
        description: 'Use a for loop with the array\'s .Length to visit every element.',
        codeExamples: [
          { label: 'Print all elements', code: 'int[] nums = { 3, 7, 2, 9 };\nfor (int i = 0; i < nums.Length; i++) {\n    Console.WriteLine($"Index {i}: {nums[i]}");\n}' },
        ],
      },
      {
        title: 'Searching an Array',
        description: 'Loop through and check each element against a target value.',
        codeExamples: [
          { label: 'Find index of value', code: 'int[] arr = { 10, 20, 30, 40 };\nint target = 30;\nint foundIndex = -1;\n\nfor (int i = 0; i < arr.Length; i++) {\n    if (arr[i] == target) {\n        foundIndex = i;\n        break;\n    }\n}\nConsole.WriteLine(foundIndex); // 2' },
        ],
      },
      {
        title: 'Filtering & Counting',
        description: 'Count elements that meet a condition, or collect them into a new structure.',
        codeExamples: [
          { label: 'Count values above 5', code: 'int[] values = { 4, 7, 2, 9, 1, 8, 3 };\nint count = 0;\nfor (int i = 0; i < values.Length; i++) {\n    if (values[i] > 5) count++;\n}\nConsole.WriteLine(count); // 3' },
        ],
      },
      {
        title: 'Accumulation (Sum / Average)',
        description: 'Add up all elements and optionally compute the average.',
        codeExamples: [
          { label: 'Sum and average', code: 'int[] data = { 10, 20, 30, 40, 50 };\nint sum = 0;\nfor (int i = 0; i < data.Length; i++) {\n    sum += data[i];\n}\ndouble avg = (double)sum / data.Length;\nConsole.WriteLine($"Sum: {sum}, Avg: {avg}");' },
        ],
      },
      {
        title: 'Transforming Elements',
        description: 'Modify each element in-place by looping with an index.',
        codeExamples: [
          { label: 'Double every value', code: 'int[] arr = { 1, 2, 3, 4, 5 };\nfor (int i = 0; i < arr.Length; i++) {\n    arr[i] = arr[i] * 2;\n}\n// arr is now { 2, 4, 6, 8, 10 }' },
        ],
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. 2D ARRAYS / GRIDS (study scope)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: '2d-grids',
    title: '2D Arrays / Grids',
    icon: 'Grid3x3',
    color: 'text-amber-400',
    topics: [
      {
        title: 'Declaring 2D Arrays',
        description: '2D arrays (rectangular arrays) have rows and columns, like a grid or matrix.',
        codeExamples: [
          { label: 'Inline initialization', code: 'int[,] grid = {\n    { 1, 2, 3 },\n    { 4, 5, 6 },\n    { 7, 8, 9 }\n};' },
          { label: 'With new keyword', code: 'int[,] matrix = new int[3, 4]; // 3 rows, 4 columns\n// All elements default to 0' },
        ],
      },
      {
        title: 'Accessing Elements',
        description: 'Use two indices: [row, col]. Both are zero-based.',
        codeExamples: [
          { label: 'Read & write', code: 'int[,] grid = {\n    { 1, 2, 3 },\n    { 4, 5, 6 }\n};\n\nConsole.WriteLine(grid[0, 0]); // 1 (row 0, col 0)\nConsole.WriteLine(grid[1, 2]); // 6 (row 1, col 2)\n\ngrid[0, 1] = 99;\nConsole.WriteLine(grid[0, 1]); // 99' },
        ],
      },
      {
        title: 'GetLength() Method',
        description: 'Use GetLength(0) for the number of rows and GetLength(1) for the number of columns.',
        codeExamples: [
          { label: 'Dimensions', code: 'int[,] grid = new int[3, 4];\nint rows = grid.GetLength(0); // 3\nint cols = grid.GetLength(1); // 4\nConsole.WriteLine($"{rows} x {cols}"); // 3 x 4' },
        ],
        tips: ['GetLength(0) = rows, GetLength(1) = columns — don\'t mix them up!'],
      },
      {
        title: 'Nested Loop Iteration',
        description: 'Use two nested for loops to visit every cell in the grid.',
        codeExamples: [
          { label: 'Print all elements', code: 'int[,] grid = {\n    { 1, 2, 3 },\n    { 4, 5, 6 },\n    { 7, 8, 9 }\n};\n\nfor (int row = 0; row < grid.GetLength(0); row++) {\n    for (int col = 0; col < grid.GetLength(1); col++) {\n        Console.Write(grid[row, col] + " ");\n    }\n    Console.WriteLine();\n}\n// Output:\n// 1 2 3\n// 4 5 6\n// 7 8 9' },
        ],
      },
      {
        title: 'Row & Column Traversal',
        description: 'Access a specific row or column by fixing one index and looping the other.',
        codeExamples: [
          { label: 'Print a single row', code: '// Print row 1:\nfor (int col = 0; col < grid.GetLength(1); col++) {\n    Console.Write(grid[1, col] + " ");\n}\n// Output: 4 5 6' },
          { label: 'Print a single column', code: '// Print column 2:\nfor (int row = 0; row < grid.GetLength(0); row++) {\n    Console.Write(grid[row, 2] + " ");\n}\n// Output: 3 6 9' },
        ],
      },
      {
        title: '2D Grid Patterns',
        description: 'Common patterns used when working with grids and matrices.',
        codeExamples: [
          { label: 'Sum all elements', code: 'int total = 0;\nfor (int r = 0; r < grid.GetLength(0); r++) {\n    for (int c = 0; c < grid.GetLength(1); c++) {\n        total += grid[r, c];\n    }\n}\nConsole.WriteLine(total); // 45' },
          { label: 'Main diagonal', code: '// Print main diagonal (only for square grids):\nint size = grid.GetLength(0);\nfor (int i = 0; i < size; i++) {\n    Console.Write(grid[i, i] + " ");\n}\n// Output: 1 5 9' },
          { label: 'Border elements', code: '// Print only border elements:\nfor (int r = 0; r < grid.GetLength(0); r++) {\n    for (int c = 0; c < grid.GetLength(1); c++) {\n        bool isBorder = r == 0 || c == 0 ||\n            r == grid.GetLength(0) - 1 ||\n            c == grid.GetLength(1) - 1;\n        if (isBorder)\n            Console.Write(grid[r, c] + " ");\n    }\n}' },
        ],
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. QUICK REFERENCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'reference',
    title: 'Quick Reference',
    icon: 'Lightbulb',
    color: 'text-yellow-400',
    topics: [
      {
        title: 'Common Errors',
        description: 'Mistakes every beginner makes — and how to fix them.',
        codeExamples: [
          { label: 'IndexOutOfRangeException', code: '// BAD:  arr[arr.Length]  — index too high!\n// GOOD: arr[arr.Length - 1]  — last element' },
          { label: 'Off-by-one in loops', code: '// BAD:  for (int i = 0; i <= arr.Length; i++)\n//       ^^^ includes arr.Length which is out of bounds\n// GOOD: for (int i = 0; i < arr.Length; i++)' },
          { label: 'Missing semicolon', code: '// Every statement in C# ends with ;\nConsole.WriteLine("Hello")  // ERROR\nConsole.WriteLine("Hello"); // OK' },
        ],
      },
      {
        title: 'Debugging Tips',
        description: 'Strategies to find and fix bugs in your code.',
        codeExamples: [],
        tips: [
          'Add Console.WriteLine() calls to print variable values at each step',
          'Trace through your loop by hand: write down i and the array values on paper',
          'Check your loop bounds: does it start at 0? Does it end at Length - 1?',
          'Read the error message carefully — it usually tells you the exact line and issue',
          'If stuck, simplify: test with a tiny array of 2–3 elements first',
        ],
      },
    ],
  },
];
