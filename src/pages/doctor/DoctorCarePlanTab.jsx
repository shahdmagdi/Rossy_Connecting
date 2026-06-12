import React, { useState, useEffect, useCallback } from "react";
import {
  createCarePlan,
  getPatientNotes,
  updateNote,
  deleteNote,
} from "../../services/Notesservice";


// ─── Helpers ──────────────────────────────────────────────

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

// ─── Skeleton ─────────────────────────────────────────────

const Skeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    {[1, 2].map((i) => (
      <div
        key={i}
        style={{
          height: 100,
          borderRadius: 16,
          backgroundImage:
            "linear-gradient(90deg,#f0fdf4 25%,#dcfce7 50%,#f0fdf4 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
        }}
      />
    ))}
    <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
  </div>
);

// ─── Care plan form ───────────────────────────────────────

const CarePlanForm = ({ patientId, initial = null, onSaved, onCancel }) => {
  const editing = !!initial;
  const [form, setForm] = useState({
    title: initial?.title || "",
    content: initial?.content || "",
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
        result = await updateNote(initial.id, { ...form, visibility: "shared" });
      } else {
        result = await createCarePlan(patientId, form);
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
        background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
        border: "1.5px solid #86efac",
        borderRadius: 16,
        padding: "24px 22px",
        marginBottom: 24,
        animation: "fadeUp 0.22s ease",
      }}
    >
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <span style={{ fontSize: 20 }}>📋</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#166534" }}>
          {editing ? "Edit Care Plan" : "New Care Plan"}
        </span>
        <span
          style={{
            fontSize: 11,
            background: "#bbf7d0",
            color: "#166534",
            padding: "2px 10px",
            borderRadius: 99,
            fontWeight: 700,
            marginLeft: "auto",
          }}
        >
          Visible to patient
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
              color: "#065f46",
              display: "block",
              marginBottom: 6,
            }}
          >
            Title
          </label>
          <input
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Post-Surgery Recovery Plan"
            style={{
              width: "100%",
              padding: "11px 14px",
              border: "1.5px solid #86efac",
              borderRadius: 10,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              color: "#0f172a",
              outline: "none",
              boxSizing: "border-box",
              background: "white",
              transition: "border-color .2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#059669")}
            onBlur={(e) => (e.target.style.borderColor = "#86efac")}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#065f46",
              display: "block",
              marginBottom: 6,
            }}
          >
            Care Plan Content
          </label>
          <textarea
            value={form.content}
            onChange={set("content")}
            placeholder="Describe the care plan, instructions, follow-ups…"
            rows={6}
            style={{
              width: "100%",
              padding: "11px 14px",
              border: "1.5px solid #86efac",
              borderRadius: 10,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              color: "#0f172a",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              background: "white",
              transition: "border-color .2s",
              lineHeight: 1.7,
            }}
            onFocus={(e) => (e.target.style.borderColor = "#059669")}
            onBlur={(e) => (e.target.style.borderColor = "#86efac")}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            padding: "10px 24px",
            background: saving
              ? "#e2e8f0"
              : "linear-gradient(135deg,#059669,#047857)",
            color: saving ? "#94a3b8" : "white",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: saving ? "none" : "0 2px 10px rgba(5,150,105,.3)",
            transition: "all .2s",
          }}
        >
          {saving
            ? "Saving…"
            : editing
            ? "Save Changes"
            : "📋 Create Care Plan"}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 20px",
            background: "white",
            color: "#64748b",
            border: "1.5px solid #d1fae5",
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

// ─── Care plan card ───────────────────────────────────────

