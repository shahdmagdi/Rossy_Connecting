import React, { useState, useEffect, useCallback } from "react";
import {
  createNote,
  getPatientNotes,
  updateNote,
  deleteNote,
} from "../../services/Notesservice";
import { getMyAssignedPatients } from "../../services/assignmentService";

// ─── Tiny helpers ────────────────────────────────────────

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const VISIBILITY = { private: "private", shared: "shared" };

const BADGE = {
  private: { bg: "#f1f5f9", color: "#475569", label: "Private" },
  shared: { bg: "#dcfce7", color: "#166534", label: "Care Plan" },
};

// ─── Skeleton loader ──────────────────────────────────────

const Skeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        style={{
          height: 88,
          borderRadius: 14,
          backgroundImage:
            "linear-gradient(90deg,#f8faff 25%,#f1f5ff 50%,#f8faff 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
        }}
      />
    ))}
    <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
  </div>
);

// ─── Note form (create / edit) ────────────────────────────

const NoteForm = ({ patientId, initial = null, onSaved, onCancel }) => {
  const editing = !!initial;

  const [form, setForm] = useState({
    title: initial?.title || "",
    content: initial?.content || "",
    visibility: VISIBILITY.private,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return setErr("Title is required.");
    if (!form.content.trim()) return setErr("Content is required.");
    setSaving(true);
    setErr("");
    try {
      let result;
      if (editing) {
        result = await updateNote(initial.id, { ...form, visibility: "private" });
      } else {
        result = await createNote(patientId, form);
      }
      if (result.success) {
        onSaved(result.note);
      } else {
        setErr(result.message || "Something went wrong.");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Request failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        background: "#f8faff",
        border: "1.5px solid #e2e8f0",
        borderRadius: 16,
        padding: "24px 22px",
        marginBottom: 24,
        animation: "fadeUp 0.2s ease",
      }}
    >
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ marginBottom: 18 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
          {editing ? "Edit Note" : "New Note"}
        </span>
      </div>

      {err && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#991b1b",
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          ⚠️ {err}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#374151",
              display: "block",
              marginBottom: 6,
            }}
          >
            Title
          </label>
          <input
            value={form.title}
            onChange={set("title")}
            placeholder="Note title…"
            style={{
              width: "100%",
              padding: "11px 14px",
              border: "1.5px solid #e2e8f0",
              borderRadius: 10,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              color: "#0f172a",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color .2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#374151",
              display: "block",
              marginBottom: 6,
            }}
          >
            Content
          </label>
          <textarea
            value={form.content}
            onChange={set("content")}
            placeholder="Write your note…"
            rows={5}
            style={{
              width: "100%",
              padding: "11px 14px",
              border: "1.5px solid #e2e8f0",
              borderRadius: 10,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              color: "#0f172a",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              transition: "border-color .2s",
              lineHeight: 1.65,
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            padding: "10px 24px",
            background: saving
              ? "#e2e8f0"
              : "linear-gradient(135deg,#0f172a,#1e293b)",
            color: saving ? "#94a3b8" : "white",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all .2s",
            boxShadow: saving ? "none" : "0 2px 8px rgba(15,23,42,.2)",
          }}
        >
          {saving ? "Saving…" : editing ? "Save Changes" : "🔒 Save Note"}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 20px",
            background: "white",
            color: "#64748b",
            border: "1.5px solid #e2e8f0",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ─── Single note card ─────────────────────────────────────

const NoteCard = ({ note, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const b = BADGE[note.visibility] || BADGE.private;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this note?")) return;
    setDeleting(true);
    try {
      const res = await deleteNote(note.id);
      if (res.success) onDelete(note.id);
    } catch {
      /* handled by parent */
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        background: "white",
        border: "1.5px solid #e8eaf0",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 12,
        boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
        transition: "box-shadow .2s, border-color .2s",
      }}
    >
      <div
        onClick={() => setExpanded((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 18px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          🔒
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#0f172a",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 240,
              }}
            >
              {note.title}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: b.bg,
                color: b.color,
                padding: "2px 10px",
                borderRadius: 99,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                flexShrink: 0,
              }}
            >
              {b.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            {fmt(note.updated_at || note.created_at)}
            {note.updated_at && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 10,
                  color: "#cbd5e1",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                • edited
              </span>
            )}
          </div>
        </div>

        <div
          style={{ display: "flex", gap: 6, flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(note)}
            style={{
              padding: "6px 12px",
              background: "#f8faff",
              border: "1.5px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: "6px 12px",
              background: "#fff1f1",
              border: "1.5px solid #fecaca",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "#dc2626",
              cursor: deleting ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>

        <span
          style={{
            fontSize: 14,
            color: "#94a3b8",
            flexShrink: 0,
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform .2s",
          }}
        >
          ▾
        </span>
      </div>

      {expanded && (
        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            padding: "18px 20px 20px",
            backgroundColor: "#fafbff",
            fontSize: 14,
            color: "#374151",
            lineHeight: 1.75,
            whiteSpace: "pre-wrap",
            animation: "scanExpand 0.18s ease",
          }}
        >
          <style>{`@keyframes scanExpand{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
          {note.content}
        </div>
      )}
    </div>
  );
};

// ─── Filter bar ───────────────────────────────────────────

const FILTERS = [
  { key: null, label: "All", emoji: "📁" },
  { key: VISIBILITY.private, label: "Private", emoji: "🔒" },
];

// ═══════════════════════════════════════════════════════════
//  MAIN: ClinicalNotesTab
// ═══════════════════════════════════════════════════════════

const ClinicalNotesTab = ({ patientId, patientName }) => {
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // ── Patient selector state (standalone page only) ────────
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    if (patientId) return; // used inside PatientDetails, skip
    setLoadingPatients(true);
    getMyAssignedPatients()
      .then((res) => {
        if (res.success) setPatients(res.patients || []);
      })
      .catch(console.error)
      .finally(() => setLoadingPatients(false));
  }, [patientId]);

  const activePatientId = patientId || selectedPatientId;
  const activePatientName =
    patientName ||
    patients.find((p) => String(p.patient_id) === String(selectedPatientId))
      ?.full_name;

  // ── Load notes ──────────────────────────────────────────
  const load = useCallback(async () => {
    if (!activePatientId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getPatientNotes(activePatientId, filter);
      if (res.success) setNotes(res.notes || []);
      else setError(res.message || "Failed to load notes.");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }, [activePatientId, filter]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Handlers ────────────────────────────────────────────
  const handleSaved = (saved) => {
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setShowForm(false);
    setEditingNote(null);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setShowForm(false);
  };

  const handleDelete = (deletedId) => {
    setNotes((prev) => prev.filter((n) => n.id !== deletedId));
  };

  const privateCount = notes.filter(
    (n) => n.visibility === VISIBILITY.private
  ).length;

  const visible =
    filter === null
      ? notes
      : notes.filter((n) => n.visibility === filter);

  return (
    <div>
      {/* ── Patient selector (standalone only) ── */}
      {!patientId && (
        <div
          style={{
            background: "white",
            border: "1.5px solid #e2e8f0",
            borderRadius: 16,
            padding: "16px 20px",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#64748b",
              whiteSpace: "nowrap",
            }}
          >
            Select patient
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            disabled={loadingPatients}
            style={{
              flex: 1,
              minWidth: 200,
              padding: "9px 12px",
              border: "1.5px solid #e2e8f0",
              borderRadius: 10,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              color: "#0f172a",
              background: "white",
              outline: "none",
            }}
          >
            <option value="">
              {loadingPatients ? "Loading patients…" : "— Choose a patient —"}
            </option>
            {patients.map((p) => (
              <option key={p.patient_id} value={p.patient_id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Empty state when standalone and no patient chosen ── */}
      {!patientId && !selectedPatientId ? (
        <div
          style={{ textAlign: "center", padding: "64px 20px", color: "#94a3b8" }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>📝</div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#64748b",
              margin: "0 0 6px",
            }}
          >
            No patient selected
          </p>
          <p style={{ fontSize: 13 }}>
            Choose a patient above to view and manage their notes.
          </p>
        </div>
      ) : (
        <>
          {/* ── Header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 22,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 20,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Clinical Notes
              </h2>
              {activePatientName && (
                <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
                  Notes for{" "}
                  <strong style={{ color: "#0f172a" }}>{activePatientName}</strong>
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setShowForm((p) => !p);
                setEditingNote(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 20px",
                background: showForm
                  ? "white"
                  : "linear-gradient(135deg,#0f172a,#1e293b)",
                color: showForm ? "#64748b" : "white",
                border: showForm ? "1.5px solid #e2e8f0" : "none",
                borderRadius: 11,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: showForm ? "none" : "0 2px 10px rgba(15,23,42,.2)",
                transition: "all .2s",
              }}
            >
              {showForm ? "✕ Cancel" : "+ New Note"}
            </button>
          </div>

          {/* ── Inline create form ── */}
          {showForm && (
            <NoteForm
              patientId={activePatientId}
              onSaved={handleSaved}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* ── Inline edit form ── */}
          {editingNote && (
            <NoteForm
              patientId={activePatientId}
              initial={editingNote}
              onSaved={handleSaved}
              onCancel={() => setEditingNote(null)}
            />
          )}

          {/* ── Stats ── */}
          {!loading && notes.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 18,
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  label: "Total",
                  count: notes.length,
                  bg: "#f1f5f9",
                  color: "#475569",
                },
                {
                  label: "Private",
                  count: privateCount,
                  bg: "#f1f5f9",
                  color: "#475569",
                },
              ].map((s) => (
                <span
                  key={s.label}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: s.bg,
                    color: s.color,
                    padding: "3px 12px",
                    borderRadius: 99,
                  }}
                >
                  {s.label}: {s.count}
                </span>
              ))}
            </div>
          )}

          {/* ── Filters ── */}
          <div
            style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
          >
            {FILTERS.map((f) => {
              const active = filter === f.key;
              const count =
                f.key === null
                  ? notes.length
                  : notes.filter((n) => n.visibility === f.key).length;
              return (
                <button
                  key={String(f.key)}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 99,
                    cursor: "pointer",
                    border: active
                      ? "2px solid #0f172a"
                      : "1.5px solid #e2e8f0",
                    backgroundColor: active ? "#0f172a" : "white",
                    color: active ? "white" : "#475569",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all .15s",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {f.emoji} {f.label}
                  {!loading && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 11,
                        backgroundColor: active
                          ? "rgba(255,255,255,.2)"
                          : "#f1f5f9",
                        color: active ? "white" : "#64748b",
                        padding: "0 6px",
                        borderRadius: 99,
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Error ── */}
          {error && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fca5a5",
                borderRadius: 12,
                padding: "12px 16px",
                color: "#991b1b",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* ── Loading ── */}
          {loading && <Skeleton />}

          {/* ── Empty ── */}
          {!loading && !error && visible.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "56px 20px",
                color: "#94a3b8",
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 12 }}>📝</div>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#64748b",
                  marginBottom: 6,
                }}
              >
                No notes yet
              </p>
              <p style={{ fontSize: 13 }}>
                {filter === VISIBILITY.private
                  ? "No private notes for this patient."
                  : 'Start by clicking "+ New Note" above.'}
              </p>
            </div>
          )}

          {/* ── Notes list ── */}
          {!loading && !error && visible.length > 0 && (
            <div>
              {visible.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClinicalNotesTab;