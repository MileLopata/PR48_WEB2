// src/models/user.js

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {string|null} profilePicture
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} emailOrUsername
 * @property {string} password
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} token
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {File} [profilePicture]
 */
