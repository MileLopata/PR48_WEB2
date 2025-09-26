import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllQuizzes } from '../services/quizService';
import { getQuizLeaderboard } from '../services/quizSolvingService';
import { QuizLevelNames, QuizSubjectNames } from '../models/quiz';
import '../styles/LeaderboardPageStyle.css';

function LeaderboardPage() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState('');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timePeriodFilter, setTimePeriodFilter] = useState('all');

    const applyTimeFilter = useCallback(() => {
        if (!leaderboardData.length) {
            setFilteredData([]);
            return;
        }

        const now = new Date();
        let filtered = leaderboardData;

        if (timePeriodFilter === 'week') {
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = leaderboardData.filter(entry => 
                new Date(entry.attemptedAt) >= oneWeekAgo
            );
        } else if (timePeriodFilter === 'month') {
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filtered = leaderboardData.filter(entry => 
                new Date(entry.attemptedAt) >= oneMonthAgo
            );
        }

        const reRanked = filtered
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                if (a.duration !== b.duration) return a.duration - b.duration;
                return new Date(a.attemptedAt) - new Date(b.attemptedAt);
            })
            .map((entry, index) => ({
                ...entry,
                userRankingPosition: index + 1
            }));

        setFilteredData(reRanked);
    }, [leaderboardData, timePeriodFilter]);

    const fetchLeaderboard = useCallback(async () => {
        if (!selectedQuizId) return;
        
        try {
            setLoading(true);
            setError('');
            const data = await getQuizLeaderboard(selectedQuizId);
            console.log('Leaderboard data:', data);
            setLeaderboardData(data);
        } catch (err) {
            setError('Failed to load leaderboard: ' + err.message);
            setLeaderboardData([]);
        } finally {
            setLoading(false);
        }
    }, [selectedQuizId]);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    useEffect(() => {
        if (selectedQuizId) {
            fetchLeaderboard();
        }
    }, [selectedQuizId, fetchLeaderboard]);

    useEffect(() => {
        applyTimeFilter();
    }, [applyTimeFilter]);

    const fetchQuizzes = async () => {
        try {
            const quizzesData = await getAllQuizzes();
            setQuizzes(quizzesData);
            
            if (quizzesData.length > 0) {
                setSelectedQuizId(quizzesData[0].id || quizzesData[0].Id);
            }
        } catch (err) {
            setError('Failed to load quizzes: ' + err.message);
        }
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

    const getRankClass = (position) => {
        if (position === 1) return 'rank-gold';
        if (position === 2) return 'rank-silver';
        if (position === 3) return 'rank-bronze';
        return 'rank-default';
    };

    const getRankIcon = (position) => {
        if (position === 1) return '🥇';
        if (position === 2) return '🥈';
        if (position === 3) return '🥉';
        return `#${position}`;
    };

    const getQuizDifficultyDisplay = (quiz) => {
        if (!quiz) return '';
        const difficulty = quiz.LevelOfDifficulty || quiz.levelOfDifficulty;
        return QuizLevelNames[difficulty] || difficulty || 'Unknown';
    };

    const getQuizSubjectsDisplay = (quiz) => {
        if (!quiz) return '';
        const subjects = quiz.Subjects || quiz.subjects || [];
        if (!Array.isArray(subjects) || subjects.length === 0) return 'No subjects';
        
        return subjects
            .map(subject => QuizSubjectNames[subject] || subject)
            .join(', ');
    };

    const selectedQuiz = quizzes.find(q => (q.id || q.Id) === parseInt(selectedQuizId));

    return (
        <div className="leaderboard-container">
            <div className="page-header">
                <h1>Quiz Leaderboards</h1>
                <button onClick={() => navigate('/regular-user')} className="back-btn">
                    Back to Dashboard
                </button>
            </div>

            <div className="filters-section">
                <div className="filter-group">
                    <label htmlFor="quiz-select">Select Quiz:</label>
                    <select
                        id="quiz-select"
                        value={selectedQuizId}
                        onChange={(e) => setSelectedQuizId(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Choose a quiz...</option>
                        {quizzes.map(quiz => (
                            <option key={quiz.id || quiz.Id} value={quiz.id || quiz.Id}>
                                {quiz.title || quiz.Title} - {getQuizDifficultyDisplay(quiz)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="time-filter">Time Period:</label>
                    <select
                        id="time-filter"
                        value={timePeriodFilter}
                        onChange={(e) => setTimePeriodFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Time</option>
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                    </select>
                </div>
            </div>

            {selectedQuiz && (
                <div className="quiz-info-card">
                    <div className="quiz-header">
                        <h2>{selectedQuiz.title || selectedQuiz.Title}</h2>
                        <div className="quiz-meta">
                            <span className="quiz-difficulty">
                                Difficulty: {getQuizDifficultyDisplay(selectedQuiz)}
                            </span>
                            <span className="quiz-questions">
                                Questions: {selectedQuiz.numberOfQuestions || selectedQuiz.NumberOfQuestions || 'N/A'}
                            </span>
                            <span className="quiz-time-limit">
                                Time Limit: {selectedQuiz.timeLimit || selectedQuiz.TimeLimit || 'N/A'}
                            </span>
                        </div>
                    </div>
                    
                    {(selectedQuiz.description || selectedQuiz.Description) && (
                        <p className="quiz-description">
                            {selectedQuiz.description || selectedQuiz.Description}
                        </p>
                    )}
                    
                    <div className="quiz-subjects">
                        <strong>Subjects:</strong> {getQuizSubjectsDisplay(selectedQuiz)}
                    </div>
                    
                    {filteredData.length > 0 && (
                        <div className="leaderboard-stats">
                            <div className="stat-item">
                                <span className="stat-label">Total Attempts:</span>
                                <span className="stat-value">{filteredData.length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Unique Players:</span>
                                <span className="stat-value">
                                    {new Set(filteredData.map(entry => entry.username)).size}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Highest Score:</span>
                                <span className="stat-value">
                                    {Math.max(...filteredData.map(entry => entry.score))} pts
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Average Score:</span>
                                <span className="stat-value">
                                    {Math.round(filteredData.reduce((sum, entry) => sum + entry.score, 0) / filteredData.length)} pts
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading-message">Loading leaderboard...</div>
            ) : (
                <div className="leaderboard-content">
                    {filteredData.length === 0 ? (
                        <div className="no-data">
                            {selectedQuizId ? 
                                `No attempts found for the selected time period.${timePeriodFilter !== 'all' ? ' Try selecting "All Time" to see more results.' : ''}` : 
                                'Select a quiz to view its leaderboard.'
                            }
                        </div>
                    ) : (
                        <>
                            <div className="results-summary">
                                <h3>
                                    {timePeriodFilter === 'all' ? 'All Time ' : 
                                     timePeriodFilter === 'week' ? 'Last Week ' : 
                                     'Last Month '}
                                    Leaderboard
                                </h3>
                                <p>Showing {filteredData.length} attempt{filteredData.length !== 1 ? 's' : ''}</p>
                            </div>

                            <div className="leaderboard-table">
                                <div className="table-header">
                                    <div className="header-cell rank">Rank</div>
                                    <div className="header-cell username">Username</div>
                                    <div className="header-cell score">Score</div>
                                    <div className="header-cell duration">Duration</div>
                                    <div className="header-cell date">Date</div>
                                </div>

                                <div className="table-body">
                                    {filteredData.map((entry, index) => (
                                        <div 
                                            key={`${entry.username}-${entry.attemptedAt}-${index}`} 
                                            className={`table-row ${getRankClass(entry.userRankingPosition)}`}
                                        >
                                            <div className="table-cell rank">
                                                <span className="rank-icon">
                                                    {getRankIcon(entry.userRankingPosition)}
                                                </span>
                                            </div>
                                            <div className="table-cell username">
                                                {entry.username}
                                            </div>
                                            <div className="table-cell score">
                                                {entry.score} pts
                                            </div>
                                            <div className="table-cell duration">
                                                {formatDuration(entry.duration)}
                                            </div>
                                            <div className="table-cell date">
                                                {formatDate(entry.attemptedAt)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default LeaderboardPage;