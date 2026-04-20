import React, { useState } from 'react';

const CarePlans = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const containerStyle = {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#831843',
    marginBottom: '30px',
  };

  const filterContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
  };

  const filterButtonStyle = (isActive) => ({
    padding: '10px 20px',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    backgroundColor: isActive ? '#DB2777' : '#ffffff',
    color: isActive ? '#ffffff' : '#9D174D',
    border: 'none',
    cursor: 'pointer',
  });

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(131, 24, 67, 0.1)',
  };

  const cardHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  };

  const patientNameStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#831843',
  };

  const badgeStyle = (priority) => {
    const colors = {
      high: { bg: '#FEE2E2', color: '#991B1B' },
      medium: { bg: '#FEF3C7', color: '#92400E' },
      low: { bg: '#D1FAE5', color: '#065F46' },
    };
    return {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: colors[priority].bg,
      color: colors[priority].color,
    };
  };

  const planCountStyle = {
    fontSize: '14px',
    color: '#9D174D',
    marginBottom: '15px',
  };

  const summaryStyle = {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
  };

  const viewButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#DB2777',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '15px',
  };

  const carePlans = [
    { id: 1, patient: 'Maria Garcia', priority: 'high', count: 3, summary: 'Active chemotherapy treatment with regular monitoring' },
    { id: 2, patient: 'Jennifer Smith', priority: 'medium', count: 2, summary: 'Post-treatment recovery plan with lifestyle modifications' },
    { id: 3, patient: 'Emily Johnson', priority: 'low', count: 4, summary: 'Preventive care plan with regular follow-ups' },
    { id: 4, patient: 'Sarah Williams', priority: 'high', count: 3, summary: 'Intensive treatment plan with multiple specialists' },
    { id: 5, patient: 'Lisa Brown', priority: 'medium', count: 2, summary: 'Recovery and rehabilitation plan' },
    { id: 6, patient: 'Amanda Davis', priority: 'low', count: 1, summary: 'Maintenance plan with quarterly checkups' },
  ];

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Care Plans</h1>

      <div style={filterContainerStyle}>
        {['all', 'high', 'medium', 'low'].map((filter) => (
          <button
            key={filter}
            style={filterButtonStyle(activeFilter === filter)}
            onClick={() => setActiveFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <div style={gridStyle}>
        {carePlans
          .filter((plan) => activeFilter === 'all' || plan.priority === activeFilter)
          .map((plan) => (
            <div key={plan.id} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <span style={patientNameStyle}>{plan.patient}</span>
                <span style={badgeStyle(plan.priority)}>{plan.priority.toUpperCase()}</span>
              </div>
              <p style={planCountStyle}>{plan.count} recommendations</p>
              <p style={summaryStyle}>{plan.summary}</p>
              <button style={viewButtonStyle}>View Full Plan</button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CarePlans;