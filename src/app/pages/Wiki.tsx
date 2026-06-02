import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Book, ChevronDown, ChevronRight, Lightbulb, Code, Database, GitBranch, Repeat, Layers, Grid3x3 } from 'lucide-react';
import { WIKI_SECTIONS, type WikiSection } from '../utils/wikiContent';
import { highlightCSharp } from '../components/WikiSidebar';

const ICON_MAP: Record<string, React.ReactNode> = {
  Code: <Code className="w-5 h-5" />,
  GitBranch: <GitBranch className="w-5 h-5" />,
  Database: <Database className="w-5 h-5" />,
  Repeat: <Repeat className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Grid3x3: <Grid3x3 className="w-5 h-5" />,
  Lightbulb: <Lightbulb className="w-5 h-5" />,
};

export function Wiki() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(WIKI_SECTIONS.map((s) => s.id))
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2 flex items-center gap-3">
            <Book className="w-7 h-7 text-primary" />
            Knowledge Base
          </h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive C# reference — from basics to arrays, loops, and 2D grids
          </p>
        </div>

        <div className="grid gap-6">
          {WIKI_SECTIONS.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              isExpanded={expandedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  section,
  isExpanded,
  onToggle,
}: {
  section: WikiSection;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border rounded-lg bg-card border-border transition-colors overflow-hidden">
      {/* Section header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-6 hover:bg-muted/30 transition-colors text-left"
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-muted/60 ${section.color}`}>
          {ICON_MAP[section.icon] || <Code className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {section.topics.length} topic{section.topics.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Topics */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          {section.topics.map((topic, idx) => (
            <div key={idx}>
              <h3 className="text-base font-semibold mb-1">{topic.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{topic.description}</p>

              <div className="space-y-3">
                {topic.codeExamples.map((example, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden bg-muted/40 border-border transition-colors">
                    <div className="px-4 py-1.5 text-xs text-muted-foreground bg-muted/60 border-b border-border/50">
                      {example.label}
                    </div>
                    <pre
                      className="px-4 py-3 text-sm leading-relaxed overflow-x-auto"
                      style={{ fontFamily: 'var(--font-mono)', background: '#1e1e1e', color: '#d4d4d4' }}
                    >
                      {highlightCSharp(example.code)}
                    </pre>
                  </div>
                ))}
              </div>

              {topic.tips && topic.tips.length > 0 && (
                <div className="mt-3 border rounded-lg p-4 bg-primary/5 border-primary/20 space-y-1.5">
                  {topic.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {idx < section.topics.length - 1 && (
                <div className="border-t border-border/30 mt-5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
