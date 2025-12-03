import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Create a separate Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Get all users
 */
export async function getAllUsers(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users from database',
        error: error.message
      });
    }

    // Remove passwords from response
    const usersWithoutPasswords = data.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return res.status(200).json({
      success: true,
      data: usersWithoutPasswords
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
}

/**
 * Get a specific user by ID
 */
export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user from database',
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = data;

    return res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
}

/**
 * Create a new user
 */
export async function createUser(req: Request, res: Response) {
  try {
    const { name, email, provider, password, type } = req.body;

    // Validate required fields
    if (!name || !email || !provider || (provider === 'email' && !password) || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Prepare user data
    const userData: any = {
      name,
      email,
      provider,
      type
    };

    // Hash password if provider is email
    if (provider === 'email' && password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(password, saltRounds);
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user in database',
        error: error.message
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = data;

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
}

/**
 * Update a user
 */
export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, email, provider, password, type } = req.body;

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (provider !== undefined) updateData.provider = provider;
    if (type !== undefined) updateData.type = type;
    
    // Hash password if provided
    if (password !== undefined && password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('user_id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user in database',
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = data;

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
}

/**
 * Delete a user
 */
export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('user_id', id);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user from database',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
}