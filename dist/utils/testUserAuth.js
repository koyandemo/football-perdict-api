"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const userService_1 = require("../services/userService");
// Load environment variables
dotenv_1.default.config();
async function testUserAuth() {
    console.log('Testing User Authentication...');
    try {
        // Test user registration
        console.log('\n1. Testing user registration...');
        const registerResult = await (0, userService_1.registerUser)({
            name: 'Test User',
            email: 'test@example.com',
            provider: 'email',
            password: 'testpassword123',
            type: 'user'
        });
        console.log('Registration result:', registerResult);
        if (!registerResult.success) {
            console.log('Registration failed, trying to login with existing user...');
        }
        // Test user login
        console.log('\n2. Testing user login...');
        const loginResult = await (0, userService_1.loginUser)('test@example.com', 'testpassword123');
        console.log('Login result:', loginResult);
        if (loginResult.success && loginResult.user) {
            // Test get user by ID
            console.log('\n3. Testing get user by ID...');
            const user = await (0, userService_1.getUserById)(loginResult.user.user_id);
            console.log('User details:', user);
        }
        // Test admin user
        console.log('\n4. Testing admin user login...');
        const adminLoginResult = await (0, userService_1.loginUser)('admin@example.com', 'admin123');
        console.log('Admin login result:', adminLoginResult);
        console.log('\nTest completed!');
    }
    catch (error) {
        console.error('Test error:', error);
    }
}
// Run the test
testUserAuth();
//# sourceMappingURL=testUserAuth.js.map