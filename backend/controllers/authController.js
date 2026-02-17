const User = require('../models/User');
const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, organizationName } = req.body;

  // Server-side password validation: at least 8 chars, one uppercase, one number, one special char
  const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!pwdRegex.test(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters and include one uppercase letter, one number, and one special character.' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Multi-tenant Org Logic
    const userCount = await User.countDocuments();
    let organization;
    if (userCount === 0) {
        organization = await Organization.create({ name: organizationName || "Main Workspace" });
    } else {
        organization = await Organization.findOne() || await Organization.create({ name: "Main Workspace" });
    }

    const role = userCount === 0 ? 'Admin' : 'Viewer';

    const user = await User.create({
      name,
      email,
      password,
      role,
      organizationId: organization._id,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        hasSeenWalkthrough: user.hasSeenWalkthrough,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt received for: ${email}`);
  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        hasSeenWalkthrough: user.hasSeenWalkthrough,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      hasSeenWalkthrough: user.hasSeenWalkthrough,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get all users in organization (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ organizationId: req.user.organizationId }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Ensure user is in the same organization
      if (user.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ message: 'Unauthorized to update users outside your organization' });
      }

      user.role = req.body.role || user.role;
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark walkthrough as seen
// @route   PUT /api/auth/walkthrough
// @access  Private
const markWalkthroughSeen = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.hasSeenWalkthrough = true;
      await user.save();
      res.json({ message: 'Walkthrough marked as seen' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, getUsers, updateUserRole, markWalkthroughSeen };
