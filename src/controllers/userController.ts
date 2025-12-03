import { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  authenticateUser,
  isAdmin,
  User,
  updateUserProfile
} from '../services/userService';

/**
 * Register a new user
 */
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, provider = 'email', type = 'user', avatar_url, favorite_team_id } = req.body;

    // Validate required fields
    if (!name || !email || (provider === 'email' && !password)) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required for email registration'
      });
    }

    // Register user
    const result = await registerUser({
      name,
      email,
      provider,
      password,
      type,
      avatar_url,
      favorite_team_id
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error: any) {
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
export async function login(req: Request, res: Response) {
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
    const result = await loginUser(email, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
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
export async function getProfile(req: Request, res: Response) {
  try {
    // Get user from request (set by auth middleware)
    const user = (req as any).user;

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
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving profile',
      error: error.message
    });
  }
}

/**
 * Update current user profile
 */
export async function updateProfile(req: Request, res: Response) {
  try {
    // Get user from request (set by auth middleware)
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Get profile data from request body
    const { name, avatar_url, favorite_team_id } = req.body;

    // Update user profile
    const result = await updateUserProfile(user.user_id, {
      name,
      avatar_url,
      favorite_team_id
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating profile',
      error: error.message
    });
  }
}

/**
 * Middleware to authenticate user
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    
    const user = await authenticateUser(token);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
      return;
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error: any) {
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
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    if (!isAdmin(user)) {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin check',
      error: error.message
    });
  }
}