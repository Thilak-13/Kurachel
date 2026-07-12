import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';

// ── Lazy-loaded pages ─────────────────────────────
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const Vehicles    = lazy(() => import('./pages/Vehicles'));
const Drivers     = lazy(() => import('./pages/Drivers'));
const Trips       = lazy(() => import('./pages/Trips'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Reports     = lazy(() => import('./pages/Reports'));
const Login       = lazy(() => import('./pages/Login'));
const FuelLogs    = lazy(() => import('./pages/FuelLogs'));
const Expenses    = lazy(() => import('./pages/Expenses'));

// ── Page loading fallback ─────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

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

  // Shared layout wrapper
  const withLayout = (Component, allowedRoles) => (
    <ProtectedRoute isAuthenticated={isAuthenticated} user={user} allowedRoles={allowedRoles}>
      <MainLayout user={user} setUser={setUser} setIsAuthenticated={setIsAuthenticated}>
        <Suspense fallback={<PageLoader />}>
          <Component user={user} />
        </Suspense>
      </MainLayout>
    </ProtectedRoute>
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Suspense fallback={<PageLoader />}>
                <Login setUser={setUser} setIsAuthenticated={setIsAuthenticated} />
              </Suspense>
            )
          }
        />

        {/* Protected */}
        <Route path="/dashboard"   element={withLayout(Dashboard)} />
        <Route path="/vehicles"    element={withLayout(Vehicles)} />
        <Route path="/drivers"     element={withLayout(Drivers,     ['Admin', 'Fleet Manager', 'Dispatcher'])} />
        <Route path="/trips"       element={withLayout(Trips,       ['Admin', 'Dispatcher'])} />
        <Route path="/maintenance" element={withLayout(Maintenance, ['Admin', 'Dispatcher', 'Maintenance Manager'])} />
        <Route path="/fuel"        element={withLayout(FuelLogs,    ['Admin', 'Fleet Manager', 'Dispatcher', 'Maintenance Manager'])} />
        <Route path="/expenses"    element={withLayout(Expenses,    ['Admin', 'Fleet Manager', 'Dispatcher'])} />
        <Route path="/reports"     element={withLayout(Reports,     ['Admin', 'Fleet Manager', 'Maintenance Manager'])} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
