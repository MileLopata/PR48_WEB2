// src/services/authService.js

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/Authentification`;

export async function login({ emailOrUsername, password }) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
    }
    return response.json();
}

export async function register({ username, email, password, profilePicture }) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    if (profilePicture) formData.append('profilePicture', profilePicture);

    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
    }
    return response.json();
}
