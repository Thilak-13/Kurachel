import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import {
  isAuthenticated as hasToken,
  getStoredUser,
  fetchProfile,
  clearSession,
  onUnauthorized,
} from './services/apiClient';

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
  // Role checks use the server-returned role only (see App state below).
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  // Session is restored ONLY when a real JWT exists. The user object is loaded
  // from stored login data and later re-verified against the backend.
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasToken());
  const [user, setUser] = useState(() => (hasToken() ? getStoredUser() : null));

  // Verify the stored session against the backend on startup. If the token is
  // missing or rejected, drop the session. The server-returned role is the
  // source of truth, so a user cannot become Admin by editing local storage.
  useEffect(() => {
    let cancelled = false;

    if (!hasToken()) {
      clearSession();
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    fetchProfile()
      .then((profileUser) => {
        if (cancelled) return;
        setUser(profileUser);
        setIsAuthenticated(true);
      })
      .catch(() => {
        // 401/invalid token clears the session inside the API client; make sure
        // React state follows for anything else (network errors keep session).
        if (cancelled) return;
        if (!hasToken()) {
          setIsAuthenticated(false);
          setUser(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // If any authenticated API call comes back unauthenticated, drop the session
  // and send the user back to login.
  useEffect(() => {
    onUnauthorized(() => {
      clearSession();
      setIsAuthenticated(false);
      setUser(null);
    });
    return () => onUnauthorized(null);
  }, []);

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

        {/* Protected — allowedRoles use the backend role names. */}
        <Route path="/dashboard"   element={withLayout(Dashboard)} />
        <Route path="/vehicles"    element={withLayout(Vehicles)} />
        <Route path="/drivers"     element={withLayout(Drivers,     ['ADMIN', 'FLEET_MANAGER', 'DISPATCHER'])} />
        <Route path="/trips"       element={withLayout(Trips,       ['ADMIN', 'DISPATCHER'])} />
        <Route path="/maintenance" element={withLayout(Maintenance, ['ADMIN', 'DISPATCHER', 'MAINTENANCE_MANAGER'])} />
        <Route path="/fuel"        element={withLayout(FuelLogs,    ['ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'MAINTENANCE_MANAGER'])} />
        <Route path="/expenses"    element={withLayout(Expenses,    ['ADMIN', 'FLEET_MANAGER', 'DISPATCHER'])} />
        <Route path="/reports"     element={withLayout(Reports,     ['ADMIN', 'FLEET_MANAGER', 'MAINTENANCE_MANAGER'])} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
