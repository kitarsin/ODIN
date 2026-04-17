import { Navigation } from '../components/Navigation';
import { Book, Code, Terminal, Database } from 'lucide-react';

export function Wiki() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2 flex items-center gap-3">
            <Book className="w-7 h-7 text-primary" />
            Knowledge Base
          </h1>
          <p className="text-sm text-muted-foreground">Programming concepts and syntax reference</p>
        </div>

        <div className="grid gap-6">
          {/* Arrays Guide */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 transition-colors">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Arrays</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Arrays are ordered collections of elements in C#. Each element is accessed using a zero-based index.
              </p>
              
              <div className="border rounded-lg p-4 bg-muted/40 border-border transition-colors">
                <p className="text-xs mb-2 text-muted-foreground">Declaration:</p>
                <code className="block text-sm text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                  int[] numbers = { 10, 20, 30, 40, 50 };
                </code>
              </div>

              <div className="border rounded-lg p-4 bg-muted/40 border-border transition-colors">
                <p className="text-xs mb-2 text-muted-foreground">Accessing Elements:</p>
                <code className="block text-sm text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                  numbers[0]  // returns 10<br />
                  numbers[2]  // returns 30
                </code>
              </div>

              <div className="border rounded-lg p-4 bg-muted/40 border-border transition-colors">
                <p className="text-xs mb-2 text-muted-foreground">Common Properties:</p>
                <code className="block text-sm text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                  numbers.Length      // get array size
                </code>
              </div>
            </div>
          </div>

          {/* Loops Guide */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary/10 transition-colors">
                <Code className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="text-xl font-semibold">Loops</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Loops allow you to repeat code multiple times. In C#, loops are essential for iterating through arrays.
              </p>
              
              <div className="border rounded-lg p-4 bg-muted/40 border-border transition-colors">
                <p className="text-xs mb-2 text-muted-foreground">For Loop:</p>
                <code className="block text-sm text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                  for (int i = 0; i &lt; 5; i++) {'{'}<br />
                  &nbsp;&nbsp;Console.WriteLine(i);<br />
                  {'}'}
                </code>
              </div>

              <div className="border rounded-lg p-4 bg-muted/40 border-border transition-colors">
                <p className="text-xs mb-2 text-muted-foreground">While Loop:</p>
                <code className="block text-sm text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                  int i = 0;<br />
                  while (i &lt; 5) {'{'}<br />
                  &nbsp;&nbsp;Console.WriteLine(i);<br />
                  &nbsp;&nbsp;i++;<br />
                  {'}'}
                </code>
              </div>

              <div className="border rounded-lg p-4 bg-muted/40 border-border transition-colors">
                <p className="text-xs mb-2 text-muted-foreground">foreach Loop (Arrays):</p>
                <code className="block text-sm text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                  foreach (int num in numbers) {'{'}<br />
                  &nbsp;&nbsp;Console.WriteLine(num);<br />
                  {'}'}
                </code>
              </div>
            </div>
          </div>

          {/* 2D Grids Guide */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/10 transition-colors">
                <Terminal className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-xl font-semibold">2D Grids</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                2D arrays (rectangular arrays) store rows and columns. They are useful for matrices and maps.
              </p>
              
              <div className="border rounded-lg p-4 bg-muted/40 border-border transition-colors">
                <p className="text-xs mb-2 text-muted-foreground">Declaration:</p>
                <code className="block text-sm text-amber-500" style={{ fontFamily: 'var(--font-mono)' }}>
                  int[,] grid = {'{'}<br />
                  &nbsp;&nbsp;{'{'}1, 2, 3{'}'},<br />
                  &nbsp;&nbsp;{'{'}4, 5, 6{'}'},<br />
                  &nbsp;&nbsp;{'{'}7, 8, 9{'}'}<br />
                  {'}'};
                </code>
              </div>

              <div className="border rounded-lg p-4 bg-muted/40 border-border transition-colors">
                <p className="text-xs mb-2 text-muted-foreground">Accessing Elements:</p>
                <code className="block text-sm text-amber-500" style={{ fontFamily: 'var(--font-mono)' }}>
                  grid[0, 0]  // returns 1 (row 0, col 0)<br />
                  grid[1, 2]  // returns 6 (row 1, col 2)
                </code>
              </div>

              <div className="border rounded-lg p-4 bg-muted/40 border-border transition-colors">
                <p className="text-xs mb-2 text-muted-foreground">Nested Loop Iteration:</p>
                <code className="block text-sm text-amber-500" style={{ fontFamily: 'var(--font-mono)' }}>
                  for (int row = 0; row &lt; grid.GetLength(0); row++) {'{'}<br />
                  &nbsp;&nbsp;for (int col = 0; col &lt; grid.GetLength(1); col++) {'{'}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;Console.WriteLine(grid[row, col]);<br />
                  &nbsp;&nbsp;{'}'}<br />
                  {'}'}
                </code>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="border rounded-lg p-6 bg-primary/10 border-primary/30 transition-colors">
            <h3 className="text-lg font-semibold text-primary mb-4">💡 Quick Tips</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Array indices always start at 0</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use .Length and GetLength() for sizes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Nested loops are required for 2D arrays</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Always check array bounds to avoid errors</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
