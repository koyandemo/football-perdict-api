"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.isAdmin = isAdmin;
exports.authenticateUser = authenticateUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../config/supabase");
/**
 * Hash a password
 */
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcryptjs_1.default.hash(password, saltRounds);
}
/**
 * Compare a password with its hash
 */
async function comparePassword(password, hash) {
    return await bcryptjs_1.default.compare(password, hash);
}
/**
 * Generate a JWT token
 */
function generateToken(user) {
    const payload = {
        user_id: user.user_id,
        email: user.email,
        type: user.type
    };
    // Use a secret key from environment variables
    const secret = process.env.JWT_SECRET || 'football_prediction_secret_key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
}
/**
 * Verify a JWT token
 */
function verifyToken(token) {
    const secret = process.env.JWT_SECRET || 'football_prediction_secret_key';
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        return null;
    }
}
/**
 * Register a new user
 */
async function registerUser(userData) {
    try {
        // Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('email', userData.email)
            .single();
        if (existingUser) {
            return {
                success: false,
                message: 'User already exists with this email',
                error: 'USER_EXISTS'
            };
        }
        // Hash password if provider is email
        let hashedPassword;
        if (userData.provider === 'email' && userData.password) {
            hashedPassword = await hashPassword(userData.password);
        }
        // Insert new user
        const { data, error } = await supabase_1.supabase
            .from('users')
            .insert({
            name: userData.name,
            email: userData.email,
            provider: userData.provider,
            password: hashedPassword,
            type: userData.type || 'user'
        })
            .select()
            .single();
        if (error) {
            return {
                success: false,
                message: 'Failed to register user',
                error: error.message
            };
        }
        // Remove password from response
        const { password, ...userWithoutPassword } = data;
        // Generate token
        const token = generateToken(userWithoutPassword);
        return {
            success: true,
            message: 'User registered successfully',
            token,
            user: userWithoutPassword
        };
    }
    catch (error) {
        return {
            success: false,
            message: 'Failed to register user',
            error: error.message
        };
    }
}
/**
 * Login user with email and password
 */
async function loginUser(email, password) {
    try {
        // Fetch user by email
        const { data: user, error } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('provider', 'email')
            .single();
        if (error || !user) {
            return {
                success: false,
                message: 'Invalid email or password',
                error: 'INVALID_CREDENTIALS'
            };
        }
        // Check if password matches
        if (!user.password || !(await comparePassword(password, user.password))) {
            return {
                success: false,
                message: 'Invalid email or password',
                error: 'INVALID_CREDENTIALS'
            };
        }
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        // Generate token
        const token = generateToken(userWithoutPassword);
        return {
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        };
    }
    catch (error) {
        return {
            success: false,
            message: 'Failed to login',
            error: error.message
        };
    }
}
/**
 * Get user by ID
 */
async function getUserById(userId) {
    try {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error) {
            return null;
        }
        return data;
    }
    catch (error) {
        return null;
    }
}
/**
 * Get user by email
 */
async function getUserByEmail(email) {
    try {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error) {
            return null;
        }
        return data;
    }
    catch (error) {
        return null;
    }
}
/**
 * Check if user is admin
 */
function isAdmin(user) {
    return user.type === 'admin';
}
/**
 * Authenticate user from token
 */
async function authenticateUser(token) {
    try {
        const decoded = verifyToken(token);
        if (!decoded || !decoded.user_id) {
            return null;
        }
        const user = await getUserById(decoded.user_id);
        return user;
    }
    catch (error) {
        return null;
    }
}
//# sourceMappingURL=userService.js.map