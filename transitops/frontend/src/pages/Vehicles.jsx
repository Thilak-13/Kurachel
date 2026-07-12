import React from 'react';

function Vehicles({ user }) {
  return (
    <div>
      <h2>Vehicle Roster</h2>
      <p>Manage and view your fleet. Current User: {user.username} ({user.role})</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>License Plate</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Model</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Odometer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>v1</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>TX-1234</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>Ford Transit</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>ACTIVE</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>45,000 mi</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>v2</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>TX-9012</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>Nissan NV200</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>IN_MAINTENANCE</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>22,500 mi</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Vehicles;
