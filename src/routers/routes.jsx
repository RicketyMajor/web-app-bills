import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Home } from '../pages/Home';

export function MyRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </BrowserRouter>
    );
}