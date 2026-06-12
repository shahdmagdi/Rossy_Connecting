import React, { useState, useEffect } from "react";
import { getMyCarePlans } from "../../services/Notesservice";

const CarePlan = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getMyCarePlans();
        if (res.success) {
          setPlans(res.notes || res.care_plans || res.data || []);
        } else {
          setError(res.message || "Failed to load care plans.");
        }
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load care plans.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Styles ──────────────────────────────────────────────
  const s = {
    container: { padding: "40px", maxWidth: "1200px", margin: "0 auto" },
    title: { fontSize: 28, fontWeight: 700, color: "#831843", marginBottom: 30 },
    card: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 25,
      marginBottom: 20,
      boxShadow: "0 4px 15px rgba(131,24,67,.1)",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 600,
      color: "#831843",
      marginBottom: 15,
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
  };

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.container}>
        <h1 style={s.title}>My Care Plan</h1>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              ...s.card,
              height: 120,
              backgroundImage:
                "linear-gradient(90deg,#fdf2f8 25%,#fce7f3 50%,#fdf2f8 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s infinite",
            }}
          />
        ))}
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────
  if (error) {
    return (
      <div style={s.container}>
        <h1 style={s.title}>My Care Plan</h1>
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: 12,
            padding: "14px 18px",
            color: "#991b1b",
            fontSize: 14,
          }}
        >
          ⚠️ {error}
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────
  if (plans.length === 0) {
    return (
      <div style={s.container}>
        <h1 style={s.title}>My Care Plan</h1>
        <div style={{ ...s.card, textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
            No care plans yet
          </p>
          <p style={{ fontSize: 13 }}>
            Your doctor hasn't shared any care plans with you yet.
          </p>
        </div>
      </div>
    );
  }

  // ── Plans list ───────────────────────────────────────────
  return (
    <div style={s.container}>
      <h1 style={s.title}>My Care Plan</h1>

      {/* Count badge */}
      <div style={{ marginBottom: 20 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            backgroundColor: "#fce7f3",
            color: "#831843",
            padding: "3px 14px",
            borderRadius: 99,
          }}
        >
          {plans.length} care plan{plans.length !== 1 ? "s" : ""}
        </span>
      </div>

      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
};

// ─── Individual plan card ─────────────────────────────────

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const PlanCard = ({ plan }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 20,
        boxShadow: "0 4px 15px rgba(131,24,67,.1)",
        border: expanded ? "1.5px solid #f9a8d4" : "1.5px solid transparent",
        overflow: "hidden",
        transition: "border-color .2s",
      }}
    >
      {/* Header — always visible */}
      <div
        onClick={() => setExpanded((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "20px 25px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg,#fce7f3,#fbcfe8)",
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
              fontSize: 16,
              fontWeight: 700,
              color: "#831843",
              marginBottom: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {plan.title}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            From your doctor · {fmt(plan.created_at)}
          </div>
        </div>

        <span
          style={{
            fontSize: 14,
            color: "#9ca3af",
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
            borderTop: "1px solid #fce7f3",
            padding: "20px 25px",
            fontSize: 14,
            color: "#374151",
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
            backgroundColor: "#fffbfd",
          }}
        >
          {plan.content}
        </div>
      )}
    </div>
  );
};

export default CarePlan;