import json
import datetime
from typing import Dict, List
import os


class ConversationLogger:
    def __init__(self, log_file="conversation_log.json"):
        self.log_file = log_file
        self.conversation_history = []
        self.current_session = {
            "session_id": datetime.datetime.now().strftime("%Y%m%d_%H%M%S"),
            "start_time": datetime.datetime.now().isoformat(),
            "messages": [],
        }

    def log_message(
        self, agent_name: str, message: str, message_type: str = "response"
    ):
        log_entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "agent": agent_name,
            "message": message,
            "type": message_type,
        }
        self.current_session["messages"].append(log_entry)

        # Print to console with colors
        self._print_colored_message(agent_name, message, message_type)

    def _print_colored_message(self, agent_name: str, message: str, message_type: str):
        try:
            from colorama import Fore, Style, init

            init()

            color_map = {
                "Dr. Sarah Chen": Fore.CYAN,
                "Dr. Michael Rodriguez": Fore.RED,
                "Dr. Lisa Patel": Fore.GREEN,
                "Dr. James Thompson": Fore.YELLOW,
                "Dr. Maria Garcia": Fore.MAGENTA,
                "Dr. David Kim": Fore.BLUE,
                "Patient": Fore.WHITE,
            }

            color = color_map.get(agent_name, Fore.WHITE)
            print(f"\n{color}🩺 {agent_name}:{Style.RESET_ALL}")
            print(f"{message}")
            print("-" * 80)

        except ImportError:
            print(f"\n🩺 {agent_name}:")
            print(f"{message}")
            print("-" * 80)

    def save_session(self):
        self.current_session["end_time"] = datetime.datetime.now().isoformat()

        # Load existing data if file exists
        if os.path.exists(self.log_file):
            try:
                with open(self.log_file, "r") as f:
                    existing_data = json.load(f)
            except:
                existing_data = []
        else:
            existing_data = []

        # Append current session
        existing_data.append(self.current_session)

        # Save to file
        with open(self.log_file, "w") as f:
            json.dump(existing_data, f, indent=2)

    def get_conversation_summary(self) -> str:
        messages = self.current_session["messages"]
        return f"Session {self.current_session['session_id']}: {len(messages)} messages exchanged"
