import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserAttempts } from '../services/quizSolvingService';
import { getQuizById } from '../services/quizService';
import { getQuizQuestions } from '../services/questionService'; // ← Use questionService like QuizResultsPage
import '../styles/MyResultsPageStyle.css';

function MyResultsPage() {
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [quizDetails, setQuizDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUserResults();
    }, []);

    const fetchUserResults = async () => {
        try {
            setLoading(true);
            
            // Get all user attempts
            const userAttempts = await getUserAttempts();
            console.log('User attempts:', userAttempts); // DEBUG
            
            // Get quiz details for each attempt AND their questions
            const quizIds = [...new Set(userAttempts.map(attempt => attempt.quizId))];
            const quizPromises = quizIds.map(async (id) => {
                try {
                    const [quiz, questions] = await Promise.all([
                        getQuizById(id),
                        getQuizQuestions(id)
                    ]);
                    
                    // Add questions to quiz object
                    quiz.questions = questions;
                    console.log(`Quiz ${id} with questions:`, quiz); // DEBUG
                    
                    return quiz;
                } catch (err) {
                    console.error(`Failed to fetch data for quiz ${id}:`, err);
                    const quiz = await getQuizById(id);
                    quiz.questions = [];
                    return quiz;
                }
            });
            
            const quizData = await Promise.all(quizPromises);
            
            // Create quiz details map
            const quizMap = {};
            quizData.forEach(quiz => {
                quizMap[quiz.id] = quiz;
            });
            
            setAttempts(userAttempts);
            setQuizDetails(quizMap);
            
        } catch (err) {
            setError('Failed to load results: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (duration) => {
        if (typeof duration === 'string') {
            return duration;
        }
        
        const totalSeconds = duration.hours * 3600 + duration.minutes * 60 + duration.seconds;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculatePercentage = (score, quizId) => {
        const quiz = quizDetails[quizId];
        if (!quiz) {
            console.log('No quiz found for ID:', quizId);
            return 0;
        }
        
        console.log('Quiz for percentage calculation:', quiz);
        
        // Try different property names for questions
        const questions = quiz.questions || quiz.Questions || [];
        console.log('Questions found:', questions);
        
        if (questions.length === 0) {
            console.log('No questions found for quiz', quizId);
            return 0; // Return 0% if we can't calculate properly
        }
        
        // Calculate total points from questions
        const totalPoints = questions.reduce((sum, q) => {
            const points = q.points || q.Points || 0;
            console.log(`Question ${q.id}: ${points} points`);
            return sum + points;
        }, 0);
        
        console.log('Total points:', totalPoints, 'User score:', score);
        
        if (totalPoints === 0) {
            console.log('Total points is 0, returning 0%');
            return 0;
        }
        
        const percentage = Math.round((score / totalPoints) * 100);
        console.log('Calculated percentage:', percentage);
        
        return percentage;
    };

    const getScoreColorClass = (percentage) => {
        if (percentage >= 70) return 'good';
        if (percentage >= 50) return 'average';
        return 'poor';
    };

    const viewDetails = (attemptId) => {
        navigate(`/quiz-results/${attemptId}`);
    };

    if (loading) {
        return (
            <div className="my-results-container">
                <div className="loading-message">Loading your results...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-results-container">
                <div className="error-message">{error}</div>
                <button onClick={() => navigate('/regular-user')} className="back-btn">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="my-results-container">
            <div className="page-header">
                <h1>My Quiz Results</h1>
                <button onClick={() => navigate('/regular-user')} className="back-btn">
                    Back to Dashboard
                </button>
            </div>

            {attempts.length === 0 ? (
                <div className="no-results">
                    <h3>No quiz attempts yet</h3>
                    <p>Start taking quizzes to see your results here!</p>
                    <button onClick={() => navigate('/regular-user')} className="start-btn">
                        Browse Quizzes
                    </button>
                </div>
            ) : (
                <div className="results-list">
                    {attempts.map((attempt) => {
                        const quiz = quizDetails[attempt.quizId];
                        const percentage = calculatePercentage(attempt.score, attempt.quizId);
                        
                        return (
                            <div key={attempt.id} className="result-card">
                                <div className="result-header">
                                    <h3 className="quiz-title">
                                        {quiz?.title || `Quiz ${attempt.quizId}`}
                                    </h3>
                                    <div className="attempt-date">
                                        {formatDate(attempt.attemptedAt)}
                                    </div>
                                </div>

                                <div className="result-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">Score:</span>
                                        <span className="stat-value">{attempt.score} points</span>
                                    </div>
                                    
                                    <div className="stat-item">
                                        <span className="stat-label">Percentage:</span>
                                        <span className={`stat-value ${getScoreColorClass(percentage)}`}>
                                            {percentage}%
                                        </span>
                                    </div>
                                    
                                    <div className="stat-item">
                                        <span className="stat-label">Duration:</span>
                                        <span className="stat-value">{formatDuration(attempt.duration)}</span>
                                    </div>
                                    
                                    <div className="stat-item">
                                        <span className="stat-label">Questions:</span>
                                        <span className="stat-value">{quiz?.numberOfQuestions || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="result-actions">
                                    <button 
                                        onClick={() => viewDetails(attempt.id)}
                                        className="view-details-btn"
                                    >
                                        View Details
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/quiz/${attempt.quizId}`)}
                                        className="retake-btn"
                                    >
                                        Retake Quiz
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MyResultsPage;