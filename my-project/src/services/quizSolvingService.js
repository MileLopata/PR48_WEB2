const API_URL = 'https://localhost:7042/api/QuizSolvingTry';

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