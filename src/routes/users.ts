import express from 'express';
import {
  register,
  login,
  getProfile,
  authenticate,
  requireAdmin
} from '../controllers/userController';

// Import the new admin controller functions
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userAdminController';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Admin user creation (no auth required for creating first admin)
router.post('/admin/create', createUser);

// Protected routes
router.get('/profile', authenticate, getProfile);

// Admin routes - protected by admin middleware
router.get('/', authenticate, requireAdmin, getAllUsers);
router.get('/:id', authenticate, requireAdmin, getUserById);
router.post('/', authenticate, requireAdmin, createUser);
router.put('/:id', authenticate, requireAdmin, updateUser);
router.delete('/:id', authenticate, requireAdmin, deleteUser);

// Legacy admin route
router.get('/admin', authenticate, requireAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin access granted',
    user: (req as any).user
  });
});

export default router;