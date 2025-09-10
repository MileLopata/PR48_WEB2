// src/pages/LoginPage.js

import React, { useState } from 'react';
import { login } from '../services/authentificationService';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../utils/auth';
import '../styles/LoginButtonStyle.css';
import '../styles/LoginPageStyle.css';

export default function LoginPage() {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await login({ emailOrUsername, password });
            localStorage.setItem('token', data.token);

            // Get user role using helper function
            const role = getUserRole();

            if (role === 'ADMIN' || role === 'Admin') {
                navigate('/admin-start');
            } else if (role === 'REGULAR' || role === 'Regular') {
                navigate('/regular-start');
            } else {
                setError('Unknown user role');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Email or Username"
                        value={emailOrUsername}
                        onChange={e => setEmailOrUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="login-btn">Login</button>
                </form>
                {error && <div className="error-message">{error}</div>}
                <p>
                    Don't have an account?{' '}
                    <button onClick={() => navigate('/register')} className="login-btn" style={{width: '60%', marginTop: '12px'}}>Register</button>
                </p>
            </div>
        </div>
    );
}
