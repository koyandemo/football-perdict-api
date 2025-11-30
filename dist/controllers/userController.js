"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getProfile = getProfile;
exports.authenticate = authenticate;
exports.requireAdmin = requireAdmin;
const userService_1 = require("../services/userService");
/**
 * Register a new user
 */
async function register(req, res) {
    try {
        const { name, email, password, provider = 'email', type = 'user' } = req.body;
        // Validate required fields
        if (!name || !email || (provider === 'email' && !password)) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required for email registration'
            });
        }
        // Register user
        const result = await (0, userService_1.registerUser)({
            name,
            email,
            provider,
            password,
            type
        });
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(201).json(result);
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
            error: error.message
        });
    }
}
/**
 * Login user
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        // Login user
        const result = await (0, userService_1.loginUser)(email, password);
        if (!result.success) {
            return res.status(401).json(result);
        }
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during login',
            error: error.message
        });
    }
}
/**
 * Get current user profile
 */
async function getProfile(req, res) {
    try {
        // Get user from request (set by auth middleware)
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            user
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving profile',
            error: error.message
        });
    }
}
/**
 * Middleware to authenticate user
 */
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authorization token required'
            });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const user = await (0, userService_1.authenticateUser)(token);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
            return;
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
            error: error.message
        });
    }
}
/**
 * Middleware to check if user is admin
 */
async function requireAdmin(req, res, next) {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }
        if (!(0, userService_1.isAdmin)(user)) {
            res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during admin check',
            error: error.message
        });
    }
}
//# sourceMappingURL=userController.js.map