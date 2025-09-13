const API_URL = 'https://localhost:7042/api/Quiz';

export async function getQuizQuestions(quizId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${quizId}/questions`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch questions');
    }
    const data = await response.json();
    console.log('Raw API response:', data); // Add this line
    return data;
}

export async function createQuestion(quizId, questionData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${quizId}/questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(questionData)
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create question');
    }
    return response.json();
}

export async function updateQuestion(quizId, questionId, questionData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${quizId}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(questionData)
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update question');
    }
    return response.json();
}

export async function deleteQuestion(quizId, questionId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${quizId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const contentType = response.headers.get('content-type');
    let responseBody;
    if (contentType && contentType.includes('application/json')) {
        responseBody = await response.json();
    } else {
        responseBody = await response.text();
    }

    if (!response.ok) {
        throw new Error(responseBody || 'Failed to delete question');
    }
    return responseBody;
}