const CarePlanCard = ({ plan, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this care plan? The patient will no longer see it."))
      return;
    setDeleting(true);
    try {
      const res = await deleteNote(plan.id);
      if (res.success) onDelete(plan.id);
    } catch {
      /* swallow */
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        background: expanded
          ? "linear-gradient(135deg,#f0fdf4,#fafffe)"
          : "white",
        border: expanded ? "1.5px solid #86efac" : "1.5px solid #e8eaf0",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 14,
        boxShadow: expanded
          ? "0 4px 16px rgba(5,150,105,.10)"
          : "0 1px 4px rgba(15,23,42,.05)",
        transition: "all .25s",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 18px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          📋
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {plan.title}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            Created {fmt(plan.created_at)}
            {plan.updated_at && (
              <span style={{ marginLeft: 6, color: "#cbd5e1", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                • edited {fmt(plan.updated_at)}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div
          style={{ display: "flex", gap: 6, flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(plan)}
            style={{
              padding: "6px 14px",
              background: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "#166534",
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

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid #d1fae5",
            padding: "20px 22px",
            fontSize: 14,
            color: "#374151",
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
            animation: "expand 0.18s ease",
          }}
        >
          <style>{`@keyframes expand{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
          {plan.content}
          {plan.scan_id && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 14px",
                background: "#eff6ff",
                borderRadius: 10,
                fontSize: 12,
                color: "#1d4ed8",
                fontWeight: 600,
              }}
            >
              🩻 Linked scan ID: {plan.scan_id}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
//  MAIN: DoctorCarePlanTab
// ═══════════════════════════════════════════════════════════

const DoctorCarePlanTab = ({ patientId, patientName }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // ── Load ────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getPatientNotes(patientId, "shared");
      if (res.success) setPlans(res.notes || []);
      else setError(res.message || "Failed to load care plans.");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load care plans.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Handlers ────────────────────────────────────────────
  const handleSaved = (saved) => {
    setPlans((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setShowForm(false);
    setEditingPlan(null);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
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
            Care Plans
          </h2>
          {patientName && (
            <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
              Shared with{" "}
              <strong style={{ color: "#0f172a" }}>{patientName}</strong> —
              patient can view these
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setShowForm((p) => !p);
            setEditingPlan(null);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 20px",
            background: showForm
              ? "white"
              : "linear-gradient(135deg,#059669,#047857)",
            color: showForm ? "#64748b" : "white",
            border: showForm ? "1.5px solid #d1fae5" : "none",
            borderRadius: 11,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: showForm ? "none" : "0 2px 10px rgba(5,150,105,.3)",
            transition: "all .2s",
          }}
        >
          {showForm ? "✕ Cancel" : "📋 New Care Plan"}
        </button>
      </div>

      {/* ── Patient visibility notice ── */}
      <div
        style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 12,
          padding: "10px 16px",
          fontSize: 13,
          color: "#166534",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>ℹ️</span>
        <span>
          Care plans are <strong>shared with the patient</strong>. They will
          receive a notification when a new care plan is created.
        </span>
      </div>

      {/* ── Create form ── */}
      {showForm && (
        <CarePlanForm
          patientId={patientId}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* ── Edit form ── */}
      {editingPlan && (
        <CarePlanForm
          patientId={patientId}
          initial={editingPlan}
          onSaved={handleSaved}
          onCancel={() => setEditingPlan(null)}
        />
      )}

      {/* ── Count badge ── */}
      {!loading && plans.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              backgroundColor: "#dcfce7",
              color: "#166534",
              padding: "3px 12px",
              borderRadius: 99,
            }}
          >
            {plans.length} care plan{plans.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

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
      {!loading && !error && plans.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "56px 20px",
            color: "#94a3b8",
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#64748b",
              marginBottom: 6,
            }}
          >
            No care plans yet
          </p>
          <p style={{ fontSize: 13 }}>
            Create one above — it will be shared with the patient automatically.
          </p>
        </div>
      )}

      {/* ── Plans list ── */}
      {!loading && !error && plans.length > 0 && (
        <div>
          {plans.map((p) => (
            <CarePlanCard
              key={p.id}
              plan={p}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorCarePlanTab;