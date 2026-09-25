import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Home } from '../pages/Home';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';

export function MyRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<Login />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Home />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
