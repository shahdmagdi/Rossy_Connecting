import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientProfile } from '../../services/assignmentService';
import detectionService from '../../services/detectionService';
import segmentationService from '../../services/segmentationService';
import MriTab from './MriTab';
import StagingTab from './StagingTab';
import ClinicalNotes from './ClinicalNotes';
import {
  createCarePlan,
  getPatientNotes,
  updateNote,
  deleteNote,
} from '../../services/Notesservice';

// ─────────────────────────────────────────────────────────
//  SHARED HELPERS
// ─────────────────────────────────────────────────────────

const PREDICTION_META = {
  normal:    { label: 'Normal',    bg: '#DCFCE7', color: '#166534', bar: '#22c55e', icon: '✅' },
  benign:    { label: 'Benign',    bg: '#FEF9C3', color: '#854D0E', bar: '#eab308', icon: '⚠️' },
  malignant: { label: 'Malignant', bg: '#FEE2E2', color: '#991B1B', bar: '#ef4444', icon: '🔴' },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const fmt = formatDate;

const PredictionBadge = ({ prediction }) => {
  const meta = PREDICTION_META[prediction] || { label: prediction, bg: '#F3F4F6', color: '#374151', icon: '❓' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      backgroundColor: meta.bg, color: meta.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
    }}>
      {meta.icon} {meta.label}
    </span>
  );
};

