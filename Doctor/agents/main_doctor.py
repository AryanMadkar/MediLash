from langchain_core.messages import HumanMessage
from langchain_core.tools import tool
from typing import Literal


@tool
def consult_cardiologist(summary: str) -> str:
    """Send the compiled clinical summary to the cardiologist."""
    return f"HANDOFF_TO_CARDIOLOGIST: {summary}"


@tool
def consult_neurologist(summary: str) -> str:
    """Send the compiled clinical summary to the neurologist."""
    return f"HANDOFF_TO_NEUROLOGIST: {summary}"


@tool
def consult_dermatologist(summary: str) -> str:
    """Send the compiled clinical summary to the dermatologist."""
    return f"HANDOFF_TO_DERMATOLOGIST: {summary}"


@tool
def consult_orthopedist(summary: str) -> str:
    """Send the compiled clinical summary to the orthopedist."""
    return f"HANDOFF_TO_ORTHOPEDIST: {summary}"


@tool
def consult_endocrinologist(summary: str) -> str:
    """Send the compiled clinical summary to the endocrinologist."""
    return f"HANDOFF_TO_ENDOCRINOLOGIST: {summary}"


class MainDoctor:
    """Primary care physician that conducts interactive history taking before specialist referral."""

    def __init__(self, llm, logger):
        self.llm = llm
        self.logger = logger
        self.name = "Dr. Sarah Chen"
        self.specialty = "Primary Care Physician & Medical Supervisor"
        self.MAX_QUESTIONS = 5  # Maximum follow-up questions to ask

        self.tools = [
            consult_cardiologist,
            consult_neurologist,
            consult_dermatologist,
            consult_orthopedist,
            consult_endocrinologist,
        ]

        self.system_prompt = f"""You are {self.name}, an experienced Primary Care Physician conducting a medical consultation.

Your role is to:
1. Take a focused but thorough medical history through targeted questions
2. Ask relevant follow-up questions based on patient responses (maximum {self.MAX_QUESTIONS} questions)
3. Once you have sufficient information, create a structured clinical summary
4. Select the most appropriate specialist and refer the patient
5. Inform the patient about the referral politely

IMPORTANT GUIDELINES:
- Ask one clear, specific question at a time
- Focus on key diagnostic criteria: onset, duration, severity, location, aggravating/relieving factors
- Consider red flags and emergency symptoms
- After gathering enough information, create a CLINICAL SUMMARY and call the appropriate specialist tool
- Always emphasize this is educational only and recommend real medical consultation

Available specialists:
- Cardiologist: Heart and cardiovascular issues (chest pain, palpitations, shortness of breath)
- Neurologist: Brain, nerves, headaches, seizures, weakness, numbness
- Dermatologist: Skin, hair, nail conditions, rashes, lesions
- Orthopedist: Bones, joints, muscles, fractures, sprains, back pain
- Endocrinologist: Diabetes, thyroid, hormones, weight issues, fatigue

When you have enough information, say:
"Thank you for providing those details. Based on your symptoms, I believe you should see our [SPECIALIST NAME]. Let me connect you with them now."

Then call the appropriate consultation tool with a structured clinical summary.

OUTPUT FORMAT:
- Either ask ONE follow-up question
- OR provide the referral statement and call the specialist tool

Remember: This is for educational purposes only. Always advise seeking real medical care."""

    def ask_or_triage(self, patient_message: str, memory: list, state: dict):
        """
        Interactive consultation method that either asks follow-up questions or triages to specialist.

        Args:
            patient_message: Current patient input
            memory: Conversation history list
            state: Shared state dictionary

        Returns:
            dict with follow_up question or triage decision
        """
        # Add patient message to conversation memory
        memory.append({"role": "user", "content": patient_message})

        # Prepare messages for LLM
        messages = [{"role": "system", "content": self.system_prompt}] + memory

        # Get LLM response with tools
        llm_with_tools = self.llm.bind_tools(self.tools)
        response = llm_with_tools.invoke(messages)

        # Log the doctor's response
        self.logger.log_message(self.name, response.content)

        # Track question count
        if "?" in response.content:
            state["question_count"] = state.get("question_count", 0) + 1

        # Prepare result
        result = {"agent_msg": response.content, "follow_up": None, "triaged": False}

        # Check if tools were called (specialist referral)
        if response.tool_calls:
            tool_call = response.tool_calls[0]
            tool_name = tool_call["name"]
            clinical_summary = tool_call["args"]["summary"]

            # Store clinical summary
            state["clinical_summary"] = clinical_summary

            # Determine next agent
            if "cardiologist" in tool_name:
                state["next_agent"] = "cardiologist"
            elif "neurologist" in tool_name:
                state["next_agent"] = "neurologist"
            elif "dermatologist" in tool_name:
                state["next_agent"] = "dermatologist"
            elif "orthopedist" in tool_name:
                state["next_agent"] = "orthopedist"
            elif "endocrinologist" in tool_name:
                state["next_agent"] = "endocrinologist"

            result["triaged"] = True
        else:
            # It's a follow-up question
            result["follow_up"] = response.content

            # Safety check for maximum questions
            if state.get("question_count", 0) >= self.MAX_QUESTIONS:
                self.logger.log_message(
                    self.name,
                    "I have enough information now. Let me determine the best specialist for you. do u want to continue ?",
                )
                # Force triage on next iteration
                result["follow_up"] = (
                    "Thank you for all the information. Let me now determine the best course of action for you. would u like to continue ?"
                )

        return result

    def provide_final_summary(self, state: dict):
        """Provide final consultation summary (kept for compatibility)"""
        specialist_input = state.get("specialist_response", "")
        clinical_summary = state.get("clinical_summary", "")

        summary_prompt = f"""Provide a brief final summary of this consultation.

Clinical Summary: {clinical_summary}
Specialist Assessment: {specialist_input}

Please provide:
1. Key findings summary
2. Specialist recommendations received
3. Important next steps
4. Reminder about seeking professional medical care
"""

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": summary_prompt},
        ]

        response = self.llm.invoke(messages)
        final_summary = f"CONSULTATION SUMMARY:\n{response.content}"
        self.logger.log_message(self.name, final_summary)

        return final_summary
