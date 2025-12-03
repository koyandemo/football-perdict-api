import dotenv from 'dotenv';
import { registerUser, loginUser, getUserById } from '../services/userService';

// Load environment variables
dotenv.config({ path: '.env' });

async function testUserAuth() {
  
  try {
    // Test user registration
    const registerResult = await registerUser({
      name: 'Test User',
      email: 'test@example.com',
      provider: 'email',
      password: 'testpassword123',
      type: 'user'
    });
    
    
    if (!registerResult.success) {
    }
    
    // Test user login
    const loginResult = await loginUser('test@example.com', 'testpassword123');
    
    
    if (loginResult.success && loginResult.user) {
      // Test get user by ID
      const user = await getUserById(loginResult.user.user_id!);
      
    }
    
    // Test admin user
    const adminLoginResult = await loginUser('admin@example.com', 'admin123');
    
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testUserAuth();