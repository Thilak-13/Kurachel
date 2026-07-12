import React from 'react';

function Drivers({ user }) {
  return (
    <div>
      <h2>Driver Directory</h2>
      <p>View and manage driver states. Current User: {user.username} ({user.role})</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>License</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>d1</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>Jane Doe</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>DL-987654</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>ACTIVE</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>d2</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>John Smith</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>DL-123456</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>ON_TRIP</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Drivers;
