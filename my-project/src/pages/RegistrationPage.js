// src/pages/RegisterPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authentificationService';
import '../styles/RegistrationPageStyle.css';

/**
 * @typedef {import('../models/auth').RegisterData} RegisterData
 */

export default function RegisterPage() {
    // Remove any existing token when visiting registration page
    localStorage.removeItem('token');

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        profilePicture: null
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state
    const navigate = useNavigate();

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        const { email, username, password, profilePicture } = formData;
        
        if (!email || !username || !password || !profilePicture) {
            setError('All fields are required, including profile picture.');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return false;
        }



        // Username validation
        if (username.length < 3) {
            setError('Username must be at least 3 characters long.');
            return false;
        }

        // File type validation
        if (profilePicture && !profilePicture.type.startsWith('image/')) {
            setError('Profile picture must be an image file.');
            return false;
        }

        // File size validation (5MB limit)
        if (profilePicture && profilePicture.size > 5 * 1024 * 1024) {
            setError('Profile picture must be smaller than 5MB.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return; // Prevent double submission
        
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            /** @type {RegisterData} */
            const registerData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                profilePicture: formData.profilePicture
            };

            const result = await register(registerData);
            
            if (result.token) {
                // Show success message before redirecting
                alert('Registration successful! Please log in with your credentials.');
                navigate('/login');
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
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
                        value={formData.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                        disabled={isSubmitting}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Username (min 3 characters)"
                        value={formData.username}
                        onChange={e => handleInputChange('username', e.target.value)}
                        disabled={isSubmitting}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={e => handleInputChange('password', e.target.value)}
                        disabled={isSubmitting}
                        required
                    />
                    <div className="file-input-container">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleInputChange('profilePicture', e.target.files[0])}
                            disabled={isSubmitting}
                            required
                        />
                        {formData.profilePicture && (
                            <div className="file-info">
                                Selected: {formData.profilePicture.name}
                            </div>
                        )}
                    </div>
                    <button 
                        type="submit" 
                        className="register-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <button
                    type="button"
                    className="register-btn"
                    style={{ 
                        marginTop: '18px', 
                        background: '#1976d2', 
                        color: '#ff9800',
                        opacity: isSubmitting ? 0.5 : 1
                    }}
                    onClick={() => navigate('/login')}
                    disabled={isSubmitting}
                >
                    Back to Login
                </button>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
}
