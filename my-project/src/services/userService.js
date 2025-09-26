const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/User`;

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


export const getProfilePicture = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/me/profile-picture`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch profile picture');
    }
    
    return response.blob();
};