const ConfidenceBar = ({ value, prediction }) => {
  const meta = PREDICTION_META[prediction] || { bar: '#6b7280', color: '#374151' };
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Confidence</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: meta.color }}>{value?.toFixed(1)}%</span>
      </div>
      <div style={{ height: 7, backgroundColor: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`, backgroundColor: meta.bar,
          borderRadius: 99, transition: 'width 0.7s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  SEGMENTATION IMAGE PAIR — reusable for both scan types
// ─────────────────────────────────────────────────────────

const SegPair = ({ originalUrl, segUrl, confidence, label }) => (
  <div>
    <div style={{
      fontSize: 11, fontWeight: 700, color: '#6366f1',
      textTransform: 'uppercase', letterSpacing: '0.05em',
      marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span>{label} Mask</span>
      {confidence != null && (
        <span style={{
          fontSize: 11, fontWeight: 700,
          backgroundColor: '#ede9fe', color: '#6d28d9',
          padding: '2px 8px', borderRadius: 99,
        }}>
          {(confidence * 100).toFixed(1)}% conf
        </span>
      )}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div>
        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Original</div>
        <img src={originalUrl} alt={`${label} original`} style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 180, border: '1px solid #e2e8f0' }} />
      </div>
      <div>
        <div style={{ fontSize: 10, color: '#6d28d9', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Segmentation</div>
        <img src={segUrl} alt={`${label} segmentation`} style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 180, border: '1.5px solid #c4b5fd' }} />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
//  CARE PLAN TAB
// ─────────────────────────────────────────────────────────

const CarePlanSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    {[1, 2].map(i => (
      <div key={i} style={{
        height: 100, borderRadius: 16,
        backgroundImage: 'linear-gradient(90deg,#f0fdf4 25%,#dcfce7 50%,#f0fdf4 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
      }} />
    ))}
  </div>
);

const CarePlanForm = ({ patientId, initial, onSaved, onCancel }) => {
  const editing = !!initial;
  const [form, setForm]     = useState({ title: initial?.title || '', content: initial?.content || '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim())   return setErr('Title is required.');
    if (!form.content.trim()) return setErr('Content is required.');
    setSaving(true); setErr('');
    try {
      const result = editing
        ? await updateNote(initial.id, { ...form, visibility: 'shared' })
        : await createCarePlan(patientId, form);
      if (result.success) onSaved(result.note);
      else setErr(result.message || 'Something went wrong.');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Request failed.');
    } finally { setSaving(false); }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
      border: '1.5px solid #86efac', borderRadius: 16,
      padding: '24px 22px', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 20 }}>📋</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#166534' }}>
          {editing ? 'Edit Care Plan' : 'New Care Plan'}
        </span>
        <span style={{ fontSize: 11, background: '#bbf7d0', color: '#166534', padding: '2px 10px', borderRadius: 99, fontWeight: 700, marginLeft: 'auto' }}>
          Visible to patient
        </span>
      </div>
      {err && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#991b1b', fontSize: 13, marginBottom: 14 }}>⚠️ {err}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#065f46', display: 'block', marginBottom: 6 }}>Title</label>
          <input value={form.title} onChange={set('title')} placeholder="e.g. Post-Surgery Recovery Plan" style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #86efac', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: 'white', transition: 'border-color .2s' }} onFocus={e => e.target.style.borderColor='#059669'} onBlur={e => e.target.style.borderColor='#86efac'} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#065f46', display: 'block', marginBottom: 6 }}>Care Plan Content</label>
          <textarea value={form.content} onChange={set('content')} placeholder="Describe the care plan, instructions, follow-ups…" rows={6} style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #86efac', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: '#0f172a', outline: 'none', resize: 'vertical', boxSizing: 'border-box', background: 'white', transition: 'border-color .2s', lineHeight: 1.7 }} onFocus={e => e.target.style.borderColor='#059669'} onBlur={e => e.target.style.borderColor='#86efac'} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button onClick={handleSubmit} disabled={saving} style={{ padding: '10px 24px', background: saving ? '#e2e8f0' : 'linear-gradient(135deg,#059669,#047857)', color: saving ? '#94a3b8' : 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: saving ? 'none' : '0 2px 10px rgba(5,150,105,.3)', transition: 'all .2s' }}>
          {saving ? 'Saving…' : editing ? 'Save Changes' : '📋 Create Care Plan'}
        </button>
        <button onClick={onCancel} style={{ padding: '10px 20px', background: 'white', color: '#64748b', border: '1.5px solid #d1fae5', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
      </div>
    </div>
  );
};

const CarePlanCard = ({ plan, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async e => {
    e.stopPropagation();
    if (!window.confirm('Delete this care plan? The patient will no longer see it.')) return;
    setDeleting(true);
    try { const res = await deleteNote(plan.id); if (res.success) onDelete(plan.id); }
    catch { /* swallow */ }
    finally { setDeleting(false); }
  };

  return (
    <div style={{ background: expanded ? 'linear-gradient(135deg,#f0fdf4,#fafffe)' : 'white', border: expanded ? '1.5px solid #86efac' : '1.5px solid #e8eaf0', borderRadius: 16, overflow: 'hidden', marginBottom: 14, boxShadow: expanded ? '0 4px 16px rgba(5,150,105,.10)' : '0 1px 4px rgba(15,23,42,.05)', transition: 'all .25s' }}>
      <div onClick={() => setExpanded(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📋</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan.title}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Created {fmt(plan.created_at)}
            {plan.updated_at && <span style={{ marginLeft: 6, color: '#cbd5e1', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>• edited {fmt(plan.updated_at)}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(plan)} style={{ padding: '6px 14px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#166534', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Edit</button>
          <button onClick={handleDelete} disabled={deleting} style={{ padding: '6px 12px', background: '#fff1f1', border: '1.5px solid #fecaca', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#dc2626', cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif" }}>{deleting ? '…' : 'Delete'}</button>
        </div>
        <span style={{ fontSize: 14, color: '#94a3b8', flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid #d1fae5', padding: '20px 22px', fontSize: 14, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {plan.content}
          {plan.scan_id && <div style={{ marginTop: 14, padding: '10px 14px', background: '#eff6ff', borderRadius: 10, fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>🩻 Linked scan ID: {plan.scan_id}</div>}
        </div>
      )}
    </div>
  );
};

const DoctorCarePlanTab = ({ patientId, patientName }) => {
  const [plans, setPlans]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true); setError('');
    try {
      const res = await getPatientNotes(patientId, 'shared');
      if (res.success) setPlans(res.notes || []);
      else setError(res.message || 'Failed to load care plans.');
    } catch (e) { setError(e?.response?.data?.message || 'Failed to load care plans.'); }
    finally { setLoading(false); }
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const handleSaved = saved => {
    setPlans(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
    setShowForm(false); setEditingPlan(null);
  };

  const handleEdit   = plan => { setEditingPlan(plan); setShowForm(false); };
  const handleDelete = id   => setPlans(prev => prev.filter(p => p.id !== id));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: '#0f172a', margin: 0 }}>Care Plans</h2>
          {patientName && <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Shared with <strong style={{ color: '#0f172a' }}>{patientName}</strong> — patient can view these</p>}
        </div>
        <button onClick={() => { setShowForm(p => !p); setEditingPlan(null); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: showForm ? 'white' : 'linear-gradient(135deg,#059669,#047857)', color: showForm ? '#64748b' : 'white', border: showForm ? '1.5px solid #d1fae5' : 'none', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: showForm ? 'none' : '0 2px 10px rgba(5,150,105,.3)', transition: 'all .2s' }}>
          {showForm ? '✕ Cancel' : '📋 New Care Plan'}
        </button>
      </div>
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 16px', fontSize: 13, color: '#166534', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>ℹ️</span>
        <span>Care plans are <strong>shared with the patient</strong>. They will receive a notification when a new care plan is created.</span>
      </div>
      {showForm    && <CarePlanForm patientId={patientId} onSaved={handleSaved} onCancel={() => setShowForm(false)} />}
      {editingPlan && <CarePlanForm patientId={patientId} initial={editingPlan} onSaved={handleSaved} onCancel={() => setEditingPlan(null)} />}
      {!loading && plans.length > 0 && <div style={{ marginBottom: 16 }}><span style={{ fontSize: 12, fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534', padding: '3px 12px', borderRadius: 99 }}>{plans.length} care plan{plans.length !== 1 ? 's' : ''}</span></div>}
      {error   && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: '12px 16px', color: '#991b1b', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
      {loading && <CarePlanSkeleton />}
      {!loading && !error && plans.length === 0 && (
        <div style={{ textAlign: 'center', padding: '56px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>No care plans yet</p>
          <p style={{ fontSize: 13 }}>Create one above — it will be shared with the patient automatically.</p>
        </div>
      )}
      {!loading && !error && plans.map(p => <CarePlanCard key={p.id} plan={p} onEdit={handleEdit} onDelete={handleDelete} />)}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  SINGLE SCAN CARD
// ─────────────────────────────────────────────────────────

const ScanCard = ({ scan }) => {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [segLoading, setSegLoading] = useState(false);
  const [segError,   setSegError]   = useState('');
  const [segResult,  setSegResult]  = useState(
    scan.segmentation?.ready
      ? { url: scan.segmentation.url, confidence: scan.segmentation.confidence, cached: true }
      : null
  );
  const [deleting, setDeleting] = useState(false);

  const probs = scan.probabilities || {};
  const meta  = PREDICTION_META[scan.prediction] || {};

  const handleRunSegmentation = async e => {
    e.stopPropagation(); setSegLoading(true); setSegError('');
    try {
      const res = await segmentationService.getSegmentation(scan.scan_id);
      setSegResult({ url: res.segmentation_url, confidence: res.confidence, cached: res.cached });
    } catch (err) { setSegError(err.message); }
    finally { setSegLoading(false); }
  };

  const handleDeleteSegmentation = async e => {
    e.stopPropagation(); setDeleting(true); setSegError('');
    try {
      await segmentationService.deleteSegmentation(scan.scan_id);
      setSegResult(null);
    } catch (err) { setSegError(err.message); }
    finally { setDeleting(false); }
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 14, border: `1.5px solid ${expanded ? (meta.bar||'#e2e8f0')+'55' : '#e8eaf0'}`, boxShadow: expanded ? `0 4px 20px ${(meta.bar||'#6b7280')}18` : '0 1px 4px rgba(15,23,42,0.06)', overflow: 'hidden', marginBottom: 12, transition: 'box-shadow 0.25s,border-color 0.25s' }}>
      <div onClick={() => setExpanded(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ width: 54, height: 54, borderRadius: 11, overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid #e8eaf0' }}>
          {!imgError && scan.image_url ? <img src={scan.image_url} alt="scan" onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🩻'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 10px', borderRadius: 99, textTransform: 'capitalize', letterSpacing: '0.04em' }}>
              {scan.image_type === 'ultrasound' ? '🔊' : '🩻'} {scan.image_type}
            </span>
            {scan.prediction && <PredictionBadge prediction={scan.prediction} />}
            {scan.shared_with_doctor && <span style={{ fontSize: 11, backgroundColor: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600, border: '1px solid #bbf7d0' }}>✓ Shared</span>}
            {scan.mental_health_mode && <span style={{ fontSize: 11, backgroundColor: '#ede9fe', color: '#5b21b6', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>🧠 MH Mode</span>}
            {segResult && <span style={{ fontSize: 11, backgroundColor: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: 99, fontWeight: 600, border: '1px solid #bbf7d0' }}>🔬 Seg Ready</span>}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{formatDate(scan.created_at)}</div>
        </div>
        {scan.confidence != null && <div style={{ flexShrink: 0, backgroundColor: meta.bg||'#f3f4f6', color: meta.color||'#374151', fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 99 }}>{scan.confidence.toFixed(1)}%</div>}
        <span style={{ fontSize: 16, color: '#94a3b8', flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '22px 22px 24px', backgroundColor: '#fafbff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Scan Image</div>
              {scan.image_url && !imgError ? <img src={scan.image_url} alt="full scan" onError={() => setImgError(true)} style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 200, border: '1px solid #e2e8f0' }} /> : <div style={{ width: '100%', height: 140, backgroundColor: '#f1f5f9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🩻</div>}
              {scan.model_version && <div style={{ marginTop: 10, fontSize: 10, color: '#cbd5e1', letterSpacing: '0.04em' }}>Model: {scan.model_version}</div>}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Classification Results</div>
              <ConfidenceBar value={scan.confidence} prediction={scan.prediction} />
              {Object.keys(probs).length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Class Probabilities</div>
                  <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 10, overflow: 'hidden' }}>
                    {Object.entries(probs).map(([cls, val], i) => {
                      const m = PREDICTION_META[cls] || {}; const isTop = cls === scan.prediction;
                      return (
                        <div key={cls} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', fontSize: 13, backgroundColor: isTop ? (m.bg+'88'||'#f9fafb') : 'transparent', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                          <span style={{ color: '#555', textTransform: 'capitalize', fontWeight: isTop ? 600 : 400 }}>{cls}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 60, height: 4, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: `${val}%`, backgroundColor: m.bar||'#6b7280', borderRadius: 99 }} /></div>
                            <span style={{ fontWeight: isTop ? 700 : 400, color: isTop ? (m.color||'#0f172a') : '#94a3b8', minWidth: 38, textAlign: 'right' }}>{val?.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {scan.recommendation && (
                <div style={{ marginTop: 14, backgroundColor: '#f0fdf4', borderRadius: 10, padding: '12px 14px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 11, color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>Recommendation</div>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: 0 }}>{scan.recommendation}</p>
                </div>
              )}
            </div>
          </div>

          {scan.shared_with_doctor && (
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>🔬 Segmentation Analysis</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{segResult ? (segResult.cached ? 'Cached result — generated previously' : 'Just generated') : 'Highlight tumor region using AI segmentation'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!segResult ? (
                    <button onClick={handleRunSegmentation} disabled={segLoading} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none', background: segLoading ? '#e2e8f0' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: segLoading ? '#94a3b8' : 'white', fontSize: 13, fontWeight: 700, cursor: segLoading ? 'not-allowed' : 'pointer', boxShadow: segLoading ? 'none' : '0 2px 8px rgba(37,99,235,0.3)' }}>
                      {segLoading ? 'Analyzing…' : 'Run Segmentation'}
                    </button>
                  ) : (
                    <>
                      <button onClick={handleRunSegmentation} disabled={segLoading} style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontSize: 12, fontWeight: 600, cursor: segLoading ? 'not-allowed' : 'pointer' }}>{segLoading ? 'Running…' : '↺ Re-run'}</button>
                      <button onClick={handleDeleteSegmentation} disabled={deleting} style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #fecaca', background: '#fff1f1', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer' }}>{deleting ? 'Deleting…' : '🗑 Delete'}</button>
                    </>
                  )}
                </div>
              </div>
              {segError && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#991b1b', fontSize: 13, marginBottom: 14 }}>⚠️ {segError}</div>}
              {segLoading && !segResult && <div style={{ height: 220, borderRadius: 12, backgroundImage: 'linear-gradient(90deg,#f0f4ff 25%,#e8eeff 50%,#f0f4ff 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />}
              {segResult && !segLoading && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Original</div>
                    <img src={scan.image_url} alt="original scan" style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 220, border: '1px solid #e2e8f0' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#2563eb' }}>Segmentation Mask</span>
                      {segResult.confidence != null && <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 99 }}>{(segResult.confidence * 100).toFixed(1)}% conf</span>}
                    </div>
                    <img src={segResult.url} alt="segmentation mask" style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 220, border: '1.5px solid #bfdbfe' }} />
                  </div>
                </div>
              )}
            </div>
          )}
          {!scan.shared_with_doctor && (
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginTop: 4, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
              🔒 Segmentation is only available for scans shared with you by the patient.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  MULTIMODAL CARD  ← segmentation added here
// ─────────────────────────────────────────────────────────

const MultimodalCard = ({ result }) => {
  const [expanded, setExpanded] = useState(false);
  const meta  = PREDICTION_META[result.prediction] || {};
  const probs = result.probabilities || {};

  // ── Segmentation state ────────────────────────────────
  // Pre-populate from list data if segmentation already exists
  const initSeg = () => {
    const s = result.segmentation;
    if (s?.ultrasound?.ready || s?.mammogram?.ready) {
      return {
        ultrasound: s.ultrasound?.ready ? { url: s.ultrasound.url, confidence: s.ultrasound.confidence } : null,
        mammogram:  s.mammogram?.ready  ? { url: s.mammogram.url,  confidence: s.mammogram.confidence  } : null,
        cached: true,
      };
    }
    return null;
  };

  const [segLoading, setSegLoading] = useState(false);
  const [segError,   setSegError]   = useState('');
  const [segResult,  setSegResult]  = useState(initSeg);
  const [deleting,   setDeleting]   = useState(false);

  const scanId = result.multimodal_id || result.id;

  const handleRunSegmentation = async e => {
    e.stopPropagation(); setSegLoading(true); setSegError('');
    try {
      const res = await segmentationService.getSegmentation(scanId);
      // Response: { segmentation: { ultrasound: { ready, url, confidence }, mammogram: { ready, url, confidence } }, original_images: {...} }
      setSegResult({
        ultrasound: res.segmentation?.ultrasound?.ready
          ? { url: res.segmentation.ultrasound.url, confidence: res.segmentation.ultrasound.confidence }
          : null,
        mammogram: res.segmentation?.mammogram?.ready
          ? { url: res.segmentation.mammogram.url, confidence: res.segmentation.mammogram.confidence }
          : null,
        originalImages: res.original_images,
        cached: res.cached,
      });
    } catch (err) { setSegError(err.message); }
    finally { setSegLoading(false); }
  };

  const handleDeleteSegmentation = async e => {
    e.stopPropagation(); setDeleting(true); setSegError('');
    try {
      await segmentationService.deleteSegmentation(scanId);
      setSegResult(null);
    } catch (err) { setSegError(err.message); }
    finally { setDeleting(false); }
  };

  const hasSegResult = segResult && (segResult.ultrasound || segResult.mammogram);

  return (
    <div style={{ background: 'linear-gradient(135deg,#eff6ff 0%,#fdf4ff 100%)', borderRadius: 14, border: '1.5px solid #c7d2fe', boxShadow: '0 2px 10px rgba(99,102,241,0.10)', marginBottom: 12, overflow: 'hidden' }}>
      <div onClick={() => setExpanded(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ width: 54, height: 54, borderRadius: 11, flexShrink: 0, background: 'linear-gradient(135deg,#6366f1,#a21caf)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🔬</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', backgroundColor: '#e0e7ff', padding: '2px 10px', borderRadius: 99, letterSpacing: '0.04em' }}>🔬 MULTIMODAL COMBINED</span>
            {result.prediction && <PredictionBadge prediction={result.prediction} />}
            {result.shared_with_doctor && <span style={{ fontSize: 11, backgroundColor: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600, border: '1px solid #bbf7d0' }}>✓ Shared</span>}
            {/* Segmentation ready badge */}
            {hasSegResult && <span style={{ fontSize: 11, backgroundColor: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: 99, fontWeight: 600, border: '1px solid #c4b5fd' }}>🔬 Seg Ready</span>}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{formatDate(result.created_at)}</div>
        </div>
        {result.confidence != null && <div style={{ flexShrink: 0, backgroundColor: meta.bg||'#f3f4f6', color: meta.color||'#374151', fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 99 }}>{result.confidence.toFixed(1)}%</div>}
        <span style={{ fontSize: 16, color: '#94a3b8', flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #e0e7ff', padding: '20px 22px', backgroundColor: '#f8f9ff' }}>

          {/* Classification */}
          {result.prediction && <ConfidenceBar value={result.confidence} prediction={result.prediction} />}
          {Object.keys(probs).length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Combined Class Probabilities</div>
              <div style={{ background: '#fff', border: '1px solid #e0e7ff', borderRadius: 10, overflow: 'hidden' }}>
                {Object.entries(probs).map(([cls, val], i) => {
                  const m = PREDICTION_META[cls] || {}; const isTop = cls === result.prediction;
                  return (
                    <div key={cls} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', fontSize: 13, backgroundColor: isTop ? (m.bg+'88') : 'transparent', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                      <span style={{ color: '#555', textTransform: 'capitalize', fontWeight: isTop ? 600 : 400 }}>{cls}</span>
                      <span style={{ fontWeight: isTop ? 700 : 400, color: isTop ? (m.color||'#0f172a') : '#94a3b8', minWidth: 38, textAlign: 'right' }}>{val?.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {result.recommendation && (
            <div style={{ marginTop: 14, backgroundColor: '#f0fdf4', borderRadius: 10, padding: '12px 14px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 11, color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>Recommendation</div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: 0 }}>{result.recommendation}</p>
            </div>
          )}

          {/* ── SEGMENTATION SECTION ── */}
          {result.shared_with_doctor && (
            <div style={{ borderTop: '1px solid #e0e7ff', paddingTop: 20, marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                    🔬 Multimodal Segmentation
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {hasSegResult
                      ? segResult.cached ? 'Cached results — generated previously' : 'Just generated'
                      : 'Run AI segmentation on both ultrasound and mammogram'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!hasSegResult ? (
                    <button
                      onClick={handleRunSegmentation}
                      disabled={segLoading}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '9px 18px', borderRadius: 10, border: 'none',
                        background: segLoading ? '#e2e8f0' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
                        color: segLoading ? '#94a3b8' : 'white',
                        fontSize: 13, fontWeight: 700,
                        cursor: segLoading ? 'not-allowed' : 'pointer',
                        boxShadow: segLoading ? 'none' : '0 2px 8px rgba(99,102,241,0.35)',
                      }}
                    >
                      {segLoading ? 'Analyzing both scans…' : '🔬 Run Segmentation'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleRunSegmentation}
                        disabled={segLoading}
                        style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e0e7ff', background: 'white', color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: segLoading ? 'not-allowed' : 'pointer' }}
                      >
                        {segLoading ? 'Running…' : '↺ Re-run'}
                      </button>
                      <button
                        onClick={handleDeleteSegmentation}
                        disabled={deleting}
                        style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #fecaca', background: '#fff1f1', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer' }}
                      >
                        {deleting ? 'Deleting…' : '🗑 Delete'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {segError && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#991b1b', fontSize: 13, marginBottom: 14 }}>
                  ⚠️ {segError}
                </div>
              )}

              {/* Loading skeleton */}
              {segLoading && !hasSegResult && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[1,2].map(i => (
                    <div key={i} style={{ height: 200, borderRadius: 12, backgroundImage: 'linear-gradient(90deg,#ede9fe 25%,#ddd6fe 50%,#ede9fe 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                  ))}
                </div>
              )}

              {/* Results: ultrasound + mammogram each with original + mask */}
              {hasSegResult && !segLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Ultrasound segmentation */}
                  {segResult.ultrasound && (
                    <div style={{ background: 'white', borderRadius: 12, padding: '16px', border: '1px solid #e0e7ff' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        🔊 Ultrasound Segmentation
                      </div>
                      <SegPair
                        originalUrl={segResult.originalImages?.ultrasound || result.ultrasound_image_url}
                        segUrl={segResult.ultrasound.url}
                        confidence={segResult.ultrasound.confidence}
                        label="Ultrasound"
                      />
                    </div>
                  )}

                  {/* Mammogram segmentation */}
                  {segResult.mammogram && (
                    <div style={{ background: 'white', borderRadius: 12, padding: '16px', border: '1px solid #e0e7ff' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#a21caf', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        🩻 Mammogram Segmentation
                      </div>
                      <SegPair
                        originalUrl={segResult.originalImages?.mammogram || result.mammogram_image_url}
                        segUrl={segResult.mammogram.url}
                        confidence={segResult.mammogram.confidence}
                        label="Mammogram"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Not shared notice */}
          {!result.shared_with_doctor && (
            <div style={{ borderTop: '1px solid #e0e7ff', paddingTop: 16, marginTop: 20, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
              🔒 Segmentation is only available for multimodal results shared with you.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  HISTORY TAB
// ─────────────────────────────────────────────────────────

const HistoryTab = ({ patientId, patientName }) => {
  const [data, setData]       = useState(null);
  const [filter, setFilter]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!patientId) return;
    const load = async () => {
      setLoading(true); setError(null);
      try { const res = await detectionService.getPatientScans(patientId); setData(res); }
      catch (err) { setError(err.message || 'Failed to load scans.'); }
      finally { setLoading(false); }
    };
    load();
  }, [patientId]);

  const allScans   = data?.scans || [];
  const byType     = data?.by_type || {};
  const multimodal = data?.multimodal || [];
  const visibleScans = filter ? (byType[filter] || []) : allScans;
  const total        = data?.total ?? 0;

  const FILTERS = [
    { key: null,         label: 'All Scans',  emoji: '🩻' },
    { key: 'ultrasound', label: 'Ultrasound', emoji: '🔊' },
    { key: 'mammogram',  label: 'Mammogram',  emoji: '🩻' },
  ];

  const normalCount    = allScans.filter(s => s.prediction === 'normal').length;
  const benignCount    = allScans.filter(s => s.prediction === 'benign').length;
  const malignantCount = allScans.filter(s => s.prediction === 'malignant').length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: '#0f172a', margin: 0 }}>Scan History</h2>
          {patientName && <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>All detection scans shared by <strong style={{ color: '#0f172a' }}>{patientName}</strong></p>}
        </div>
        {!loading && total > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[{ label: 'Normal', count: normalCount, bg: '#DCFCE7', color: '#166534' }, { label: 'Benign', count: benignCount, bg: '#FEF9C3', color: '#854D0E' }, { label: 'Malignant', count: malignantCount, bg: '#FEE2E2', color: '#991B1B' }].filter(x => x.count > 0).map(x => (
              <span key={x.label} style={{ fontSize: 12, fontWeight: 700, backgroundColor: x.bg, color: x.color, padding: '3px 10px', borderRadius: 99 }}>{x.label}: {x.count}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={String(f.key)} onClick={() => setFilter(f.key)} style={{ padding: '7px 16px', borderRadius: 99, cursor: 'pointer', border: filter === f.key ? '2px solid #2563eb' : '1.5px solid #e2e8f0', backgroundColor: filter === f.key ? '#2563eb' : '#fff', color: filter === f.key ? '#fff' : '#475569', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}>
            {f.emoji} {f.label}
            {!loading && <span style={{ marginLeft: 6, fontSize: 11, backgroundColor: filter === f.key ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: filter === f.key ? '#fff' : '#64748b', padding: '0 6px', borderRadius: 99 }}>{f.key === null ? total : (byType[f.key]?.length ?? 0)}</span>}
          </button>
        ))}
      </div>

      {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: '12px 16px', color: '#991b1b', fontSize: 14, marginBottom: 16 }}>⚠️ {error}</div>}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 82, borderRadius: 14, backgroundImage: 'linear-gradient(90deg,#f8faff 25%,#f1f5ff 50%,#f8faff 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />)}
        </div>
      )}

      {!loading && !error && visibleScans.length === 0 && multimodal.length === 0 && (
        <div style={{ textAlign: 'center', padding: '56px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🩻</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>No scans found</p>
          <p style={{ fontSize: 13 }}>{filter ? `No ${filter} scans shared by this patient yet.` : 'This patient has not shared any scans with you yet.'}</p>
        </div>
      )}

      {!loading && !error && !filter && multimodal.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#e0e7ff' }} />🔬 Combined Analysis<div style={{ flex: 1, height: 1, backgroundColor: '#e0e7ff' }} />
          </div>
          {multimodal.map(r => <MultimodalCard key={r.multimodal_id || r.id} result={r} />)}
        </div>
      )}

      {!loading && !error && visibleScans.length > 0 && (
        <div>
          {filter && <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ flex: 1, height: 1, backgroundColor: '#f1f5f9' }} />{filter === 'ultrasound' ? '🔊' : '🩻'} {filter}<div style={{ flex: 1, height: 1, backgroundColor: '#f1f5f9' }} /></div>}
          {visibleScans.map(scan => <ScanCard key={scan.scan_id} scan={scan} />)}
        </div>
      )}

      {!loading && !error && !filter && visibleScans.length > 0 && Object.keys(byType).length > 1 && (
        <div style={{ marginTop: 12, padding: '10px 14px', backgroundColor: '#f8faff', borderRadius: 10, fontSize: 12, color: '#64748b' }}>
          💡 Use the filters above to view ultrasound and mammogram scans separately.
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  PATIENT DETAILS PAGE
// ─────────────────────────────────────────────────────────

const PatientDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('diagnosis');
  const [patient, setPatient]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving,  setSaving]      = useState(false);
  const [error,   setError]       = useState(null);

  const [diagnosis, setDiagnosis] = useState({
    stage: '', tumorSize: '', lymphNode: '', metastasis: '', notes: '',
  });

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true); setError(null);
      try {
        const data = await getPatientProfile(id);
        if (data.success) setPatient(data.patient);
        else setError(data.message || 'Failed to load patient.');
      } catch (err) { setError(err?.response?.data?.message || 'Failed to load patient data.'); }
      finally { setLoading(false); }
    };
    fetchPatient();
  }, [id]);

  const handleSaveDiagnosis = async () => {
    setSaving(true);
    try { /* TODO: connect to diagnosis API */ }
    catch { setError('Failed to save diagnosis.'); }
    finally { setSaving(false); }
  };

  const tabs = [
    //{ key: 'diagnosis', label: 'Diagnosis',    icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg> },
    { key: 'history',   label: 'Scan History', icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> },
    { key: 'notes',     label: 'Clinical Notes', icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg> },
    { key: 'care_plan', label: 'Care Plan',    icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg> },
    { key: 'staging',   label: 'AJCC Staging', icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg> },
    { key: 'mri',       label: 'MRI Staging',  icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><ellipse cx="12" cy="12" rx="10" ry="6"/><line x1="12" y1="6" x2="12" y2="18"/><line x1="2" y1="12" x2="22" y2="12"/></svg> },
  ];

  const patientName     = patient?.full_name || '—';
  const patientInitials = patientName !== '—' ? patientName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?';

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .pd-wrap{padding:36px 44px;max-width:1200px;animation:fadeUp 0.35s ease}
        .back-btn{display:inline-flex;align-items:center;gap:8px;background:white;border:1.5px solid rgba(15,23,42,0.1);border-radius:10px;padding:9px 16px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:#475569;cursor:pointer;text-decoration:none;transition:all 0.2s;margin-bottom:28px;box-shadow:0 1px 3px rgba(15,23,42,0.06)}
        .back-btn:hover{background:#f8faff;color:#0f172a;transform:translateX(-2px)}
        .patient-hero{background:white;border-radius:20px;border:1px solid rgba(15,23,42,0.06);box-shadow:0 1px 4px rgba(15,23,42,0.06);padding:32px;margin-bottom:28px;display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap}
        .patient-main{display:flex;align-items:center;gap:22px}
        .ph-avatar{width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg,#dbeafe,#93c5fd);display:flex;align-items:center;justify-content:center;color:#1d4ed8;font-size:26px;font-weight:800;flex-shrink:0}
        .ph-name{font-family:'DM Serif Display',serif;font-size:26px;color:#0f172a;margin-bottom:6px}
        .ph-meta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:6px}
        .ph-pill{background:#f1f5ff;color:#475569;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500}
        .ph-contacts{display:flex;flex-direction:column;gap:8px;font-size:13px;color:#64748b}
        .ph-contact{display:flex;align-items:center;gap:8px}
        .ph-wa{color:#16a34a;font-weight:600;text-decoration:none}
        .ph-wa:hover{text-decoration:underline}
        .skeleton-hero{background:white;border-radius:20px;padding:32px;margin-bottom:28px;height:140px;background-image:linear-gradient(90deg,#f8faff 25%,#f1f5ff 50%,#f8faff 75%);background-size:200% 100%;animation:shimmer 1.4s infinite}
        .tabs-row{display:flex;gap:2px;margin-bottom:0;flex-wrap:wrap}
        .tab-pill{display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px 12px 0 0;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#64748b;background:rgba(255,255,255,0.6);transition:all 0.2s}
        .tab-pill.active{background:white;color:#0f172a;font-weight:700;box-shadow:0 -1px 8px rgba(15,23,42,0.06)}
        .tab-pill:not(.active):hover{background:rgba(255,255,255,0.8);color:#334155}
        .tab-content{background:white;border-radius:0 16px 16px 16px;border:1px solid rgba(15,23,42,0.06);box-shadow:0 1px 4px rgba(15,23,42,0.06);padding:36px}
        .section-title{font-family:'DM Serif Display',serif;font-size:19px;color:#0f172a;margin-bottom:18px}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .form-group{display:flex;flex-direction:column;gap:7px}
        .form-label{font-size:13px;font-weight:600;color:#374151}
        .form-select,.form-input{padding:11px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;color:#0f172a;outline:none;background:white;transition:border-color .2s,box-shadow .2s;appearance:none}
        .form-select:focus,.form-input:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
        .form-textarea{padding:12px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;color:#0f172a;outline:none;background:white;resize:vertical;min-height:110px;transition:border-color .2s,box-shadow .2s;width:100%}
        .form-textarea:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
        .btn-group{display:flex;gap:12px;margin-top:22px}
        .btn-save{padding:12px 28px;background:#0f172a;color:white;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s}
        .btn-save:hover{background:#1e293b;transform:translateY(-1px)}
        .btn-save:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .btn-outline{padding:12px 28px;background:white;color:#475569;border:1.5px solid #e2e8f0;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
        .btn-outline:hover{background:#f8faff;color:#0f172a}
        .error-bar{background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:14px 18px;font-size:14px;color:#991b1b;margin-bottom:20px}
        @media(max-width:700px){.pd-wrap{padding:20px 14px}.form-grid{grid-template-columns:1fr}.ph-name{font-size:20px}}
      `}</style>

      <div className="pd-wrap">
        <button className="back-btn" onClick={() => navigate('/doctor/patients')}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Patients
        </button>

        {error && <div className="error-bar">{error}</div>}

        {loading ? <div className="skeleton-hero" /> : patient ? (
          <div className="patient-hero">
            <div className="patient-main">
              <div className="ph-avatar">{patientInitials}</div>
              <div>
                <div className="ph-name">{patient.full_name}</div>
                <div className="ph-meta">
                  {patient.gender        && <span className="ph-pill">{patient.gender}</span>}
                  {patient.date_of_birth && <span className="ph-pill">DOB: {patient.date_of_birth}</span>}
                  {patient.mental_health_mode && <span className="ph-pill" style={{ background: '#ede9fe', color: '#5b21b6' }}>🧠 Mental Health Mode</span>}
                </div>
              </div>
            </div>
            <div className="ph-contacts">
              {patient.email        && <div className="ph-contact"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>{patient.email}</div>}
              {patient.phone_number && <div className="ph-contact"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>{patient.phone_number}</div>}
              {patient.whatsapp_link && <div className="ph-contact"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><a href={patient.whatsapp_link} target="_blank" rel="noreferrer" className="ph-wa">WhatsApp</a></div>}
            </div>
          </div>
        ) : (
          <div className="patient-hero"><p style={{ color: '#94a3b8', fontSize: 14 }}>Patient not found or not assigned to you.</p></div>
        )}

        <div className="tabs-row">
          {tabs.map(t => (
            <button key={t.key} className={`tab-pill ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'diagnosis' && (
            <>
              <h2 className="section-title">Final Diagnosis</h2>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Cancer Stage</label><select className="form-select" value={diagnosis.stage} onChange={e => setDiagnosis({...diagnosis,stage:e.target.value})}><option value="">Select stage</option><option value="stage_0">Stage 0</option><option value="stage_1">Stage I</option><option value="stage_2">Stage II</option><option value="stage_3">Stage III</option><option value="stage_4">Stage IV</option></select></div>
                <div className="form-group"><label className="form-label">Tumor Size (cm)</label><input className="form-input" type="text" placeholder="e.g. 2.5" value={diagnosis.tumorSize} onChange={e => setDiagnosis({...diagnosis,tumorSize:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Lymph Node Involvement</label><select className="form-select" value={diagnosis.lymphNode} onChange={e => setDiagnosis({...diagnosis,lymphNode:e.target.value})}><option value="">Select status</option><option value="negative">Negative</option><option value="micrometastasis">Micrometastasis</option><option value="macrometastasis">Macrometastasis</option></select></div>
                <div className="form-group"><label className="form-label">Metastasis</label><select className="form-select" value={diagnosis.metastasis} onChange={e => setDiagnosis({...diagnosis,metastasis:e.target.value})}><option value="">Select status</option><option value="no">No</option><option value="yes">Yes</option></select></div>
              </div>
              <div className="form-group" style={{ marginTop: 18 }}><label className="form-label">Notes</label><textarea className="form-textarea" placeholder="Additional diagnosis notes…" value={diagnosis.notes} onChange={e => setDiagnosis({...diagnosis,notes:e.target.value})} /></div>
              <div className="btn-group">
                <button className="btn-save" onClick={handleSaveDiagnosis} disabled={saving}>{saving ? 'Saving…' : 'Save Diagnosis'}</button>
                <button className="btn-outline" onClick={() => setDiagnosis({stage:'',tumorSize:'',lymphNode:'',metastasis:'',notes:''})}>Clear</button>
              </div>
            </>
          )}
          {activeTab === 'history'   && <HistoryTab        patientId={id} patientName={patient?.full_name} />}
          {activeTab === 'notes'     && <ClinicalNotes     patientId={id} patientName={patient?.full_name} />}
          {activeTab === 'care_plan' && <DoctorCarePlanTab patientId={id} patientName={patient?.full_name} />}
          {activeTab === 'staging'   && <StagingTab        patientId={id} patientName={patient?.full_name} />}
          {activeTab === 'mri'       && <MriTab            patientId={id} patientName={patient?.full_name} />}
        </div>
      </div>
    </>
  );
};

export default PatientDetails;