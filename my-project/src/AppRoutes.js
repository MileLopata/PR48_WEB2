import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import RegisterPage from "./pages/RegistrationPage";
import LoginPage from "./pages/LoginPage";
import AdminStartPage from "./pages/AdminStartPage";
import RegularUserStartPage from "./pages/RegularUserStartPage";
import QuizTakingPage from './pages/QuizTakingPage';
import QuizResultsPage from './pages/QuizResultsPage';
import MyResultsPage from './pages/MyResultsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import { isLoggedIn, getUserRole } from "./utils/auth";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import RoleProtectedRoute from "./components/routing/RoleProtectedRoute";

function RootRedirect() {
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }
    
    const role = getUserRole();
    if (role === 'ADMIN') {
        return <Navigate to="/admin-start" replace />;
    } else if (role === 'REGULAR') {
        return <Navigate to="/regular-user" replace />;
    } else {
        return <Navigate to="/login" replace />;
    }
}

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes for Regular Users */}
            <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                <Route path="/regular-user" element={<RegularUserStartPage />} />
                <Route path="/quiz/:quizId" element={<QuizTakingPage />} />
                <Route path="/quiz-results/:attemptId" element={<QuizResultsPage />} />
                <Route path="/my-results" element={<MyResultsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin-start" element={<AdminStartPage />} />
            </Route>
        </Routes>
    );
}