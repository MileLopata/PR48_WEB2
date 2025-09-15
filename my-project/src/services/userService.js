const API_URL = 'https://localhost:7042/api/User';

export const getCurrentUser = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/me`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to fetch user data');
    }
    
    return response.json();
};