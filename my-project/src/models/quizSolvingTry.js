/**
 * @typedef {Object} QuizSolvingTry
 * @property {number} id
 * @property {number} userId
 * @property {number} quizId
 * @property {string} userName
 * @property {string} quizTitle
 * @property {number} score
 * @property {number} maxScore
 * @property {string} duration
 * @property {string} attemptedAt
 * @property {number} userRankingPosition
 * @property {UserAnswer[]} userAnswers
 */

/**
 * @typedef {Object} UserAnswer
 * @property {number} questionId
 * @property {number[]} selectedOptionIds
 * @property {string|null} textAnswer
 */

/**
 * @typedef {Object} CreateQuizSolvingTryRequest
 * @property {number} QuizId
 * @property {UserAnswerRequest[]} UserAnswers
 * @property {string} Duration
 */

/**
 * @typedef {Object} UserAnswerRequest
 * @property {number} QuestionId
 * @property {number[]} SelectedOptionIds
 * @property {string|null} TextAnswer
 */

/**
 * @typedef {Object} LeaderboardEntry
 * @property {number} userId
 * @property {string} userName
 * @property {number} score
 * @property {number} maxScore
 * @property {string} duration
 * @property {string} attemptedAt
 * @property {number} userRankingPosition
 */

/**
 * @typedef {Object} QuizSolvingTryResult
 * @property {number} id
 * @property {string} userName
 * @property {string} quizTitle
 * @property {number} score
 * @property {number} maxScore
 * @property {number} percentage
 * @property {string} duration
 * @property {string} attemptedAt
 * @property {QuestionResult[]} questionResults
 */

/**
 * @typedef {Object} QuestionResult
 * @property {number} questionId
 * @property {string} questionText
 * @property {number} points
 * @property {number} earnedPoints
 * @property {boolean} isCorrect
 * @property {string[]} correctAnswers
 * @property {string[]} userAnswers
 */