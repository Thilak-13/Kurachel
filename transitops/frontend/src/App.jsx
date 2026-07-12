import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Login from './pages/Login';
import FuelLogs from './pages/FuelLogs';
import Expenses from './pages/Expenses';

function ProtectedRoute({ isAuthenticated, user, allowedRoles, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('transitops_auth') === 'true';
  });
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('transitops_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { username: 'admin_user', role: 'Admin', email: 'admin@transitops.com' };
      }
    }
    return { username: 'admin_user', role: 'Admin', email: 'admin@transitops.com' };
  });

  useEffect(() => {
    localStorage.setItem('transitops_auth', isAuthenticated);
    if (user) {
      localStorage.setItem('transitops_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('transitops_user');
    }
  }, [isAuthenticated, user]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login setUser={setUser} setIsAuthenticated={setIsAuthenticated} />
            )
          } 
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user}>
              <MainLayout user={user} setUser={setUser} setIsAuthenticated={setIsAuthenticated}>
                <Dashboard user={user} />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user}>
              <MainLayout user={user} setUser={setUser} setIsAuthenticated={setIsAuthenticated}>
                <Vehicles user={user} />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/drivers"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              user={user} 
              allowedRoles={['Admin', 'Fleet Manager', 'Dispatcher']}
            >
              <MainLayout user={user} setUser={setUser} setIsAuthenticated={setIsAuthenticated}>
                <Drivers user={user} />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              user={user} 
              allowedRoles={['Admin', 'Dispatcher']}
            >
              <MainLayout user={user} setUser={setUser} setIsAuthenticated={setIsAuthenticated}>
                <Trips user={user} />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              user={user} 
              allowedRoles={['Admin', 'Dispatcher', 'Maintenance Manager']}
            >
              <MainLayout user={user} setUser={setUser} setIsAuthenticated={setIsAuthenticated}>
                <Maintenance user={user} />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fuel"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              user={user} 
              allowedRoles={['Admin', 'Fleet Manager', 'Dispatcher', 'Maintenance Manager']}
            >
              <MainLayout user={user} setUser={setUser} setIsAuthenticated={setIsAuthenticated}>
                <FuelLogs user={user} />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              user={user} 
              allowedRoles={['Admin', 'Fleet Manager', 'Dispatcher']}
            >
              <MainLayout user={user} setUser={setUser} setIsAuthenticated={setIsAuthenticated}>
                <Expenses user={user} />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              user={user} 
              allowedRoles={['Admin', 'Fleet Manager', 'Maintenance Manager']}
            >
              <MainLayout user={user} setUser={setUser} setIsAuthenticated={setIsAuthenticated}>
                <Reports user={user} />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all Route redirects to Login or Dashboard */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
