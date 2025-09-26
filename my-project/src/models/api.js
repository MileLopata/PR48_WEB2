/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string|null} message
 * @property {any} data
 */

/**
 * @typedef {Object} ApiError
 * @property {string} error
 * @property {string|null} details
 * @property {number} statusCode
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {any[]} data
 * @property {number} totalCount
 * @property {number} pageNumber
 * @property {number} pageSize
 * @property {boolean} hasNext
 * @property {boolean} hasPrevious
 */

export const ResponseStatus = {
    OK: 'OK',
    ERROR: 'ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    BAD_REQUEST: 'BAD_REQUEST'
};