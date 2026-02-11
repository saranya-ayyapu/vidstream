const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  getUsers,
  updateUserRole,
  markWalkthroughSeen,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// User Management (Admin only)
router.get('/users', protect, authorize('Admin'), getUsers);
router.put('/users/:id/role', protect, authorize('Admin'), updateUserRole);
router.put('/walkthrough', protect, markWalkthroughSeen);

module.exports = router;
