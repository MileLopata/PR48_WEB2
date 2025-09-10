import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import RegisterPage from "./pages/RegistrationPage";
import LoginPage from "./pages/LoginPage";
import AdminStartPage from "./pages/AdminStartPage";
import RegularUserStartPage from "./pages/RegularUserStartPage";
import { isLoggedIn } from "./utils/auth";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import RoleProtectedRoute from "./components/routing/RoleProtectedRoute";

function RootRedirect() {
    return isLoggedIn() ? <Navigate to="/regular-start" replace /> : <Navigate to="/login" replace />;
}

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected route for regular users */}
            <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                <Route path="/regular-start" element={<RegularUserStartPage />} />
            </Route>

            {/* Protected route for admin users only */}
            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'Admin']} />}>
                <Route path="/admin-start" element={<AdminStartPage />} />
            </Route>
        </Routes>
    );
}
