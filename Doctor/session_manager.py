import time
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

class SessionManager:
    """Manage consultation sessions for the server"""
    
    def __init__(self, session_timeout_minutes: int = 30):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.session_timeout = timedelta(minutes=session_timeout_minutes)
    
    def create_session(self, session_id: str, bot, initial_result: dict):
        """Create a new session"""
        self.sessions[session_id] = {
            "bot": bot,
            "current_state": initial_result,
            "created_at": datetime.now().isoformat(),
            "last_activity": datetime.now().isoformat()
        }
        
        # Clean up old sessions
        self._cleanup_expired_sessions()
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data"""
        if session_id not in self.sessions:
            return None
        
        session = self.sessions[session_id]
        
        # Check if session expired
        last_activity = datetime.fromisoformat(session["last_activity"])
        if datetime.now() - last_activity > self.session_timeout:
            del self.sessions[session_id]
            return None
        
        return session
    
    def update_session(self, session_id: str, new_state: dict):
        """Update session state"""
        if session_id in self.sessions:
            self.sessions[session_id]["current_state"] = new_state
            self.sessions[session_id]["last_activity"] = datetime.now().isoformat()
    
    def end_session(self, session_id: str):
        """End and remove session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
    
    def _cleanup_expired_sessions(self):
        """Remove expired sessions"""
        current_time = datetime.now()
        expired_sessions = []
        
        for session_id, session_data in self.sessions.items():
            last_activity = datetime.fromisoformat(session_data["last_activity"])
            if current_time - last_activity > self.session_timeout:
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            del self.sessions[session_id]
    
    def get_active_sessions_count(self) -> int:
        """Get count of active sessions"""
        self._cleanup_expired_sessions()
        return len(self.sessions)
