import { jwtDecode } from "jwt-decode";

export function getUserRole() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
    } catch {
        return null;
    }
}

export function getUserName() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded.name || null;
    } catch {
        return null;
    }
}

export function isLoggedIn() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}