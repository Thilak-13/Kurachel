import React from 'react';

function Login({ user, setUser }) {
  const handleRoleChange = (role) => {
    setUser({
      username: `${role.toLowerCase()}_user`,
      role: role
    });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Simulate User Login</h2>
      <p>Select a role to test role-based access control (RBAC):</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        <button 
          onClick={() => handleRoleChange('ADMIN')}
          style={{ padding: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: user.role === 'ADMIN' ? 'bold' : 'normal' }}
        >
          Login as ADMIN
        </button>
        <button 
          onClick={() => handleRoleChange('DISPATCHER')}
          style={{ padding: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: user.role === 'DISPATCHER' ? 'bold' : 'normal' }}
        >
          Login as DISPATCHER
        </button>
        <button 
          onClick={() => handleRoleChange('DRIVER')}
          style={{ padding: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: user.role === 'DRIVER' ? 'bold' : 'normal' }}
        >
          Login as DRIVER
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Current active session: <strong>{user.username}</strong> ({user.role})</p>
      </div>
    </div>
  );
}

export default Login;
