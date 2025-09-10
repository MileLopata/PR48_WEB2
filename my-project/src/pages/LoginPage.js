// src/pages/LoginPage.js

import React, { useState } from 'react';
import { login } from '../services/authentificationService';
import { useNavigate } from 'react-router-dom';

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
            // Redirect based on user role
            if (data.role === 'admin' || data.role === 'Admin') {
                navigate('/admin-start');
            } else {
                navigate('/regular-start');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Email or Username"
                    value={emailOrUsername}
                    onChange={e => setEmailOrUsername(e.target.value)}
                    required
                /><br />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                /><br />
                <button type="submit">Login</button>
            </form>
            {error && <div style={{color: 'red'}}>{error}</div>}
            <p>
                Don't have an account?{' '}
                <button onClick={() => navigate('/register')}>Register</button>
            </p>
        </div>
    );
}
