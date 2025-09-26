import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { getQuizQuestions } from '../services/questionService';
import { createQuizAttempt } from '../services/quizSolvingService';
import { getQuizById } from '../services/quizService';
import { QuestionTypes } from '../models/question';
import '../styles/QuizTakingPageStyle.css';

function QuizTakingPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isQuizStarted, setIsQuizStarted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    const fetchQuizData = useCallback(async () => {
        try {
            setLoading(true);
            
            // Fetch both quiz details and questions
            const [quizData, questionsData] = await Promise.all([
                getQuizById(quizId),
                getQuizQuestions(quizId)
            ]);
            
            setQuestions(questionsData || []);
            setQuiz({
                id: quizId,
                title: quizData.Title || quizData.title,
                timeLimit: quizData.TimeLimit || quizData.timeLimit || '01:00:00'
            });
        } catch (err) {
            setError('Failed to load quiz: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [quizId]);

    useEffect(() => {
        fetchQuizData();
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [fetchQuizData]);

    const parseTimeLimit = (timeLimit) => {
        const parts = timeLimit.split(':');
        return (parseInt(parts[0]) * 3600) + (parseInt(parts[1]) * 60) + parseInt(parts[2]);
    };

    const startQuiz = () => {
        if (quiz && quiz.timeLimit) {
            const totalSeconds = parseTimeLimit(quiz.timeLimit);
            setTimeRemaining(totalSeconds);
            setIsQuizStarted(true);
            startTimeRef.current = Date.now();
            
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        submitQuiz(true); // Auto-submit when time runs out
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId, answerData) => {
        console.log('Answer changed for question', questionId, ':', answerData);
        setUserAnswers(prev => {
            const newAnswers = {
                ...prev,
                [questionId]: answerData
            };
            console.log('Updated userAnswers:', newAnswers);
            return newAnswers;
        });
    };

    const submitQuiz = useCallback(async (isAutoSubmit = false) => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        try {
            console.log('User Answers Object:', userAnswers);
            console.log('Questions:', questions);

            const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
            const durationInSeconds = Math.floor(duration / 1000);
            
            // Convert duration to TimeSpan format (HH:MM:SS)
            const hours = Math.floor(durationInSeconds / 3600);
            const minutes = Math.floor((durationInSeconds % 3600) / 60);
            const seconds = durationInSeconds % 60;
            const timeSpanDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Prepare answers using model constants
            const answers = questions.map(question => {
                const questionId = question.Id || question.id;
                const userAnswer = userAnswers[questionId];
                
                console.log(`Question ${questionId}:`, {
                    question: question,
                    userAnswer: userAnswer,
                    questionType: question.Type || question.type,
                    hasUserAnswer: !!userAnswer
                });
                
                if (!userAnswer) {
                    console.log(`No answer for question ${questionId}`);
                    return {
                        QuestionId: questionId,
                        SelectedOptionIds: [],
                        FillInTheBlankInput: null
                    };
                }

                // Use model constants instead of magic strings
                if (question.Type === QuestionTypes.FILL_IN_THE_BLANK || question.type === QuestionTypes.FILL_IN_THE_BLANK) {
                    console.log(`Fill in blank answer for ${questionId}:`, userAnswer.text);
                    return {
                        QuestionId: questionId,
                        SelectedOptionIds: [],
                        FillInTheBlankInput: userAnswer.text || ''
                    };
                } else {
                    console.log(`Multiple choice answer for ${questionId}:`, userAnswer.selectedOptions);
                    return {
                        QuestionId: questionId,
                        SelectedOptionIds: userAnswer.selectedOptions || [],
                        FillInTheBlankInput: null
                    };
                }
            });

            // Create request payload following proper model structure
            const payload = {
                QuizId: parseInt(quizId),
                Duration: timeSpanDuration,
                Answers: answers
            };

            console.log('Final payload:', payload);
            
            const result = await createQuizAttempt(payload);
            
            if (isAutoSubmit) {
                alert('Time is up! Quiz submitted automatically.');
            } else {
                alert('Quiz submitted successfully!');
            }
            
            // Navigate to results page
            navigate(`/quiz-results/${result.Id || result.id}`);
            
        } catch (err) {
            setError('Failed to submit quiz: ' + err.message);
            setIsSubmitting(false);
        }
    }, [isSubmitting, quizId, questions, userAnswers, navigate]);

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const goToQuestion = (index) => {
        setCurrentQuestionIndex(index);
    };

    const goBackToQuizzes = useCallback(() => {
        // Clean up timer when going back
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        // Reset all state
        setIsQuizStarted(false);
        setTimeRemaining(0);
        setIsSubmitting(false);
        
        // Navigate back
        navigate('/regular-user');
    }, [navigate]);


    if (loading) {
        return (
            <div className="quiz-taking-bg">
                <div className="quiz-container">
                    <div className="loading-message">Loading quiz...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quiz-taking-bg">
                <div className="quiz-container">
                    <div className="error-message">{error}</div>
                    <button onClick={goBackToQuizzes} className="back-btn">
                        Back to Quizzes
                    </button>
                </div>
            </div>
        );
    }

    if (!isQuizStarted) {
        return (
            <div className="quiz-taking-bg">
                <div className="quiz-container">
                    <div className="quiz-start-screen">
                        <h1>Ready to Start Quiz?</h1>
                        <div className="quiz-info">
                            <p><strong>Questions:</strong> {questions.length}</p>
                            <p><strong>Time Limit:</strong> {quiz?.timeLimit || 'No limit'}</p>
                            <p><strong>Instructions:</strong> Answer all questions to the best of your ability. You can navigate between questions, but the timer will run continuously once started.</p>
                        </div>
                        <button onClick={startQuiz} className="start-quiz-btn">
                            Start Quiz
                        </button>
                        <button onClick={goBackToQuizzes} className="back-btn">
                            Back to Quizzes
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="quiz-taking-bg">
            <div className="quiz-container">
                {/* Timer and Progress */}
                <div className="quiz-header">
                    <div className="timer-container">
                        <div className={`timer ${timeRemaining <= 300 ? 'timer-warning' : ''} ${timeRemaining <= 60 ? 'timer-critical' : ''}`}>
                            <span className="timer-icon">⏰</span>
                            <span className="timer-text">{formatTime(timeRemaining)}</span>
                        </div>
                    </div>
                    
                    <div className="progress-container">
                        <span className="progress-text">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Question Content */}
                <div className="question-container">
                    <div className="question-header">
                        <h2>Question {currentQuestionIndex + 1}</h2>
                        <span className="question-points">
                            {currentQuestion.Points || currentQuestion.points} points
                        </span>
                    </div>
                    
                    <div className="question-text">
                        {currentQuestion.Text || currentQuestion.text}
                    </div>

                    <QuestionAnswerInput
                        question={currentQuestion}
                        userAnswer={userAnswers[currentQuestion.Id || currentQuestion.id]}
                        onAnswerChange={handleAnswerChange}
                    />
                </div>

                {/* Navigation */}
                <div className="quiz-navigation">
                    <div className="nav-buttons">
                        <button 
                            onClick={previousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="nav-btn prev-btn"
                        >
                            ← Previous
                        </button>
                        
                        <button 
                            onClick={nextQuestion}
                            disabled={currentQuestionIndex === questions.length - 1}
                            className="nav-btn next-btn"
                        >
                            Next →
                        </button>
                    </div>

                    <div className="question-grid">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToQuestion(index)}
                                className={`question-nav-btn ${
                                    index === currentQuestionIndex ? 'current' : ''
                                } ${
                                    userAnswers[questions[index].Id || questions[index].id] ? 'answered' : ''
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}

                    </div>

                    <button 
                        onClick={() => submitQuiz(false)}
                        disabled={isSubmitting}
                        className="submit-quiz-btn"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Component for handling different question types
function QuestionAnswerInput({ question, userAnswer, onAnswerChange }) {
    const questionId = question.Id || question.id;
    const questionType = question.Type || question.type;
    const answerOptions = question.AnswerOptions || question.answerOptions || [];

    const handleOptionChange = (optionId, isChecked) => {
        console.log('Option changed:', { optionId, isChecked, questionType });
        
        // Use model constants instead of magic strings
        if (questionType === QuestionTypes.MULTIPLE_CHOICE_ONE_CORRECT || questionType === QuestionTypes.TRUE_FALSE) {
            // Single selection
            const newAnswer = {
                selectedOptions: isChecked ? [optionId] : []
            };
            console.log('Single selection answer:', newAnswer);
            onAnswerChange(questionId, newAnswer);
        } else if (questionType === QuestionTypes.MULTIPLE_CHOICE_MULTIPLE_CORRECT) {
            // Multiple selection
            const currentOptions = userAnswer?.selectedOptions || [];
            const newOptions = isChecked 
                ? [...currentOptions, optionId]
                : currentOptions.filter(id => id !== optionId);
            
            const newAnswer = {
                selectedOptions: newOptions
            };
            console.log('Multiple selection answer:', newAnswer);
            onAnswerChange(questionId, newAnswer);
        }
    };

    const handleTextChange = (text) => {
        console.log('Text changed:', text);
        const newAnswer = {
            text: text
        };
        console.log('Fill in blank answer:', newAnswer);
        onAnswerChange(questionId, newAnswer);
    };

    // Use model constant instead of magic string
    if (questionType === QuestionTypes.FILL_IN_THE_BLANK) {
        return (
            <div className="answer-container">
                <input
                    type="text"
                    placeholder="Enter your answer..."
                    value={userAnswer?.text || ''}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className="fill-blank-input"
                />
            </div>
        );
    }

    return (
        <div className="answer-container">
            {answerOptions.map((option, index) => (
                <label key={option.Id || option.id} className="answer-option">
                    <input
                        type={questionType === QuestionTypes.MULTIPLE_CHOICE_MULTIPLE_CORRECT ? 'checkbox' : 'radio'}
                        name={`question-${questionId}`}
                        checked={userAnswer?.selectedOptions?.includes(option.Id || option.id) || false}
                        onChange={(e) => handleOptionChange(option.Id || option.id, e.target.checked)}
                        className="answer-input"
                    />
                    <span className="answer-text">{option.Text || option.text}</span>
                </label>
            ))}
        </div>
    );
}

export default QuizTakingPage;