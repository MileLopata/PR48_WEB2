/**
 * @typedef {Object} Question
 * @property {number} id
 * @property {string} text
 * @property {number} points
 * @property {string} type - 'MULTIPLE_CHOICE_ONE_CORRECT' | 'MULTIPLE_CHOICE_MULTIPLE_CORRECT' | 'TRUE_FALSE' | 'FILL_IN_THE_BLANK'
 * @property {AnswerOption[]} answerOptions
 */

/**
 * @typedef {Object} AnswerOption
 * @property {number} id
 * @property {string} text
 * @property {boolean} isCorrect
 * @property {string|null} fillInTheBlankCorrectAnswer
 */

/**
 * @typedef {Object} CreateQuestionRequest
 * @property {string} text
 * @property {number} points
 * @property {string} type
 * @property {CreateAnswerOptionRequest[]} answerOptions
 */

/**
 * @typedef {Object} CreateAnswerOptionRequest
 * @property {string} Text
 * @property {boolean} IsCorrect
 * @property {string|null} FillInTheBlankCorrectAnswer
 */

export const QuestionTypes = {
    MULTIPLE_CHOICE_ONE_CORRECT: 'MULTIPLE_CHOICE_ONE_CORRECT',
    MULTIPLE_CHOICE_MULTIPLE_CORRECT: 'MULTIPLE_CHOICE_MULTIPLE_CORRECT',
    TRUE_FALSE: 'TRUE_FALSE',
    FILL_IN_THE_BLANK: 'FILL_IN_THE_BLANK'
};