import { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { useFeatureLockdown, LOCKABLE_FEATURES, type FeatureKey, type LockdownRule, type NewLockdownRule } from '../context/FeatureLockdownContext';
import { supabase } from '../../lib/supabaseClient';
import { ShieldAlert, Plus, Trash2, Power, PowerOff, Search, Home, Gamepad2, Book, User, Settings, FlaskConical } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'Home': <Home className="w-5 h-5" />,
  'Gamepad2': <Gamepad2 className="w-5 h-5" />,
  'Book': <Book className="w-5 h-5" />,
  'User': <User className="w-5 h-5" />,
  'Settings': <Settings className="w-5 h-5" />,
  'FlaskConical': <FlaskConical className="w-5 h-5" />,
};

interface StudentOption {
  id: string;
  name: string;
  studentId: string;
  section: string;
}

export function FeatureLockdown() {
  const { rules, loading, addRule, updateRule, deleteRule } = useFeatureLockdown();
  const [showForm, setShowForm] = useState(false);
  const [formFeature, setFormFeature] = useState<FeatureKey>('game');
  const [formScope, setFormScope] = useState<'all' | 'section' | 'student'>('all');
  const [formScopeValue, setFormScopeValue] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [filterFeature, setFilterFeature] = useState<string>('all');
  const [filterScope, setFilterScope] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, student_id, section').eq('role', 'student').order('full_name');
      if (data) {
        const mapped = data.map((r: any) => ({ id: r.id, name: r.full_name || 'User', studentId: r.student_id || '', section: r.section || '' }));
        setStudents(mapped);
        setSections([...new Set(mapped.map((s) => s.section).filter(Boolean))]);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (formScope === 'section' && !formScopeValue) { setFormError('Please select a section.'); return; }
    if (formScope === 'student' && !formScopeValue) { setFormError('Please select a student.'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const rule: NewLockdownRule = { feature_key: formFeature, scope: formScope, scope_value: formScope === 'all' ? null : formScopeValue, message: formMessage || null };
      await addRule(rule);
      setShowForm(false);
      setFormFeature('game');
      setFormScope('all');
      setFormScopeValue('');
      setFormMessage('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (rule: LockdownRule) => {
    try { await updateRule(rule.id, { is_active: !rule.is_active }); } catch (err) { console.error('Toggle error:', err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lockdown rule permanently?')) return;
    try { await deleteRule(id); } catch (err) { console.error('Delete error:', err); }
  };

  // Quick-toggle: toggle the global "all students" rule for a feature
  const handleQuickToggle = async (featureKey: FeatureKey) => {
    const globalRule = rules.find((r) => r.feature_key === featureKey && r.scope === 'all');
    if (globalRule) {
      await updateRule(globalRule.id, { is_active: !globalRule.is_active });
    } else {
      await addRule({ feature_key: featureKey, scope: 'all', scope_value: null, message: null });
    }
  };

  const isGloballyLocked = (featureKey: string) => rules.some((r) => r.feature_key === featureKey && r.scope === 'all' && r.is_active);
  const ruleCountForFeature = (featureKey: string) => rules.filter((r) => r.feature_key === featureKey && r.is_active).length;

  const filteredRules = rules.filter((r) => {
    if (filterFeature !== 'all' && r.feature_key !== filterFeature) return false;
    if (filterScope !== 'all' && r.scope !== filterScope) return false;
    return true;
  });

  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
  });

  const getScopeLabel = (rule: LockdownRule) => {
    if (rule.scope === 'all') return 'All Students';
    if (rule.scope === 'section') return `Section: ${rule.scope_value}`;
    const student = students.find((s) => s.id === rule.scope_value);
    return student ? `${student.name} (${student.studentId})` : `Student: ${rule.scope_value?.slice(0, 8)}…`;
  };

  const formatDate = (d: string) => { const dt = new Date(d); return dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2 flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-[#FF5252]" />
            Feature Lockdown
          </h1>
          <p className="text-sm text-muted-foreground">Control which features students can access. Admins always retain full access.</p>
        </div>

        {/* Quick Toggle Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {LOCKABLE_FEATURES.map((f) => {
            const locked = isGloballyLocked(f.key);
            const count = ruleCountForFeature(f.key);
            return (
              <button
                key={f.key}
                onClick={() => handleQuickToggle(f.key)}
                className={`relative border rounded-lg p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  locked
                    ? 'border-[#FF5252] bg-[#FF5252]/10 shadow-[0_0_12px_rgba(255,82,82,0.15)]'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <div className={`mb-2 ${locked ? 'text-[#FF5252]' : 'text-primary'}`}>
                  {FEATURE_ICONS[f.icon]}
                </div>
                <p className="text-sm font-medium mb-1">{f.label}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${locked ? 'text-[#FF5252]' : 'text-primary'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                    {locked ? 'LOCKED' : 'OPEN'}
                  </span>
                  {count > 0 && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                      {count}
                    </span>
                  )}
                </div>
                {/* Status dot */}
                <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${locked ? 'bg-[#FF5252] shadow-[0_0_6px_rgba(255,82,82,0.6)]' : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]'}`} />
              </button>
            );
          })}
        </div>

        {/* Add Rule */}
        <div className="border rounded-lg bg-card border-border mb-6 transition-colors">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Add Lockdown Rule</span>
            </div>
            <span className="text-xs text-muted-foreground">{showForm ? 'Collapse' : 'Expand'}</span>
          </button>

          {showForm && (
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Feature */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Feature</label>
                  <select value={formFeature} onChange={(e) => setFormFeature(e.target.value as FeatureKey)} className="w-full px-3 py-2 border rounded-md text-sm bg-background border-border text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                    {LOCKABLE_FEATURES.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>
                </div>
                {/* Scope */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Scope</label>
                  <select value={formScope} onChange={(e) => { setFormScope(e.target.value as any); setFormScopeValue(''); }} className="w-full px-3 py-2 border rounded-md text-sm bg-background border-border text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                    <option value="all">All Students</option>
                    <option value="section">By Section</option>
                    <option value="student">Specific Student</option>
                  </select>
                </div>
                {/* Scope value */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {formScope === 'all' ? 'Target (N/A)' : formScope === 'section' ? 'Section' : 'Student'}
                  </label>
                  {formScope === 'all' && <Input disabled placeholder="Applies to everyone" className="bg-muted/40" />}
                  {formScope === 'section' && (
                    <select value={formScopeValue} onChange={(e) => setFormScopeValue(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm bg-background border-border text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                      <option value="">Select section…</option>
                      {sections.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                  {formScope === 'student' && (
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input placeholder="Search student…" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="pl-8" />
                      {studentSearch && (
                        <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto bg-card border border-border rounded-md shadow-lg">
                          {filteredStudents.slice(0, 8).map((s) => (
                            <button key={s.id} onClick={() => { setFormScopeValue(s.id); setStudentSearch(`${s.name} (${s.studentId})`); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors">
                              {s.name} <span className="text-muted-foreground">({s.studentId})</span>
                            </button>
                          ))}
                          {filteredStudents.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground">No students found.</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* Message */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Message (optional)</label>
                <Input placeholder="e.g. This feature is disabled during the exam period." value={formMessage} onChange={(e) => setFormMessage(e.target.value)} />
              </div>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={submitting} className="bg-[#FF5252] hover:bg-[#FF5252]/90 text-white">
                  {submitting ? 'Creating…' : 'Create Rule'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <select value={filterFeature} onChange={(e) => setFilterFeature(e.target.value)} className="px-3 py-1.5 border rounded-md text-sm bg-background border-border text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
            <option value="all">All Features</option>
            {LOCKABLE_FEATURES.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
          <select value={filterScope} onChange={(e) => setFilterScope(e.target.value)} className="px-3 py-1.5 border rounded-md text-sm bg-background border-border text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
            <option value="all">All Scopes</option>
            <option value="all">Global</option>
            <option value="section">Section</option>
            <option value="student">Student</option>
          </select>
        </div>

        {/* Rules Table */}
        <div className="border rounded-lg overflow-hidden bg-card border-border transition-colors">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading rules…</div>
          ) : filteredRules.length === 0 ? (
            <div className="p-8 text-center">
              <ShieldAlert className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No lockdown rules found.</p>
              <p className="text-xs text-muted-foreground mt-1">Use the panel above to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Feature</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scope</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((rule, idx) => {
                    const featureMeta = LOCKABLE_FEATURES.find((f) => f.key === rule.feature_key);
                    return (
                      <tr key={rule.id} className={`border-b border-border hover:bg-muted transition-colors ${idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={rule.is_active ? 'text-[#FF5252]' : 'text-muted-foreground'}>{featureMeta ? FEATURE_ICONS[featureMeta.icon] : null}</span>
                            <span className="text-sm font-medium">{featureMeta?.label || rule.feature_key}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ fontFamily: 'var(--font-mono)' }}>{getScopeLabel(rule)}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">{rule.message || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.is_active ? 'bg-[#FF5252]/20 text-[#FF5252]' : 'bg-muted text-muted-foreground'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${rule.is_active ? 'bg-[#FF5252]' : 'bg-muted-foreground'}`} />
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(rule.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleToggle(rule)} className={`transition-colors ${rule.is_active ? 'text-[#FF5252] hover:bg-[#FF5252]/10' : 'text-primary hover:bg-primary/10'}`}>
                              {rule.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)} className="text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* Footer */}
          <div className="px-4 py-3 border-t border-border bg-muted/40 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {filteredRules.length} rule{filteredRules.length !== 1 ? 's' : ''}
              {filteredRules.filter((r) => r.is_active).length > 0 && (
                <span className="ml-2 text-[#FF5252]">({filteredRules.filter((r) => r.is_active).length} active)</span>
              )}
            </span>
            <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>feature_lockdowns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
