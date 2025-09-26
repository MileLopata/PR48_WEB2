import React, { useState } from 'react';
import { login } from '../services/authentificationService';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../utils/auth';
import { UserRoles } from '../models/auth'; 
import '../styles/LoginButtonStyle.css';
import '../styles/LoginPageStyle.css';

export default function LoginPage() {
    // Remove any existing token when visiting login page
    localStorage.removeItem('token');

    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: ''
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
        const { emailOrUsername, password } = formData;
        
        if (!emailOrUsername.trim()) {
            setError('Email or username is required.');
            return false;
        }

        if (!password) {
            setError('Password is required.');
            return false;
        }

        if (password.length < 3) {
            setError('Password is too short.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            const loginData = {
                emailOrUsername: formData.emailOrUsername,
                password: formData.password
            };

            console.log('Attempting login...');
            const data = await login(loginData);
            console.log('Login successful, storing token...');
            
            localStorage.setItem('token', data.token);
            
            // Force a small delay and re-check auth state
            setTimeout(() => {
                const role = getUserRole();
                
                console.log('After token storage:');
                console.log('- User role:', role);
                console.log('- Token exists:', !!localStorage.getItem('token'));
                

                
                if (role === UserRoles.ADMIN) {
                    console.log('Redirecting to admin dashboard');
                    navigate('/admin-start');
                } else if (role === UserRoles.REGULAR) {
                    console.log('Redirecting to user dashboard');
                    navigate('/regular-user');
                } else {
                    console.log('Unknown role, clearing auth and showing error');
                    localStorage.removeItem('token');
                    setError('Unknown user role. Please contact support.');
                    setIsSubmitting(false);
                }
            }, 200); // Increased delay to ensure localStorage is updated
            
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-container">
                <h2>Welcome Back</h2>
                <p className="login-subtitle">Sign in to your account</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Email or Username"
                            value={formData.emailOrUsername}
                            onChange={e => handleInputChange('emailOrUsername', e.target.value)}
                            disabled={isSubmitting}
                            required
                            autoComplete="username"
                        />
                    </div>
                    
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={e => handleInputChange('password', e.target.value)}
                            disabled={isSubmitting}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="login-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Login'}
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}
                
                <div className="login-footer">
                    <p>
                        Don't have an account?{' '}
                    </p>
                    <button 
                        onClick={() => navigate('/register')} 
                        className="login-btn register-redirect-btn" 
                        style={{
                            width: '60%', 
                            marginTop: '12px',
                            opacity: isSubmitting ? 0.5 : 1
                        }}
                        disabled={isSubmitting}
                    >
                        Create Account
                    </button>
                </div>
            </div>
        </div>
    );
}
