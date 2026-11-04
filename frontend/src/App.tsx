import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { ReportPage } from './pages/ReportPage';
import { TicketPage } from './pages/TicketPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Route-level code splitting for heavy interactive sub-applications
const MapPage = lazy(() => import('./pages/MapPage').then((m) => ({ default: m.MapPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const PublicUpdatePage = lazy(() => import('./pages/PublicUpdatePage').then((m) => ({ default: m.PublicUpdatePage })));
const ConfirmResolutionPage = lazy(() => import('./pages/ConfirmResolutionPage').then((m) => ({ default: m.ConfirmResolutionPage })));
const RewardsPage = lazy(() => import('./pages/RewardsPage').then((m) => ({ default: m.RewardsPage })));
const AdminPortalPage = lazy(() => import('./pages/AdminPortalPage').then((m) => ({ default: m.AdminPortalPage })));
const SuperAdminPortalPage = lazy(() => import('./pages/SuperAdminPortalPage').then((m) => ({ default: m.SuperAdminPortalPage })));
const VolunteersPage = lazy(() => import('./pages/VolunteersPage').then((m) => ({ default: m.VolunteersPage })));

const RouteLoadingFallback: React.FC = () => (
  <div className="py-24 flex flex-col items-center justify-center text-center">
    <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-3" />
    <span className="text-xs font-mono text-slate-500">Loading Municipal Module...</span>
  </div>
);

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/tickets/:id" element={<TicketPage />} />
            <Route
              path="/tickets/:id/confirm"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ConfirmResolutionPage />
                </Suspense>
              }
            />
            <Route
              path="/map"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <MapPage />
                </Suspense>
              }
            />
            <Route
              path="/rewards"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <RewardsPage />
                </Suspense>
              }
            />
            <Route
              path="/volunteers"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <VolunteersPage />
                </Suspense>
              }
            />
            {/* Super Admin Dedicated Portal (Single Unified URL: /super-admin) */}
            <Route
              path="/super-admin"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SuperAdminPortalPage />
                </Suspense>
              }
            />
            <Route path="/super-admin-portal" element={<Navigate to="/super-admin" replace />} />
            <Route path="/super-admin/login" element={<Navigate to="/super-admin" replace />} />

            {/* Municipal Corporation Ward Admin Dedicated Portal (Protected - Login via /login) */}
            <Route
              path="/admin-portal"
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <AdminPortalPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Remove all other /admin, /ward-admin, /staff-portal login routes -> Redirect to /login */}
            <Route path="/admin" element={<Navigate to="/login" replace />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            <Route path="/ward-admin" element={<Navigate to="/login" replace />} />
            <Route path="/staff-portal" element={<Navigate to="/login" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['officer', 'admin', 'super_admin']}>
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <DashboardPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/update/:token"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <PublicUpdatePage />
                </Suspense>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
