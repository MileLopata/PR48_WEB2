import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserAttempts } from '../services/quizSolvingService';
import { getQuizById } from '../services/quizService';
import { getQuizQuestions } from '../services/questionService';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import '../styles/MyResultsPageStyle.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function MyResultsPage() {
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [quizDetails, setQuizDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedQuizForProgress, setSelectedQuizForProgress] = useState(null);

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

    const getQuizAttempts = (quizId) => {
        return attempts
            .filter(attempt => attempt.quizId === quizId)
            .sort((a, b) => new Date(a.attemptedAt) - new Date(b.attemptedAt)) // Sort by date ascending
            .map((attempt, index) => ({
                ...attempt,
                attemptNumber: index + 1,
                percentage: calculatePercentage(attempt.score, quizId)
            }));
    };

    const generateProgressChartData = (quizId) => {
        const quizAttempts = getQuizAttempts(quizId);
        
        if (quizAttempts.length < 2) {
            return null; // Don't show chart for single attempts
        }

        return {
            labels: quizAttempts.map(attempt => `Attempt ${attempt.attemptNumber}`),
            datasets: [
                {
                    label: 'Score Percentage',
                    data: quizAttempts.map(attempt => attempt.percentage),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    pointBackgroundColor: quizAttempts.map(attempt => {
                        if (attempt.percentage >= 70) return '#4caf50';
                        if (attempt.percentage >= 50) return '#ff9800';
                        return '#f44336';
                    }),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Progress Over Time',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                }
            }
        }
    };

    const showProgressGraph = (quizId) => {
        const chartData = generateProgressChartData(quizId);
        if (chartData) {
            setSelectedQuizForProgress({ quizId, chartData });
        }
    };

    const groupAttemptsByQuiz = () => {
        const grouped = {};
        attempts.forEach(attempt => {
            if (!grouped[attempt.quizId]) {
                grouped[attempt.quizId] = [];
            }
            grouped[attempt.quizId].push(attempt);
        });
        return grouped;
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
                <div className="results-content">
                    {/* Progress Overview Section */}
                    <div className="progress-overview">
                        <h2>Progress Overview</h2>
                        <div className="quiz-progress-cards">
                            {Object.entries(groupAttemptsByQuiz()).map(([quizId, quizAttempts]) => {
                                const quiz = quizDetails[quizId];
                                const latestAttempt = quizAttempts.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt))[0];
                                const latestPercentage = calculatePercentage(latestAttempt.score, quizId);
                                const hasMultipleAttempts = quizAttempts.length > 1;
                                
                                return (
                                    <div key={quizId} className="progress-card">
                                        <h4>{quiz?.title || `Quiz ${quizId}`}</h4>
                                        <div className="progress-stats">
                                            <div className="stat">
                                                <span>Attempts:</span>
                                                <span className="stat-number">{quizAttempts.length}</span>
                                            </div>
                                            <div className="stat">
                                                <span>Best Score:</span>
                                                <span className={`stat-number ${getScoreColorClass(Math.max(...quizAttempts.map(a => calculatePercentage(a.score, quizId))))}`}>
                                                    {Math.max(...quizAttempts.map(a => calculatePercentage(a.score, quizId)))}%
                                                </span>
                                            </div>
                                            <div className="stat">
                                                <span>Latest:</span>
                                                <span className={`stat-number ${getScoreColorClass(latestPercentage)}`}>
                                                    {latestPercentage}%
                                                </span>
                                            </div>
                                        </div>
                                        {hasMultipleAttempts && (
                                            <button 
                                                onClick={() => showProgressGraph(parseInt(quizId))}
                                                className="progress-btn"
                                            >
                                                📈 View Progress
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Detailed Results List */}
                    <div className="results-list">
                        <h2>All Attempts</h2>
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
                </div>
            )}

            {/* Progress Chart Modal */}
            {selectedQuizForProgress && (
                <div className="chart-modal-overlay" onClick={() => setSelectedQuizForProgress(null)}>
                    <div className="chart-modal" onClick={e => e.stopPropagation()}>
                        <div className="chart-header">
                            <h3>Progress for {quizDetails[selectedQuizForProgress.quizId]?.title}</h3>
                            <button 
                                className="close-btn" 
                                onClick={() => setSelectedQuizForProgress(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="chart-content">
                            <Line 
                                data={selectedQuizForProgress.chartData} 
                                options={chartOptions} 
                            />
                            <div className="chart-summary">
                                <h4>Summary:</h4>
                                <div className="summary-stats">
                                    {getQuizAttempts(selectedQuizForProgress.quizId).map((attempt, index) => (
                                        <div key={attempt.id} className="summary-item">
                                            <span>Attempt {index + 1}:</span>
                                            <span className={`summary-score ${getScoreColorClass(attempt.percentage)}`}>
                                                {attempt.percentage}% ({attempt.score} points)
                                            </span>
                                            <span className="summary-date">{formatDate(attempt.attemptedAt)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyResultsPage;