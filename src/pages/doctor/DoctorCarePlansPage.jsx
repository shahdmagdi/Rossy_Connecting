import React, { useState, useEffect } from "react";
import { getMyAssignedPatients } from "../../services/assignmentService";
import DoctorCarePlanTab from "./DoctorCarePlanTab";

const DoctorCarePlansPage = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyAssignedPatients();
        if (res.success) setPatients(res.patients || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPatients(false);
      }
    };
    load();
  }, []);

  const selectedPatient = patients.find(
    (p) => String(p.patient_id) === String(selectedPatientId)
  );

  return (
    <div style={{ padding: "32px", maxWidth: 860, margin: "0 auto" }}>
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
        <label style={{ fontSize: 13, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>
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

      {!selectedPatientId && (
        <div style={{ textAlign: "center", padding: "64px 20px", color: "#94a3b8" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#64748b", margin: "0 0 6px" }}>
            No patient selected
          </p>
          <p style={{ fontSize: 13 }}>
            Choose a patient above to view and manage their care plans.
          </p>
        </div>
      )}

      {selectedPatientId && (
        <DoctorCarePlanTab
          key={selectedPatientId}
          patientId={selectedPatientId}
          patientName={selectedPatient?.full_name}
        />
      )}
    </div>
  );
};

export default DoctorCarePlansPage;