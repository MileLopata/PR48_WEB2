const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/Quiz`;
const QUESTION_API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/Question`;

export async function getAllQuizzes() {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) throw new Error('Failed to fetch quizzes');
    return response.json();
}

export async function createQuiz(quizData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(quizData),
    });
    if (!response.ok) {
        let errorMsg = 'Failed to create quiz';
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorData || errorMsg;
        } catch {
            errorMsg = await response.text();
        }
        throw new Error(errorMsg);
    }
    return response.json();
}

export async function updateQuiz(id, quizData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(quizData),
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update quiz');
    }
    return response.json();
}

export async function deleteQuiz(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
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
        throw new Error(responseBody || 'Failed to delete quiz');
    }
    return responseBody;
}

export async function getQuizById(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch quiz');
    }
    return response.json();
}

export async function getQuizQuestions(quizId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${QUESTION_API_URL}/quiz/${quizId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to fetch quiz questions');
    }
    
    const data = await response.json();
    console.log('Raw API response:', data); // DEBUG
    return data;
}