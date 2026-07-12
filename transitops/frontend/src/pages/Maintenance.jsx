import React from 'react';

function Maintenance({ user }) {
  return (
    <div>
      <h2>Maintenance Tracking & Logging</h2>
      <p>Schedule repairs and track fleet health. Current User: {user.username} ({user.role})</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Log ID</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Vehicle</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Service Type</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Description</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Cost</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>m1</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>v2 (TX-9012)</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>Routine</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>Oil change and tire rotation</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>$150</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>IN_PROGRESS</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Maintenance;
