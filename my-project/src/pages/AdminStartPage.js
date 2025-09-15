import React, { useEffect, useState } from 'react';
import { getAllQuizzes, createQuiz, updateQuiz, deleteQuiz } from '../services/quizService';
import { createQuestion, getQuizQuestions, updateQuestion, deleteQuestion } from '../services/questionService';import { QuizLevelNames, QuizSubjectNames } from '../models/quiz';
import { getAllQuizResults } from '../services/quizSolvingService';
import '../styles/AdminStartPageStyle.css'; 
import { useNavigate } from 'react-router-dom';

function AdminStartPage() {
    const [quizzes, setQuizzes] = useState([]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        levelOfDifficulty: 1,
        subjects: [],
        timeLimit: '00:30:00'
    });
    const [error, setError] = useState('');
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState(null);
    const [questionForm, setQuestionForm] = useState({
        text: '',
        points: 1,
        type: 'MULTIPLE_CHOICE_ONE_CORRECT',
        answerOptions: [
            { text: '', isCorrect: false, fillInTheBlankCorrectAnswer: null }
        ]
    });
    const [viewingQuestions, setViewingQuestions] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [editQuestionForm, setEditQuestionForm] = useState({
    text: '',
    points: 1,
    type: 'MULTIPLE_CHOICE_ONE_CORRECT',
    answerOptions: []
});
    const [viewingResults, setViewingResults] = useState(false);
    const [allResults, setAllResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    async function fetchQuizzes() {
        try {
            const data = await getAllQuizzes();
            setQuizzes(data.data || data);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        try {
            await createQuiz({
                Title: form.title,
                Description: form.description,
                LevelOfDifficulty: form.levelOfDifficulty,
                Subjects: form.subjects,
                TimeLimit: form.timeLimit
            });
            setForm({
                title: '',
                description: '',
                levelOfDifficulty: 1,
                subjects: [],
                timeLimit: '00:30:00'
            });
            fetchQuizzes();
        } catch (err) {
            if (
                err.message.includes('duplicate') ||
                err.message.includes('constraint') ||
                err.message.includes('entity changes')
            ) {
                setError('You cannot assign the same subject to a quiz more than once.');
            } else {
                setError(err.message);
            }
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function handleSubjectsChange(e) {
        const options = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
        setForm(prev => ({
            ...prev,
            subjects: options
        }));
    }

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        try {
            // Prepare answer options based on question type
            let answerOptions = [];
            
            if (questionForm.type === 'TRUE_FALSE') {
                // Ensure we always have True and False options with proper text
                const trueOption = questionForm.answerOptions.find(opt => opt.text === 'True') || { text: 'True', isCorrect: false };
                const falseOption = questionForm.answerOptions.find(opt => opt.text === 'False') || { text: 'False', isCorrect: false };
                
                answerOptions = [
                    {
                        Text: 'True',
                        IsCorrect: trueOption.isCorrect,
                        FillInTheBlankCorrectAnswer: null
                    },
                    {
                        Text: 'False', 
                        IsCorrect: falseOption.isCorrect,
                        FillInTheBlankCorrectAnswer: null
                    }
                ];
            } else if (questionForm.type === 'FILL_IN_THE_BLANK') {
                answerOptions = [{
                    Text: '',
                    IsCorrect: null,
                    FillInTheBlankCorrectAnswer: questionForm.answerOptions[0]?.fillInTheBlankCorrectAnswer
                }];
            } else {
                // Multiple choice
                answerOptions = questionForm.answerOptions.map(option => ({
                    Text: option.text,
                    IsCorrect: option.isCorrect,
                    FillInTheBlankCorrectAnswer: null
                }));
            }

            await createQuestion(selectedQuizForQuestions.Id || selectedQuizForQuestions.id, {
                Text: questionForm.text,
                Points: parseFloat(questionForm.points),
                Type: questionForm.type,
                AnswerOptions: answerOptions
            });
            
            // Reset form
            setQuestionForm({
                text: '',
                points: 1,
                type: 'MULTIPLE_CHOICE_ONE_CORRECT',
                answerOptions: [
                    { text: '', isCorrect: false, fillInTheBlankCorrectAnswer: null }
                ]
            });
            
            // Close the question form
            setSelectedQuizForQuestions(null);
            
            // Refresh quiz list to update question count
            fetchQuizzes();
            
            alert('Question added successfully!');
        } catch (err) {
            setError('Failed to create question: ' + err.message);
        }
    };

    const addAnswerOption = () => {
        setQuestionForm(prev => ({
            ...prev,
            answerOptions: [
                ...prev.answerOptions,
                { text: '', isCorrect: false, fillInTheBlankCorrectAnswer: null }
            ]
        }));
    };

    const removeAnswerOption = (index) => {
        setQuestionForm(prev => ({
            ...prev,
            answerOptions: prev.answerOptions.filter((_, i) => i !== index)
        }));
    };

    const updateAnswerOption = (index, field, value) => {
        setQuestionForm(prev => ({
            ...prev,
            answerOptions: prev.answerOptions.map((option, i) => 
                i === index ? { ...option, [field]: value } : option
            )
        }));
    };

    const fetchQuestions = async (quizId) => {
        try {
            const data = await getQuizQuestions(quizId);
            console.log('Questions data received:', data); // Add this line
            setQuestions(data || []);
        } catch (err) {
            setError('Failed to fetch questions: ' + err.message);
            setQuestions([]);
        }
    };

    const startEditingQuestion = (question) => {
        console.log('Original question points:', question.Points || question.points); // Debug log
        setEditingQuestion(question);
        setEditQuestionForm({
            text: question.Text || question.text,
            points: parseFloat(question.Points || question.points) || 1, // Ensure it's a number
            type: question.Type || question.type,
            answerOptions: (question.AnswerOptions || question.answerOptions || []).map(option => ({
                id: option.Id || option.id,
                text: option.Text || option.text || '',
                isCorrect: option.IsCorrect ?? option.isCorrect ?? false,
                fillInTheBlankCorrectAnswer: option.FillInTheBlankCorrectAnswer || option.fillInTheBlankCorrectAnswer || null
            }))
        });
    };

    const handleEditQuestionSubmit = async (e) => {
        e.preventDefault();
        try {
            // Debug logging
            console.log('Edit form points:', editQuestionForm.points);
            console.log('Parsed points:', parseFloat(editQuestionForm.points));
            
            // Prepare answer options based on question type
            let answerOptions = [];
            
            if (editQuestionForm.type === 'TRUE_FALSE') {
                answerOptions = editQuestionForm.answerOptions.map(option => ({
                    Id: option.id || 0,
                    Text: option.text,
                    IsCorrect: option.isCorrect,
                    FillInTheBlankCorrectAnswer: null
                }));
            } else if (editQuestionForm.type === 'FILL_IN_THE_BLANK') {
                answerOptions = [{
                    Id: editQuestionForm.answerOptions[0]?.id || 0,
                    Text: '',
                    IsCorrect: null,
                    FillInTheBlankCorrectAnswer: editQuestionForm.answerOptions[0]?.fillInTheBlankCorrectAnswer
                }];
            } else {
                // Multiple choice
                answerOptions = editQuestionForm.answerOptions.map(option => ({
                    Id: option.id || 0,
                    Text: option.text,
                    IsCorrect: option.isCorrect,
                    FillInTheBlankCorrectAnswer: null
                }));
            }

            const payload = {
                Text: editQuestionForm.text,
                Points: parseFloat(editQuestionForm.points),
                Type: editQuestionForm.type,
                AnswerOptions: answerOptions
            };
            
            console.log('Update payload:', payload); // Add this line

            await updateQuestion(
                viewingQuestions.Id || viewingQuestions.id,
                editingQuestion.Id || editingQuestion.id,
                payload
            );
            
            // Close edit form and refresh questions
            setEditingQuestion(null);
            setEditQuestionForm({
                text: '',
                points: 1,
                type: 'MULTIPLE_CHOICE_ONE_CORRECT',
                answerOptions: []
            });
            
            // Refresh questions list
            fetchQuestions(viewingQuestions.Id || viewingQuestions.id);
            
            alert('Question updated successfully!');
        } catch (err) {
            setError('Failed to update question: ' + err.message);
        }
    };

    const updateEditAnswerOption = (index, field, value) => {
        setEditQuestionForm(prev => {
            if (field === 'isCorrect' && prev.type === 'MULTIPLE_CHOICE_ONE_CORRECT' && value === true) {
                // For single correct answer, uncheck all others when one is checked
                return {
                    ...prev,
                    answerOptions: prev.answerOptions.map((option, i) => ({
                        ...option,
                        isCorrect: i === index ? true : false
                    }))
                };
            } else {
                // For other fields or multiple correct answers
                return {
                    ...prev,
                    answerOptions: prev.answerOptions.map((option, i) => 
                        i === index ? { ...option, [field]: value } : option
                    )
                };
            }
        });
    };

    const addEditAnswerOption = () => {
        setEditQuestionForm(prev => ({
            ...prev,
            answerOptions: [
                ...prev.answerOptions,
                { id: 0, text: '', isCorrect: false, fillInTheBlankCorrectAnswer: null }
            ]
        }));
    };

    const removeEditAnswerOption = (index) => {
        setEditQuestionForm(prev => ({
            ...prev,
            answerOptions: prev.answerOptions.filter((_, i) => i !== index)
        }));
    };

    const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
        try {
            await deleteQuestion(
                viewingQuestions.Id || viewingQuestions.id,
                questionId
            );
            
            // Refresh questions list
            fetchQuestions(viewingQuestions.Id || viewingQuestions.id);
            
            // Refresh quiz list to update question count
            fetchQuizzes();
            
            alert('Question deleted successfully!');
        } catch (err) {
            setError('Failed to delete question: ' + err.message);
        }
    }
};

const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('token');
    
    // Navigate back to login page
    navigate('/login');
};

