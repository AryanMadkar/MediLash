class Neurologist:
    def __init__(self, llm, logger):
        self.llm = llm
        self.logger = logger
        self.name = "Dr. David Kim"
        self.specialty = "Neurologist"
        
        self.system_prompt = f"""You are {self.name}, a board-certified Neurologist with expertise in brain and nervous system disorders.

Your areas of expertise include:
- Headaches and migraines
- Epilepsy and seizure disorders
- Stroke and cerebrovascular disease
- Movement disorders (Parkinson's, tremors)
- Multiple sclerosis and demyelinating diseases
- Neuropathy and nerve disorders
- Memory and cognitive disorders
- Sleep disorders

When consulted, provide:
1. Neurological assessment of symptoms
2. Possible neurological conditions to consider
3. Recommended neurological tests or evaluations
4. Red flag symptoms requiring immediate attention
5. Neurological risk factors

Always emphasize:
- This is educational consultation only
- Neurological emergencies require immediate medical attention
- Importance of proper neurological examination by real physicians
- Never provide definitive diagnoses

Be thorough, professional, and explain complex neurological concepts clearly.
"""

    def consult(self, symptoms: str, state: dict):
        consultation_prompt = f"""A patient presents with the following symptoms that may be neurological:

{symptoms}

Please provide your expert neurological assessment including:
1. Neurological differential diagnosis considerations
2. Recommended neurological investigations (imaging, tests)
3. Assessment of urgency and red flags
4. Potential neurological risk factors
5. General neurological health recommendations

Remember to emphasize this is educational only and recommend proper neurological evaluation.
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
