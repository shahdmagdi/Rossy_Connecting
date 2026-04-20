import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('diagnosis');

  const [diagnosis, setDiagnosis] = useState({
    stage: '',
    tumorSize: '',
    lymphNode: '',
    metastasis: '',
    notes: '',
  });

  const [newNote, setNewNote] = useState('');
  const [newRecommendation, setNewRecommendation] = useState({
    title: '',
    description: '',
    category: 'treatment',
    priority: 'medium',
  });

  const containerStyle = {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const backButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'none',
    border: 'none',
    color: '#9D174D',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '20px',
    padding: '0',
  };

  const topInfoCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(131, 24, 67, 0.1)',
    marginBottom: '30px',
  };

  const topInfoHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  };

  const patientInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  };

  const avatarStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#FCE7F3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#831843',
    fontSize: '28px',
    fontWeight: '600',
  };

  const patientNameStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#831843',
    marginBottom: '8px',
  };

  const patientMetaStyle = {
    fontSize: '15px',
    color: '#9D174D',
    display: 'flex',
    gap: '20px',
  };

  const contactInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '14px',
    color: '#666',
  };

  const tabsContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '0',
    borderBottom: '2px solid #F9A8D4',
    paddingBottom: '0',
  };

  const tabStyle = (isActive) => ({
    padding: '14px 28px',
    borderRadius: '12px 12px 0 0',
    fontSize: '15px',
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#831843' : '#9D174D',
    backgroundColor: isActive ? '#ffffff' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '-2px',
  });

  const contentCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '0 16px 16px 16px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(131, 24, 67, 0.1)',
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#831843',
    marginBottom: '20px',
  };

  const filesListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '30px',
  };

  const fileItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    backgroundColor: '#FCE7F3',
    borderRadius: '10px',
  };

  const fileInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const fileIconStyle = {
    fontSize: '24px',
  };

  const fileNameStyle = {
    fontSize: '15px',
    fontWeight: '500',
    color: '#831843',
  };

  const fileDateStyle = {
    fontSize: '13px',
    color: '#9D174D',
  };

  const downloadButtonStyle = {
    padding: '8px 16px',
    backgroundColor: '#DB2777',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  };

  const aiResultsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginBottom: '30px',
  };

  const aiResultCardStyle = {
    backgroundColor: '#FCE7F3',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  };

  const aiLabelStyle = {
    fontSize: '13px',
    color: '#9D174D',
    marginBottom: '8px',
  };

  const aiValueStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#831843',
  };

  const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  };

  const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#831843',
  };

  const selectStyle = {
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #F9A8D4',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#831843',
  };

  const textareaStyle = {
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #F9A8D4',
    borderRadius: '8px',
    outline: 'none',
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
  };

  const saveButtonStyle = {
    padding: '14px 28px',
    backgroundColor: '#DB2777',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const cancelButtonStyle = {
    padding: '14px 28px',
    backgroundColor: 'transparent',
    color: '#9D174D',
    border: '2px solid #DB2777',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const notesListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px',
  };

  const noteCardStyle = {
    backgroundColor: '#FCE7F3',
    borderRadius: '12px',
    padding: '20px',
  };

  const noteHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  };

  const noteDoctorStyle = {
    fontSize: '15px',
    fontWeight: '600',
    color: '#831843',
  };

  const noteDateStyle = {
    fontSize: '13px',
    color: '#9D174D',
  };

  const noteContentStyle = {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
  };

  const addNoteStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  };

  const carePlanGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  };

  const recommendationCardStyle = {
    backgroundColor: '#FCE7F3',
    borderRadius: '12px',
    padding: '20px',
  };

  const recTitleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#831843',
    marginBottom: '10px',
  };

  const recDescStyle = {
    fontSize: '14px',
    color: '#666',
    marginBottom: '15px',
    lineHeight: '1.5',
  };

  const recMetaStyle = {
    display: 'flex',
    gap: '10px',
  };

  const categoryBadgeStyle = (category) => {
    const colors = {
      treatment: { bg: '#DBEAFE', color: '#1E40AF' },
      lifestyle: { bg: '#D1FAE5', color: '#065F46' },
      follow_up: { bg: '#FEF3C7', color: '#92400E' },
    };
    return {
      padding: '4px 10px',
      borderRadius: '15px',
      fontSize: '11px',
      fontWeight: '600',
      backgroundColor: colors[category]?.bg || colors.treatment.bg,
      color: colors[category]?.color || colors.treatment.color,
    };
  };

  const priorityBadgeStyle = (priority) => {
    const colors = {
      high: { bg: '#FEE2E2', color: '#991B1B' },
      medium: { bg: '#FEF3C7', color: '#92400E' },
      low: { bg: '#D1FAE5', color: '#065F46' },
    };
    return {
      padding: '4px 10px',
      borderRadius: '15px',
      fontSize: '11px',
      fontWeight: '600',
      backgroundColor: colors[priority]?.bg || colors.medium.bg,
      color: colors[priority]?.color || colors.medium.color,
    };
  };

  const patient = {
    name: 'Maria Garcia',
    age: 45,
    gender: 'Female',
    email: 'maria.garcia@email.com',
    phone: '+1 555-0123',
    lastVisit: '2024-01-15',
    diagnosis: 'Early-stage breast cancer',
  };

  const files = [
    { id: 1, name: 'Mammogram_001.jpg', date: '2024-01-15', type: 'image' },
    { id: 2, name: 'Blood_Test_Results.pdf', date: '2024-01-10', type: 'pdf' },
    { id: 3, name: 'Biopsy_Report.pdf', date: '2024-01-05', type: 'pdf' },
  ];

  const aiResults = {
    detection: 'Positive',
    stage: 'Stage II',
    tumorSize: '2.3 cm',
    confidence: '94%',
  };

  const notes = [
    { id: 1, doctor: 'Dr. Sarah Mitchell', date: '2024-01-15', content: 'Patient showed significant improvement in overall condition. Recommended continued monitoring and lifestyle modifications.' },
    { id: 2, doctor: 'Dr. John Anderson', date: '2024-01-10', content: 'Initial consultation completed. Discussed treatment options and answered patient questions.' },
  ];

  const recommendations = [
    { id: 1, title: 'Chemotherapy Session', description: 'Complete 6 cycles of adjuvant chemotherapy', category: 'treatment', priority: 'high' },
    { id: 2, title: 'Regular Exercise', description: '150 minutes of moderate aerobic activity per week', category: 'lifestyle', priority: 'medium' },
    { id: 3, title: 'Follow-up MRI', description: 'Schedule MRI scan in 3 months', category: 'follow_up', priority: 'medium' },
  ];

  const getCategoryLabel = (category) => {
    const labels = { treatment: 'Treatment', lifestyle: 'Lifestyle', follow_up: 'Follow-up' };
    return labels[category] || category;
  };

  const getPriorityLabel = (priority) => {
    const labels = { high: 'High', medium: 'Medium', low: 'Low' };
    return labels[priority] || priority;
  };

  return (
    <div style={containerStyle}>
      <button
        style={backButtonStyle}
        onClick={() => navigate('/doctor/patients')}
      >
        ← Back to Patients
      </button>

      {/* Top Info */}
      <div style={topInfoCardStyle}>
        <div style={topInfoHeaderStyle}>
          <div style={patientInfoStyle}>
            <div style={avatarStyle}>
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 style={patientNameStyle}>{patient.name}</h1>
              <div style={patientMetaStyle}>
                <span>{patient.age} years old</span>
                <span>{patient.gender}</span>
                <span>Last visit: {patient.lastVisit}</span>
              </div>
              <p style={{ ...patientMetaStyle, marginTop: '8px', fontWeight: '600' }}>
                Diagnosis: {patient.diagnosis}
              </p>
            </div>
          </div>
          <div style={contactInfoStyle}>
            <span>📧 {patient.email}</span>
            <span>📱 {patient.phone}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={tabsContainerStyle}>
        {['diagnosis', 'notes', 'care_plan'].map((tab) => (
          <button
            key={tab}
            style={tabStyle(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'diagnosis' ? 'Diagnosis' : tab === 'notes' ? 'Clinical Notes' : 'Care Plan'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={contentCardStyle}>
        {activeTab === 'diagnosis' && (
          <>
            <h2 style={sectionTitleStyle}>Uploaded Files</h2>
            <div style={filesListStyle}>
              {files.map((file) => (
                <div key={file.id} style={fileItemStyle}>
                  <div style={fileInfoStyle}>
                    <span style={fileIconStyle}>
                      {file.type === 'pdf' ? '📄' : '🖼️'}
                    </span>
                    <div>
                      <div style={fileNameStyle}>{file.name}</div>
                      <div style={fileDateStyle}>{file.date}</div>
                    </div>
                  </div>
                  <button style={downloadButtonStyle}>Download</button>
                </div>
              ))}
            </div>

            <h2 style={sectionTitleStyle}>AI Analysis Results</h2>
            <div style={aiResultsStyle}>
              <div style={aiResultCardStyle}>
                <div style={aiLabelStyle}>Detection</div>
                <div style={aiValueStyle}>{aiResults.detection}</div>
              </div>
              <div style={aiResultCardStyle}>
                <div style={aiLabelStyle}>Stage</div>
                <div style={aiValueStyle}>{aiResults.stage}</div>
              </div>
              <div style={aiResultCardStyle}>
                <div style={aiLabelStyle}>Tumor Size</div>
                <div style={aiValueStyle}>{aiResults.tumorSize}</div>
              </div>
              <div style={aiResultCardStyle}>
                <div style={aiLabelStyle}>Confidence</div>
                <div style={aiValueStyle}>{aiResults.confidence}</div>
              </div>
            </div>

            <h2 style={sectionTitleStyle}>Final Diagnosis</h2>
            <div style={formGridStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Cancer Stage *</label>
                <select
                  style={selectStyle}
                  value={diagnosis.stage}
                  onChange={(e) => setDiagnosis({ ...diagnosis, stage: e.target.value })}
                >
                  <option value="">Select stage</option>
                  <option value="stage_0">Stage 0</option>
                  <option value="stage_1">Stage I</option>
                  <option value="stage_2">Stage II</option>
                  <option value="stage_3">Stage III</option>
                  <option value="stage_4">Stage IV</option>
                </select>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Tumor Size (cm) *</label>
                <input
                  type="text"
                  placeholder="e.g., 2.5"
                  style={selectStyle}
                  value={diagnosis.tumorSize}
                  onChange={(e) => setDiagnosis({ ...diagnosis, tumorSize: e.target.value })}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Lymph Node Involvement *</label>
                <select
                  style={selectStyle}
                  value={diagnosis.lymphNode}
                  onChange={(e) => setDiagnosis({ ...diagnosis, lymphNode: e.target.value })}
                >
                  <option value="">Select status</option>
                  <option value="negative">Negative</option>
                  <option value="micrometastasis">Micrometastasis</option>
                  <option value="macrometastasis">Macrometastasis</option>
                </select>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Metastasis *</label>
                <select
                  style={selectStyle}
                  value={diagnosis.metastasis}
                  onChange={(e) => setDiagnosis({ ...diagnosis, metastasis: e.target.value })}
                >
                  <option value="">Select status</option>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
            <div style={{ ...formGroupStyle, marginTop: '20px' }}>
              <label style={labelStyle}>Notes</label>
              <textarea
                placeholder="Additional diagnosis notes..."
                style={textareaStyle}
                value={diagnosis.notes}
                onChange={(e) => setDiagnosis({ ...diagnosis, notes: e.target.value })}
              />
            </div>
            <div style={buttonGroupStyle}>
              <button style={saveButtonStyle}>Save Diagnosis</button>
              <button style={cancelButtonStyle}>Cancel</button>
            </div>
          </>
        )}

        {activeTab === 'notes' && (
          <>
            <h2 style={sectionTitleStyle}>Clinical Notes</h2>
            <div style={notesListStyle}>
              {notes.map((note) => (
                <div key={note.id} style={noteCardStyle}>
                  <div style={noteHeaderStyle}>
                    <span style={noteDoctorStyle}>{note.doctor}</span>
                    <span style={noteDateStyle}>{note.date}</span>
                  </div>
                  <p style={noteContentStyle}>{note.content}</p>
                </div>
              ))}
            </div>

            <h2 style={sectionTitleStyle}>Add Note</h2>
            <div style={addNoteStyle}>
              <textarea
                placeholder="Write your clinical note here..."
                style={textareaStyle}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button style={saveButtonStyle}>Add Note</button>
            </div>
          </>
        )}

        {activeTab === 'care_plan' && (
          <>
            <h2 style={sectionTitleStyle}>Care Plan Recommendations</h2>
            <div style={carePlanGridStyle}>
              {recommendations.map((rec) => (
                <div key={rec.id} style={recommendationCardStyle}>
                  <h3 style={recTitleStyle}>{rec.title}</h3>
                  <p style={recDescStyle}>{rec.description}</p>
                  <div style={recMetaStyle}>
                    <span style={categoryBadgeStyle(rec.category)}>{getCategoryLabel(rec.category)}</span>
                    <span style={priorityBadgeStyle(rec.priority)}>{getPriorityLabel(rec.priority)} Priority</span>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={sectionTitleStyle}>Add Recommendation</h2>
            <div style={formGridStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Title *</label>
                <input
                  type="text"
                  placeholder="Recommendation title"
                  style={selectStyle}
                  value={newRecommendation.title}
                  onChange={(e) => setNewRecommendation({ ...newRecommendation, title: e.target.value })}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Category *</label>
                <select
                  style={selectStyle}
                  value={newRecommendation.category}
                  onChange={(e) => setNewRecommendation({ ...newRecommendation, category: e.target.value })}
                >
                  <option value="treatment">Treatment</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="follow_up">Follow-up</option>
                </select>
              </div>
            </div>
            <div style={{ ...formGroupStyle, marginTop: '20px' }}>
              <label style={labelStyle}>Description *</label>
              <textarea
                placeholder="Recommendation description..."
                style={textareaStyle}
                value={newRecommendation.description}
                onChange={(e) => setNewRecommendation({ ...newRecommendation, description: e.target.value })}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Priority *</label>
              <select
                style={selectStyle}
                value={newRecommendation.priority}
                onChange={(e) => setNewRecommendation({ ...newRecommendation, priority: e.target.value })}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div style={buttonGroupStyle}>
              <button style={saveButtonStyle}>Add Recommendation</button>
              <button style={cancelButtonStyle}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;