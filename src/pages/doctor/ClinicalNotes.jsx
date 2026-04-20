import React, { useState } from 'react';

const ClinicalNotes = () => {
  const [selectedPatient, setSelectedPatient] = useState('all');

  const containerStyle = {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#831843',
  };

  const selectStyle = {
    padding: '12px 20px',
    fontSize: '15px',
    border: '2px solid #F9A8D4',
    borderRadius: '8px',
    outline: 'none',
    width: '250px',
    backgroundColor: '#ffffff',
  };

  const listStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const noteCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(131, 24, 67, 0.1)',
  };

  const noteHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #F9A8D4',
  };

  const patientInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  };

  const avatarStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#FCE7F3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#831843',
    fontWeight: '600',
    fontSize: '16px',
  };

  const nameStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#831843',
  };

  const dateStyle = {
    fontSize: '14px',
    color: '#9D174D',
  };

  const noteContentStyle = {
    fontSize: '15px',
    color: '#666',
    lineHeight: '1.6',
  };

  const doctorNameStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#9D174D',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #FCE7F3',
  };

  const notes = [
    { id: 1, patient: 'Maria Garcia', date: '2024-01-15', doctor: 'Dr. Sarah Mitchell', content: 'Patient showed significant improvement in overall condition. Mammo results indicate positive response to treatment. Recommended continued monitoring and lifestyle modifications. Next follow-up scheduled in 4 weeks.' },
    { id: 2, patient: 'Maria Garcia', date: '2024-01-10', doctor: 'Dr. John Anderson', content: 'Initial consultation completed. Discussed treatment options including chemotherapy and radiation. Patient opted for combined approach. All questions answered satisfactorily.' },
    { id: 3, patient: 'Jennifer Smith', date: '2024-01-14', doctor: 'Dr. Sarah Mitchell', content: 'Biopsy results reviewed. Need to discuss staging and treatment options. Patient expressed preference for conservative approach if possible.' },
    { id: 4, patient: 'Emily Johnson', date: '2024-01-13', doctor: 'Dr. Lisa Chen', content: 'Post-treatment follow-up. Patient recovering well. No complications observed. Continue current medication plan and schedule follow-up in 3 months.' },
    { id: 5, patient: 'Sarah Williams', date: '2024-01-12', doctor: 'Dr. Sarah Mitchell', content: 'Lab results reviewed. All values within normal range. Patient maintaining good health. Continue preventive care regimen.' },
  ];

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Clinical Notes</h1>
        <select
          style={selectStyle}
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
        >
          <option value="all">All Patients</option>
          <option value="maria">Maria Garcia</option>
          <option value="jennifer">Jennifer Smith</option>
          <option value="emily">Emily Johnson</option>
          <option value="sarah">Sarah Williams</option>
        </select>
      </div>

      <div style={listStyle}>
        {notes
          .filter((note) => selectedPatient === 'all' || note.patient.toLowerCase().includes(selectedPatient))
          .map((note) => (
            <div key={note.id} style={noteCardStyle}>
              <div style={noteHeaderStyle}>
                <div style={patientInfoStyle}>
                  <div style={avatarStyle}>
                    {note.patient.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={nameStyle}>{note.patient}</div>
                    <div style={dateStyle}>{note.date}</div>
                  </div>
                </div>
              </div>
              <p style={noteContentStyle}>{note.content}</p>
              <p style={doctorNameStyle}>— {note.doctor}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ClinicalNotes;