import React, { useEffect, useState, useCallback } from 'react';
import { getAllQuizzes } from '../services/quizService';
import { QuizLevelNames, QuizSubjectNames } from '../models/quiz';
import '../styles/RegularUserStartPageStyle.css';

function RegularUserStartPage() {
    const [quizzes, setQuizzes] = useState([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');

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

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSubject('');
        setSelectedDifficulty('');
    };

    const handleStartQuiz = (quiz) => {
        // TODO: Implement quiz start functionality
        console.log('Starting quiz:', quiz);
        alert(`Starting quiz: ${quiz.Title || quiz.title}`);
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

    return (
        <div className="user-bg">
            <div className="user-container">
                <div className="user-header">
                    <h1>Available Quizzes</h1>
                    <p>Choose a quiz to test your knowledge!</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* Filters Section */}
                <div className="filters-section">
                    <div className="filters-container">
                        <div className="filter-group">
                            <label htmlFor="search">Search:</label>
                            <input
                                id="search"
                                type="text"
                                placeholder="Search by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="filter-input"
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="subject">Subject:</label>
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
                            <label htmlFor="difficulty">Difficulty:</label>
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

                        <div className="filter-group">
                            <button 
                                onClick={clearFilters}
                                className="clear-filters-btn"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    <div className="results-count">
                        Showing {filteredQuizzes.length} of {quizzes.length} quizzes
                    </div>
                </div>

                <div className="quizzes-grid">
                    {filteredQuizzes.length === 0 ? (
                        <div className="no-quizzes">
                            {quizzes.length === 0 ? (
                                <p>No quizzes available at the moment.</p>
                            ) : (
                                <p>No quizzes match your search criteria.</p>
                            )}
                        </div>
                    ) : (
                        filteredQuizzes.map(quiz => (
                            <div key={quiz.Id || quiz.id} className="quiz-card">
                                <div className="quiz-card-header">
                                    <h3>{quiz.Title || quiz.title}</h3>
                                    <div className={`quiz-level ${getDifficultyClass(quiz.levelOfDifficulty || quiz.LevelOfDifficulty)}`}>
                                        {QuizLevelNames[quiz.levelOfDifficulty || quiz.LevelOfDifficulty] || 
                                         (quiz.levelOfDifficulty || quiz.LevelOfDifficulty)}
                                    </div>
                                </div>

                                <div className="quiz-card-body">
                                    <p className="quiz-description">
                                        {quiz.Description || quiz.description}
                                    </p>

                                    <div className="quiz-info">
                                        <div className="info-item">
                                            <span className="info-label">Questions:</span>
                                            <span className="info-value">
                                                {quiz.NumberOfQuestions || quiz.numberOfQuestions || 0}
                                            </span>
                                        </div>

                                        <div className="info-item">
                                            <span className="info-label">Time Limit:</span>
                                            <span className="info-value">
                                                {quiz.TimeLimit || quiz.timeLimit}
                                            </span>
                                        </div>

                                        <div className="info-item subjects">
                                            <span className="info-label">Subjects:</span>
                                            <span className="info-value">
                                                {Array.isArray(quiz.subjects || quiz.Subjects)
                                                    ? (quiz.subjects || quiz.Subjects)
                                                        .map(subj => QuizSubjectNames[subj] || subj)
                                                        .join(', ')
                                                    : 'General'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="quiz-card-footer">
                                    <button 
                                        className="start-quiz-btn"
                                        onClick={() => handleStartQuiz(quiz)}
                                        disabled={!quiz.NumberOfQuestions && !quiz.numberOfQuestions}
                                    >
                                        {(quiz.NumberOfQuestions || quiz.numberOfQuestions) > 0 
                                            ? 'Start Quiz' 
                                            : 'No Questions Available'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default RegularUserStartPage;
