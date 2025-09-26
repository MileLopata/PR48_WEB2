import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizAttempt } from '../services/quizSolvingService';
import { getQuizQuestions } from '../services/questionService';
import { getQuizById } from '../services/quizService';
import { QuestionTypes } from '../models/question';
import { QuizLevelNames } from '../models/quiz';
import '../styles/QuizResultsPageStyle.css';

function QuizResultsPage() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    
    const [attemptData, setAttemptData] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchResultsData = useCallback(async () => {
        try {
            setLoading(true);
            
            // First, get the attempt data
            const attempt = await getQuizAttempt(attemptId);
            console.log('Attempt data received:', attempt);
            
            // Debug: Check all properties
            console.log('All attempt properties:', Object.keys(attempt));
            console.log('Looking for Results in:', attempt.Results || attempt.results || attempt.userAnswers || attempt.answers);
            
            setAttemptData(attempt);
            
            // Then fetch quiz details and questions
            const [quizData, questionsData] = await Promise.all([
                getQuizById(attempt.QuizId || attempt.quizId),
                getQuizQuestions(attempt.QuizId || attempt.quizId)
            ]);
            
            console.log('Quiz data received:', quizData);
            console.log('Questions data received:', questionsData); 
            console.log('Attempt Results:', attempt.Results); 
            
            setQuiz(quizData);
            setQuestions(questionsData || []);
            
        } catch (err) {
            setError('Failed to load results: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [attemptId]);

    useEffect(() => {
        fetchResultsData();
    }, [fetchResultsData]);

    const formatDuration = (duration) => {
        // Handle both string format "HH:MM:SS" and object format
        if (typeof duration === 'string') {
            return duration;
        }
        
        const totalSeconds = duration.hours * 3600 + duration.minutes * 60 + duration.seconds;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getQuestionResult = (questionId) => {
        if (!attemptData) return null;
        
        // Handle both Results (uppercase from create) and userAnswers (lowercase from get)
        const results = attemptData.Results || attemptData.userAnswers;
        if (!results) return null;
        
        return results.find(result => 
            (result.QuestionId === questionId) || (result.questionId === questionId)
        );
    };

    const getCorrectAnswersCount = () => {
        if (!attemptData) return 0;
        
        // Handle both Results and userAnswers
        const results = attemptData.Results || attemptData.userAnswers;
        if (!results) return 0;
        
        return results.filter(result => {
            const questionId = result.QuestionId || result.questionId;
            const question = questions.find(q => (q.Id || q.id) === questionId);
            if (!question) return false;
            
            const questionPoints = question.Points || question.points || 0;
            const resultScore = result.Score || result.score || 0;
            return resultScore === questionPoints;
        }).length;
    };

    const getScorePercentage = () => {
        if (!attemptData || !questions.length) return 0;
        
        const totalPoints = questions.reduce((sum, q) => sum + (q.Points || q.points || 0), 0);
        const userScore = attemptData.Score || attemptData.score || 0;
        
        return totalPoints > 0 ? Math.round((userScore / totalPoints) * 100) : 0;
    };

    const getCorrectAnswers = (question) => {
        const answerOptions = question.AnswerOptions || question.answerOptions || [];
        
        // Use model constant instead of magic string
        if (question.Type === QuestionTypes.FILL_IN_THE_BLANK || question.type === QuestionTypes.FILL_IN_THE_BLANK) {
            return answerOptions
                .filter(option => option.FillInTheBlankCorrectAnswer || option.fillInTheBlankCorrectAnswer)
                .map(option => option.FillInTheBlankCorrectAnswer || option.fillInTheBlankCorrectAnswer);
        }
        
        return answerOptions
            .filter(option => option.IsCorrect || option.isCorrect)
            .map(option => option.Text || option.text);
    };

    const isAnswerCorrect = (question, userResult) => {
        if (!userResult) return false;
        
        const questionPoints = question.Points || question.points || 0;
        const resultScore = userResult.Score || userResult.score || 0;
        return resultScore === questionPoints;
    };

    const getUserAnswers = (question, userResult) => {
        if (!userResult) return [];
        
        // Use model constant instead of magic string
        if (question.Type === QuestionTypes.FILL_IN_THE_BLANK || question.type === QuestionTypes.FILL_IN_THE_BLANK) {
            return [userResult.FillInTheBlankInput || userResult.fillInTheBlankInput || 'No answer'];
        }
        
        const answerOptions = question.AnswerOptions || question.answerOptions || [];
        const selectedIds = userResult.SelectedOptionIds || userResult.selectedOptionIds || [];
        
        if (selectedIds.length === 0) return ['No answer'];
        
        return selectedIds.map(id => {
            const option = answerOptions.find(opt => (opt.Id || opt.id) === id);
            return option ? (option.Text || option.text) : 'Unknown';
        });
    };

    const getScoreColorClass = (percentage) => {
        if (percentage >= 70) return 'good';
        if (percentage >= 50) return 'average';
        return 'poor';
    };

    // Add a function to get quiz difficulty display
    const getQuizDifficultyDisplay = () => {
        if (!quiz) return '';
        const difficulty = quiz.LevelOfDifficulty || quiz.levelOfDifficulty;
        return QuizLevelNames[difficulty] || difficulty;
    };

    if (loading) {
        return (
            <div className="results-bg">
                <div className="results-container">
                    <div className="loading-message">Loading results...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="results-bg">
                <div className="results-container">
                    <div className="error-message">{error}</div>
                    <button onClick={() => navigate('/regular-user')} className="back-btn">
                        Back to Quizzes
                    </button>
                </div>
            </div>
        );
    }

    const percentage = getScorePercentage();
    const correctCount = getCorrectAnswersCount();

    return (
        <div className="results-bg">
            <div className="results-container">
                {/* Results Header - Enhanced with quiz info */}
                <div className="results-header">
                    <h1>Quiz Results</h1>
                    <h2>{quiz?.Title || quiz?.title}</h2>
                    {quiz && (
                        <div className="quiz-meta">
                            <span 
                                className="quiz-difficulty"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: '#fff',
                                    padding: '12px 20px',
                                    borderRadius: '25px',
                                    fontWeight: '500',
                                    fontSize: '0.95rem',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                                    borderLeft: '4px solid #17a2b8',
                                    transition: 'all 0.3s ease',
                                    textAlign: 'center',
                                    display: 'inline-block'
                                }}
                            >
                                Difficulty: {getQuizDifficultyDisplay()}
                            </span>
                            {quiz.Description || quiz.description ? (
                                <p className="quiz-description">
                                    {quiz.Description || quiz.description}
                                </p>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Score Summary */}
                <div className="score-summary">
                    <div className="score-circle-container">
                        <div className={`score-circle ${getScoreColorClass(percentage)}`}>
                            <span className="percentage">{percentage}%</span>
                        </div>
                    </div>
                    
                    <div className="score-details">
                        <div className="score-item">
                            <span className="label">Total Questions:</span>
                            <span className="value">{questions.length}</span>
                        </div>
                        <div className="score-item">
                            <span className="label">Correct Answers:</span>
                            <span className="value correct">{correctCount}</span>
                        </div>
                        <div className="score-item">
                            <span className="label">Incorrect Answers:</span>
                            <span className="value incorrect">{questions.length - correctCount}</span>
                        </div>
                        <div className="score-item">
                            <span className="label">Total Score:</span>
                            <span className="value">{attemptData?.Score || attemptData?.score || 0} points</span>
                        </div>
                        <div className="score-item">
                            <span className="label">Time Taken:</span>
                            <span className="value">{formatDuration(attemptData?.Duration || attemptData?.duration)}</span>
                        </div>
                        <div className="score-item">
                            <span className="label">Max Possible Score:</span>
                            <span className="value">
                                {questions.reduce((sum, q) => sum + (q.Points || q.points || 0), 0)} points
                            </span>
                        </div>
                    </div>
                </div>

                {/* Question by Question Review */}
                <div className="questions-review">
                    <h3>Question Review</h3>
                    
                    {questions.map((question, index) => {
                        const userResult = getQuestionResult(question.Id || question.id);
                        const isCorrect = isAnswerCorrect(question, userResult);
                        const correctAnswers = getCorrectAnswers(question);
                        const userAnswers = getUserAnswers(question, userResult);
                        const questionType = question.Type || question.type;
                        
                        return (
                            <div key={question.Id || question.id} className={`question-review ${isCorrect ? 'correct' : 'incorrect'}`}>
                                <div className="question-review-header">
                                    <div className="question-number">
                                        <span className={`result-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                                            {isCorrect ? '✓' : '✗'}
                                        </span>
                                        Question {index + 1}
                                        <span className="question-type">
                                            ({questionType?.replace(/_/g, ' ').toLowerCase() || 'unknown'})
                                        </span>
                                    </div>
                                    <div className="points-earned">
                                        {(userResult?.Score || userResult?.score || 0)} / {question.Points || question.points} points
                                    </div>
                                </div>
                                
                                <div className="question-text">
                                    {question.Text || question.text}
                                </div>
                                
                                <div className="answers-comparison">
                                    <div className="answer-section">
                                        <h5>Your Answer:</h5>
                                        <div className={`answer-list ${isCorrect ? 'correct-answer' : 'incorrect-answer'}`}>
                                            {userAnswers.map((answer, ansIndex) => (
                                                <div key={ansIndex} className="answer-item">
                                                    {answer}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {!isCorrect && (
                                        <div className="answer-section">
                                            <h5>Correct Answer{correctAnswers.length > 1 ? 's' : ''}:</h5>
                                            <div className="answer-list correct-answer">
                                                {correctAnswers.map((answer, ansIndex) => (
                                                    <div key={ansIndex} className="answer-item">
                                                        {answer}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="results-actions">
                    <button 
                        onClick={() => navigate('/regular-user')} 
                        className="back-to-quizzes-btn"
                    >
                        Back to Quizzes
                    </button>
                    <button 
                        onClick={() => navigate(`/quiz/${quiz?.Id || quiz?.id}`)} 
                        className="retake-quiz-btn"
                    >
                        Retake Quiz
                    </button>
                    <button 
                        onClick={() => navigate('/my-results')} 
                        className="my-results-btn"
                    >
                        View All My Results
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuizResultsPage;