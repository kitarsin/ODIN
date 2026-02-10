import { Navigation } from '../components/Navigation';
import { Book, Code, Terminal, Database } from 'lucide-react';

export function Wiki() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navigation />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2 flex items-center gap-3">
            <Book className="w-7 h-7 text-[#10B981]" />
            Knowledge Base
          </h1>
          <p className="text-sm text-[#94A3B8]">Programming concepts and syntax reference</p>
        </div>

        <div className="grid gap-6">
          {/* Arrays Guide */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-[#10B981]" />
              </div>
              <h2 className="text-xl font-semibold text-[#F1F5F9]">Arrays</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-[#94A3B8]">
                Arrays are ordered collections of elements. Each element can be accessed using an index.
              </p>
              
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                <p className="text-xs text-[#64748B] mb-2">Declaration:</p>
                <code className="block text-[#10B981] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  let numbers = [10, 20, 30, 40, 50];
                </code>
              </div>

              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                <p className="text-xs text-[#64748B] mb-2">Accessing Elements:</p>
                <code className="block text-[#10B981] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  numbers[0]  // returns 10<br />
                  numbers[2]  // returns 30
                </code>
              </div>

              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                <p className="text-xs text-[#64748B] mb-2">Common Methods:</p>
                <code className="block text-[#10B981] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  numbers.push(60)    // add to end<br />
                  numbers.pop()       // remove from end<br />
                  numbers.length      // get array size
                </code>
              </div>
            </div>
          </div>

          {/* Loops Guide */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h2 className="text-xl font-semibold text-[#F1F5F9]">Loops</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-[#94A3B8]">
                Loops allow you to repeat code multiple times. Essential for iterating through arrays.
              </p>
              
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                <p className="text-xs text-[#64748B] mb-2">For Loop:</p>
                <code className="block text-[#3B82F6] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  for (let i = 0; i &lt; 5; i++) {'{'}<br />
                  &nbsp;&nbsp;console.log(i);<br />
                  {'}'}
                </code>
              </div>

              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                <p className="text-xs text-[#64748B] mb-2">While Loop:</p>
                <code className="block text-[#3B82F6] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  let i = 0;<br />
                  while (i &lt; 5) {'{'}<br />
                  &nbsp;&nbsp;console.log(i);<br />
                  &nbsp;&nbsp;i++;<br />
                  {'}'}
                </code>
              </div>

              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                <p className="text-xs text-[#64748B] mb-2">For...of Loop (Arrays):</p>
                <code className="block text-[#3B82F6] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  for (let num of numbers) {'{'}<br />
                  &nbsp;&nbsp;console.log(num);<br />
                  {'}'}
                </code>
              </div>
            </div>
          </div>

          {/* 2D Grids Guide */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                <Terminal className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h2 className="text-xl font-semibold text-[#F1F5F9]">2D Grids</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-[#94A3B8]">
                2D arrays (grids) are arrays of arrays, useful for representing matrices, game boards, and maps.
              </p>
              
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                <p className="text-xs text-[#64748B] mb-2">Declaration:</p>
                <code className="block text-[#F59E0B] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  let grid = [<br />
                  &nbsp;&nbsp;[1, 2, 3],<br />
                  &nbsp;&nbsp;[4, 5, 6],<br />
                  &nbsp;&nbsp;[7, 8, 9]<br />
                  ];
                </code>
              </div>

              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                <p className="text-xs text-[#64748B] mb-2">Accessing Elements:</p>
                <code className="block text-[#F59E0B] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  grid[0][0]  // returns 1 (row 0, col 0)<br />
                  grid[1][2]  // returns 6 (row 1, col 2)
                </code>
              </div>

              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                <p className="text-xs text-[#64748B] mb-2">Nested Loop Iteration:</p>
                <code className="block text-[#F59E0B] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  for (let row = 0; row &lt; grid.length; row++) {'{'}<br />
                  &nbsp;&nbsp;for (let col = 0; col &lt; grid[row].length; col++) {'{'}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;console.log(grid[row][col]);<br />
                  &nbsp;&nbsp;{'}'}<br />
                  {'}'}
                </code>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#10B981] mb-4">💡 Quick Tips</h3>
            <ul className="space-y-2 text-sm text-[#F1F5F9]">
              <li className="flex items-start gap-2">
                <span className="text-[#10B981]">•</span>
                <span>Array indices always start at 0</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10B981]">•</span>
                <span>Use .length to get the size of an array</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10B981]">•</span>
                <span>Nested loops are required for 2D arrays</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10B981]">•</span>
                <span>Always check array bounds to avoid errors</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
