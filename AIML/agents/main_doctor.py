from langchain_core.messages import HumanMessage
from langchain_core.tools import tool
from typing import Literal


@tool
def consult_cardiologist(symptoms: str) -> str:
    """Consult cardiologist for heart and cardiovascular related symptoms."""
    return f"HANDOFF_TO_CARDIOLOGIST: {symptoms}"


@tool
def consult_neurologist(symptoms: str) -> str:
    """Consult neurologist for brain, nerve, and neurological symptoms."""
    return f"HANDOFF_TO_NEUROLOGIST: {symptoms}"


@tool
def consult_dermatologist(symptoms: str) -> str:
    """Consult dermatologist for skin, hair, and nail related symptoms."""
    return f"HANDOFF_TO_DERMATOLOGIST: {symptoms}"


@tool
def consult_orthopedist(symptoms: str) -> str:
    """Consult orthopedist for bone, joint, and musculoskeletal symptoms."""
    return f"HANDOFF_TO_ORTHOPEDIST: {symptoms}"


@tool
def consult_endocrinologist(symptoms: str) -> str:
    """Consult endocrinologist for hormone, diabetes, and endocrine symptoms."""
    return f"HANDOFF_TO_ENDOCRINOLOGIST: {symptoms}"


class MainDoctor:
    def __init__(self, llm, logger):
        self.llm = llm
        self.logger = logger
        self.name = "Dr. Sarah Chen"
        self.specialty = "Primary Care Physician & Medical Supervisor"

        self.tools = [
            consult_cardiologist,
            consult_neurologist,
            consult_dermatologist,
            consult_orthopedist,
            consult_endocrinologist,
        ]

        self.system_prompt = f"""You are {self.name}, a highly experienced Primary Care Physician and Medical Supervisor.

Your role is to:
1. Listen to patient symptoms carefully
2. Perform initial assessment and triage
3. Determine which specialists to consult based on symptoms
4. Coordinate with specialist doctors to get expert opinions
5. Synthesize all information into final recommendations

Available specialists:
- Cardiologist: Heart and cardiovascular issues
- Neurologist: Brain, nerves, and neurological disorders  
- Dermatologist: Skin, hair, and nail conditions
- Orthopedist: Bones, joints, and musculoskeletal problems
- Endocrinologist: Hormones, diabetes, and endocrine disorders

Important guidelines:
- Always emphasize this is for educational purposes only
- Recommend seeing real healthcare professionals
- For emergency symptoms, advise immediate medical attention
- Be professional, empathetic, and thorough
- Use appropriate medical terminology but explain it clearly

When you need specialist input, use the consultation tools available to you.
"""

    def process_patient_input(self, patient_input: str, state: dict):
        # Log patient input
        self.logger.log_message("Patient", patient_input, "input")

        # Create the prompt with patient input
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"Patient presents with: {patient_input}"},
        ]

        # Get LLM response
        llm_with_tools = self.llm.bind_tools(self.tools)
        response = llm_with_tools.invoke(messages)

        # Log main doctor's initial response
        self.logger.log_message(self.name, response.content)

        # Check if tools were called
        if response.tool_calls:
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]

                # Execute the handoff
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

                state["consultation_request"] = tool_args["symptoms"]
        else:
            state["next_agent"] = "end"

        state["main_doctor_assessment"] = response.content
        return state

    def provide_final_summary(self, state: dict):
        specialist_input = state.get("specialist_response", "")
        initial_assessment = state.get("main_doctor_assessment", "")

        summary_prompt = f"""Based on the initial assessment and specialist consultation, provide a comprehensive final summary and recommendations.

Initial Assessment: {initial_assessment}
Specialist Input: {specialist_input}

Please provide:
1. Summary of findings
2. Possible conditions to consider
3. Recommended next steps
4. Important disclaimers about seeking professional medical care
"""

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": summary_prompt},
        ]

        response = self.llm.invoke(messages)
        self.logger.log_message(self.name, f"FINAL SUMMARY:\n{response.content}")

        return response.content
