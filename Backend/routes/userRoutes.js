const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token - FIXED VERSION
const generateToken = (userId) => {
    return jwt.sign(
        { userId: userId }, // Payload MUST be an object
        process.env.JWT_SECRET || 'fallback_secret_key',
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
    );
};

// Generate Refresh Token - FIXED VERSION  
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId: userId }, // Payload MUST be an object
        process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
        {
            expiresIn: '30d'
        }
    );
};

// Register User
router.post('/register',
    [
        body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { username, email, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                return res.status(400).json({
                    message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
                });
            }

            // Create new user
            const user = new User({
                username,
                email,
                password
            });

            await user.save();

            // Generate tokens using the fixed functions
            const token = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // Save tokens to user
            user.token = token;
            user.refreshToken = refreshToken;
            user.lastLogin = new Date();
            await user.save();

            res.status(201).json({
                message: 'User registered successfully',
                user: user.toJSON(),
                token,
                refreshToken
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    }
);

// Login User
router.post('/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 1 }).withMessage('Password is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { email, password } = req.body;

            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Check if account is active
            if (!user.isActive) {
                return res.status(401).json({ message: 'Account is deactivated' });
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate tokens
            const token = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // Update user with new tokens
            user.token = token;
            user.refreshToken = refreshToken;
            user.lastLogin = new Date();
            await user.save();

            res.json({
                message: 'Login successful',
                user: user.toJSON(),
                token,
                refreshToken
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    }
);

// Other routes remain the same...
router.post('/logout', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.token = null;
            user.refreshToken = null;
            await user.save();
        }

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error during logout' });
    }
});

router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ user: user.toJSON() });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});

router.put('/profile', auth, async (req, res) => {
    try {
        const { username, profile } = req.body;
        const user = await User.findById(req.user._id);

        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            user.username = username;
        }

        if (profile) {
            user.profile = { ...user.profile, ...profile };
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

router.post('/medical-conversation', auth, async (req, res) => {
    try {
        const { conversationId, messages } = req.body;
        const user = await User.findById(req.user._id);

        user.medicalConversation.push({
            conversationId,
            messages
        });

        await user.save();

        res.json({
            message: 'Medical conversation added successfully',
            conversation: user.medicalConversation[user.medicalConversation.length - 1]
        });
    } catch (error) {
        console.error('Add conversation error:', error);
        res.status(500).json({ message: 'Server error adding conversation' });
    }
});

router.get('/medical-conversations', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ conversations: user.medicalConversation });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Server error fetching conversations' });
    }
});

module.exports = router;
