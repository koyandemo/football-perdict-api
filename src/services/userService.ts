import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// User type definition
export interface User {
  user_id?: number;
  name: string;
  email: string;
  provider: 'google' | 'facebook' | 'twitter' | 'email';
  password?: string;
  type: 'user' | 'admin' | 'seed';
  avatar_url?: string;
  favorite_team_id?: number;
  created_at?: string;
  updated_at?: string;
}

// Authentication response type
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Omit<User, 'password'>;
  error?: string;
}

// Lazy initialization of Supabase client
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    // Get environment variables
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    // Validate environment variables
    if (!supabaseUrl) {
      throw new Error('Missing SUPABASE_URL environment variable');
    }

    if (!supabaseServiceRoleKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }

    // Create Supabase client with service role key for server-side operations
    supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabase;
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(user: Omit<User, 'password'>): string {
  const payload = {
    user_id: user.user_id,
    email: user.email,
    type: user.type
  };
  
  // Use a secret key from environment variables
  const secret = process.env.JWT_SECRET || 'football_prediction_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): any {
  const secret = process.env.JWT_SECRET || 'football_prediction_secret_key';
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Register a new user
 */
export async function registerUser(userData: Omit<User, 'user_id' | 'created_at' | 'updated_at'>): Promise<AuthResponse> {
  try {
    const supabase = getSupabaseClient();
    
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      // If user exists but with a different provider, we might want to update the provider
      // For now, we'll just return the existing user
      const { password, ...userWithoutPassword } = existingUser as User;
      
      // Generate token
      const token = generateToken(userWithoutPassword);
      
      return {
        success: true,
        message: 'User already exists',
        token,
        user: userWithoutPassword
      };
    }

    // Hash password if provider is email and password is provided
    let hashedPassword: string | undefined;
    if (userData.provider === 'email' && userData.password) {
      hashedPassword = await hashPassword(userData.password);
    }

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        email: userData.email,
        provider: userData.provider,
        password: hashedPassword,
        type: userData.type || 'user',
        avatar_url: userData.avatar_url,
        favorite_team_id: userData.favorite_team_id
      } as any)
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
    const { password, ...userWithoutPassword } = data as User;

    // Generate token
    const token = generateToken(userWithoutPassword);

    return {
      success: true,
      message: 'User registered successfully',
      token,
      user: userWithoutPassword
    };
  } catch (error: any) {
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
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const supabase = getSupabaseClient();
    
    // Fetch user by email
    const { data: user, error } = await supabase
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

    // Check if password matches (only for email provider)
    const userData = user as User;
    if (userData.provider === 'email') {
      if (!userData.password || !(await comparePassword(password, userData.password))) {
        return {
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS'
        };
      }
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = userData;

    // Generate token
    const token = generateToken(userWithoutPassword);

    return {
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    };
  } catch (error: any) {
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
export async function getUserById(userId: number): Promise<User | null> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Exception in getUserById:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: number, profileData: Partial<Omit<User, 'user_id' | 'email' | 'provider' | 'password' | 'type' | 'created_at' | 'updated_at'>>): Promise<AuthResponse> {
  try {
    const supabase = getSupabaseClient();
    
    // Update user profile
    const { data, error } = await supabase
      .from('users')
      .update({
        name: profileData.name,
        avatar_url: profileData.avatar_url,
        favorite_team_id: profileData.favorite_team_id,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: 'Failed to update profile',
        error: error.message
      };
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = data as User;

    // Generate new token
    const token = generateToken(userWithoutPassword);

    return {
      success: true,
      message: 'Profile updated successfully',
      token,
      user: userWithoutPassword
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to update profile',
      error: error.message
    };
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      return null;
    }

    return data as User;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User): boolean {
  return user.type === 'admin';
}

/**
 * Authenticate user from token
 */
export async function authenticateUser(token: string): Promise<User | null> {
  try {
    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.user_id) {
      return null;
    }

    const user = await getUserById(decoded.user_id);
    return user;
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return null;
  }
}