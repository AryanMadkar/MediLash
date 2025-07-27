const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false  // Keep this as false for security
    },
    profile: {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        phone: { type: String, trim: true },
        dateOfBirth: { type: Date },
        gender: { 
            type: String, 
            enum: ['male', 'female', 'other', 'prefer_not_to_say'],
            default: 'prefer_not_to_say'
        },
        medicalHistory: [{ type: String }],
        allergies: [{ type: String }],
        currentMedications: [{ type: String }],
        emergencyContact: {
            name: { type: String, trim: true },
            phone: { type: String, trim: true },
            relationship: { type: String, trim: true }
        }
    },
    medicalConversation: [{
        conversationId: { type: String },
        title: { type: String, default: 'Medical Consultation' },
        messages: [{
            role: { 
                type: String, 
                enum: ['user', 'doctor', 'specialist'],
                required: true
            },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            agentName: { type: String },
            agentSpecialty: { type: String }
        }],
        summary: {
            clinicalSummary: { type: String },
            specialistConsulted: { type: String },
            recommendations: [{ type: String }],
            medications: [{ type: String }],
            finalDiagnosis: { type: String }
        },
        status: { 
            type: String, 
            enum: ['active', 'completed', 'archived'],
            default: 'active'
        },
        startedAt: { type: Date, default: Date.now },
        completedAt: { type: Date },
        tags: [{ type: String }]
    }],
    token: { type: String },
    refreshToken: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Create sparse index (to avoid the duplicate key error you had)
userSchema.index(
    { 'medicalConversation.conversationId': 1 }, 
    { sparse: true }
);

// Hash password before saving - IMPROVED VERSION
userSchema.pre('save', async function(next) {
    // Only hash if password is modified
    if (!this.isModified('password')) return next();
    
    try {
        console.log('🔐 Hashing password for user:', this.email);
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        console.log('✅ Password hashed successfully');
        next();
    } catch (error) {
        console.error('❌ Password hashing failed:', error);
        next(error);
    }
});

// FIXED Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Check if password exists
        if (!this.password) {
            console.error('❌ No password found for comparison');
            throw new Error('Password not found for user');
        }
        
        if (!candidatePassword) {
            console.error('❌ No candidate password provided');
            throw new Error('No password provided for comparison');
        }

        console.log('🔍 Comparing passwords for user:', this.email);
        const isMatch = await bcrypt.compare(candidatePassword.toString(), this.password);
        console.log('🔍 Password comparison result:', isMatch);
        
        return isMatch;
    } catch (error) {
        console.error('❌ Password comparison error:', error.message);
        // Don't throw here, return false instead
        return false;
    }
};

// Hide sensitive fields when converting to JSON
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.token;
    delete userObject.refreshToken;
    return userObject;
};

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);
