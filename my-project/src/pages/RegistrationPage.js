// src/pages/RegisterPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authentificationService';
import '../styles/RegistrationPageStyle.css';

export default function RegisterPage() {
    // Remove any existing token when visiting registration page
    localStorage.removeItem('token');

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !username || !password || !profilePicture) {
            setError('All fields are required, including profile picture.');
            return;
        }
        try {
            const result = await register({ username, email, password, profilePicture });
            if (result.token) {
                // Do NOT log in immediately, redirect to login page instead
                navigate('/login');
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch (err) {
            setError(err.message || 'Network error');
        }
    };

    return (
        <div className="registration-bg">
            <div className="registration-container">
                <h2>Register</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setProfilePicture(e.target.files[0])}
                        required
                    />
                    <button type="submit" className="register-btn">Register</button>
                </form>
                <button
                    type="button"
                    className="register-btn"
                    style={{ marginTop: '18px', background: '#1976d2', color: '#ff9800' }}
                    onClick={() => navigate('/login')}
                >
                    Back to Login
                </button>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
}
