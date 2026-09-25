import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Home } from '../pages/Home';
import { Categories } from '../pages/Categories';
import { Movements } from '../pages/Movements';
import { Reports } from '../pages/Reports';
import { AppLayout } from '../components/templates/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';

export function MyRoutes() {
    return (
        <BrowserRouter>
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
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
