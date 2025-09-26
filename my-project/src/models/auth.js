/**
 * @typedef {Object} LoginCredentials
 * @property {string} emailOrUsername
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {File|null} profilePicture
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} token
 * @property {User} user
 */

/**
 * @typedef {Object} DecodedToken
 * @property {string} sub - User ID
 * @property {string} email
 * @property {string} role
 * @property {number} exp - Expiration timestamp
 * @property {number} iat - Issued at timestamp
 */

export const UserRoles = {
    ADMIN: 'ADMIN',      
    REGULAR: 'REGULAR'   
};