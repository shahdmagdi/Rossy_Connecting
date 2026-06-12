import React, { useState, useEffect, useRef } from 'react';
import mriService from '../../services/mriService';

// ── Helpers ───────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const STAGE_META = {
  T1mi: { label: 'T1mi', desc: '≤ 0.1 cm', bg: '#DCFCE7', color: '#166534', bar: '#22c55e' },
  T1a:  { label: 'T1a',  desc: '0.1–0.5 cm', bg: '#D1FAE5', color: '#065F46', bar: '#10b981' },
  T1b:  { label: 'T1b',  desc: '0.5–1.0 cm', bg: '#FEF9C3', color: '#854D0E', bar: '#eab308' },
  T1c:  { label: 'T1c',  desc: '1.0–2.0 cm', bg: '#FEF3C7', color: '#92400E', bar: '#f59e0b' },
  T2:   { label: 'T2',   desc: '2.0–5.0 cm', bg: '#FFEDD5', color: '#9A3412', bar: '#f97316' },
  T3:   { label: 'T3',   desc: '> 5.0 cm',   bg: '#FEE2E2', color: '#991B1B', bar: '#ef4444' },
};

const TumorStageBadge = ({ stage }) => {
  if (!stage) return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      backgroundColor: '#DCFCE7', color: '#166534',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
    }}>✅ No Tumor Detected</span>
  );
  const meta = STAGE_META[stage] || { label: stage, bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      backgroundColor: meta.bg, color: meta.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
    }}>
      🔬 Stage {meta.label} {meta.desc && <span style={{ fontWeight: 400, opacity: 0.8 }}>({meta.desc})</span>}
    </span>
  );
};

// ── Metric Row ────────────────────────────────────────────

