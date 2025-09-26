const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/QuizSolvingTry`;

export async function createQuizAttempt(attemptData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(attemptData)
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to submit quiz attempt');
    }
    
    return response.json();
}

export async function getQuizAttempt(attemptId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${attemptId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to fetch quiz attempt');
    }
    
    return response.json();
}

export async function getUserAttempts() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/leaderboard/me`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to fetch user attempts');
    }
    
    return response.json();
}

export async function getQuizLeaderboard(quizId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/leaderboard/${quizId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to fetch quiz leaderboard');
    }
    
    return response.json();
}

export async function getAllQuizResults() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/all-results`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to fetch all quiz results');
    }
    
    return response.json();
}