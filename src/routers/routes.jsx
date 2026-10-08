import { lazy, Suspense } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/templates/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { Splash } from '../components/molecules/Splash';

// Route-level code splitting: each page ships in its own chunk.
const Login = lazy(() => import('../pages/Login').then((m) => ({ default: m.Login })));
// ponytail: "/" is the PWA start_url, so fetch Home's chunks while the session resolves
// (logged-out visitors download ~25 KB they don't use; route-aware prefetch if that matters)
const homePage = import('../pages/Home');
const Home = lazy(() => homePage.then((m) => ({ default: m.Home })));
const Categories = lazy(() => import('../pages/Categories').then((m) => ({ default: m.Categories })));
const Budgets = lazy(() => import('../pages/Budgets').then((m) => ({ default: m.Budgets })));
const Movements = lazy(() => import('../pages/Movements').then((m) => ({ default: m.Movements })));
const Reports = lazy(() => import('../pages/Reports').then((m) => ({ default: m.Reports })));
const Goals = lazy(() => import('../pages/Goals').then((m) => ({ default: m.Goals })));
const Settings = lazy(() => import('../pages/Settings').then((m) => ({ default: m.Settings })));
const Privacy = lazy(() => import('../pages/Privacy').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('../pages/Terms').then((m) => ({ default: m.Terms })));

export function MyRoutes() {
    return (
        <BrowserRouter>
            <Suspense fallback={<Splash />}>
                <Routes>
                    <Route element={<PublicOnlyRoute />}>
                        <Route path="/login" element={<Login />} />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                        <Route element={<AppLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/budgets" element={<Budgets />} />
                            <Route path="/movements" element={<Movements />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/goals" element={<Goals />} />
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
