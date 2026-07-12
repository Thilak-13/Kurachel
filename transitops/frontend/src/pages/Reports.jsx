import React from 'react';

function Reports({ user }) {
  return (
    <div>
      <h2>Operational Reports</h2>
      <p>Analyze performance and fleet metrics. Current User: {user.username} ({user.role})</p>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: '4px' }}>
        <h3>Monthly Highlights</h3>
        <ul>
          <li><strong>Fleet Uptime:</strong> 94.2%</li>
          <li><strong>Completed Trips:</strong> 1,120</li>
          <li><strong>Total Fuel Expenses:</strong> $3,450</li>
          <li><strong>Maintenance Downtime:</strong> 18 hours total</li>
        </ul>
      </div>
    </div>
  );
}

export default Reports;
