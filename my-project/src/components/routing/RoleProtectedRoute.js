import { Navigate, Outlet } from "react-router-dom";
import { getUserRole, isLoggedIn } from "../../utils/auth";

const RoleProtectedRoute = ({ allowedRoles }) => {
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }

    const userRole = getUserRole();
    if (!userRole || !allowedRoles.includes(userRole)) {
        return <Navigate to="/regular-start" replace />;
    }

    return <Outlet />;
};

export default RoleProtectedRoute;