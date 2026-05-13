import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '../components/Navigation';
import { Search, Save, RefreshCw, Pencil, X, Check, ClipboardList, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { supabase } from '../../lib/supabaseClient';

// ── Types ────────────────────────────────────────────────────────────────────

type StudentProfile = {
  id: string;
  fullName: string;
  studentId: string;
  section: string;
  pretestCompleted: boolean;
  posttestCompleted: boolean;
};

type ResponseRow = {
  id: string;
  user_id: string;
  question_id: string;
  sequence_number: number;
  response: string;
  time_to_first_key_ms: number;
  total_time_ms: number;
  avg_flight_time_ms: number;
  avg_dwell_time_ms: number;
  paste_count: number;
  paste_char_count: number;
  typed_char_count: number;
  is_correct: boolean;
  created_at: string;
};

type TestType = 'pretest' | 'posttest';
type CompletionFilter = 'all' | 'completed' | 'pending';

// ── Component ────────────────────────────────────────────────────────────────

export function AdminResponseEditor() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('all');
  const [testType, setTestType] = useState<TestType>('pretest');

  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ResponseRow>>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const tableName = testType === 'pretest' ? 'pretest_responses' : 'posttest_responses';
  const sections = ['all', ...Array.from(new Set(students.map(s => s.section).filter(Boolean)))];

  // ── Fetch students ───────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, student_id, section, pretest_completed, posttest_completed')
        .eq('role', 'student')
        .order('full_name');
      if (error) { console.error(error); setLoading(false); return; }
      setStudents((data || []).map((r: any) => ({
        id: r.id,
        fullName: r.full_name || 'Unknown',
        studentId: r.student_id || '',
        section: r.section || '',
        pretestCompleted: r.pretest_completed ?? false,
        posttestCompleted: r.posttest_completed ?? false,
      })));
      setLoading(false);
    })();
  }, []);

  // ── Fetch responses for selected student ─────────────────────────────────

  const fetchResponses = useCallback(async (studentId: string) => {
    setResponsesLoading(true);
    const { data, error } = await supabase
      .from(tableName)
      .select('id, user_id, question_id, sequence_number, response, time_to_first_key_ms, total_time_ms, avg_flight_time_ms, avg_dwell_time_ms, paste_count, paste_char_count, typed_char_count, is_correct, created_at')
      .eq('user_id', studentId)
      .order('sequence_number');
    if (error) { console.error(error); setResponsesLoading(false); return; }
    setResponses(data || []);
    setResponsesLoading(false);
  }, [tableName]);

  useEffect(() => {
    if (selectedStudent) fetchResponses(selectedStudent.id);
    else setResponses([]);
  }, [selectedStudent, fetchResponses]);

  // ── Filtering ────────────────────────────────────────────────────────────

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = sectionFilter === 'all' || s.section === sectionFilter;
    const completed = testType === 'pretest' ? s.pretestCompleted : s.posttestCompleted;
    const matchesCompletion = completionFilter === 'all' ||
      (completionFilter === 'completed' && completed) ||
      (completionFilter === 'pending' && !completed);
    return matchesSearch && matchesSection && matchesCompletion;
  });

  // ── Edit helpers ─────────────────────────────────────────────────────────

  const startEdit = (row: ResponseRow) => {
    setEditingId(row.id);
    setEditDraft({ ...row });
  };

  const cancelEdit = () => { setEditingId(null); setEditDraft({}); };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setSaveMessage('');
    const { id, user_id, ...updates } = editDraft as ResponseRow;
    const { error } = await supabase.from(tableName).update(updates).eq('id', editingId);
    if (error) {
      setSaveMessage(`Error: ${error.message}`);
    } else {
      setSaveMessage('Saved!');
      setResponses(prev => prev.map(r => r.id === editingId ? { ...r, ...updates } : r));
      setEditingId(null);
      setEditDraft({});
      setTimeout(() => setSaveMessage(''), 2000);
    }
    setSaving(false);
  };

  const updateDraft = (key: keyof ResponseRow, value: any) => {
    setEditDraft(prev => ({ ...prev, [key]: value }));
  };

  // ── Render helpers ───────────────────────────────────────────────────────



  const formatTimestamp = (iso: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString();
  };

  // Convert ISO string to datetime-local input value
  const toDatetimeLocal = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2 flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-primary" />
            Response Editor
          </h1>
          <p className="text-sm text-muted-foreground">
            Edit individual pretest and posttest responses for any student
          </p>
        </div>

        {/* Test type toggle + filters */}
        <div className="border rounded-lg p-4 mb-6 bg-card border-border transition-colors">
          <div className="flex flex-wrap items-center gap-4">

            {/* Test type tabs */}
            <div className="flex rounded-lg overflow-hidden border border-border">
              <button
                onClick={() => { setTestType('pretest'); setSelectedStudent(null); }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${testType === 'pretest' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                Pretest
              </button>
              <button
                onClick={() => { setTestType('posttest'); setSelectedStudent(null); }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${testType === 'posttest' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                Posttest
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or student ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 border bg-background border-border text-foreground"
              />
            </div>

            {/* Section filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={sectionFilter}
                onChange={e => setSectionFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background border-border text-foreground"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {sections.map(s => (
                  <option key={s} value={s}>{s === 'all' ? 'All Sections' : s}</option>
                ))}
              </select>
            </div>

            {/* Completion filter */}
            <select
              value={completionFilter}
              onChange={e => setCompletionFilter(e.target.value as CompletionFilter)}
              className="px-3 py-2 border rounded-md text-sm bg-background border-border text-foreground"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <option value="all">All Students</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

          {/* ── Student picker (left) ──────────────────────────────────────── */}
          <div className="border rounded-lg bg-card border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Students ({filteredStudents.length})
              </p>
            </div>
            <div className="max-h-[calc(100vh-340px)] overflow-y-auto">
              {loading && (
                <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
              )}
              {!loading && filteredStudents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No students match filters</p>
              )}
              {filteredStudents.map(s => {
                const completed = testType === 'pretest' ? s.pretestCompleted : s.posttestCompleted;
                const isSelected = selectedStudent?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className={`w-full text-left px-4 py-3 border-b border-border transition-colors hover:bg-muted/50 ${isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{s.fullName}</p>
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                          {s.studentId} • {s.section}
                        </p>
                      </div>
                      <span className={`shrink-0 ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${completed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                        {completed ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Response editor (right) ────────────────────────────────────── */}
          <div className="border rounded-lg bg-card border-border overflow-hidden">
            {!selectedStudent ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <ClipboardList className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">Select a student to view and edit their {testType} responses</p>
              </div>
            ) : (
              <>
                {/* Student header */}
                <div className="px-5 py-4 border-b border-border bg-muted/40 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold">{selectedStudent.fullName}</h2>
                    <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                      {selectedStudent.studentId} • {selectedStudent.section} • {testType.charAt(0).toUpperCase() + testType.slice(1)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {saveMessage && (
                      <span className={`text-xs font-medium ${saveMessage.startsWith('Error') ? 'text-destructive' : 'text-emerald-500'}`}>
                        {saveMessage}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchResponses(selectedStudent.id)}
                      disabled={responsesLoading}
                    >
                      <RefreshCw className={`w-4 h-4 ${responsesLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Responses */}
                {responsesLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-12">Loading responses...</p>
                ) : responses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">No {testType} responses found for this student</p>
                ) : (
                  <div className="divide-y divide-border max-h-[calc(100vh-340px)] overflow-y-auto">
                    {responses.map((row, idx) => {
                      const isEditing = editingId === row.id;
                      const draft = isEditing ? editDraft : row;
                      return (
                        <div key={row.id} className={`px-5 py-4 ${isEditing ? 'bg-primary/5' : idx % 2 === 0 ? '' : 'bg-muted/20'}`}>

                          {/* Row header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                                Q{(draft.sequence_number ?? 0) + 1}
                              </span>
                              <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                                {draft.question_id}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${draft.is_correct ? 'bg-emerald-500/20 text-emerald-500' : 'bg-destructive/20 text-destructive'}`}>
                                {draft.is_correct ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <>
                                  <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" onClick={saveEdit} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                    <Save className="w-4 h-4 mr-1" />
                                    {saving ? 'Saving...' : 'Save'}
                                  </Button>
                                </>
                              ) : (
                                <Button variant="ghost" size="sm" onClick={() => startEdit(row)} className="text-secondary hover:text-secondary">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Code response */}
                          <div className="mb-3">
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Response Code</label>
                            {isEditing ? (
                              <textarea
                                value={draft.response ?? ''}
                                onChange={e => updateDraft('response', e.target.value)}
                                rows={5}
                                className="w-full rounded border p-3 text-sm bg-muted border-border text-foreground resize-y"
                                style={{ fontFamily: 'var(--font-mono)', tabSize: 4 }}
                              />
                            ) : (
                              <pre className="rounded border p-3 text-sm bg-muted/50 border-border overflow-x-auto whitespace-pre-wrap" style={{ fontFamily: 'var(--font-mono)' }}>
                                {row.response || '(empty)'}
                              </pre>
                            )}
                          </div>

                          {/* Metrics grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                            {([
                              { key: 'time_to_first_key_ms', label: 'First Key (ms)', type: 'number' },
                              { key: 'total_time_ms', label: 'Total Time (ms)', type: 'number' },
                              { key: 'avg_flight_time_ms', label: 'Avg Flight (ms)', type: 'number' },
                              { key: 'avg_dwell_time_ms', label: 'Avg Dwell (ms)', type: 'number' },
                              { key: 'paste_count', label: 'Paste Count', type: 'number' },
                              { key: 'paste_char_count', label: 'Paste Chars', type: 'number' },
                              { key: 'typed_char_count', label: 'Typed Chars', type: 'number' },
                              { key: 'sequence_number', label: 'Sequence #', type: 'number' },
                            ] as { key: keyof ResponseRow; label: string; type: string }[]).map(field => (
                              <div key={field.key}>
                                <label className="text-xs text-muted-foreground block mb-1">{field.label}</label>
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={String(draft[field.key] ?? '')}
                                    onChange={e => updateDraft(field.key, parseFloat(e.target.value) || 0)}
                                    className="h-8 text-sm border bg-background border-border"
                                    style={{ fontFamily: 'var(--font-mono)' }}
                                  />
                                ) : (
                                  <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                                    {typeof row[field.key] === 'number' ? row[field.key].toLocaleString() : row[field.key]}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Bottom row: correctness toggle + question ID + timestamp */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">Correct</label>
                              {isEditing ? (
                                <button
                                  onClick={() => updateDraft('is_correct', !draft.is_correct)}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-medium transition-colors ${draft.is_correct ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : 'bg-destructive/20 border-destructive/50 text-destructive'}`}
                                >
                                  {draft.is_correct ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                  {draft.is_correct ? 'Yes' : 'No'}
                                </button>
                              ) : (
                                <p className={`text-sm font-medium ${row.is_correct ? 'text-emerald-500' : 'text-destructive'}`}>
                                  {row.is_correct ? 'Yes' : 'No'}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">Question ID</label>
                              {isEditing ? (
                                <Input
                                  value={draft.question_id ?? ''}
                                  onChange={e => updateDraft('question_id', e.target.value)}
                                  className="h-8 text-sm border bg-background border-border"
                                  style={{ fontFamily: 'var(--font-mono)' }}
                                />
                              ) : (
                                <p className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>{row.question_id}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">Created At</label>
                              {isEditing ? (
                                <input
                                  type="datetime-local"
                                  step="1"
                                  value={toDatetimeLocal(draft.created_at ?? '')}
                                  onChange={e => {
                                    const d = new Date(e.target.value);
                                    if (!isNaN(d.getTime())) updateDraft('created_at', d.toISOString());
                                  }}
                                  className="w-full h-8 px-2 text-sm rounded border bg-background border-border text-foreground"
                                  style={{ fontFamily: 'var(--font-mono)' }}
                                />
                              ) : (
                                <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                                  {formatTimestamp(row.created_at)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
