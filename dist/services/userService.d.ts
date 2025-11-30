export interface User {
    user_id?: number;
    name: string;
    email: string;
    provider: 'google' | 'facebook' | 'twitter' | 'email';
    password?: string;
    type: 'user' | 'admin' | 'seed';
    created_at?: string;
    updated_at?: string;
}
export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: Omit<User, 'password'>;
    error?: string;
}
/**
 * Hash a password
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Compare a password with its hash
 */
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
/**
 * Generate a JWT token
 */
export declare function generateToken(user: Omit<User, 'password'>): string;
/**
 * Verify a JWT token
 */
export declare function verifyToken(token: string): any;
/**
 * Register a new user
 */
export declare function registerUser(userData: Omit<User, 'user_id' | 'created_at' | 'updated_at'>): Promise<AuthResponse>;
/**
 * Login user with email and password
 */
export declare function loginUser(email: string, password: string): Promise<AuthResponse>;
/**
 * Get user by ID
 */
export declare function getUserById(userId: number): Promise<User | null>;
/**
 * Get user by email
 */
export declare function getUserByEmail(email: string): Promise<User | null>;
/**
 * Check if user is admin
 */
export declare function isAdmin(user: User): boolean;
/**
 * Authenticate user from token
 */
export declare function authenticateUser(token: string): Promise<User | null>;
//# sourceMappingURL=userService.d.ts.map