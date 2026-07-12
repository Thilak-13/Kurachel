import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Login from './pages/Login';

function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [user, setUser] = useState({ username: 'Guest', role: 'ADMIN' });

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard user={user} />;
      case 'Vehicles':
        return <Vehicles user={user} />;
      case 'Drivers':
        return <Drivers user={user} />;
      case 'Trips':
        return <Trips user={user} />;
      case 'Maintenance':
        return <Maintenance user={user} />;
      case 'Reports':
        return <Reports user={user} />;
      case 'Login':
        return <Login user={user} setUser={setUser} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="app-container" style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h1>TransitOps Portal</h1>
        <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {['Dashboard', 'Vehicles', 'Drivers', 'Trips', 'Maintenance', 'Reports', 'Login'].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                fontWeight: currentPage === page ? 'bold' : 'normal',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              {page}
            </button>
          ))}
          <span style={{ marginLeft: '20px', padding: '5px 10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            {user.username} ({user.role})
          </span>
        </nav>
      </header>
      <main style={{ marginTop: '20px' }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
