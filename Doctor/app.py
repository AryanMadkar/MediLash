from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import uuid
from datetime import datetime
from server_bot import ServerMedicalBot
from session_manager import SessionManager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')

# Enable CORS for MERN stack communication
CORS(app, origins=['http://localhost:3000', 'https://your-frontend-domain.com'])

# Initialize components
session_manager = SessionManager()

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Medical AI Bot Server is running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/start-consultation', methods=['POST'])
def start_consultation():
    """Start a new medical consultation session"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                "error": "Message is required to start consultation",
                "success": False
            }), 400
        
        patient_message = data['message'].strip()
        if not patient_message:
            return jsonify({
                "error": "Message cannot be empty",
                "success": False
            }), 400
        
        # Create new session
        session_id = str(uuid.uuid4())
        bot = ServerMedicalBot()
        
        # Start consultation
        result = bot.start_consultation(patient_message, session_id)
        
        # Store session
        session_manager.create_session(session_id, bot, result)
        
        logger.info(f"Started consultation for session: {session_id}")
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "doctor_name": "Dr. Sarah Chen",
            "doctor_response": result["doctor_response"],
            "is_question": result["is_question"],
            "consultation_stage": "history_taking",
            "question_count": result["question_count"],
            "max_questions": 5
        })
        
    except Exception as e:
        logger.error(f"Error starting consultation: {str(e)}")
        return jsonify({
            "error": f"Failed to start consultation: {str(e)}",
            "success": False
        }), 500

@app.route('/api/send-message', methods=['POST'])
def send_message():
    """Send message in ongoing consultation"""
    try:
        data = request.get_json()
        
        if not data or 'session_id' not in data or 'message' not in data:
            return jsonify({
                "error": "Session ID and message are required",
                "success": False
            }), 400
        
        session_id = data['session_id']
        patient_message = data['message'].strip()
        
        if not patient_message:
            return jsonify({
                "error": "Message cannot be empty",
                "success": False
            }), 400
        
        # Get session
        session_data = session_manager.get_session(session_id)
        if not session_data:
            return jsonify({
                "error": "Invalid or expired session",
                "success": False
            }), 404
        
        bot = session_data['bot']
        
        # Continue consultation
        result = bot.continue_consultation(patient_message, session_id)
        
        # Update session
        session_manager.update_session(session_id, result)
        
        response_data = {
            "success": True,
            "session_id": session_id,
            "doctor_response": result["doctor_response"],
            "is_question": result["is_question"],
            "consultation_stage": result["stage"]
        }
        
        # Add stage-specific data
        if result["stage"] == "history_taking":
            response_data.update({
                "doctor_name": "Dr. Sarah Chen",
                "question_count": result["question_count"],
                "max_questions": 5
            })
        elif result["stage"] == "specialist_handoff":
            response_data.update({
                "specialist_name": result["specialist_name"],
                "handoff_message": result["handoff_message"]
            })
        elif result["stage"] == "specialist_consultation":
            response_data.update({
                "specialist_name": result["specialist_name"],
                "clinical_summary": result.get("clinical_summary", ""),
                "specialist_assessment": result["doctor_response"],
                "recommendations": result.get("recommendations", []),
                "medications": result.get("medications", [])
            })
        elif result["stage"] == "consultation_complete":
            response_data.update({
                "final_summary": result.get("final_summary", ""),
                "specialist_consulted": result.get("specialist_name", ""),
                "clinical_summary": result.get("clinical_summary", "")
            })
        
        logger.info(f"Message processed for session: {session_id}, stage: {result['stage']}")
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        return jsonify({
            "error": f"Failed to process message: {str(e)}",
            "success": False
        }), 500

@app.route('/api/end-consultation', methods=['POST'])
def end_consultation():
    """End consultation and cleanup session"""
    try:
        data = request.get_json()
        
        if not data or 'session_id' not in data:
            return jsonify({
                "error": "Session ID is required",
                "success": False
            }), 400
        
        session_id = data['session_id']
        
        # Get final summary
        session_data = session_manager.get_session(session_id)
        if session_data:
            bot = session_data['bot']
            summary = bot.get_consultation_summary()
        else:
            summary = "Session not found"
        
        # Clean up session
        session_manager.end_session(session_id)
        
        logger.info(f"Ended consultation for session: {session_id}")
        
        return jsonify({
            "success": True,
            "message": "Consultation ended successfully",
            "summary": summary,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error ending consultation: {str(e)}")
        return jsonify({
            "error": f"Failed to end consultation: {str(e)}",
            "success": False
        }), 500

@app.route('/api/session-status/<session_id>', methods=['GET'])
def get_session_status(session_id):
    """Get current session status"""
    try:
        session_data = session_manager.get_session(session_id)
        
        if not session_data:
            return jsonify({
                "error": "Session not found",
                "success": False
            }), 404
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "stage": session_data['current_state']['stage'],
            "question_count": session_data['current_state'].get('question_count', 0),
            "created_at": session_data['created_at'],
            "last_activity": session_data['last_activity']
        })
        
    except Exception as e:
        logger.error(f"Error getting session status: {str(e)}")
        return jsonify({
            "error": f"Failed to get session status: {str(e)}",
            "success": False
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "success": False
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "error": "Internal server error",
        "success": False
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Medical AI Bot Server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
