from typing import Dict
from .models import SessionData

# In-memory storage (replace with database in production)
sessions: Dict[str, SessionData] = {}


def get_session(session_id: str) -> SessionData | None:
    """Get session data by ID."""
    return sessions.get(session_id)


def create_session(session_id: str) -> SessionData:
    """Create a new session."""
    session = SessionData(
        session_id=session_id, attempts=[], exposures=[], stress_indicators=[]
    )
    sessions[session_id] = session
    return session


def get_or_create_session(session_id: str) -> SessionData:
    """Get existing session or create a new one."""
    if session_id not in sessions:
        return create_session(session_id)
    return sessions[session_id]


def clear_all_sessions():
    """Clear all sessions (for testing)."""
    sessions.clear()
