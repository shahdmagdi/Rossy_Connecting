import React, { useState, useEffect, useCallback } from 'react';
import detectionService from '../../services/detectionService';

// ── Helpers ───────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PREDICTION_META = {
  normal:    { label: 'Normal',    bg: '#DCFCE7', color: '#166534', icon: '✅' },
  benign:    { label: 'Benign',    bg: '#FEF9C3', color: '#854D0E', icon: '⚠️' },
  malignant: { label: 'Malignant', bg: '#FEE2E2', color: '#991B1B', icon: '🔴' },
};

const PredictionBadge = ({ prediction }) => {
  const meta = PREDICTION_META[prediction] || { label: prediction, bg: '#F3F4F6', color: '#374151', icon: '❓' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      backgroundColor: meta.bg,
      color: meta.color,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
    }}>
      {meta.icon} {meta.label}
    </span>
  );
};

const ConfidenceBar = ({ value, prediction }) => {
  const color = prediction === 'normal' ? '#16A34A' : prediction === 'benign' ? '#CA8A04' : '#DC2626';
  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>Confidence</span>
        <span style={{ fontSize: '12px', fontWeight: '600', color }}>{value?.toFixed(1)}%</span>
      </div>
      <div style={{ height: '6px', backgroundColor: '#F3F4F6', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${value}%`,
          backgroundColor: color,
          borderRadius: '99px',
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
};

const ProbabilityRow = ({ label, value, isTop }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
    <span style={{ fontSize: '12px', color: '#555', textTransform: 'capitalize' }}>{label}</span>
    <span style={{
      fontSize: '12px',
      fontWeight: isTop ? '700' : '400',
      color: isTop ? '#831843' : '#777',
    }}>
      {value?.toFixed(1)}%
    </span>
  </div>
);

// ── Scan Card ─────────────────────────────────────────────

const ScanCard = ({ scan, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this scan?')) return;
    setDeleting(true);
    try {
      await detectionService.deleteScan(scan.scan_id);
      onDelete(scan.scan_id);
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  };

  const probs = scan.probabilities || {};
  const topClass = scan.prediction;

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(131,24,67,0.07)',
      overflow: 'hidden',
      border: '1px solid #F9D5E5',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Header row */}
      <div
        onClick={() => setExpanded(p => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Thumbnail */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '10px',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#FCE7F3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
        }}>
          {!imgError && scan.image_url
            ? <img
                src={scan.image_url}
                alt="scan"
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            : '🩻'
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#831843',
              textTransform: 'capitalize',
              backgroundColor: '#FCE7F3',
              padding: '2px 10px',
              borderRadius: '99px',
            }}>
              {scan.image_type}
            </span>
            {!scan.mental_health_mode && scan.prediction && (
              <PredictionBadge prediction={scan.prediction} />
            )}
            {scan.mental_health_mode && (
              <span style={{
                fontSize: '12px',
                backgroundColor: '#EDE9FE',
                color: '#5B21B6',
                padding: '2px 10px',
                borderRadius: '99px',
              }}>
                🧠 Mental Health Mode
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>{formatDate(scan.created_at)}</div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: 'none',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '5px 10px',
              color: '#DC2626',
              fontSize: '12px',
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.5 : 1,
            }}
          >
            {deleting ? '…' : '🗑 Delete'}
          </button>
          <span style={{ fontSize: '18px', color: '#C084AC', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            ▾
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          borderTop: '1px solid #FCE7F3',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          backgroundColor: '#FFFAFA',
        }}>
          {/* Left — scan image */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#831843', marginBottom: '10px' }}>Scan Image</div>
            {scan.image_url && !imgError ? (
              <img
                src={scan.image_url}
                alt="Full scan"
                onError={() => setImgError(true)}
                style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', maxHeight: '240px' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '160px',
                backgroundColor: '#FCE7F3',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
              }}>🩻</div>
            )}
          </div>

          {/* Right — results */}
          <div>
            {scan.mental_health_mode ? (
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#831843', marginBottom: '10px' }}>Recommendation</div>
                <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>{scan.recommendation}</p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#831843', marginBottom: '10px' }}>Results</div>
                <ConfidenceBar value={scan.confidence} prediction={scan.prediction} />

                {Object.keys(probs).length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Class probabilities</div>
                    <div style={{ backgroundColor: '#fff', border: '1px solid #F9D5E5', borderRadius: '10px', padding: '10px 14px' }}>
                      {Object.entries(probs).map(([cls, val]) => (
                        <ProbabilityRow key={cls} label={cls} value={val} isTop={cls === topClass} />
                      ))}
                    </div>
                  </div>
                )}

                {scan.recommendation && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Recommendation</div>
                    <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', margin: 0 }}>{scan.recommendation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Filter tabs ───────────────────────────────────────────

const FILTERS = [
  { key: null,          label: 'All Scans' },
  { key: 'ultrasound',  label: '🔊 Ultrasound' },
  { key: 'mammogram',   label: '🩻 Mammogram' },
];

// ══════════════════════════════════════════════════════════
//  HISTORY PAGE
// ══════════════════════════════════════════════════════════

const History = () => {
  const [scans, setScans]         = useState([]);
  const [filter, setFilter]       = useState(null);       // null | "ultrasound" | "mammogram"
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await detectionService.getScanHistory(filter);
      // data.history is the flat list sorted newest-first
      setScans(data.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDelete = (deletedId) => {
    setScans(prev => prev.filter(s => s.scan_id !== deletedId));
  };

  // ── Styles ─────────────────────────────────────────────

  const containerStyle = {
    padding: '40px',
    maxWidth: '900px',
    margin: '0 auto',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#831843',
    margin: 0,
  };

  const filterBarStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  };

  const filterBtnStyle = (active) => ({
    padding: '8px 18px',
    borderRadius: '99px',
    border: active ? '2px solid #831843' : '1.5px solid #E5C4D2',
    backgroundColor: active ? '#831843' : '#fff',
    color: active ? '#fff' : '#831843',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  const emptyStyle = {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#9D174D',
  };

  const errorStyle = {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const countStyle = {
    fontSize: '14px',
    color: '#9D174D',
    fontWeight: '500',
  };

  // ── Render ─────────────────────────────────────────────

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>🩺 Scan History</h1>
        {!loading && !error && (
          <span style={countStyle}>{scans.length} scan{scans.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Filter tabs */}
      <div style={filterBarStyle}>
        {FILTERS.map(f => (
          <button
            key={String(f.key)}
            style={filterBtnStyle(filter === f.key)}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div style={errorStyle}>
          <span>⚠️ {error}</span>
          <button
            onClick={fetchHistory}
            style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: '600' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#C084AC', fontSize: '16px' }}>
          Loading scans…
        </div>
      )}

      {/* Empty */}
      {!loading && !error && scans.length === 0 && (
        <div style={emptyStyle}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🩻</div>
          <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>No scans yet</h3>
          <p style={{ fontSize: '14px', color: '#BE185D' }}>
            {filter
              ? `No ${filter} scans found. Try a different filter.`
              : 'Upload your first scan to see results here.'}
          </p>
        </div>
      )}

      {/* Scan list */}
      {!loading && !error && scans.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {scans.map(scan => (
            <ScanCard key={scan.scan_id} scan={scan} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default History;