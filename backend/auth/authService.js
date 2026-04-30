const bcrypt = require('bcrypt');
const database = require('../database-postgres');

/**
 * Validate password against security rules
 * @param {string} password - Plain text password
 * @returns {Object} - {valid: boolean, errors: string[]}
 */
function validatePassword(password) {
  const errors = [];
  
  // Minimum length requirement
  if (!password || password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  // Maximum length to prevent DoS attacks
  if (password && password.length > 128) {
    errors.push('La contraseña no debe exceder 128 caracteres');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Hash a password using bcrypt with cost factor 10
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  try {
    const saltRounds = 10; // Minimum cost factor as per requirements
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error('Error hashing password: ' + error.message);
  }
}

/**
 * Verify a password against its hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Error verifying password: ' + error.message);
  }
}

/**
 * Authenticate user with username/email and password
 * @param {string} identifier - Username or email
 * @param {string} password - Plain text password
 * @returns {Promise<Object|null>} - User object without password or null if invalid
 */
async function authenticateUser(identifier, password) {
  try {
    // Try to find user by username first
    let user = await database.getUserByUsername(identifier);
    
    // If not found by username, try by email
    if (!user) {
      user = await database.getUserByEmail(identifier);
    }
    
    if (!user) {
      return null; // User not found
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return null; // Invalid password
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} - User object without password or null if not found
 */
async function getUserById(userId) {
  try {
    const user = await database.getUserById(userId);
    
    if (!user) {
      return null;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Get user by username
 * @param {string} username - Username
 * @returns {Promise<Object|null>} - User object without password or null if not found
 */
async function getUserByUsername(username) {
  try {
    const user = await database.getUserByUsername(username);
    
    if (!user) {
      return null;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
}

/**
 * Create a new user
 * @param {Object} userData - User data {username, email, password, role}
 * @returns {Promise<Object|null>} - Created user without password or null if error
 */
async function createUser(userData) {
  try {
    const { username, email, password, role = 'patient' } = userData;
    
    // Validate required fields
    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error('Password validation failed: ' + passwordValidation.errors.join(', '));
    }
    
    // Check if username or email already exists
    const existingUserByUsername = await database.getUserByUsername(username);
    const existingUserByEmail = await database.getUserByEmail(email);
    
    if (existingUserByUsername || existingUserByEmail) {
      throw new Error('Username or email already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user in database
    const newUser = await database.createUser({
      username,
      email,
      password: hashedPassword,
      role
    });
    
    if (!newUser) {
      throw new Error('Failed to create user');
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Update user password
 * @param {number} userId - User ID
 * @param {string} newPassword - New plain text password
 * @returns {Promise<boolean>} - True if successful
 */
async function updateUserPassword(userId, newPassword) {
  try {
    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      console.error('Password validation failed:', passwordValidation.errors);
      return false;
    }
    
    // Check if user exists
    const user = await database.getUserById(userId);
    if (!user) {
      return false;
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password in database
    const updated = await database.updateUser(userId, {
      password: hashedPassword
    });
    
    return updated !== null;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
}

module.exports = {
  validatePassword,
  hashPassword,
  verifyPassword,
  authenticateUser,
  getUserById,
  getUserByUsername,
  createUser,
  updateUserPassword
};
