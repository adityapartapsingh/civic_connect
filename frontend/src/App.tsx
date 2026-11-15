import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CitizenLayout } from './components/layout/CitizenLayout';
import { OfficerLayout } from './components/layout/OfficerLayout';
import { WardAdminLayout } from './components/layout/WardAdminLayout';
import { SuperAdminLayout } from './components/layout/SuperAdminLayout';
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
          {/* ============================================================== */}
          {/* 1. CITIZEN COMMUNITY PUBLIC PORTAL                             */}
          {/* ============================================================== */}
          <Route element={<CitizenLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <ReportPage />
                </ProtectedRoute>
              }
            />
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
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ============================================================== */}
          {/* 2. AUTHENTICATION & LOGIN (STANDALONE CANVAS)                  */}
          {/* ============================================================== */}
          <Route path="/login" element={<div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4"><LoginPage /></div>} />
          <Route path="/signup" element={<div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4"><LoginPage /></div>} />
          <Route path="/register" element={<div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4"><LoginPage /></div>} />
          <Route path="/admin" element={<Navigate to="/login?portal=staff" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login?portal=staff" replace />} />
          <Route path="/ward-admin" element={<Navigate to="/login?portal=staff" replace />} />
          <Route path="/staff-portal" element={<Navigate to="/login?portal=staff" replace />} />
          <Route
            path="/update/:token"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <PublicUpdatePage />
              </Suspense>
            }
          />

          {/* ============================================================== */}
          {/* 3. FIELD OFFICER WORKSTATION (RUGGED ON-SITE UTILITY)          */}
          {/* ============================================================== */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['officer', 'admin', 'super_admin']}>
                <OfficerLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route path="/officer-portal" element={<Navigate to="/dashboard" replace />} />
            <Route path="/officer" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* ============================================================== */}
          {/* 4. MUNICIPAL WARD ADMIN TACTICAL CONSOLE (ZONAL DISPATCH)      */}
          {/* ============================================================== */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <WardAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/admin-portal"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AdminPortalPage />
                </Suspense>
              }
            />
            <Route path="/ward-console" element={<Navigate to="/admin-portal" replace />} />
          </Route>

          {/* ============================================================== */}
          {/* 5. SUPER ADMIN ROOT GOVERNANCE (EXECUTIVE COMMAND TERMINAL)    */}
          {/* ============================================================== */}
          <Route element={<SuperAdminLayout />}>
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
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
