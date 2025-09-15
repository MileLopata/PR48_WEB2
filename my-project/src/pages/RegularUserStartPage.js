import React, { useEffect, useState, useCallback } from 'react';
import { getAllQuizzes } from '../services/quizService';
import { getCurrentUser } from '../services/userService'; // Add this import
import { QuizLevelNames, QuizSubjectNames } from '../models/quiz';
import '../styles/RegularUserStartPageStyle.css';
import { useNavigate } from 'react-router-dom';

function RegularUserStartPage() {
    const [quizzes, setQuizzes] = useState([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null); // Add user state
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');

    const navigate = useNavigate();

    const filterQuizzes = useCallback(() => {
        let filtered = [...quizzes];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(quiz => 
                (quiz.Title || quiz.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (quiz.Description || quiz.description || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by subject
        if (selectedSubject) {
            filtered = filtered.filter(quiz => {
                const subjects = quiz.subjects || quiz.Subjects || [];
                return subjects.includes(selectedSubject);
            });
        }

        // Filter by difficulty
        if (selectedDifficulty) {
            filtered = filtered.filter(quiz => 
                (quiz.levelOfDifficulty || quiz.LevelOfDifficulty) === selectedDifficulty
            );
        }

        setFilteredQuizzes(filtered);
    }, [quizzes, searchTerm, selectedSubject, selectedDifficulty]);

    useEffect(() => {
        fetchQuizzes();
        fetchCurrentUser(); // Add this line
    }, []);

    useEffect(() => {
        filterQuizzes();
    }, [filterQuizzes]);

    async function fetchQuizzes() {
        try {
            setLoading(true);
            const data = await getAllQuizzes();
            setQuizzes(data.data || data);
        } catch (err) {
            setError('Failed to load quizzes: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    // Add this function
    async function fetchCurrentUser() {
        try {
            console.log('Fetching current user...'); // Keep this if you want
            const userData = await getCurrentUser();
            console.log('User data received:', userData); // Keep this if you want
            setCurrentUser(userData);
            
            // Remove this debugging code since it's working:
            // const token = localStorage.getItem('token');
            // const response = await fetch('https://localhost:7042/api/User/me/profile-picture', {
            //     headers: {
            //         'Authorization': `Bearer ${token}`
            //     }
            // });
            // console.log('Profile picture response status:', response.status);
        } catch (err) {
            console.error('Failed to fetch user data:', err);
        }
    }

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSubject('');
        setSelectedDifficulty('');
    };

    const handleStartQuiz = (quiz) => {
        navigate(`/quiz/${quiz.Id || quiz.id}`, { 
            state: { 
                quizData: quiz 
            } 
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getDifficultyClass = (difficulty) => {
        switch (difficulty) {
            case 'EASY': return 'difficulty-easy';
            case 'NORMAL': return 'difficulty-normal';
            case 'HARD': return 'difficulty-hard';
            default: return 'difficulty-normal';
        }
    };

    // Get unique subjects from all quizzes
    const allSubjects = [...new Set(
        quizzes.flatMap(quiz => quiz.subjects || quiz.Subjects || [])
    )].sort();

    // Get unique difficulties from all quizzes
    const allDifficulties = [...new Set(
        quizzes.map(quiz => quiz.levelOfDifficulty || quiz.LevelOfDifficulty)
    )].filter(Boolean).sort();

    if (loading) {
        return (
            <div className="user-bg">
                <div className="user-container">
                    <div className="loading-message">Loading quizzes...</div>
                </div>
            </div>
        );
    }

    // Add this component inside your RegularUserStartPage component:
    const ProfilePicture = ({ currentUser }) => {
        const [imageSrc, setImageSrc] = useState(null);
        const [imageError, setImageError] = useState(false);

        useEffect(() => {
            const fetchProfilePicture = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('https://localhost:7042/api/User/me/profile-picture', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        const blob = await response.blob();
                        const imageUrl = URL.createObjectURL(blob);
                        setImageSrc(imageUrl);
                        setImageError(false);
                    } else {
                        setImageError(true);
                    }
                } catch (error) {
                    console.error('Failed to fetch profile picture:', error);
                    setImageError(true);
                }
            };

            if (currentUser) {
                fetchProfilePicture();
            }

            // Cleanup function to revoke the object URL
            return () => {
                if (imageSrc) {
                    URL.revokeObjectURL(imageSrc);
                }
            };
        }, [currentUser, imageSrc]); // Fixed dependency array

        return (
            <div className="profile-picture">
                {imageSrc && !imageError ? (
                    <img 
                        src={imageSrc}
                        alt="Profile" 
                        className="profile-img"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="profile-placeholder">
                        {(currentUser?.username || currentUser?.Username || 'U').charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="user-bg">
            <div className="user-container">
                <div className="user-header">
                    <div className="header-content">
                        {/* User Profile Section */}
                        {currentUser && (
                            <div className="user-profile">
                                <ProfilePicture currentUser={currentUser} />
                                <div className="user-info">
                                    <span className="username">
                                        {currentUser.username || currentUser.Username || 'User'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="header-text">
                            <h1>Available Quizzes</h1>
                            <p>Choose a quiz to test your knowledge!</p>
                        </div>
                        
                        <div className="header-actions">
                            <button 
                                onClick={() => navigate('/my-results')} 
                                className="my-results-btn"
                            >
                                📊 My Results
                            </button>
                            <button 
                                onClick={() => navigate('/leaderboard')} 
                                className="leaderboard-btn"
                            >
                                🏆 Leaderboards
                            </button>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="logout-btn"
                >
                    🚪 Logout
                </button>

                {error && <div className="error-message">{error}</div>}

                {/* Filters Section */}
                <div className="filters-section">
                    <div className="filters-container">
                        <div className="filter-group">
                            <label htmlFor="search">Search Quizzes</label>
                            <input
                                id="search"
                                type="text"
                                placeholder="Search by title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="filter-input"
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="subject">Subject</label>
                            <select
                                id="subject"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Subjects</option>
                                {allSubjects.map(subject => (
                                    <option key={subject} value={subject}>
                                        {QuizSubjectNames[subject] || subject}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="difficulty">Difficulty</label>
                            <select
                                id="difficulty"
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Difficulties</option>
                                {allDifficulties.map(difficulty => (
                                    <option key={difficulty} value={difficulty}>
                                        {QuizLevelNames[difficulty] || difficulty}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={clearFilters}
                            className="clear-filters-btn"
                        >
                            Clear Filters
                        </button>
                    </div>

                    <div className="results-count">
                        {filteredQuizzes.length === quizzes.length 
                            ? `Showing all ${quizzes.length} quizzes`
                            : `Showing ${filteredQuizzes.length} of ${quizzes.length} quizzes`
                        }
                    </div>
                </div>

                <div className="quizzes-grid">
                    {filteredQuizzes.length > 0 ? (
                        filteredQuizzes.map(quiz => (
                            <div key={quiz.Id || quiz.id} className="quiz-card">
                                <div className="quiz-card-header">
                                    <h3>{quiz.Title || quiz.title}</h3>
                                    <span className={`quiz-level ${getDifficultyClass(quiz.LevelOfDifficulty || quiz.levelOfDifficulty)}`}>
                                        {QuizLevelNames[quiz.LevelOfDifficulty || quiz.levelOfDifficulty] || (quiz.LevelOfDifficulty || quiz.levelOfDifficulty)}
                                    </span>
                                </div>
                                
                                <div className="quiz-card-body">
                                    <p className="quiz-description">
                                        {quiz.Description || quiz.description}
                                    </p>
                                    
                                    <div className="quiz-info">
                                        <div className="info-item">
                                            <span className="info-label">Questions:</span>
                                            <span className="info-value">{quiz.NumberOfQuestions || quiz.numberOfQuestions || 'N/A'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Time Limit:</span>
                                            <span className="info-value">{quiz.TimeLimit || quiz.timeLimit}</span>
                                        </div>
                                        <div className="info-item subjects">
                                            <span className="info-label">Subjects:</span>
                                            <span className="info-value">
                                                {Array.isArray(quiz.Subjects || quiz.subjects)
                                                    ? (quiz.Subjects || quiz.subjects)
                                                        .map(subject => QuizSubjectNames[subject] || subject)
                                                        .join(', ')
                                                    : 'None'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="quiz-card-footer">
                                    <button
                                        onClick={() => handleStartQuiz(quiz)}
                                        className="start-quiz-btn"
                                        disabled={!quiz.NumberOfQuestions && !quiz.numberOfQuestions}
                                    >
                                        {!quiz.NumberOfQuestions && !quiz.numberOfQuestions 
                                            ? 'No Questions Available' 
                                            : 'Start Quiz'
                                        }
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-quizzes">
                            <p>No quizzes match your current filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RegularUserStartPage;
