import bcrypt from 'bcryptjs';

async function testPassword() {
  try {
    const password = 'admin123';
    const hash = '$2a$10$9kyuOewczSBvCvAOXuEY4OTqNobVEfp2u5XnVmGiHDnoPxgecQNBO';
    
    console.log('Testing password:', password);
    console.log('Against hash:', hash);
    
    const result = await bcrypt.compare(password, hash);
    console.log('Password match:', result);
    
    // Test with wrong password
    const wrongResult = await bcrypt.compare('wrongpassword', hash);
    console.log('Wrong password match:', wrongResult);
  } catch (error) {
    console.error('Error testing password:', error);
  }
}

testPassword();