/**
 * @typedef {Object} Quiz
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {number} levelOfDifficulty
 * @property {string[]} subjects
 * @property {string} timeLimit
 * @property {number} numberOfQuestions
 */

/**
 * @typedef {Object} CreateQuizRequest
 * @property {string} Title
 * @property {string} Description
 * @property {number} LevelOfDifficulty
 * @property {string[]} Subjects
 * @property {string} TimeLimit
 */

/**
 * @typedef {Object} UpdateQuizRequest
 * @property {string} Title
 * @property {string} Description
 * @property {number} LevelOfDifficulty
 * @property {string[]} Subjects
 * @property {string} TimeLimit
 */

export const QuizLevelNames = {
    1: 'Beginner',
    2: 'Easy', 
    3: 'Normal',
    4: 'Intermediate',
    5: 'Hard',
    6: 'Nightmare',
    BEGGINER: 'Beginner',
    EASY: 'Easy',
    NORMAL: 'Normal', 
    INTERMEDIATE: 'Intermediate',
    HARD: 'Hard',
    NIGHTMARE: 'Nightmare'
};

export const QuizSubjectNames = {
    1: 'Sports',
    2: 'NFL',
    3: 'World of Warcraft',
    4: 'Movies',
    5: 'TV Shows',
    6: 'Science',
    7: 'Astronomy',
    8: 'Biology',
    9: 'History',
    10: 'Ancient Warfare',
    11: 'Geography',
    12: 'General Knowledge',
    13: 'IQ Test',
    SPORTS: 'Sports',
    NFL: 'NFL',
    WORLD_OF_WARCRAFT: 'World of Warcraft',
    MOVIES: 'Movies',
    TV_SHOWS: 'TV Shows',
    SCIENCE: 'Science',
    ASTRONOMY: 'Astronomy',
    BIOLOGY: 'Biology',
    HISTORY: 'History',
    ANCIENT_WARFARE: 'Ancient Warfare',
    GEOGRAPHY: 'Geography',
    GENERAL_KNOWLEDGE: 'General Knowledge',
    IQ_TEST: 'IQ Test'
};

export const QuizDifficultyLevels = {
    BEGINNER: 1,
    EASY: 2,
    NORMAL: 3,
    INTERMEDIATE: 4,
    HARD: 5,
    NIGHTMARE: 6
};