const MetricRow = ({ label, value, unit, barValue, barColor }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
        {value != null ? `${value}${unit ? ` ${unit}` : ''}` : '—'}
      </span>
    </div>
    {barValue != null && (
      <div style={{ height: 5, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(barValue * 100, 100)}%`,
          backgroundColor: barColor || '#6b7280',
          borderRadius: 99,
          transition: 'width 0.7s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
    )}
  </div>
);

// ── Single MRI Scan Card ──────────────────────────────────

const MriScanCard = ({ scan, onDelete }) => {
  const [expanded, setExpanded]     = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [confirmDelete, setConfirm] = useState(false);

  const stage    = scan.results?.t_stage;
  const detected = scan.results?.tumor_detected;
  const stageMeta = STAGE_META[stage] || {};

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirm(true); return; }
    setDeleting(true);
    try {
      await mriService.deleteMriScan(scan.scan_id);
      onDelete(scan.scan_id);
    } catch (err) {
      alert(err.message);
      setDeleting(false);
      setConfirm(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 14,
      border: `1.5px solid ${expanded ? '#c7d2fe' : '#e8eaf0'}`,
      boxShadow: expanded
        ? '0 4px 20px rgba(99,102,241,0.10)'
        : '0 1px 4px rgba(15,23,42,0.06)',
      overflow: 'hidden',
      marginBottom: 12,
      transition: 'box-shadow 0.25s, border-color 0.25s',
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 18px', cursor: 'pointer', userSelect: 'none',
      }} onClick={() => setExpanded(p => !p)}>

        {/* Icon */}
        <div style={{
          width: 54, height: 54, borderRadius: 11, flexShrink: 0,
          background: detected
            ? 'linear-gradient(135deg, #fee2e2, #fecaca)'
            : 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          border: '1px solid #e8eaf0',
        }}>
          🧠
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#6366f1',
              backgroundColor: '#e0e7ff', padding: '2px 10px',
              borderRadius: 99, letterSpacing: '0.04em',
            }}>
              🧠 MRI STAGING
            </span>
            <TumorStageBadge stage={stage} />
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{formatDate(scan.created_at)}</div>
        </div>

        {/* Size pill */}
        {scan.results?.size_cm != null && (
          <div style={{
            flexShrink: 0,
            backgroundColor: stageMeta.bg || '#f3f4f6',
            color: stageMeta.color || '#374151',
            fontSize: 13, fontWeight: 700,
            padding: '4px 12px', borderRadius: 99,
          }}>
            {scan.results.size_cm} cm
          </div>
        )}

        <span style={{
          fontSize: 16, color: '#94a3b8', flexShrink: 0,
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }}>▾</span>
      </div>

      {/* ── Expanded Detail ── */}
      {expanded && (
        <div style={{
          borderTop: '1px solid #f1f5f9',
          padding: '22px 24px 24px',
          backgroundColor: '#fafbff',
        }}>

          {/* Results grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>

            {/* Left: Staging results */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Staging Results
              </div>

              <MetricRow
                label="Tumor Size"
                value={scan.results?.size_cm}
                unit="cm"
                barValue={scan.results?.size_cm ? scan.results.size_cm / 15 : null}
                barColor={stageMeta.bar}
              />
              <MetricRow
                label="Tumor Volume"
                value={scan.results?.volume_cc}
                unit="cc"
                barValue={scan.results?.volume_cc ? scan.results.volume_cc / 100 : null}
                barColor={stageMeta.bar}
              />
              <MetricRow
                label="Segmentation Consistency"
                value={scan.results?.segmentation_consistency != null
                  ? (scan.results.segmentation_consistency * 100).toFixed(1)
                  : null}
                unit="%"
                barValue={scan.results?.segmentation_consistency}
                barColor="#6366f1"
              />
              <MetricRow
                label="Uncertainty Mean"
                value={scan.results?.uncertainty_mean != null
                  ? (scan.results.uncertainty_mean * 100).toFixed(1)
                  : null}
                unit="%"
                barValue={scan.results?.uncertainty_mean}
                barColor="#f59e0b"
              />
            </div>

            {/* Right: Files + model info */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                NIfTI Files
              </div>

              {[
                { label: 'Acquisition 0', url: scan.files?.acq0_url, required: true },
                { label: 'Acquisition 1', url: scan.files?.acq1_url, required: false },
                { label: 'Acquisition 2', url: scan.files?.acq2_url, required: true },
              ].map(({ label, url, required }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', marginBottom: 6,
                  backgroundColor: url ? '#f0fdf4' : '#f8faff',
                  borderRadius: 8,
                  border: `1px solid ${url ? '#bbf7d0' : '#e8eaf0'}`,
                }}>
                  <span style={{ fontSize: 12, color: url ? '#166534' : '#94a3b8', fontWeight: 500 }}>
                    {url ? '✓' : '—'} {label}{required && !url ? ' (missing)' : ''}
                  </span>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontSize: 11, color: '#2563eb', fontWeight: 600,
                        textDecoration: 'none', padding: '2px 8px',
                        backgroundColor: '#eff6ff', borderRadius: 6,
                      }}
                    >
                      Download
                    </a>
                  )}
                </div>
              ))}

              <div style={{ marginTop: 12, fontSize: 10, color: '#cbd5e1', letterSpacing: '0.04em' }}>
                Model: {scan.model_version}
              </div>
            </div>
          </div>

          {/* Tumor detected alert */}
          {detected && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10, padding: '12px 14px', marginBottom: 14,
            }}>
              <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                ⚠️ Tumor Detected
              </div>
              <p style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.6, margin: 0 }}>
                MRI staging indicates a <strong>Stage {stage}</strong> tumor
                {scan.results?.size_cm && <> measuring <strong>{scan.results.size_cm} cm</strong></>}.
                Please review findings and consult with the patient accordingly.
              </p>
            </div>
          )}

          {/* Delete */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {confirmDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirm(false); }}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                  background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              disabled={deleting}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: confirmDelete ? '#ef4444' : '#fee2e2',
                color: confirmDelete ? '#fff' : '#991b1b',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
                opacity: deleting ? 0.6 : 1,
              }}
            >
              {deleting ? 'Deleting…' : confirmDelete ? 'Confirm Delete' : '🗑 Delete Scan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
//  MRI UPLOAD FORM
// ══════════════════════════════════════════════════════════

const MriUploadForm = ({ patientId, patientName, onSuccess }) => {
  const [acq0, setAcq0]       = useState(null);
  const [acq1, setAcq1]       = useState(null);
  const [acq2, setAcq2]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState(null);
  const [expanded, setExpanded] = useState(false);

  const ref0 = useRef(); const ref1 = useRef(); const ref2 = useRef();

  const handleUpload = async () => {
    if (!acq0 || !acq2) {
      setError('Acquisition 0 and Acquisition 2 files are required.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const res = await mriService.uploadMri(patientId, acq0, acq2, acq1 || null);
      onSuccess(res.scan);
      setAcq0(null); setAcq1(null); setAcq2(null);
      setExpanded(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const FileDropZone = ({ label, file, setFile, inputRef, required }) => (
    <div
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${file ? '#6366f1' : '#e2e8f0'}`,
        borderRadius: 12,
        padding: '18px 16px',
        cursor: 'pointer',
        backgroundColor: file ? '#f5f3ff' : '#fafbff',
        transition: 'all 0.2s',
        textAlign: 'center',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".nii,.nii.gz"
        style={{ display: 'none' }}
        onChange={e => setFile(e.target.files[0] || null)}
      />
      <div style={{ fontSize: 22, marginBottom: 6 }}>{file ? '✅' : '📁'}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: file ? '#6366f1' : '#475569', marginBottom: 3 }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </div>
      {file ? (
        <div style={{ fontSize: 11, color: '#6366f1', wordBreak: 'break-all' }}>{file.name}</div>
      ) : (
        <div style={{ fontSize: 11, color: '#94a3b8' }}>Click to upload .nii or .nii.gz</div>
      )}
    </div>
  );

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 14,
      border: '1.5px solid #c7d2fe',
      overflow: 'hidden',
      marginBottom: 24,
    }}>
      {/* Header toggle */}
      <div
        onClick={() => setExpanded(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 20px', cursor: 'pointer',
          background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>🧠</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Upload New MRI Scan</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>NIfTI format (.nii / .nii.gz) — acq0 and acq2 required</div>
        </div>
        <span style={{
          fontSize: 16, color: '#94a3b8',
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }}>▾</span>
      </div>

      {/* Upload form */}
      {expanded && (
        <div style={{ padding: '20px 20px 24px', borderTop: '1px solid #e0e7ff' }}>
          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fca5a5',
              borderRadius: 10, padding: '10px 14px',
              fontSize: 13, color: '#991b1b', marginBottom: 16,
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <FileDropZone label="Acquisition 0" file={acq0} setFile={setAcq0} inputRef={ref0} required />
            <FileDropZone label="Acquisition 1" file={acq1} setFile={setAcq1} inputRef={ref1} required={false} />
            <FileDropZone label="Acquisition 2" file={acq2} setFile={setAcq2} inputRef={ref2} required />
          </div>

          {uploading && (
            <div style={{
              backgroundColor: '#eff6ff', borderRadius: 10, padding: '12px 16px',
              fontSize: 13, color: '#1d4ed8', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: '2px solid #93c5fd', borderTopColor: '#2563eb',
                animation: 'mriSpin 0.8s linear infinite', flexShrink: 0,
              }} />
              <style>{`@keyframes mriSpin { to { transform: rotate(360deg); } }`}</style>
              MRI analysis in progress — this may take a few minutes…
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleUpload}
              disabled={uploading || !acq0 || !acq2}
              style={{
                padding: '11px 24px', borderRadius: 10, border: 'none',
                background: uploading || !acq0 || !acq2
                  ? '#e2e8f0'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: uploading || !acq0 || !acq2 ? '#94a3b8' : '#fff',
                fontSize: 14, fontWeight: 700, cursor: uploading || !acq0 || !acq2 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {uploading ? 'Analyzing…' : '🧠 Run MRI Analysis'}
            </button>
            <button
              onClick={() => { setAcq0(null); setAcq1(null); setAcq2(null); setError(null); }}
              disabled={uploading}
              style={{
                padding: '11px 20px', borderRadius: 10,
                border: '1.5px solid #e2e8f0', background: '#fff',
                color: '#475569', fontSize: 14, fontWeight: 600,
                cursor: uploading ? 'not-allowed' : 'pointer',
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
//  MRI TAB — main export
// ══════════════════════════════════════════════════════════

const MriTab = ({ patientId, patientName }) => {
  const [scans, setScans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!patientId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await mriService.getPatientMriScans(patientId);
        setScans(res.scans || []);
      } catch (err) {
        setError(err.message || 'Failed to load MRI scans.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const handleNewScan = (scan) => {
    setScans(prev => [scan, ...prev]);
  };

  const handleDelete = (scanId) => {
    setScans(prev => prev.filter(s => s.scan_id !== scanId));
  };

  const tumorCount    = scans.filter(s => s.results?.tumor_detected).length;
  const noTumorCount  = scans.filter(s => !s.results?.tumor_detected).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#0f172a', margin: 0 }}>
            MRI Staging
          </h2>
          {patientName && (
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              MRI scans for <strong style={{ color: '#0f172a' }}>{patientName}</strong> — visible to doctor only
            </p>
          )}
        </div>

        {/* Summary pills */}
        {!loading && scans.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tumorCount > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, backgroundColor: '#FEE2E2', color: '#991B1B', padding: '3px 10px', borderRadius: 99 }}>
                Tumor Detected: {tumorCount}
              </span>
            )}
            {noTumorCount > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, backgroundColor: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: 99 }}>
                No Tumor: {noTumorCount}
              </span>
            )}
            <span style={{ fontSize: 12, fontWeight: 700, backgroundColor: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: 99 }}>
              Total: {scans.length}
            </span>
          </div>
        )}
      </div>

      {/* Upload form */}
      <MriUploadForm
        patientId={patientId}
        patientName={patientName}
        onSuccess={handleNewScan}
      />

      {/* Error */}
      {error && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12,
          padding: '12px 16px', color: '#991b1b', fontSize: 14, marginBottom: 16,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              height: 82, borderRadius: 14,
              backgroundImage: 'linear-gradient(90deg,#f8faff 25%,#f1f5ff 50%,#f8faff 75%)',
              backgroundSize: '200% 100%',
              animation: 'mriShimmer 1.4s infinite',
            }} />
          ))}
          <style>{`@keyframes mriShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && scans.length === 0 && (
        <div style={{ textAlign: 'center', padding: '56px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🧠</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>No MRI scans yet</p>
          <p style={{ fontSize: 13 }}>Upload NIfTI files above to run MRI staging analysis for this patient.</p>
        </div>
      )}

      {/* Scan cards */}
      {!loading && !error && scans.length > 0 && (
        <div>
          <div style={{
            fontSize: 12, fontWeight: 700, color: '#6366f1',
            textTransform: 'uppercase', letterSpacing: '0.07em',
            marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#e0e7ff' }} />
            🧠 MRI Results
            <div style={{ flex: 1, height: 1, backgroundColor: '#e0e7ff' }} />
          </div>
          {scans.map(scan => (
            <MriScanCard key={scan.scan_id} scan={scan} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MriTab;