const fetchAllResults = async () => {
    setLoadingResults(true);
    try {
        const data = await getAllQuizResults();
        setAllResults(data.data || data);
    } catch (err) {
        setError('Failed to fetch quiz results: ' + err.message);
    } finally {
        setLoadingResults(false);
    }
};

const handleViewAllResults = () => {
    setViewingResults(true);
    fetchAllResults();
};

    return (
        <div className="admin-bg">
            <div className="admin-container" style={{ maxWidth: '1400px', width: '98vw', display: 'flex', gap: '32px', justifyContent: 'flex-start', alignItems: 'flex-start', position: 'relative' }}>
                
                {/* Add Quiz Form (Left) */}
                <div className="add-quiz-form" style={{ flex: 1, minWidth: '320px', maxWidth: '400px' }}>
                    <button 
                    onClick={handleLogout}
                    className="logout-btn-inline"
                    title="Logout"
                >
                    🚪 Logout
                </button>
                
                <h1>Admin Dashboard</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Quiz Title"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={form.description}
                        onChange={handleChange}
                        required
                    />
                    <select
                        name="levelOfDifficulty"
                        value={form.levelOfDifficulty}
                        onChange={handleChange}
                        required
                    >
                        <option value={1}>Beginner</option>
                        <option value={2}>Easy</option>
                        <option value={3}>Normal</option>
                        <option value={4}>Intermediate</option>
                        <option value={5}>Hard</option>
                        <option value={6}>Nightmare</option>
                    </select>
                    <select
                        multiple
                        name="subjects"
                        value={form.subjects}
                        onChange={handleSubjectsChange}
                        required
                    >
                        <option value={1}>Sports</option>
                        <option value={2}>NFL</option>
                        <option value={3}>World of Warcraft</option>
                        <option value={4}>Movies</option>
                        <option value={5}>TV Shows</option>
                        <option value={6}>Science</option>
                        <option value={7}>Astronomy</option>
                        <option value={8}>Biology</option>
                        <option value={9}>History</option>
                        <option value={10}>Ancient Warfare</option>
                        <option value={11}>Geography</option>
                        <option value={12}>General Knowledge</option>
                        <option value={13}>IQ Test</option>
                    </select>
                    <input
                        type="text"
                        name="timeLimit"
                        placeholder="Time Limit (hh:mm:ss)"
                        value={form.timeLimit}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="admin-btn">Add Quiz</button>
                </form>
                {error && <div className="error-message">{error}</div>}
            </div>

            {/* Quiz List (Middle) */}
            <div className="quiz-list" style={{ flex: 2, minWidth: '350px', maxWidth: '500px' }}>
                <h2>All Quizzes</h2>
                <ul>
                    {quizzes.map(q => (
                        <li key={q.Id || q.id} style={{ position: 'relative', marginBottom: '32px' }}>
                            <b>{q.Title || q.title}</b>
                            <br />
                            <span>Description: {q.Description || q.description}</span>
                            <br />
                            <span>
                                Level: {QuizLevelNames[q.levelOfDifficulty || q.LevelOfDifficulty] || (q.levelOfDifficulty || q.LevelOfDifficulty)}
                            </span>
                            <br />
                            <span>
                                Subjects: {Array.isArray(q.subjects || q.Subjects)
                                    ? (q.subjects || q.Subjects)
                                        .map(subj => QuizSubjectNames[subj] || subj)
                                        .join(', ')
                                    : ''}
                            </span>
                            <br />
                            <span>
                                Time Limit: {q.TimeLimit || q.timeLimit}
                            </span>
                            <br />
                            <span>
                                Number of Questions: {q.NumberOfQuestions || q.numberOfQuestions}
                            </span>
                            <br />
                            <button className="edit-btn" onClick={() => setEditingQuiz(q)}>Edit</button>
                            <button
                                className="delete-btn"
                                onClick={async () => {
                                    if (window.confirm('Are you sure you want to delete this quiz?')) {
                                        try {
                                            await deleteQuiz(q.Id || q.id);
                                            fetchQuizzes();
                                        } catch (err) {
                                            setError('Failed to delete quiz: ' + err.message);
                                        }
                                    }
                                }}
                                style={{ marginLeft: '8px' }}
                            >
                                Delete
                            </button>
                            <button
                                className="questions-btn"
                                onClick={() => setSelectedQuizForQuestions(q)}
                                style={{ marginLeft: '8px' }}
                            >
                                Add Questions
                            </button>
                            <button
                                className="view-questions-btn"
                                onClick={() => {
                                    setViewingQuestions(q);
                                    fetchQuestions(q.Id || q.id);
                                }}
                                style={{ marginLeft: '8px' }}
                            >
                                View Questions
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right Column - View Results Button and Edit Form */}
            <div style={{ flex: 1, minWidth: '350px', maxWidth: '400px' }}>
                {/* Always show the View Results button */}
                <button 
                    onClick={handleViewAllResults}
                    className="admin-btn"
                    style={{ width: '100%', marginBottom: '20px' }}
                >
                    📊 View All Quiz Results
                </button>
                
                {/* Show edit form below the button when editing */}
                {editingQuiz && (
                    <div className="edit-form-container">
                        <form
                            onSubmit={async e => {
                                e.preventDefault();
                                setError('');
                                try {
                                    // Get selected subjects as strings
                                    const selectedSubjects = Array.from(new Set(editingQuiz.Subjects || editingQuiz.subjects)).map(String);

                                    // Get the original subjects for this quiz
                                    const originalQuiz = quizzes.find(q => (q.Id || q.id) === (editingQuiz.Id || editingQuiz.id));
                                    const originalSubjects = (originalQuiz.Subjects || originalQuiz.subjects || []).map(String);

                                    // Only send subjects that are NOT already assigned to the quiz
                                    const subjectsToSend = selectedSubjects.filter(subj => !originalSubjects.includes(subj));

                                    // Build the payload
                                    const payload = {
                                        Title: editingQuiz.Title || editingQuiz.title,
                                        Description: editingQuiz.Description || editingQuiz.description,
                                        LevelOfDifficulty: editingQuiz.LevelOfDifficulty || editingQuiz.levelOfDifficulty,
                                        Subjects: subjectsToSend,
                                        TimeLimit: editingQuiz.TimeLimit || editingQuiz.timeLimit
                                    };
                                    console.log('Payload sent to backend:', payload);

                                    await updateQuiz(editingQuiz.Id || editingQuiz.id, payload);
                                    setEditingQuiz(null);
                                    fetchQuizzes();
                                } catch (err) {
                                    setError(err.message);
                                }
                            }}
                            style={{ background: '#263859', padding: '24px', borderRadius: '12px' }}
                        >
                            <h3>Edit Quiz</h3>
                            <input
                                type="text"
                                value={editingQuiz.Title || editingQuiz.title}
                                onChange={e => setEditingQuiz(prev => ({ ...prev, Title: e.target.value }))}
                                required
                            />
                            <textarea
                                value={editingQuiz.Description ?? editingQuiz.description ?? ''}
                                onChange={e => setEditingQuiz(prev => ({ ...prev, Description: e.target.value }))}
                            />
                            <select
                                value={editingQuiz.LevelOfDifficulty || editingQuiz.levelOfDifficulty}
                                onChange={e => setEditingQuiz(prev => ({ ...prev, LevelOfDifficulty: e.target.value }))}
                                required
                            >
                                <option value="BEGGINER">Beginner</option>
                                <option value="EASY">Easy</option>
                                <option value="NORMAL">Normal</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="HARD">Hard</option>
                                <option value="NIGHTMARE">Nightmare</option>
                            </select>
                            <select
                                multiple
                                value={editingQuiz.Subjects || editingQuiz.subjects}
                                onChange={e => {
                                    const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                                    setEditingQuiz(prev => ({ ...prev, Subjects: options }));
                                }}
                            >
                                <option value="SPORTS">Sports</option>
                                <option value="NFL">NFL</option>
                                <option value="WORLD_OF_WARCRAFT">World of Warcraft</option>
                                <option value="MOVIES">Movies</option>
                                <option value="TV_SHOWS">TV Shows</option>
                                <option value="SCIENCE">Science</option>
                                <option value="ASTRONOMY">Astronomy</option>
                                <option value="BIOLOGY">Biology</option>
                                <option value="HISTORY">History</option>
                                <option value="ANCIENT_WARFARE">Ancient Warfare</option>
                                <option value="GEOGRAPHY">Geography</option>
                                <option value="GENERAL_KNOWLEDGE">General Knowledge</option>
                                <option value="IQ_TEST">IQ Test</option>
                            </select>
                            <input
                                type="text"
                                value={editingQuiz.TimeLimit || editingQuiz.timeLimit}
                                onChange={e => setEditingQuiz(prev => ({ ...prev, TimeLimit: e.target.value }))}
                                required
                            />
                            <button type="submit" className="admin-btn">Save Changes</button>
                            <button type="button" className="cancel-btn" onClick={() => setEditingQuiz(null)} style={{ marginLeft: '12px' }}>Cancel</button>
                        </form>
                    </div>
                )}
            </div>
        </div>

        {/* Question Form (For Adding Questions to a Quiz) */}
        {selectedQuizForQuestions && (
            <div className="question-form-container" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 1000, maxWidth: '500px', width: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
                <form onSubmit={handleQuestionSubmit} style={{ background: '#263859', padding: '24px', borderRadius: '12px', color: '#fff' }}>
                    <h3>Add Question to: {selectedQuizForQuestions.Title || selectedQuizForQuestions.title}</h3>
                    
                    <input
                        type="text"
                        placeholder="Question Text"
                        value={questionForm.text}
                        onChange={e => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
                        required
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: 'none' }}
                    />
                    
                    <input
                        type="number"
                        placeholder="Points"
                        step="0.1"
                        min="0"
                        value={questionForm.points}
                        onChange={e => setQuestionForm(prev => ({ ...prev, points: e.target.value }))}
                        required
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: 'none' }}
                    />
                    
                    <select
                        value={questionForm.type}
                        onChange={e => {
                            const newType = e.target.value;
                            let newAnswerOptions = [];
                            
                            if (newType === 'TRUE_FALSE') {
                                newAnswerOptions = [
                                    { text: 'True', isCorrect: true, fillInTheBlankCorrectAnswer: null },
                                    { text: 'False', isCorrect: false, fillInTheBlankCorrectAnswer: null }
                                ];
                            } else if (newType === 'FILL_IN_THE_BLANK') {
                                newAnswerOptions = [{ text: '', isCorrect: null, fillInTheBlankCorrectAnswer: '' }];
                            } else {
                                newAnswerOptions = [{ text: '', isCorrect: false, fillInTheBlankCorrectAnswer: null }];
                            }
                            
                            setQuestionForm(prev => ({ 
                                ...prev, 
                                type: newType,
                                answerOptions: newAnswerOptions
                            }));
                        }}
                        required
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: 'none' }}
                    >
                        <option value="MULTIPLE_CHOICE_ONE_CORRECT">Multiple Choice (One Correct)</option>
                        <option value="MULTIPLE_CHOICE_MULTIPLE_CORRECT">Multiple Choice (Multiple Correct)</option>
                        <option value="TRUE_FALSE">True/False</option>
                        <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
                    </select>

                    {/* Answer Options */}
                    <div style={{ marginBottom: '15px' }}>
                        <h4>Answer Options:</h4>
                        
                        {questionForm.type === 'TRUE_FALSE' ? (
                            // True/False options
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px' }}>
                                    <input
                                        type="radio"
                                        name="trueFalseAnswer"
                                        checked={questionForm.answerOptions.some(opt => opt.text === 'True' && opt.isCorrect)}
                                        onChange={() => setQuestionForm(prev => ({
                                            ...prev,
                                            answerOptions: [
                                                { text: 'True', isCorrect: true, fillInTheBlankCorrectAnswer: null },
                                                { text: 'False', isCorrect: false, fillInTheBlankCorrectAnswer: null }
                                            ]
                                        }))}
                                        style={{ marginRight: '5px' }}
                                    />
                                    True
                                </label>
                                <label style={{ display: 'block' }}>
                                    <input
                                        type="radio"
                                        name="trueFalseAnswer"
                                        checked={questionForm.answerOptions.some(opt => opt.text === 'False' && opt.isCorrect)}
                                        onChange={() => setQuestionForm(prev => ({
                                            ...prev,
                                            answerOptions: [
                                                { text: 'True', isCorrect: false, fillInTheBlankCorrectAnswer: null },
                                                { text: 'False', isCorrect: true, fillInTheBlankCorrectAnswer: null }
                                            ]
                                        }))}
                                        style={{ marginRight: '5px' }}
                                    />
                                    False
                                </label>
                            </div>
                        ) : questionForm.type === 'FILL_IN_THE_BLANK' ? (
                            // Fill in the blank
                            <div>
                                <input
                                    type="text"
                                    placeholder="Correct Answer"
                                    value={questionForm.answerOptions[0]?.fillInTheBlankCorrectAnswer || ''}
                                    onChange={e => setQuestionForm(prev => ({
                                        ...prev,
                                        answerOptions: [{
                                            text: '',
                                            isCorrect: null,
                                            fillInTheBlankCorrectAnswer: e.target.value
                                        }]
                                    }))}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: 'none' }}
                                />
                            </div>
                        ) : (
                            // Multiple choice options
                            <div>
                                {questionForm.answerOptions.map((option, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <input
                                            type={questionForm.type === 'MULTIPLE_CHOICE_ONE_CORRECT' ? 'radio' : 'checkbox'}
                                            name="correctAnswer"
                                            checked={option.isCorrect}
                                            onChange={e => updateAnswerOption(index, 'isCorrect', e.target.checked)}
                                            style={{ marginRight: '8px' }}
                                        />
                                        <input
                                            type="text"
                                            placeholder={`Option ${index + 1}`}
                                            value={option.text}
                                            onChange={e => updateAnswerOption(index, 'text', e.target.value)}
                                            required
                                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: 'none', marginRight: '8px' }}
                                        />
                                        {questionForm.answerOptions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeAnswerOption(index)}
                                                style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 10px' }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addAnswerOption}
                                    style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', marginTop: '10px' }}
                                >
                                    Add Option
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <button type="submit" className="admin-btn">Add Question</button>
                    <button 
                        type="button" 
                        className="cancel-btn" 
                        onClick={() => {
                            setSelectedQuizForQuestions(null);
                            setQuestionForm({
                                text: '',
                                points: 1,
                                type: 'MULTIPLE_CHOICE_ONE_CORRECT',
                                answerOptions: [{ text: '', isCorrect: false, fillInTheBlankCorrectAnswer: null }]
                            });
                        }}
                        style={{ marginLeft: '12px' }}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        )}
        {/* View Questions Modal */}
        {viewingQuestions && (
            <div className="questions-view-container" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 1000, maxWidth: '800px', width: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ background: '#263859', padding: '24px', borderRadius: '12px', color: '#fff' }}>
                    <h3>Questions for: {viewingQuestions.Title || viewingQuestions.title}</h3>
                    
                    {questions.length === 0 ? (
                        <p>No questions found for this quiz.</p>
                    ) : (
                        <div>
                            {questions.map((question, index) => (
                                <div key={question.Id || question.id} style={{ marginBottom: '20px', padding: '16px', background: '#1a252f', borderRadius: '8px' }}>
                                    <h4>Question {index + 1}:</h4>
                                    <p><strong>Text:</strong> {question.Text || question.text}</p>
                                    <p><strong>Points:</strong> {question.Points || question.points}</p>
                                    <p><strong>Type:</strong> {question.Type || question.type}</p>
                                    
                                    {/* Answer Options */}
                                    <div style={{ marginTop: '10px' }}>
                                        <strong>Answer Options:</strong>
                                        {(question.Type || question.type) === 'FILL_IN_THE_BLANK' ? (
                                            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                                                {(question.AnswerOptions || question.answerOptions || []).map((option, optIndex) => (
                                                    <li key={option.Id || option.id || optIndex}>
                                                        <strong>Correct Answer:</strong> {option.FillInTheBlankCorrectAnswer || option.fillInTheBlankCorrectAnswer}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                                                {(question.AnswerOptions || question.answerOptions || []).map((option, optIndex) => (
                                                    <li key={option.Id || option.id || optIndex} style={{ color: (option.IsCorrect || option.isCorrect) ? '#4caf50' : '#fff' }}>
                                                        {option.Text || option.text} 
                                                        {(option.IsCorrect || option.isCorrect) && ' ✓'}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    
                                    {/* Edit and Delete Buttons */}
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                        <button
                                            className="edit-btn"
                                            onClick={() => startEditingQuestion(question)}
                                            style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 10px' }}
                                        >
                                            Edit Question
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteQuestion(question.Id || question.id)}
                                            style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 10px' }}
                                        >
                                            Delete Question
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <button 
                        type="button" 
                        className="cancel-btn" 
                        onClick={() => {
                            setViewingQuestions(null);
                            setQuestions([]);
                        }}
                        style={{ marginTop: '20px' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        )}
        {/* Edit Question Modal */}
        {editingQuestion && (
    <div className="edit-question-container" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 1001, maxWidth: '600px', width: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
        <form onSubmit={handleEditQuestionSubmit} style={{ background: '#263859', padding: '24px', borderRadius: '12px', color: '#fff' }}>
            <h3>Edit Question</h3>
            
            <input
                type="text"
                placeholder="Question Text"
                value={editQuestionForm.text}
                onChange={e => setEditQuestionForm(prev => ({ ...prev, text: e.target.value }))}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: 'none' }}
            />
            
            <input
                type="number"
                placeholder="Points"
                step="0.1"
                min="0"
                value={editQuestionForm.points}
                onChange={e => setEditQuestionForm(prev => ({ ...prev, points: parseFloat(e.target.value) || 0 }))}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: 'none' }}
            />
            
            <select
                value={editQuestionForm.type}
                onChange={e => setEditQuestionForm(prev => ({ ...prev, type: e.target.value }))}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: 'none' }}
            >
                <option value="MULTIPLE_CHOICE_ONE_CORRECT">Multiple Choice (One Correct)</option>
                <option value="MULTIPLE_CHOICE_MULTIPLE_CORRECT">Multiple Choice (Multiple Correct)</option>
                <option value="TRUE_FALSE">True/False</option>
                <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
            </select>

            {/* Answer Options */}
            <div style={{ marginBottom: '15px' }}>
                <h4>Answer Options:</h4>
                
                {editQuestionForm.type === 'TRUE_FALSE' ? (
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px' }}>
                            <input
                                type="radio"
                                name="editTrueFalseAnswer"
                                checked={editQuestionForm.answerOptions[0]?.isCorrect === true}
                                onChange={() => setEditQuestionForm(prev => ({
                                    ...prev,
                                    answerOptions: [
                                        { id: prev.answerOptions[0]?.id || 0, text: 'True', isCorrect: true, fillInTheBlankCorrectAnswer: null },
                                        { id: prev.answerOptions[1]?.id || 0, text: 'False', isCorrect: false, fillInTheBlankCorrectAnswer: null }
                                    ]
                                }))}
                                style={{ marginRight: '5px' }}
                            />
                            True
                        </label>
                        <label style={{ display: 'block' }}>
                            <input
                                type="radio"
                                name="editTrueFalseAnswer"
                                checked={editQuestionForm.answerOptions[1]?.isCorrect === true || editQuestionForm.answerOptions[0]?.isCorrect === false}
                                onChange={() => setEditQuestionForm(prev => ({
                                    ...prev,
                                    answerOptions: [
                                        { id: prev.answerOptions[0]?.id || 0, text: 'True', isCorrect: false, fillInTheBlankCorrectAnswer: null },
                                        { id: prev.answerOptions[1]?.id || 0, text: 'False', isCorrect: true, fillInTheBlankCorrectAnswer: null }
                                    ]
                                }))}
                                style={{ marginRight: '5px' }}
                            />
                            False
                        </label>
                    </div>
                ) : editQuestionForm.type === 'FILL_IN_THE_BLANK' ? (
                    <div>
                        <input
                            type="text"
                            placeholder="Correct Answer"
                            value={editQuestionForm.answerOptions[0]?.fillInTheBlankCorrectAnswer || ''}
                            onChange={e => setEditQuestionForm(prev => ({
                                ...prev,
                                answerOptions: [{
                                    id: prev.answerOptions[0]?.id || 0,
                                    text: '',
                                    isCorrect: null,
                                    fillInTheBlankCorrectAnswer: e.target.value
                                }]
                            }))}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: 'none' }}
                        />
                    </div>
                ) : editQuestionForm.type === 'MULTIPLE_CHOICE_ONE_CORRECT' ? (
                    // Single correct answer - use radio buttons with same name
                    <div>
                        {editQuestionForm.answerOptions.map((option, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <input
                                    type="radio"
                                    name="editCorrectAnswerRadio" // Same name for all radio buttons
                                    checked={option.isCorrect}
                                    onChange={e => updateEditAnswerOption(index, 'isCorrect', e.target.checked)}
                                    style={{ marginRight: '8px' }}
                                />
                                <input
                                    type="text"
                                    placeholder={`Option ${index + 1}`}
                                    value={option.text}
                                    onChange={e => updateEditAnswerOption(index, 'text', e.target.value)}
                                    required
                                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: 'none', marginRight: '8px' }}
                                />
                                {editQuestionForm.answerOptions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeEditAnswerOption(index)}
                                        style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 10px' }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addEditAnswerOption}
                            style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', marginTop: '10px' }}
                        >
                            Add Option
                        </button>
                    </div>
                ) : (
                    // Multiple correct answers - use checkboxes
                    <div>
                        {editQuestionForm.answerOptions.map((option, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={option.isCorrect}
                                    onChange={e => updateEditAnswerOption(index, 'isCorrect', e.target.checked)}
                                    style={{ marginRight: '8px' }}
                                />
                                <input
                                    type="text"
                                    placeholder={`Option ${index + 1}`}
                                    value={option.text}
                                    onChange={e => updateEditAnswerOption(index, 'text', e.target.value)}
                                    required
                                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: 'none', marginRight: '8px' }}
                                />
                                {editQuestionForm.answerOptions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeEditAnswerOption(index)}
                                        style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 10px' }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addEditAnswerOption}
                            style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', marginTop: '10px' }}
                        >
                            Add Option
                        </button>
                    </div>
                )}
            </div>
            
            <button type="submit" className="admin-btn">Update Question</button>
            <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => {
                    setEditingQuestion(null);
                    setEditQuestionForm({
                        text: '',
                        points: 1,
                        type: 'MULTIPLE_CHOICE_ONE_CORRECT',
                        answerOptions: []
                    });
                }}
                style={{ marginLeft: '12px' }}
            >
                Cancel
            </button>
        </form>
    </div>
)}
            {/* All Results Modal */}
            {viewingResults && (
                <div className="results-view-container" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 1000, maxWidth: '1000px', width: '95vw', maxHeight: '85vh', overflowY: 'auto' }}>
                    <div style={{ background: '#263859', padding: '24px', borderRadius: '12px', color: '#fff' }}>
                        <h3>All Quiz Results</h3>
                        
                        {loadingResults ? (
                            <p>Loading results...</p>
                        ) : allResults.length === 0 ? (
                            <p>No quiz results found.</p>
                        ) : (
                            <div>
                                <div style={{ marginBottom: '20px' }}>
                                    <p><strong>Total Results:</strong> {allResults.length}</p>
                                </div>
                                
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#1a252f' }}>
                                                <th style={{ padding: '12px', border: '1px solid #444', textAlign: 'left' }}>User</th>
                                                <th style={{ padding: '12px', border: '1px solid #444', textAlign: 'left' }}>Quiz</th>
                                                <th style={{ padding: '12px', border: '1px solid #444', textAlign: 'left' }}>Score</th>
                                                <th style={{ padding: '12px', border: '1px solid #444', textAlign: 'left' }}>Max Score</th>
                                                <th style={{ padding: '12px', border: '1px solid #444', textAlign: 'left' }}>Percentage</th>
                                                <th style={{ padding: '12px', border: '1px solid #444', textAlign: 'left' }}>Date</th>
                                                <th style={{ padding: '12px', border: '1px solid #444', textAlign: 'left' }}>Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allResults.map((result, index) => {
                                                console.log('Result object:', result); // Add this to debug
                                                const percentage = (result.MaxScore || result.maxScore) > 0 ? 
                                                    (((result.Score || result.score) / (result.MaxScore || result.maxScore)) * 100).toFixed(1) : '0';
                                                
                                                // Try both casing variations
                                                const attemptedAt = result.AttemptedAt || result.attemptedAt;
                                                const completedDate = attemptedAt ? new Date(attemptedAt).toLocaleDateString() : 'Invalid Date';
                                                
                                                // Duration should be handled as TimeSpan string
                                                const duration = result.Duration || result.duration || 'N/A';
                                                
                                                return (
                                                    <tr key={(result.Id || result.id) || index} style={{ backgroundColor: index % 2 === 0 ? '#2a3441' : '#1a252f' }}>
                                                        <td style={{ padding: '12px', border: '1px solid #444' }}>
                                                            {result.UserName || result.userName || 'Unknown User'}
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #444' }}>
                                                            {result.QuizTitle || result.quizTitle || 'Unknown Quiz'}
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #444' }}>
                                                            {result.Score || result.score || 0}
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #444' }}>
                                                            {result.MaxScore || result.maxScore || 0}
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #444', color: percentage >= 70 ? '#4caf50' : percentage >= 50 ? '#ff9800' : '#f44336' }}>
                                                            {percentage}%
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #444' }}>
                                                            {completedDate}
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #444' }}>
                                                            {duration}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        
                        <button 
                            type="button" 
                            className="cancel-btn" 
                            onClick={() => {
                                setViewingResults(false);
                                setAllResults([]);
                            }}
                            style={{ marginTop: '20px' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminStartPage;