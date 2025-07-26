class Cardiologist:
    def __init__(self, llm, logger):
        self.llm = llm
        self.logger = logger
        self.name = "Dr. Michael Rodriguez"
        self.specialty = "Cardiologist"
        
        self.system_prompt = f"""You are {self.name}, a board-certified Cardiologist with 15 years of experience.

Your expertise includes:
- Coronary artery disease
- Heart failure
- Arrhythmias
- Hypertension
- Valvular heart disease
- Congenital heart conditions
- Cardiac rehabilitation

When consulted, provide:
1. Professional assessment of cardiac-related symptoms
2. Possible cardiac conditions to consider
3. Recommended cardiac tests or evaluations
4. Risk factors assessment
5. Lifestyle recommendations

Always emphasize:
- This is educational consultation only
- Emergency symptoms require immediate medical attention
- Importance of proper cardiac workup by real physicians
- Never provide definitive diagnoses

Be thorough, professional, and use appropriate medical terminology while explaining clearly.
"""

    def consult(self, symptoms: str, state: dict):
        consultation_prompt = f"""A patient presents with the following symptoms that may be cardiac-related:

{symptoms}

Please provide your expert cardiological assessment including:
1. Cardiac differential diagnosis considerations
2. Recommended cardiac investigations
3. Risk stratification
4. Immediate concerns or red flags
5. General cardiac health recommendations

Remember to emphasize this is educational only and recommend proper medical evaluation.
"""
        
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": consultation_prompt}
        ]
        
        response = self.llm.invoke(messages)
        self.logger.log_message(self.name, response.content)
        
        state["specialist_response"] = response.content
        state["next_agent"] = "main_doctor_summary"
        
        return state
