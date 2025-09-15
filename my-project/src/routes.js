import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import RegisterPage from "./pages/RegistrationPage";
import LoginPage from "./pages/LoginPage";
import AdminStartPage from "./pages/AdminStartPage";
import RegularUserStartPage from "./pages/RegularUserStartPage";
import QuizTakingPage from './pages/QuizTakingPage';
import QuizResultsPage from './pages/QuizResultsPage';
import MyResultsPage from './pages/MyResultsPage';
import LeaderboardPage from './pages/LeaderboardPage';
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
                <Route path="/regular-user" element={<ProtectedRoute><RegularUserStartPage /></ProtectedRoute>} />
            </Route>

            {/* Protected route for admin users only */}
            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'Admin']} />}>
                <Route path="/admin-start" element={<AdminStartPage />} />
            </Route>

            {/* Protected route for quiz taking */}
            <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizTakingPage /></ProtectedRoute>} />
            
            {/* Protected route for quiz results */}
            <Route path="/quiz-results/:attemptId" element={<ProtectedRoute><QuizResultsPage /></ProtectedRoute>} />

            {/* Protected route for my results */}
            <Route path="/my-results" element={<ProtectedRoute><MyResultsPage /></ProtectedRoute>} />

            {/* Protected route for leaderboard */}
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
        </Routes>
    );
}
