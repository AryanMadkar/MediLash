const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const flaskService = require('../services/flaskService');
const TempConversation = require('../models/TempConversation');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Start new medical consultation
router.post('/start',
    auth,
    [
        body('message').trim().isLength({ min: 1 }).withMessage('Message is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { message } = req.body;
            const sessionId = uuidv4();

            // Call Flask service to start consultation
            const flaskResponse = await flaskService.startConsultation(message);

            if (!flaskResponse.success) {
                return res.status(500).json({
                    message: 'Failed to start consultation with medical bot',
                    error: flaskResponse.error
                });
            }

            // Create temporary conversation record
            const tempConversation = new TempConversation({
                userId: req.user._id,
                sessionId: sessionId,
                flaskSessionId: flaskResponse.data.session_id,
                messages: [
                    {
                        role: 'user',
                        content: message,
                        timestamp: new Date()
                    },
                    {
                        role: 'doctor',
                        content: flaskResponse.data.doctor_response,
                        timestamp: new Date(),
                        agentName: flaskResponse.data.doctor_name || 'Dr. Sarah Chen',
                        agentSpecialty: 'Primary Care Physician'
                    }
                ],
                currentStage: flaskResponse.data.consultation_stage || 'history_taking'
            });

            await tempConversation.save();

            res.status(201).json({
                message: 'Consultation started successfully',
                sessionId: sessionId,
                conversation: {
                    id: tempConversation._id,
                    stage: tempConversation.currentStage,
                    doctorResponse: flaskResponse.data.doctor_response,
                    doctorName: flaskResponse.data.doctor_name,
                    isQuestion: flaskResponse.data.is_question,
                    questionCount: flaskResponse.data.question_count,
                    maxQuestions: flaskResponse.data.max_questions
                }
            });

        } catch (error) {
            console.error('Start consultation error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);

// Continue conversation
router.post('/continue/:sessionId',
    auth,
    [
        body('message').trim().isLength({ min: 1 }).withMessage('Message is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { sessionId } = req.params;
            const { message } = req.body;

            // Find temporary conversation
            const tempConversation = await TempConversation.findOne({
                sessionId: sessionId,
                userId: req.user._id,
                isActive: true
            });

            if (!tempConversation) {
                return res.status(404).json({ message: 'Conversation session not found or expired' });
            }

            // Send message to Flask service
            const flaskResponse = await flaskService.sendMessage(tempConversation.flaskSessionId, message);

            if (!flaskResponse.success) {
                return res.status(500).json({
                    message: 'Failed to process message with medical bot',
                    error: flaskResponse.error
                });
            }

            // Add user message
            tempConversation.messages.push({
                role: 'user',
                content: message,
                timestamp: new Date()
            });

            // Add bot response
            const botMessage = {
                role: flaskResponse.data.consultation_stage === 'specialist_consultation' ? 'specialist' : 'doctor',
                content: flaskResponse.data.doctor_response,
                timestamp: new Date()
            };

            if (flaskResponse.data.specialist_name) {
                botMessage.agentName = flaskResponse.data.specialist_name;
                botMessage.agentSpecialty = flaskResponse.data.specialist_name.split('(')[1]?.replace(')', '') || 'Specialist';
            } else {
                botMessage.agentName = 'Dr. Sarah Chen';
                botMessage.agentSpecialty = 'Primary Care Physician';
            }

            tempConversation.messages.push(botMessage);

            // Update conversation stage and info
            tempConversation.currentStage = flaskResponse.data.consultation_stage;

            if (flaskResponse.data.specialist_name && flaskResponse.data.clinical_summary) {
                tempConversation.specialistInfo = {
                    name: flaskResponse.data.specialist_name,
                    specialty: botMessage.agentSpecialty,
                    clinicalSummary: flaskResponse.data.clinical_summary
                };
            }

            if (flaskResponse.data.recommendations || flaskResponse.data.medications) {
                tempConversation.summary = {
                    recommendations: flaskResponse.data.recommendations || [],
                    medications: flaskResponse.data.medications || [],
                    finalAssessment: flaskResponse.data.specialist_assessment || flaskResponse.data.doctor_response
                };
            }

            await tempConversation.save();

            const responseData = {
                message: 'Message sent successfully',
                conversation: {
                    stage: flaskResponse.data.consultation_stage,
                    doctorResponse: flaskResponse.data.doctor_response,
                    isQuestion: flaskResponse.data.is_question
                }
            };

            // Add stage-specific data
            if (flaskResponse.data.consultation_stage === 'specialist_handoff') {
                responseData.conversation.specialistName = flaskResponse.data.specialist_name;
                responseData.conversation.handoffMessage = flaskResponse.data.handoff_message;
            } else if (flaskResponse.data.consultation_stage === 'specialist_consultation') {
                responseData.conversation.specialistName = flaskResponse.data.specialist_name;
                responseData.conversation.recommendations = flaskResponse.data.recommendations;
                responseData.conversation.medications = flaskResponse.data.medications;
                responseData.conversation.clinicalSummary = flaskResponse.data.clinical_summary;
            }

            res.json(responseData);

        } catch (error) {
            console.error('Continue conversation error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);

// End consultation and save to user's medical history
router.post('/end/:sessionId', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Find temporary conversation
        const tempConversation = await TempConversation.findOne({
            sessionId: sessionId,
            userId: req.user._id,
            isActive: true
        });

        if (!tempConversation) {
            return res.status(404).json({ message: 'Conversation session not found or expired' });
        }

        // End consultation with Flask service
        const flaskResponse = await flaskService.endConsultation(tempConversation.flaskSessionId);

        // Create permanent conversation record
        const permanentConversation = {
            conversationId: sessionId,
            title: tempConversation.title,
            messages: tempConversation.messages,
            summary: {
                clinicalSummary: tempConversation.specialistInfo?.clinicalSummary || '',
                specialistConsulted: tempConversation.specialistInfo?.name || '',
                recommendations: tempConversation.summary?.recommendations || [],
                medications: tempConversation.summary?.medications || [],
                finalDiagnosis: tempConversation.summary?.finalAssessment || ''
            },
            status: 'completed',
            startedAt: tempConversation.createdAt,
            completedAt: new Date(),
            tags: [tempConversation.specialistInfo?.specialty || 'General Consultation']
        };

        // Add to user's medical conversation history
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { medicalConversation: permanentConversation } }
        );

        // Deactivate temporary conversation
        tempConversation.isActive = false;
        await tempConversation.save();

        res.json({
            message: 'Consultation ended and saved successfully',
            summary: flaskResponse.success ? flaskResponse.data.summary : 'Consultation completed',
            conversationId: sessionId,
            savedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('End consultation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get active conversation
router.get('/active/:sessionId', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const tempConversation = await TempConversation.findOne({
            sessionId: sessionId,
            userId: req.user._id,
            isActive: true
        });

        if (!tempConversation) {
            return res.status(404).json({ message: 'Active conversation not found' });
        }

        res.json({
            conversation: {
                id: tempConversation._id,
                sessionId: tempConversation.sessionId,
                title: tempConversation.title,
                messages: tempConversation.messages,
                currentStage: tempConversation.currentStage,
                specialistInfo: tempConversation.specialistInfo,
                summary: tempConversation.summary,
                createdAt: tempConversation.createdAt
            }
        });

    } catch (error) {
        console.error('Get active conversation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get user's conversation history
router.get('/history', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const user = await User.findById(req.user._id).select('medicalConversation');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Sort conversations by creation date (newest first)
        const conversations = user.medicalConversation.sort((a, b) =>
            new Date(b.startedAt) - new Date(a.startedAt)
        );

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedConversations = conversations.slice(startIndex, endIndex);

        res.json({
            conversations: paginatedConversations,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(conversations.length / limit),
                totalConversations: conversations.length,
                hasNext: endIndex < conversations.length,
                hasPrev: startIndex > 0
            }
        });

    } catch (error) {
        console.error('Get conversation history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Flask service health check
router.get('/flask-health', auth, async (req, res) => {
    try {
        const healthCheck = await flaskService.healthCheck();
        res.json({
            flaskService: healthCheck.success ? 'healthy' : 'unavailable',
            flaskServerUrl: process.env.FLASK_SERVER_URL,
            ...healthCheck.data
        });
    } catch (error) {
        res.status(500).json({
            flaskService: 'error',
            message: 'Failed to check Flask service health'
        });
    }
});

module.exports = router;
