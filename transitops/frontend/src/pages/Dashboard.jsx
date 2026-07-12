import React from 'react';

function Dashboard({ user }) {
  return (
    <div>
      <h2>Dashboard Overview</h2>
      <p>Welcome, <strong>{user.username}</strong>. Role: <em>{user.role}</em></p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Vehicles</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>12 Active</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Drivers</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>8 Active</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Trips Today</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>34 Scheduled</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>In Maintenance</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>2 Vehicles</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
