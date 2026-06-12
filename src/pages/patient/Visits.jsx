import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import detectionService from '../../services/detectionService';

// ── Helpers ───────────────────────────────────────────────

const PREDICTION_META = {
  normal:    { label: 'Normal',    color: '#16A34A', bg: '#DCFCE7', icon: '✅' },
  benign:    { label: 'Benign',    color: '#B45309', bg: '#FEF3C7', icon: '⚠️' },
  malignant: { label: 'Malignant', color: '#DC2626', bg: '#FEE2E2', icon: '🔴' },
};

// ── Single Result Card ────────────────────────────────────

const ResultCard = ({ result, onReset, onViewHistory }) => {
  const diagnosis = result?.diagnosis || {};
  const meta = PREDICTION_META[diagnosis.prediction] || { label: diagnosis.prediction, color: '#374151', bg: '#F3F4F6', icon: '❓' };
  const probs = diagnosis.probabilities || {};

  return (
    <div style={{ borderRadius: '16px', border: `2px solid ${meta.color}33`, padding: '28px', marginTop: '20px', animation: 'fadeIn 0.4s ease', backgroundColor: '#fff' }}>
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
        <div style={{ backgroundColor: '#F0FDF4', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#166534', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Recommendation</div>
          <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', margin: 0 }}>{diagnosis.recommendation}</p>
        </div>
      )}
      {result?.note && (
        <div style={{ backgroundColor: '#EDE9FE', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', color: '#5B21B6', margin: 0 }}>🩺 {result.note}</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onViewHistory} style={{ flex: 1, padding: '11px', borderRadius: '10px', backgroundColor: '#831843', color: '#fff', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>View History</button>
        <button onClick={onReset} style={{ flex: 1, padding: '11px', borderRadius: '10px', backgroundColor: '#FCE7F3', color: '#831843', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Upload Another</button>
      </div>
    </div>
  );
};

// ── Multimodal Result Card ────────────────────────────────

const MultimodalResultCard = ({ result, onReset, onViewHistory }) => {
  const data = result?.multimodal || {};
  const meta = PREDICTION_META[data.prediction] || { color: '#374151', bg: '#F3F4F6', icon: '❓' };
  const probs = data.probabilities || {};

  return (
    <div style={{ borderRadius: '16px', border: `2px solid ${meta.color}33`, padding: '28px', marginTop: '20px', animation: 'fadeIn 0.4s ease', backgroundColor: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ backgroundColor: '#EDE9FE', color: '#5B21B6', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '99px' }}>🔬 Multimodal Fusion</span>
        <span style={{ backgroundColor: '#EDE9FE', color: '#5B21B6', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '99px' }}>👁 Shared with doctor</span>
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
        <div style={{ backgroundColor: '#F0FDF4', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#166534', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Recommendation</div>
          <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', margin: 0 }}>{data.recommendation}</p>
        </div>
      )}
      {result?.note && (
        <div style={{ backgroundColor: '#EDE9FE', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', color: '#5B21B6', margin: 0 }}>🩺 {result.note}</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onViewHistory} style={{ flex: 1, padding: '11px', borderRadius: '10px', backgroundColor: '#831843', color: '#fff', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>View History</button>
        <button onClick={onReset} style={{ flex: 1, padding: '11px', borderRadius: '10px', backgroundColor: '#FCE7F3', color: '#831843', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Upload Another</button>
      </div>
    </div>
  );
};

// ── File Drop Zone ────────────────────────────────────────

const FileDropZone = ({ label, icon, file, preview, onFile, onClear, inputRef }) => {
  const handleDrop = useCallback((e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }, [onFile]);
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '12px', color: '#9D174D', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{icon} {label}</div>
      <div
        onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => inputRef.current?.click()}
        style={{ border: '2px dashed #E5C4D2', borderRadius: '12px', padding: preview ? '12px' : '24px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#FDF2F8', transition: 'border-color 0.2s, background-color 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '120px' }}
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

// ── Scan Upload With Doctor ───────────────────────────────

const ScanUploadWithDoctor = ({ onViewHistory }) => {
  const [mode, setMode]           = useState('single');
  const [imageType, setImageType] = useState('ultrasound');
  // single
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  // multimodal
  const [usFile, setUsFile]       = useState(null);
  const [usPreview, setUsPreview] = useState(null);
  const [mmFile, setMmFile]       = useState(null);
  const [mmPreview, setMmPreview] = useState(null);

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
    const err = validateFile(f); if (err) { setError(err); return; }
    setError(null); setFile(f); setPreview(URL.createObjectURL(f));
  }, []);

  const handleUsFile = useCallback((f) => {
    if (!f) return;
    const err = validateFile(f); if (err) { setError(err); return; }
    setError(null); setUsFile(f); setUsPreview(URL.createObjectURL(f));
  }, []);

  const handleMmFile = useCallback((f) => {
    if (!f) return;
    const err = validateFile(f); if (err) { setError(err); return; }
    setError(null); setMmFile(f); setMmPreview(URL.createObjectURL(f));
  }, []);

  const handleReset = () => {
    setFile(null); setPreview(null);
    setUsFile(null); setUsPreview(null); setMmFile(null); setMmPreview(null);
    setResult(null); setResultType(null); setError(null);
  };

  const handleSubmit = async () => {
    setError(null); setUploading(true);
    try {
      if (mode === 'multimodal') {
        if (!usFile || !mmFile) { setError('Please select both ultrasound and mammogram images.'); setUploading(false); return; }
        const data = await detectionService.uploadMultimodalScanWithDoctor(usFile, mmFile);
        setResult(data); setResultType('multimodal');
        setUsFile(null); setUsPreview(null); setMmFile(null); setMmPreview(null);
      } else {
        if (!file) { setError('Please select an image first.'); setUploading(false); return; }
        const data = await detectionService.uploadScanWithDoctor(file, imageType);
        setResult(data); setResultType('single');
        setFile(null); setPreview(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = mode === 'multimodal' ? (usFile && mmFile) : !!file;

  return (
    <div>
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[{ key: 'single', label: '🔍 Single Scan' }, { key: 'multimodal', label: '🔬 Multimodal' }].map(({ key, label }) => (
          <button key={key} onClick={() => { setMode(key); setResult(null); setError(null); }} style={{
            padding: '9px 20px', borderRadius: '99px',
            border: mode === key ? '2px solid #831843' : '1.5px solid #E5C4D2',
            backgroundColor: mode === key ? '#831843' : '#fff',
            color: mode === key ? '#fff' : '#831843',
            fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Single — type picker */}
      {mode === 'single' && !result && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {['ultrasound', 'mammogram'].map(type => (
            <button key={type} onClick={() => { setImageType(type); setResult(null); }} style={{
              padding: '10px 24px', borderRadius: '99px',
              border: imageType === type ? '2px solid #831843' : '1.5px solid #E5C4D2',
              backgroundColor: imageType === type ? '#831843' : '#fff',
              color: imageType === type ? '#fff' : '#831843',
              fontWeight: '600', fontSize: '14px', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
            }}>{type === 'ultrasound' ? '🔊' : '🩻'} {type}</button>
          ))}
        </div>
      )}

      {/* Multimodal hint */}
      {mode === 'multimodal' && !result && (
        <div style={{ backgroundColor: '#EDE9FE', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#5B21B6' }}>
          🔬 Both scans will be analyzed together and shared with your doctor for review.
        </div>
      )}

      {/* Upload area */}
      {!result && (
        mode === 'multimodal' ? (
          <div style={{ display: 'flex', gap: '14px' }}>
            <FileDropZone label="Ultrasound" icon="🔊" file={usFile} preview={usPreview} onFile={handleUsFile} onClear={() => { setUsFile(null); setUsPreview(null); }} inputRef={usInputRef} />
            <FileDropZone label="Mammogram"  icon="🩻" file={mmFile} preview={mmPreview} onFile={handleMmFile} onClear={() => { setMmFile(null); setMmPreview(null); }} inputRef={mmInputRef} />
          </div>
        ) : (
          <div
            onDrop={e => { e.preventDefault(); handleSingleFile(e.dataTransfer.files[0]); }} onDragOver={e => e.preventDefault()} onClick={() => fileInputRef.current?.click()}
            style={{ border: '2px dashed #E5C4D2', borderRadius: '14px', padding: '36px 24px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#FDF2F8', transition: 'border-color 0.2s, background-color 0.2s', minHeight: preview ? 'auto' : '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C084AC'; e.currentTarget.style.backgroundColor = '#FCE7F3'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5C4D2'; e.currentTarget.style.backgroundColor = '#FDF2F8'; }}
          >
            {preview
              ? <><img src={preview} alt="preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '10px', objectFit: 'contain' }} /><span style={{ fontSize: '13px', color: '#9D174D' }}>Click to change image</span></>
              : <><div style={{ fontSize: '44px' }}>🩻</div><div style={{ fontSize: '15px', fontWeight: '600', color: '#831843' }}>Drop image here or click to browse</div><div style={{ fontSize: '13px', color: '#BE185D' }}>PNG, JPG, JPEG · max 10MB</div></>
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
          {uploading ? 'Analyzing scan…' : mode === 'multimodal' ? 'Analyze & Share Both Scans' : 'Analyze & Share with Doctor'}
        </button>
      )}

      {result && resultType === 'multimodal' && <MultimodalResultCard result={result} onReset={handleReset} onViewHistory={onViewHistory} />}
      {result && resultType === 'single'     && <ResultCard result={result} onReset={handleReset} onViewHistory={onViewHistory} />}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
//  VISITS PAGE
// ══════════════════════════════════════════════════════════

const Visits = () => {
  const navigate = useNavigate();
  const [hasDoctor, setHasDoctor] = useState(false);
  const [doctor, setDoctor]       = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const checkDoctor = async () => {
      try {
        const res = await authService.getMyDoctor();
        const assigned = res?.success && res?.doctor;
        setHasDoctor(!!assigned);
        if (assigned) setDoctor(res.doctor);
      } catch { setHasDoctor(false); }
      finally { setLoading(false); }
    };
    checkDoctor();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#C084AC' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
          <p style={{ fontSize: '16px', fontWeight: '500' }}>Checking your doctor assignment…</p>
        </div>
      </div>
    );
  }

  if (!hasDoctor) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '40px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '48px 40px', textAlign: 'center', maxWidth: '420px', boxShadow: '0 4px 24px rgba(131,24,67,0.1)', border: '1px solid #F9D5E5' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🩺</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#831843', marginBottom: '10px' }}>No Doctor Assigned</h2>
          <p style={{ fontSize: '14px', color: '#BE185D', lineHeight: '1.6', marginBottom: '28px' }}>You need an assigned doctor to share scan results. Head to the Doctor page to request one.</p>
          <button onClick={() => navigate('/patient/doctor')} style={{ backgroundColor: '#831843', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 28px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>Find a Doctor →</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#831843', marginBottom: '6px' }}>Shared Scans</h1>
      <p style={{ fontSize: '14px', color: '#9D174D', marginBottom: '32px' }}>Upload scans that your doctor can view and review</p>

      {doctor && (
        <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '18px 22px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(131,24,67,0.07)', border: '1px solid #F9D5E5', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', backgroundColor: '#FCE7F3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>👩‍⚕️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#9D174D', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your Assigned Doctor</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#831843' }}>{doctor.full_name || doctor.name || 'Your Doctor'}</div>
            {doctor.specialty && <div style={{ fontSize: '13px', color: '#666' }}>{doctor.specialty}</div>}
          </div>
          <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '99px' }}>✅ Active</span>
        </div>
      )}

      <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 24px rgba(131,24,67,0.08)', border: '1px solid #F9D5E5', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#831843', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>🩻 Upload Scan for Doctor</h2>
          <span style={{ fontSize: '12px', color: '#5B21B6', backgroundColor: '#EDE9FE', padding: '4px 12px', borderRadius: '99px', fontWeight: '500' }}>👁 Doctor can view this</span>
        </div>
        <ScanUploadWithDoctor onViewHistory={() => navigate('/patient/history')} />
      </div>

      <div style={{ backgroundColor: '#EDE9FE', borderRadius: '12px', padding: '14px 18px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>💡</span>
        <p style={{ fontSize: '13px', color: '#5B21B6', margin: 0, lineHeight: '1.6' }}>
          Scans uploaded here are shared with your doctor. For private scans only you can see, use the <strong>Dashboard</strong>.
        </p>
      </div>

      <button onClick={() => navigate('/patient/history')} style={{ background: 'none', border: 'none', color: '#9D174D', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline', padding: 0, marginTop: '20px', display: 'inline-block' }}>
        View all past scans →
      </button>
    </div>
  );
};

export default Visits;