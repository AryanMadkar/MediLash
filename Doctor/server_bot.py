from utils.groq_client import GroqClient
from utils.conversation_logger import ConversationLogger
from agents.main_doctor import MainDoctor
from agents.cardiologist import Cardiologist
from agents.neurologist import Neurologist
from agents.dermatologist import Dermatologist
from agents.orthopedist import Orthopedist
from agents.endocrinologist import Endocrinologist
import json
import re

class ServerMedicalBot:
    """Medical AI Bot adapted for server/API usage"""
    
    def __init__(self):
        # Initialize components
        self.groq_client = GroqClient()
        self.llm = self.groq_client.get_llm()
        self.logger = ConversationLogger()
        
        # Initialize doctor agents
        self.main_doctor = MainDoctor(self.llm, self.logger)
        self.specialists = {
            "cardiologist": Cardiologist(self.llm, self.logger),
            "neurologist": Neurologist(self.llm, self.logger),
            "dermatologist": Dermatologist(self.llm, self.logger),
            "orthopedist": Orthopedist(self.llm, self.logger),
            "endocrinologist": Endocrinologist(self.llm, self.logger)
        }
        
        # Session state
        self.conversation_memory = []
        self.session_state = {}
    
    def start_consultation(self, initial_message: str, session_id: str):
        """Start a new consultation session"""
        # Reset state for new session
        self.conversation_memory = []
        self.session_state = {
            "session_id": session_id,
            "stage": "history_taking",
            "question_count": 0,
            "specialist_selected": None,
            "clinical_summary": None
        }
        
        # Process initial message
        result = self.main_doctor.ask_or_triage(initial_message, self.conversation_memory, self.session_state)
        
        return {
            "doctor_response": result["agent_msg"],
            "is_question": not result["triaged"],
            "stage": "specialist_handoff" if result["triaged"] else "history_taking",
            "question_count": self.session_state.get("question_count", 0),
            "session_id": session_id
        }
    
    def continue_consultation(self, message: str, session_id: str):
        """Continue existing consultation"""
        current_stage = self.session_state.get("stage", "history_taking")
        
        if current_stage == "history_taking":
            return self._handle_history_taking(message)
        elif current_stage == "specialist_handoff":
            return self._handle_specialist_consultation(message)
        else:
            return {
                "doctor_response": "Consultation completed. Please start a new session for additional concerns.",
                "is_question": False,
                "stage": "consultation_complete"
            }
    
    def _handle_history_taking(self, message: str):
        """Handle history taking phase"""
        result = self.main_doctor.ask_or_triage(message, self.conversation_memory, self.session_state)
        
        if result["triaged"]:
            # Specialist selected
            specialist_name = self.session_state.get("next_agent", "")
            specialist_display_names = {
                "cardiologist": "Dr. Michael Rodriguez (Cardiologist)",
                "neurologist": "Dr. David Kim (Neurologist)",
                "dermatologist": "Dr. Maria Garcia (Dermatologist)",
                "orthopedist": "Dr. James Thompson (Orthopedist)",
                "endocrinologist": "Dr. Lisa Patel (Endocrinologist)"
            }
            
            self.session_state["stage"] = "specialist_handoff"
            self.session_state["specialist_selected"] = specialist_name
            
            return {
                "doctor_response": result["agent_msg"],
                "is_question": False,
                "stage": "specialist_handoff",
                "specialist_name": specialist_display_names.get(specialist_name, specialist_name),
                "handoff_message": f"Connecting you with {specialist_display_names.get(specialist_name, specialist_name)}..."
            }
        else:
            return {
                "doctor_response": result["agent_msg"],
                "is_question": True,
                "stage": "history_taking",
                "question_count": self.session_state.get("question_count", 0)
            }
    
    def _handle_specialist_consultation(self, message: str):
        """Handle specialist consultation phase"""
        specialist_name = self.session_state.get("specialist_selected")
        clinical_summary = self.session_state.get("clinical_summary", "")
        
        if not specialist_name or specialist_name not in self.specialists:
            return {
                "doctor_response": "Error: Specialist not found. Please start a new consultation.",
                "is_question": False,
                "stage": "error"
            }
        
        # Get specialist consultation
        specialist = self.specialists[specialist_name]
        specialist_state = {
            "consultation_request": clinical_summary,
            "specialist_response": ""
        }
        
        result_state = specialist.consult(clinical_summary, specialist_state)
        specialist_response = result_state["specialist_response"]
        
        # Extract medications and recommendations from response
        medications = self._extract_medications(specialist_response)
        recommendations = self._extract_recommendations(specialist_response)
        
        self.session_state["stage"] = "specialist_consultation"
        
        specialist_display_names = {
            "cardiologist": "Dr. Michael Rodriguez",
            "neurologist": "Dr. David Kim",
            "dermatologist": "Dr. Maria Garcia",
            "orthopedist": "Dr. James Thompson",
            "endocrinologist": "Dr. Lisa Patel"
        }
        
        return {
            "doctor_response": specialist_response,
            "is_question": False,
            "stage": "specialist_consultation",
            "specialist_name": specialist_display_names.get(specialist_name, specialist_name),
            "clinical_summary": clinical_summary,
            "medications": medications,
            "recommendations": recommendations
        }
    
    def _extract_medications(self, response: str):
        """Extract medication suggestions from specialist response"""
        medications = []
        
        # Look for common medication patterns
        med_patterns = [
            r'(?:take|consider|try|use)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:\d+\s*mg)?',
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*\d+\s*mg',
            r'over-the-counter\s+([a-z]+(?:\s+[a-z]+)*)',
        ]
        
        for pattern in med_patterns:
            matches = re.findall(pattern, response, re.IGNORECASE)
            medications.extend(matches)
        
        # Common OTC medications
        otc_meds = ['ibuprofen', 'acetaminophen', 'aspirin', 'naproxen', 'antihistamine']
        for med in otc_meds:
            if med.lower() in response.lower():
                medications.append(med.title())
        
        return list(set(medications))  # Remove duplicates
    
    def _extract_recommendations(self, response: str):
        """Extract recommendations from specialist response"""
        recommendations = []
        
        # Look for recommendation patterns
        lines = response.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'advise', 'should']):
                clean_line = line.strip('- •').strip()
                if clean_line and len(clean_line) > 10:
                    recommendations.append(clean_line)
        
        return recommendations[:5]  # Limit to top 5
    
    def get_consultation_summary(self):
        """Get consultation summary"""
        if not self.conversation_memory:
            return "No consultation data available."
        
        return {
            "session_id": self.session_state.get("session_id"),
            "total_messages": len(self.conversation_memory),
            "stage_reached": self.session_state.get("stage"),
            "specialist_consulted": self.session_state.get("specialist_selected"),
            "questions_asked": self.session_state.get("question_count", 0)
        }
