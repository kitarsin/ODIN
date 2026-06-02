import { useState } from 'react';
import { Book, ChevronRight, ChevronDown, Search, X, Lightbulb } from 'lucide-react';
import { WIKI_SECTIONS, type WikiSection, type WikiTopic } from '../utils/wikiContent';

// ── C# Syntax Highlighter ─────────────────────────────────────────────────────

const CS_KEYWORDS = new Set([
  'abstract','as','base','bool','break','byte','case','catch','char','checked',
  'class','const','continue','decimal','default','delegate','do','double','else',
  'enum','event','explicit','extern','false','finally','fixed','float','for',
  'foreach','goto','if','implicit','in','int','interface','internal','is','lock',
  'long','namespace','new','null','object','operator','out','override','params',
  'private','protected','public','readonly','ref','return','sbyte','sealed','short',
  'sizeof','stackalloc','static','string','struct','switch','this','throw','true',
  'try','typeof','uint','ulong','unchecked','unsafe','ushort','using','virtual',
  'void','volatile','while','var','dynamic','yield',
]);

const TOKEN_RE = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|\b(\d+(?:\.\d*)?[fFdDmMlLuU]*)\b|([A-Za-z_]\w*)|([\s\S])/g;

function highlightCSharp(code: string) {
  const result: (string | JSX.Element)[] = [];
  TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = TOKEN_RE.exec(code)) !== null) {
    const [full, comment, str, chr, num, ident] = m;
    let color: string | null = null;

    if (comment !== undefined)           color = '#6a9955'; // green  — comments
    else if (str !== undefined
          || chr !== undefined)          color = '#ce9178'; // orange — strings / chars
    else if (num !== undefined)          color = '#b5cea8'; // sage   — numbers
    else if (ident !== undefined) {
      if (CS_KEYWORDS.has(ident))        color = '#569cd6'; // blue   — keywords
      else if (code[TOKEN_RE.lastIndex] === '(') color = '#dcdcaa'; // yellow — methods
      else if (/^[A-Z]/.test(ident))     color = '#4ec9b0'; // teal   — types/classes
    }

    result.push(color
      ? <span key={key++} style={{ color }}>{full}</span>
      : full
    );
  }

  return result;
}

export function WikiSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTopic = (key: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Filter sections/topics by search query
  const filteredSections = searchQuery.trim()
    ? WIKI_SECTIONS.map((section) => {
        const q = searchQuery.toLowerCase();
        const matchedTopics = section.topics.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.codeExamples.some((e) => e.code.toLowerCase().includes(q) || e.label.toLowerCase().includes(q)),
        );
        if (matchedTopics.length > 0 || section.title.toLowerCase().includes(q)) {
          return { ...section, topics: matchedTopics.length > 0 ? matchedTopics : section.topics };
        }
        return null;
      }).filter(Boolean) as WikiSection[]
    : WIKI_SECTIONS;

  return (
    <>
      {/* Toggle button — always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex-shrink-0 flex items-center justify-center border-r border-border bg-card/80 hover:bg-muted/60 transition-all ${
          isOpen ? 'w-0 overflow-hidden border-0' : 'w-10'
        }`}
        title={isOpen ? 'Close Wiki' : 'Open Wiki'}
        style={{ writingMode: 'vertical-lr' }}
      >
        {!isOpen && (
          <div className="flex items-center gap-2 py-4">
            <Book className="w-4 h-4 text-primary rotate-90" />
            <span className="text-xs font-semibold text-muted-foreground tracking-wider">WIKI</span>
          </div>
        )}
      </button>

      {/* Sidebar panel */}
      <div
        className={`flex-shrink-0 border-r border-border bg-card/60 backdrop-blur-md overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'w-[320px]' : 'w-0'
        }`}
      >
        {isOpen && (
          <div className="h-full flex flex-col w-[320px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80">
              <div className="flex items-center gap-2">
                <Book className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Knowledge Base</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topics..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {filteredSections.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">No results found.</div>
              ) : (
                filteredSections.map((section) => (
                  <SectionAccordion
                    key={section.id}
                    section={section}
                    isExpanded={expandedSections.has(section.id) || searchQuery.trim().length > 0}
                    onToggle={() => toggleSection(section.id)}
                    expandedTopics={expandedTopics}
                    onToggleTopic={toggleTopic}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Section Accordion ─────────────────────────────────────────────────────────

function SectionAccordion({
  section,
  isExpanded,
  onToggle,
  expandedTopics,
  onToggleTopic,
}: {
  section: WikiSection;
  isExpanded: boolean;
  onToggle: () => void;
  expandedTopics: Set<string>;
  onToggleTopic: (key: string) => void;
}) {
  return (
    <div className="border-b border-border/50">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        )}
        <span className={`text-sm font-semibold ${section.color}`}>{section.title}</span>
        <span className="ml-auto text-[10px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
          {section.topics.length}
        </span>
      </button>

      {isExpanded && (
        <div className="pb-1">
          {section.topics.map((topic) => {
            const key = `${section.id}::${topic.title}`;
            const topicExpanded = expandedTopics.has(key);
            return (
              <TopicCard
                key={key}
                topic={topic}
                sectionColor={section.color}
                isExpanded={topicExpanded}
                onToggle={() => onToggleTopic(key)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Topic Card ────────────────────────────────────────────────────────────────

function TopicCard({
  topic,
  sectionColor,
  isExpanded,
  onToggle,
}: {
  topic: WikiTopic;
  sectionColor: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mx-2 mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors text-left"
      >
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sectionColor.replace('text-', 'bg-')}`} />
        <span className="text-xs font-medium truncate">{topic.title}</span>
        {isExpanded ? (
          <ChevronDown className="w-3 h-3 text-muted-foreground ml-auto flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-2 pt-1 space-y-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{topic.description}</p>

          {topic.codeExamples.map((example, i) => (
            <div key={i} className="rounded-md border border-border overflow-hidden">
              <div className="px-2.5 py-1 text-[10px] text-muted-foreground bg-muted/50 border-b border-border/50">
                {example.label}
              </div>
              <pre
                className="px-2.5 py-2 text-[11px] leading-relaxed overflow-x-auto"
                style={{ fontFamily: 'var(--font-mono)', background: '#1e1e1e', color: '#d4d4d4' }}
              >
                {highlightCSharp(example.code)}
              </pre>
            </div>
          ))}

          {topic.tips && topic.tips.length > 0 && (
            <div className="rounded-md border border-primary/20 bg-primary/5 p-2">
              {topic.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground leading-relaxed">
                  <Lightbulb className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
