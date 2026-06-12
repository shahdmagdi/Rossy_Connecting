import React, { useState, useEffect, useCallback } from 'react';
import stagingService from '../../services/stagingService';

// ══════════════════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════════════════

const STAGE_COLORS = {
  IA:      { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
  IB:      { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
  IIA:     { bg: '#fef9c3', color: '#854d0e', border: '#fde68a' },
  IIB:     { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  IIIA:    { bg: '#ffedd5', color: '#9a3412', border: '#fdba74' },
  IIIB:    { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  IIIC:    { bg: '#fce7f3', color: '#9d174d', border: '#f9a8d4' },
  IV:      { bg: '#ede9fe', color: '#4c1d95', border: '#c4b5fd' },
  Unknown: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
};

const SUBTYPE_META = {
  'HR+/HER2-':       { bg: '#dbeafe', color: '#1e40af', label: 'HR+/HER2−' },
  'HR+/HER2+':       { bg: '#ede9fe', color: '#5b21b6', label: 'HR+/HER2+' },
  'HR-/HER2+':       { bg: '#fce7f3', color: '#9d174d', label: 'HR−/HER2+' },
  'Triple_Negative': { bg: '#fee2e2', color: '#991b1b', label: 'Triple Negative' },
};

const TNM_DESCRIPTIONS = {
  T: { T0: 'No primary tumour', T1: '≤ 2 cm', T2: '> 2–5 cm', T3: '> 5 cm', T4: 'Chest wall/skin involvement' },
  N: { N0: 'No regional nodes', N1mi: 'Micrometastasis (≤ 2mm)', N1: 'Movable ipsilateral nodes', N2: 'Fixed ipsilateral nodes', N3: 'Internal mammary / supraclavicular' },
  M: { M0: 'No distant metastasis', M1: 'Distant metastasis present' },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// Extracts the base stage for color lookup (strips * / ?)
const baseStage = (s) => s?.replace(/[*?]/, '') || 'Unknown';

// ══════════════════════════════════════════════════════════
//  STAGING RESULT BADGE
// ══════════════════════════════════════════════════════════

const StageBadge = ({ stage, size = 'md' }) => {
  if (!stage) return null;
  const key    = baseStage(stage);
  const colors = STAGE_COLORS[key] || STAGE_COLORS.Unknown;
  const isFlag = stage.endsWith('*') || stage.endsWith('?');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      backgroundColor: colors.bg, color: colors.color,
      border: `1.5px solid ${colors.border}`,
      padding: size === 'lg' ? '5px 14px' : '3px 10px',
      borderRadius: 99,
      fontSize: size === 'lg' ? 15 : 12,
      fontWeight: 700, letterSpacing: '0.02em',
    }}>
      {stage}
      {isFlag && (
        <span title={stage.endsWith('*') ? 'Prognostic stage incomplete' : 'Unassignable — gap in AJCC table'}
              style={{ fontSize: 10, opacity: 0.7 }}>
          {stage.endsWith('*') ? '⚠' : '?'}
        </span>
      )}
    </span>
  );
};

// ══════════════════════════════════════════════════════════
//  TNM CHIP
// ══════════════════════════════════════════════════════════

const TnmChip = ({ label, value }) => {
  const desc = TNM_DESCRIPTIONS[label]?.[value];
  return (
    <div title={desc || ''} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      backgroundColor: '#f8faff', border: '1.5px solid #e2e8f0',
      borderRadius: 10, padding: '10px 16px', gap: 3, cursor: desc ? 'help' : 'default',
    }}>
      <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>{value || '—'}</span>
      {desc && <span style={{ fontSize: 10, color: '#64748b', textAlign: 'center', lineHeight: 1.3 }}>{desc}</span>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
//  STAGING RECORD CARD  (collapsed / expanded)
// ══════════════════════════════════════════════════════════

const StagingCard = ({ record, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const s       = record.staging || {};
  const pStage  = s.prognostic_stage || s.anatomic_stage;
  const colors  = STAGE_COLORS[baseStage(pStage)] || STAGE_COLORS.Unknown;
  const subMeta = SUBTYPE_META[s.molecular_subtype];

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this staging record? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await onDelete(record.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 14,
      border: `1.5px solid ${expanded ? colors.border : '#e8eaf0'}`,
      boxShadow: expanded ? `0 4px 20px ${colors.border}88` : '0 1px 4px rgba(15,23,42,0.06)',
      overflow: 'hidden', marginBottom: 12,
      transition: 'box-shadow 0.25s, border-color 0.25s',
    }}>

      {/* ── Header ── */}
      <div
        onClick={() => setExpanded(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px', cursor: 'pointer', userSelect: 'none',
        }}
      >
        {/* Stage icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 12, flexShrink: 0,
          backgroundColor: colors.bg, border: `1.5px solid ${colors.border}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 1,
        }}>
          <span style={{ fontSize: 9, color: colors.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stage</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: colors.color, lineHeight: 1 }}>{pStage || '?'}</span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            {/* TNM pills */}
            {[s.cT_stage, s.cN_stage, s.cM_stage].filter(Boolean).map(v => (
              <span key={v} style={{
                fontSize: 11, fontWeight: 700, color: '#475569',
                backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: 99,
              }}>{v}</span>
            ))}
            {subMeta && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                backgroundColor: subMeta.bg, color: subMeta.color,
                padding: '2px 8px', borderRadius: 99,
              }}>{subMeta.label}</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            {formatDate(record.created_at)}
            {record.updated_at && <span style={{ marginLeft: 8, color: '#cbd5e1' }}>(updated {formatDate(record.updated_at)})</span>}
          </div>
        </div>

        {/* Result label (truncated) */}
        <div style={{
          flexShrink: 0, maxWidth: 220, fontSize: 12, color: '#64748b',
          textAlign: 'right', lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }} title={s.result_label}>
          {s.result_label}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onEdit(record)}
            style={{
              padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
              background: '#f8faff', color: '#475569', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#2563eb'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '6px 12px', borderRadius: 8,
              border: '1.5px solid #fecaca', background: '#fff1f1',
              color: '#dc2626', fontSize: 12, fontWeight: 600,
              cursor: deleting ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
              opacity: deleting ? 0.6 : 1,
            }}
          >
            {deleting ? '…' : '🗑'}
          </button>
        </div>

        <span style={{
          fontSize: 16, color: '#94a3b8', flexShrink: 0,
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }}>▾</span>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div style={{
          borderTop: '1px solid #f1f5f9', padding: '22px 22px 24px',
          backgroundColor: '#fafbff', animation: 'stageExpand 0.2s ease',
        }}>
          <style>{`@keyframes stageExpand { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`}</style>

          {/* Result banner */}
          <div style={{
            backgroundColor: colors.bg, border: `1.5px solid ${colors.border}`,
            borderRadius: 12, padding: '14px 18px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: 11, color: colors.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Result
              </div>
              <div style={{ fontSize: 14, color: colors.color, fontWeight: 600, lineHeight: 1.5 }}>
                {s.result_label}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {s.anatomic_stage && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Anatomic</div>
                  <StageBadge stage={s.anatomic_stage} size="lg" />
                </div>
              )}
              {s.prognostic_stage && s.prognostic_stage !== s.anatomic_stage && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Prognostic</div>
                  <StageBadge stage={s.prognostic_stage} size="lg" />
                </div>
              )}
              {subMeta && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Subtype</div>
                  <span style={{
                    display: 'inline-block', fontSize: 13, fontWeight: 700,
                    backgroundColor: subMeta.bg, color: subMeta.color,
                    border: '1.5px solid currentColor', opacity: 0.8,
                    padding: '4px 12px', borderRadius: 99, marginTop: 3,
                  }}>{subMeta.label}</span>
                </div>
              )}
            </div>
          </div>

          {/* TNM grid */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              TNM Classification
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <TnmChip label="T" value={s.cT_stage} />
              <TnmChip label="N" value={s.cN_stage} />
              <TnmChip label="M" value={s.cM_stage} />
            </div>
          </div>

          {/* Timestamps */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Created: <strong style={{ color: '#475569' }}>{formatDate(record.created_at)}</strong>
            </div>
            {record.updated_at && (
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Updated: <strong style={{ color: '#475569' }}>{formatDate(record.updated_at)}</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
//  STAGING FORM  (create + edit)
// ══════════════════════════════════════════════════════════

const EMPTY_FORM = {
  no_primary_tumour: false,
  tumor_size:        '',
  lymphadenopathy:   '',
  metastatic:        '',
  skin_nipple:       '',
  pec_chest:         '',
  er:                '',
  pr:                '',
  her2:              '',
  histologic_grade:  '',
};

const StagingForm = ({ patientId, editRecord, onSuccess, onCancel }) => {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  // Pre-fill when editing
  useEffect(() => {
    if (!editRecord) { setForm(EMPTY_FORM); return; }
    // editRecord comes from the list API — inputs aren't returned directly
    // so we only pre-fill what we have from the staging object
    // The backend supports partial update, so blank fields won't overwrite
    setForm(EMPTY_FORM);
  }, [editRecord]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const buildPayload = () => {
    const p = { no_primary_tumour: form.no_primary_tumour };
    if (!form.no_primary_tumour && form.tumor_size !== '')
      p.tumor_size = parseFloat(form.tumor_size);
    if (form.lymphadenopathy !== '')  p.lymphadenopathy  = parseFloat(form.lymphadenopathy);
    if (form.metastatic      !== '')  p.metastatic       = parseInt(form.metastatic);
    if (form.skin_nipple     !== '')  p.skin_nipple      = parseInt(form.skin_nipple);
    if (form.pec_chest       !== '')  p.pec_chest        = parseInt(form.pec_chest);
    if (form.er              !== '')  p.er               = parseInt(form.er);
    if (form.pr              !== '')  p.pr               = parseInt(form.pr);
    if (form.her2            !== '')  p.her2             = parseInt(form.her2);
    if (form.histologic_grade !== '') p.histologic_grade = parseInt(form.histologic_grade);
    return p;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.no_primary_tumour && form.tumor_size === '') {
      setError('Tumor size is required unless "No primary tumour" is checked.');
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editRecord) {
        await stagingService.updateStaging(editRecord.id, payload);
      } else {
        await stagingService.createStaging(patientId, payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, hint, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{label}</label>
      {hint && <span style={{ fontSize: 11, color: '#94a3b8', marginTop: -3 }}>{hint}</span>}
      {children}
    </div>
  );

  const selectStyle = {
    padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9,
    fontFamily: 'inherit', fontSize: 13, color: '#0f172a',
    background: 'white', outline: 'none', appearance: 'none',
    transition: 'border-color .2s, box-shadow .2s',
    cursor: 'pointer',
  };
  const inputStyle = {
    ...selectStyle,
    cursor: 'text',
  };

  return (
    <div style={{
      backgroundColor: '#f8faff', borderRadius: 14,
      border: '1.5px solid #e2e8f0', padding: '24px',
      marginBottom: 24, animation: 'stageExpand 0.2s ease',
    }}>
      <style>{`@keyframes stageExpand { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: '#0f172a', margin: 0 }}>
          {editRecord ? '✏️ Edit Staging Record' : '➕ New Staging Record'}
        </h3>
        <button onClick={onCancel} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 18, color: '#94a3b8', lineHeight: 1, padding: '2px 6px',
        }}>✕</button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2', border: '1px solid #fca5a5',
          borderRadius: 10, padding: '10px 14px', fontSize: 13,
          color: '#991b1b', marginBottom: 16,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Section 1: Tumour ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          🎯 Tumour (T)
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* No primary tumour toggle */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', userSelect: 'none',
              backgroundColor: form.no_primary_tumour ? '#dcfce7' : '#f1f5f9',
              border: `1.5px solid ${form.no_primary_tumour ? '#bbf7d0' : '#e2e8f0'}`,
              borderRadius: 10, padding: '10px 14px',
              transition: 'all 0.2s',
            }}>
              <input
                type="checkbox"
                checked={form.no_primary_tumour}
                onChange={e => set('no_primary_tumour', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#16a34a', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.no_primary_tumour ? '#166534' : '#374151' }}>
                  No Primary Tumour (T0)
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  Check when primary tumour cannot be identified
                </div>
              </div>
            </label>
          </div>

          {!form.no_primary_tumour && (
            <Field label="Tumor Size (cm)" hint="Required — e.g. 2.5">
              <input
                type="number" step="0.1" min="0.1"
                placeholder="e.g. 2.5"
                value={form.tumor_size}
                onChange={e => set('tumor_size', e.target.value)}
                style={inputStyle}
              />
            </Field>
          )}

          <Field label="Skin / Nipple Involvement" hint="0 = No · 1 = Yes">
            <select style={selectStyle} value={form.skin_nipple} onChange={e => set('skin_nipple', e.target.value)}>
              <option value="">Not specified</option>
              <option value="0">0 — No</option>
              <option value="1">1 — Yes</option>
            </select>
          </Field>

          <Field label="Pec / Chest Wall Involvement" hint="0 = No · 1 = Yes">
            <select style={selectStyle} value={form.pec_chest} onChange={e => set('pec_chest', e.target.value)}>
              <option value="">Not specified</option>
              <option value="0">0 — No</option>
              <option value="1">1 — Yes</option>
            </select>
          </Field>
        </div>
      </div>

      {/* ── Section 2: Nodes & Metastasis ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          🔗 Nodes (N) & Metastasis (M)
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Lymphadenopathy" hint="0 = N0 · 0.5 = N1mi · 1 = N1 · 2 = N2 · 3 = N3">
            <select style={selectStyle} value={form.lymphadenopathy} onChange={e => set('lymphadenopathy', e.target.value)}>
              <option value="">Not specified (N0)</option>
              <option value="0">0 — N0 (No nodes)</option>
              <option value="0.5">0.5 — N1mi (Micrometastasis)</option>
              <option value="1">1 — N1 (Movable ipsilateral)</option>
              <option value="2">2 — N2 (Fixed ipsilateral)</option>
              <option value="3">3 — N3 (Supraclavicular / IM)</option>
            </select>
          </Field>

          <Field label="Distant Metastasis" hint="0 = M0 · 1 = M1">
            <select style={selectStyle} value={form.metastatic} onChange={e => set('metastatic', e.target.value)}>
              <option value="">Not specified (M0)</option>
              <option value="0">0 — M0 (No metastasis)</option>
              <option value="1">1 — M1 (Distant metastasis)</option>
            </select>
          </Field>
        </div>
      </div>

      {/* ── Section 3: Biomarkers ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          🧬 Biomarkers (for prognostic staging)
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, backgroundColor: '#f8faff', borderRadius: 8, padding: '8px 12px' }}>
          ℹ️ Optional — leaving blank gives anatomic-only staging (marked with *)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <Field label="ER" hint="Estrogen receptor">
            <select style={selectStyle} value={form.er} onChange={e => set('er', e.target.value)}>
              <option value="">—</option>
              <option value="0">0 — Negative</option>
              <option value="1">1 — Positive</option>
            </select>
          </Field>
          <Field label="PR" hint="Progesterone receptor">
            <select style={selectStyle} value={form.pr} onChange={e => set('pr', e.target.value)}>
              <option value="">—</option>
              <option value="0">0 — Negative</option>
              <option value="1">1 — Positive</option>
            </select>
          </Field>
          <Field label="HER2" hint="HER2/neu status">
            <select style={selectStyle} value={form.her2} onChange={e => set('her2', e.target.value)}>
              <option value="">—</option>
              <option value="0">0 — Negative</option>
              <option value="1">1 — Positive</option>
            </select>
          </Field>
          <Field label="Histologic Grade" hint="Nottingham grade">
            <select style={selectStyle} value={form.histologic_grade} onChange={e => set('histologic_grade', e.target.value)}>
              <option value="">—</option>
              <option value="1">1 — Well differentiated</option>
              <option value="2">2 — Moderately differentiated</option>
              <option value="3">3 — Poorly differentiated</option>
            </select>
          </Field>
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            padding: '12px 28px', borderRadius: 10,
            background: saving ? '#e2e8f0' : '#0f172a',
            color: saving ? '#94a3b8' : 'white',
            border: 'none', fontSize: 14, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {saving
            ? (editRecord ? 'Updating…' : 'Running algorithm…')
            : (editRecord ? '✓ Update & Re-run' : '▶ Run AJCC Staging')}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '12px 20px', borderRadius: 10,
            background: 'white', color: '#475569',
            border: '1.5px solid #e2e8f0', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
//  STAGING TAB  (main export)
// ══════════════════════════════════════════════════════════

const StagingTab = ({ patientId, patientName }) => {
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await stagingService.getPatientStagings(patientId);
      setRecords(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load staging records.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (stagingId) => {
    await stagingService.deleteStaging(stagingId);
    setRecords(r => r.filter(x => x.id !== stagingId));
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuccess = async () => {
    setShowForm(false);
    setEditRecord(null);
    await load();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditRecord(null);
  };

  // ── Stage timeline summary ─────────────────────────────
  const latestPrognostic = records[0]?.staging?.prognostic_stage || records[0]?.staging?.anatomic_stage;

  return (
    <div>
      {/* ── Tab header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 24,
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#0f172a', margin: 0 }}>
            AJCC Staging
          </h2>
          {patientName && (
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              Staging records for <strong style={{ color: '#0f172a' }}>{patientName}</strong>
              {records.length > 0 && (
                <> · <span style={{ color: '#94a3b8' }}>{records.length} record{records.length !== 1 ? 's' : ''}</span></>
              )}
            </p>
          )}
        </div>

        {/* Current stage summary pill */}
        {latestPrognostic && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Latest:</span>
            <StageBadge stage={latestPrognostic} size="lg" />
          </div>
        )}
      </div>

      {/* ── Form (create / edit) ── */}
      {showForm && (
        <StagingForm
          patientId={patientId}
          editRecord={editRecord}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {/* ── Add button ── */}
      {!showForm && (
        <button
          onClick={() => { setEditRecord(null); setShowForm(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 20, padding: '11px 20px', borderRadius: 10,
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            color: 'white', border: 'none', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(15,23,42,0.2)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Staging
        </button>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12,
          padding: '12px 16px', color: '#991b1b', fontSize: 14, marginBottom: 16,
        }}>
          ⚠️ {error}
          <button
            onClick={load}
            style={{
              marginLeft: 12, fontSize: 12, fontWeight: 600,
              color: '#991b1b', background: 'none', border: 'none',
              cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              height: 80, borderRadius: 14,
              backgroundImage: 'linear-gradient(90deg,#f8faff 25%,#f1f5ff 50%,#f8faff 75%)',
              backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
            }} />
          ))}
          <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && records.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '56px 20px', color: '#94a3b8' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            backgroundColor: '#f8faff', border: '1.5px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28,
          }}>🔬</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>No staging records yet</p>
          <p style={{ fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
            Run the AJCC 8th Edition staging algorithm<br />to classify this patient's cancer stage.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '11px 24px', borderRadius: 10,
              background: '#0f172a', color: 'white',
              border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Run First Staging →
          </button>
        </div>
      )}

      {/* ── Records list ── */}
      {!loading && !error && records.length > 0 && (
        <>
          {/* Stage progression timeline (if multiple records) */}
          {records.length > 1 && (
            <div style={{
              backgroundColor: '#f8faff', borderRadius: 12, padding: '14px 18px',
              marginBottom: 20, border: '1px solid #e2e8f0',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Stage Progression ({records.length} records)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {[...records].reverse().map((r, i) => {
                  const stage = r.staging?.prognostic_stage || r.staging?.anatomic_stage;
                  return (
                    <React.Fragment key={r.id}>
                      {i > 0 && <span style={{ color: '#94a3b8', fontSize: 14 }}>→</span>}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <StageBadge stage={stage} />
                        <span style={{ fontSize: 9, color: '#cbd5e1' }}>
                          {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {records.map(r => (
            <StagingCard
              key={r.id}
              record={r}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default StagingTab;