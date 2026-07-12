import React from 'react';

function Trips({ user }) {
  return (
    <div>
      <h2>Trip Dispatch Control Board</h2>
      <p>Schedule, dispatch, and track trips. Current User: {user.username} ({user.role})</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Route Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Vehicle</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Driver</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>t1</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>Route 42 - Downtown Express</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>v1 (TX-1234)</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>d2 (John Smith)</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>IN_PROGRESS</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>t2</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>Route 10 - Airport Shuttle</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>v3 (TX-8888)</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>d1 (Jane Doe)</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>SCHEDULED</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Trips;
