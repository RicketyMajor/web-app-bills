import { lazy, Suspense } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/templates/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';

// Route-level code splitting: each page ships in its own chunk.
const Login = lazy(() => import('../pages/Login').then((m) => ({ default: m.Login })));
const Home = lazy(() => import('../pages/Home').then((m) => ({ default: m.Home })));
const Categories = lazy(() => import('../pages/Categories').then((m) => ({ default: m.Categories })));
const Movements = lazy(() => import('../pages/Movements').then((m) => ({ default: m.Movements })));
const Reports = lazy(() => import('../pages/Reports').then((m) => ({ default: m.Reports })));
const Settings = lazy(() => import('../pages/Settings').then((m) => ({ default: m.Settings })));
const Privacy = lazy(() => import('../pages/Privacy').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('../pages/Terms').then((m) => ({ default: m.Terms })));

export function MyRoutes() {
    return (
        <BrowserRouter>
            <Suspense fallback={null}>
                <Routes>
                    <Route element={<PublicOnlyRoute />}>
                        <Route path="/login" element={<Login />} />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                        <Route element={<AppLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/movements" element={<Movements />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>
                    </Route>
                    {/* Public for everyone (Google OAuth consent screen links here) */}
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
