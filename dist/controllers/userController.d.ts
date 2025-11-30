import { Request, Response, NextFunction } from 'express';
/**
 * Register a new user
 */
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Login user
 */
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Get current user profile
 */
export declare function getProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Middleware to authenticate user
 */
export declare function authenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Middleware to check if user is admin
 */
export declare function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=userController.d.ts.map