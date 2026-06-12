import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MentalHealthAlert from '../../components/MentalHealthAlert';
import MentalHealthToggle from '../../components/MentalHealthToggle';
import detectionService from '../../services/detectionService';
import authService from '../../services/authService';
import API from '../../services/api';
import NotificationPanel, { NotificationBell } from '../../components/NotificationPanel';

// ══════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════

const PREDICTION_META = {
  normal:    { label: 'Normal',    color: '#16A34A', bg: '#DCFCE7', icon: '✅' },
  benign:    { label: 'Benign',    color: '#B45309', bg: '#FEF3C7', icon: '⚠️' },
  malignant: { label: 'Malignant', color: '#DC2626', bg: '#FEE2E2', icon: '🔴' },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ══════════════════════════════════════════════════════════
//  MINI BAR CHART
// ══════════════════════════════════════════════════════════

const ScanChart = ({ scans, multimodal }) => {
  const merged = [
    ...scans.map(s => ({ ...s, _id: s.scan_id, _kind: 'single' })),
    ...(multimodal || []).map(m => ({ ...m, _id: m.multimodal_id, _kind: 'multimodal' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8).reverse();

  if (merged.length === 0) {
    return <div style={{ textAlign: 'center', padding: '30px', color: '#C084AC', fontSize: '13px' }}>No scan data yet</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', padding: '0 4px' }}>
        {merged.map((item) => {
          const meta      = PREDICTION_META[item.prediction] || { color: '#C084AC' };
          const heightPct = Math.max((item.confidence / 100) * 100, 10);
          const isMulti   = item._kind === 'multimodal';
          const typeLabel = isMulti ? 'Multimodal' : item.image_type;
          const tooltip   = `${typeLabel} · ${item.prediction} · ${item.confidence?.toFixed(1)}% · ${formatDate(item.created_at)}`;
          return (
            <div key={item._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: meta.color }}>{item.confidence?.toFixed(0)}%</div>
              <div
                title={tooltip}
                style={{
                  width: '100%', height: `${heightPct}%`,
                  background: isMulti
                    ? `repeating-linear-gradient(45deg, ${meta.color}, ${meta.color} 4px, ${meta.color}99 4px, ${meta.color}99 8px)`
                    : meta.color,
                  borderRadius: '6px 6px 0 0', opacity: 0.85, cursor: 'default',
                  minHeight: '12px', transition: 'opacity 0.2s',
                  borderTop: isMulti ? '3px solid #7C3AED' : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
              />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '8px 4px 0', borderTop: '1px solid #F9D5E5', marginTop: '4px' }}>
        {merged.map((item) => {
          const meta    = PREDICTION_META[item.prediction] || { color: '#C084AC' };
          const isMulti = item._kind === 'multimodal';
          return (
            <div key={item._id} style={{ flex: 1, textAlign: 'center' }}>
              {isMulti && <div style={{ fontSize: '9px', color: '#7C3AED', fontWeight: '700', marginBottom: '1px' }}></div>}
              <div style={{ fontSize: '10px', color: meta.color, fontWeight: '600', textTransform: 'capitalize' }}>{item.prediction?.slice(0, 3)}</div>
              <div style={{ fontSize: '9px', color: '#aaa', marginTop: '2px' }}>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '14px', marginTop: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        {Object.entries(PREDICTION_META).map(([key, meta]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: meta.color }} />
            <span style={{ fontSize: '11px', color: '#666', textTransform: 'capitalize' }}>{key}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'repeating-linear-gradient(45deg, #C084AC, #C084AC 2px, #C084AC99 2px, #C084AC99 4px)', border: '1.5px solid #7C3AED' }} />
          <span style={{ fontSize: '11px', color: '#666' }}>Multimodal</span>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
//  STAT CARD
// ══════════════════════════════════════════════════════════

const StatCard = ({ icon, label, value, sub, color = '#831843', bg = '#FCE7F3' }) => (
  <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 12px rgba(131,24,67,0.07)', border: '1px solid #F9D5E5', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{icon}</div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: '700', color, lineHeight: 1, textTransform: 'capitalize' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>{sub}</div>}
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════
//  SINGLE RESULT CARD
// ══════════════════════════════════════════════════════════

const ResultCard = ({ result, onReset, onViewHistory }) => {
  const diagnosis = result?.diagnosis || {};
  const meta  = PREDICTION_META[diagnosis.prediction] || { color: '#374151', bg: '#F3F4F6', icon: '❓' };
  const probs = diagnosis.probabilities || {};

  return (
    <div style={{ borderRadius: '16px', border: `2px solid ${meta.color}33`, padding: '28px', marginTop: '20px', animation: 'fadeIn 0.4s ease', backgroundColor: '#FAFAFA' }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>{meta.icon}</span>
          <div>
            <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Result</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: meta.color, textTransform: 'capitalize' }}>{diagnosis.prediction}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Confidence</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: meta.color }}>{diagnosis.confidence?.toFixed(1)}%</div>
        </div>
      </div>
      <div style={{ height: '8px', backgroundColor: '#F3F4F6', borderRadius: '99px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ height: '100%', width: `${diagnosis.confidence}%`, backgroundColor: meta.color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
      </div>
      {Object.keys(probs).length > 0 && (
        <div style={{ backgroundColor: '#FDF2F8', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#9D174D', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>Class Probabilities</div>
          {Object.entries(probs).map(([cls, val]) => (
            <div key={cls} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span style={{ fontSize: '13px', color: '#555', textTransform: 'capitalize' }}>{cls}</span>
              <span style={{ fontSize: '13px', fontWeight: cls === diagnosis.prediction ? '700' : '400', color: cls === diagnosis.prediction ? '#831843' : '#999' }}>{val?.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
      {diagnosis.recommendation && (
        <div style={{ backgroundColor: '#F0FDF4', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: '#166534', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Recommendation</div>
          <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', margin: 0 }}>{diagnosis.recommendation}</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onViewHistory} style={{ flex: 1, padding: '11px', borderRadius: '10px', backgroundColor: '#831843', color: '#fff', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>View History</button>
        <button onClick={onReset} style={{ flex: 1, padding: '11px', borderRadius: '10px', backgroundColor: '#FCE7F3', color: '#831843', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Upload Another</button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
//  MULTIMODAL RESULT CARD
// ══════════════════════════════════════════════════════════

const MultimodalResultCard = ({ result, onReset, onViewHistory }) => {
  const data  = result?.multimodal || {};
  const meta  = PREDICTION_META[data.prediction] || { color: '#374151', bg: '#F3F4F6', icon: '❓' };
  const probs = data.probabilities || {};

  return (
    <div style={{ borderRadius: '16px', border: `2px solid ${meta.color}33`, padding: '28px', marginTop: '20px', animation: 'fadeIn 0.4s ease', backgroundColor: '#FAFAFA' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ backgroundColor: '#EDE9FE', color: '#5B21B6', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '99px' }}>🔬 Multimodal Fusion</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>{meta.icon}</span>
          <div>
            <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Combined Result</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: meta.color, textTransform: 'capitalize' }}>{data.prediction}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Confidence</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: meta.color }}>{data.confidence?.toFixed(1)}%</div>
        </div>
      </div>
      <div style={{ height: '8px', backgroundColor: '#F3F4F6', borderRadius: '99px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ height: '100%', width: `${data.confidence}%`, backgroundColor: meta.color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
      </div>
      {(data.ultrasound_image_url || data.mammogram_image_url) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {data.ultrasound_image_url && (
            <div>
              <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>🔊 Ultrasound</div>
              <img src={data.ultrasound_image_url} alt="ultrasound" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '120px' }} />
            </div>
          )}
          {data.mammogram_image_url && (
            <div>
              <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>🩻 Mammogram</div>
              <img src={data.mammogram_image_url} alt="mammogram" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '120px' }} />
            </div>
          )}
        </div>
      )}
      {Object.keys(probs).length > 0 && (
        <div style={{ backgroundColor: '#FDF2F8', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#9D174D', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>Class Probabilities</div>
          {Object.entries(probs).map(([cls, val]) => (
            <div key={cls} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span style={{ fontSize: '13px', color: '#555', textTransform: 'capitalize' }}>{cls}</span>
              <span style={{ fontSize: '13px', fontWeight: cls === data.prediction ? '700' : '400', color: cls === data.prediction ? '#831843' : '#999' }}>{val?.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
      {data.recommendation && (
        <div style={{ backgroundColor: '#F0FDF4', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: '#166534', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Recommendation</div>
          <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', margin: 0 }}>{data.recommendation}</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onViewHistory} style={{ flex: 1, padding: '11px', borderRadius: '10px', backgroundColor: '#831843', color: '#fff', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>View History</button>
        <button onClick={onReset} style={{ flex: 1, padding: '11px', borderRadius: '10px', backgroundColor: '#FCE7F3', color: '#831843', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Upload Another</button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
//  FILE DROP ZONE (reusable)
// ══════════════════════════════════════════════════════════

const FileDropZone = ({ label, icon, file, preview, onFile, onClear, inputRef }) => {
  const handleDrop = useCallback((e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }, [onFile]);

  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '12px', color: '#9D174D', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{icon} {label}</div>
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #E5C4D2', borderRadius: '12px', padding: preview ? '12px' : '24px',
          textAlign: 'center', cursor: 'pointer', backgroundColor: '#FDF2F8',
          transition: 'border-color 0.2s, background-color 0.2s',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
          minHeight: '120px',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#C084AC'; e.currentTarget.style.backgroundColor = '#FCE7F3'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5C4D2'; e.currentTarget.style.backgroundColor = '#FDF2F8'; }}
      >
        {preview
          ? <><img src={preview} alt="preview" style={{ maxHeight: '100px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} /><span style={{ fontSize: '11px', color: '#9D174D' }}>Click to change</span></>
          : <><div style={{ fontSize: '28px' }}>{icon}</div><div style={{ fontSize: '13px', fontWeight: '500', color: '#831843' }}>Drop or click</div><div style={{ fontSize: '11px', color: '#BE185D' }}>PNG/JPG · max 10MB</div></>
        }
        <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg" style={{ display: 'none' }} onChange={e => onFile(e.target.files[0])} />
      </div>
      {file && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ fontSize: '11px', color: '#9D174D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>📎 {file.name}</span>
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>Remove</button>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
//  SCAN UPLOAD
// ══════════════════════════════════════════════════════════

const ScanUpload = ({ onViewHistory, onUploadSuccess }) => {
  const [mode, setMode]             = useState('single');
  const [imageType, setImageType]   = useState('ultrasound');
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [usFile, setUsFile]         = useState(null);
  const [usPreview, setUsPreview]   = useState(null);
  const [mmFile, setMmFile]         = useState(null);
  const [mmPreview, setMmPreview]   = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState(null);
  const [result, setResult]         = useState(null);
  const [resultType, setResultType] = useState(null);

  const fileInputRef = useRef();
  const usInputRef   = useRef();
  const mmInputRef   = useRef();

  const validateFile = (f) => {
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(f.type)) return 'Only PNG, JPG, JPEG files are allowed.';
    if (f.size > 10 * 1024 * 1024) return 'File must be under 10MB.';
    return null;
  };

  const handleSingleFile = useCallback((f) => {
    if (!f) return;
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError(null); setFile(f); setPreview(URL.createObjectURL(f));
  }, []);

  const handleUsFile = useCallback((f) => {
    if (!f) return;
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError(null); setUsFile(f); setUsPreview(URL.createObjectURL(f));
  }, []);

  const handleMmFile = useCallback((f) => {
    if (!f) return;
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError(null); setMmFile(f); setMmPreview(URL.createObjectURL(f));
  }, []);

  const handleReset = () => {
    setFile(null); setPreview(null);
    setUsFile(null); setUsPreview(null);
    setMmFile(null); setMmPreview(null);
    setResult(null); setResultType(null); setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setUploading(true);
    try {
      if (mode === 'multimodal') {
        if (!usFile || !mmFile) { setError('Please select both ultrasound and mammogram images.'); setUploading(false); return; }
        const data = await detectionService.uploadMultimodalScan(usFile, mmFile);
        setResult(data); setResultType('multimodal');
        setUsFile(null); setUsPreview(null); setMmFile(null); setMmPreview(null);
      } else {
        if (!file) { setError('Please select an image first.'); setUploading(false); return; }
        const data = await detectionService.uploadScan(file, imageType);
        setResult(data); setResultType('single');
        setFile(null); setPreview(null);
      }
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = mode === 'multimodal' ? (usFile && mmFile) : !!file;

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { key: 'single',     label: '🔍 Single Scan' },
          { key: 'multimodal', label: '🔬 Multimodal' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => { setMode(key); setResult(null); setError(null); }} style={{
            padding: '9px 20px', borderRadius: '99px',
            border: mode === key ? '2px solid #831843' : '1.5px solid #E5C4D2',
            backgroundColor: mode === key ? '#831843' : '#fff',
            color: mode === key ? '#fff' : '#831843',
            fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {mode === 'single' && !result && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {['ultrasound', 'mammogram'].map(type => (
            <button key={type} onClick={() => { setImageType(type); setResult(null); }} style={{
              padding: '10px 24px', borderRadius: '99px',
              border: imageType === type ? '2px solid #831843' : '1.5px solid #E5C4D2',
              backgroundColor: imageType === type ? '#831843' : '#fff',
              color: imageType === type ? '#fff' : '#831843',
              fontWeight: '600', fontSize: '14px', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
            }}>
              {type === 'ultrasound' ? '🔊' : '🩻'} {type}
            </button>
          ))}
        </div>
      )}

      {mode === 'multimodal' && !result && (
        <div style={{ backgroundColor: '#EDE9FE', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#5B21B6' }}>
          🔬 Upload both scans together for a combined AI analysis using the multimodal fusion model.
        </div>
      )}

      {!result && (
        mode === 'multimodal' ? (
          <div style={{ display: 'flex', gap: '14px' }}>
            <FileDropZone label="Ultrasound" icon="🔊" file={usFile} preview={usPreview} onFile={handleUsFile} onClear={() => { setUsFile(null); setUsPreview(null); }} inputRef={usInputRef} />
            <FileDropZone label="Mammogram"  icon="🩻" file={mmFile} preview={mmPreview} onFile={handleMmFile} onClear={() => { setMmFile(null); setMmPreview(null); }} inputRef={mmInputRef} />
          </div>
        ) : (
          <div
            onDrop={e => { e.preventDefault(); handleSingleFile(e.dataTransfer.files[0]); }}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #E5C4D2', borderRadius: '14px', padding: '36px 24px',
              textAlign: 'center', cursor: 'pointer', backgroundColor: '#FDF2F8',
              transition: 'border-color 0.2s, background-color 0.2s',
              minHeight: preview ? 'auto' : '160px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C084AC'; e.currentTarget.style.backgroundColor = '#FCE7F3'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5C4D2'; e.currentTarget.style.backgroundColor = '#FDF2F8'; }}
          >
            {preview
              ? <><img src={preview} alt="preview" style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '10px', objectFit: 'contain' }} /><span style={{ fontSize: '13px', color: '#9D174D' }}>Click to change image</span></>
              : <><div style={{ fontSize: '40px' }}>🩻</div><div style={{ fontSize: '15px', fontWeight: '600', color: '#831843' }}>Drop image here or click to browse</div><div style={{ fontSize: '13px', color: '#BE185D' }}>PNG, JPG, JPEG · max 10MB</div></>
            }
            <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg" style={{ display: 'none' }} onChange={e => handleSingleFile(e.target.files[0])} />
          </div>
        )
      )}

      {file && !result && mode === 'single' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
          <span style={{ fontSize: '13px', color: '#9D174D' }}>📎 {file.name}</span>
          <button onClick={handleReset} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Remove</button>
        </div>
      )}

      {error && <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginTop: '12px' }}>⚠️ {error}</div>}

      {!result && (
        <button onClick={handleSubmit} disabled={uploading || !canSubmit} style={{
          width: '100%', marginTop: '16px', padding: '14px', borderRadius: '12px',
          backgroundColor: uploading || !canSubmit ? '#E5C4D2' : '#831843',
          color: '#fff', border: 'none', fontWeight: '700', fontSize: '15px',
          cursor: uploading || !canSubmit ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s',
        }}>
          {uploading ? 'Analyzing scan…' : mode === 'multimodal' ? 'Analyze Both Scans' : 'Analyze Scan'}
        </button>
      )}

      {result && resultType === 'multimodal' && <MultimodalResultCard result={result} onReset={handleReset} onViewHistory={onViewHistory} />}
      {result && resultType === 'single'     && <ResultCard result={result} onReset={handleReset} onViewHistory={onViewHistory} />}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
//  PATIENT DASHBOARD
// ══════════════════════════════════════════════════════════

const PatientDashboard = () => {
  const navigate             = useNavigate();
  const { user }             = useAuth();
  const [scans,      setScans]      = useState([]);
  const [multimodal, setMultimodal] = useState([]);
  const [doctor,     setDoctor]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [mentalHealthMode, setMentalHealthMode] = useState(false);

  // ── Notification state ──────────────────────────────────
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadDashboardData = useCallback(async () => {
    try {
      const [historyRes, doctorRes] = await Promise.allSettled([
        detectionService.getScanHistory(),
        authService.getMyDoctor(),
      ]);
      if (historyRes.status === 'fulfilled') {
        setScans(historyRes.value?.history    || []);
        setMultimodal(historyRes.value?.multimodal || []);
      }
      if (doctorRes.status === 'fulfilled') {
        const d = doctorRes.value;
        setDoctor(d?.success && d?.doctor ? d.doctor : null);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  // ── Poll unread count every 30 s ────────────────────────
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await API.get('/notifications?unread=true');
        setUnreadCount(res.data.unread_count || 0);
      } catch { /* silent */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const allScans       = [...scans, ...multimodal];
  const lastScan       = allScans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
  const normalCount    = allScans.filter(s => s.prediction === 'normal').length;
  const benignCount    = allScans.filter(s => s.prediction === 'benign').length;
  const malignantCount = allScans.filter(s => s.prediction === 'malignant').length;
  const lastMeta       = lastScan ? (PREDICTION_META[lastScan.prediction] || {}) : null;

  const sectionCard  = { backgroundColor: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(131,24,67,0.07)', border: '1px solid #F9D5E5', marginBottom: '24px' };
  const sectionTitle = { fontSize: '17px', fontWeight: '700', color: '#831843', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FCE7F3', paddingTop: '80px' }}>
      <main style={{ padding: '40px', maxWidth: '960px', margin: '0 auto' }}>

        {/* ── Greeting row with notification bell ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#831843', marginBottom: '4px' }}>
              Welcome{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
            </h1>
            <p style={{ fontSize: '14px', color: '#9D174D', margin: 0 }}>Here's an overview of your health activity</p>
          </div>
          <NotificationBell
            onClick={() => setNotifOpen(true)}
            unreadCount={unreadCount}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#C084AC' }}>Loading your dashboard…</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <StatCard icon="🩻" label="Total Scans" value={scans.length + multimodal.length} sub={scans.length + multimodal.length === 0 ? 'No scans yet' : `Last: ${formatDate(lastScan?.created_at)}`} />
              <StatCard icon={lastMeta?.icon || '—'} label="Last Result" value={lastScan ? lastScan.prediction : 'None'} sub={lastScan ? `${lastScan.confidence?.toFixed(1)}% confidence` : 'Upload a scan to start'} color={lastMeta?.color || '#831843'} bg={lastMeta?.bg || '#FCE7F3'} />
              <StatCard icon="🩺" label="Your Doctor" value={doctor ? (doctor.full_name || doctor.name || 'Assigned') : 'None'} sub={doctor ? (doctor.specialty || 'Assigned doctor') : 'Go to Doctor page'} color={doctor ? '#1D4ED8' : '#831843'} bg={doctor ? '#DBEAFE' : '#FCE7F3'} />
              <StatCard icon="📊" label="Breakdown" value={`${normalCount} · ${benignCount} · ${malignantCount}`} sub={`Normal · Benign · Malignant${multimodal.length > 0 ? ` (incl. ${multimodal.length} multimodal)` : ''}`} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={sectionCard}>
                <div style={sectionTitle}>📈 Recent Scan Results</div>
                <ScanChart scans={scans} multimodal={multimodal} />
              </div>
              <div style={sectionCard}>
                <div style={sectionTitle}>🩺 Doctor Assignment</div>
                {doctor ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                      <div style={{ width: '52px', height: '52px', backgroundColor: '#DBEAFE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>👩‍⚕️</div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1D4ED8' }}>{doctor.full_name || doctor.name}</div>
                        {doctor.specialty && <div style={{ fontSize: '13px', color: '#666' }}>{doctor.specialty}</div>}
                        {doctor.email && <div style={{ fontSize: '12px', color: '#aaa' }}>{doctor.email}</div>}
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#DCFCE7', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span>✅</span><span style={{ fontSize: '13px', color: '#166534', fontWeight: '500' }}>Doctor can view your shared scans</span>
                    </div>
                    <button onClick={() => navigate('/patient/visits')} style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Upload shared scan →</button>
                    <div style={{ marginTop: '16px' }}><MentalHealthToggle externalMode={mentalHealthMode} /></div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>🩺</div>
                    <p style={{ fontSize: '14px', color: '#BE185D', marginBottom: '16px', lineHeight: '1.6' }}>No doctor assigned yet. Assign one to share your scan results.</p>
                    <button onClick={() => navigate('/patient/doctor')} style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#831843', color: '#fff', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Find a Doctor →</button>
                    <div style={{ marginTop: '16px' }}><MentalHealthToggle externalMode={mentalHealthMode} /></div>
                  </div>
                )}
              </div>
            </div>

            <div style={sectionCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={sectionTitle}>🩻 Breast Cancer Detection</div>
                <span style={{ fontSize: '12px', color: '#BE185D', backgroundColor: '#FCE7F3', padding: '4px 12px', borderRadius: '99px', fontWeight: '500' }}>🔒 Private · only you can see this</span>
              </div>
              <ScanUpload onViewHistory={() => navigate('/patient/history')} onUploadSuccess={loadDashboardData} />
            </div>

            <button onClick={() => navigate('/patient/history')} style={{ background: 'none', border: 'none', color: '#9D174D', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              View all past scans →
            </button>
          </>
        )}
      </main>

      <MentalHealthAlert onModeChange={(val) => setMentalHealthMode(val)} />

      {/* ── Notification slide-in panel ── */}
      <NotificationPanel
        isOpen={notifOpen}
        onClose={() => { setNotifOpen(false); setUnreadCount(0); }}
      />
    </div>
  );
};

export default PatientDashboard;