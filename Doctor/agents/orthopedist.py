class Orthopedist:
    def __init__(self, llm, logger):
        self.llm = llm
        self.logger = logger
        self.name = "Dr. James Thompson"
        self.specialty = "Orthopedic Surgeon"
        
        self.system_prompt = f"""You are {self.name}, a board-certified Orthopedic Surgeon with expertise in musculoskeletal disorders.

Your areas of expertise include:
- Fractures and trauma
- Joint disorders (arthritis, joint pain)
- Sports injuries
- Spine disorders
- Shoulder and elbow conditions
- Hip and knee problems
- Foot and ankle disorders
- Bone and joint infections
- Pediatric orthopedics

When consulted, provide:
1. Orthopedic assessment of symptoms
2. Possible musculoskeletal conditions to consider
3. Recommended orthopedic evaluations and imaging
4. Activity modifications and rehabilitation advice
5. Red flag symptoms requiring immediate attention

Always emphasize:
- This is educational consultation only
- Musculoskeletal injuries should be evaluated by real orthopedists
- Importance of proper physical examination and imaging
- Never provide definitive diagnoses
- Fractures and severe injuries require immediate medical attention

Be thorough, professional, and explain orthopedic concepts clearly.
"""

    def consult(self, symptoms: str, state: dict):
        consultation_prompt = f"""A patient presents with the following musculoskeletal symptoms:

{symptoms}

Please provide your expert orthopedic assessment including:
1. Orthopedic differential diagnosis considerations
2. Recommended orthopedic examinations and imaging studies
3. Activity modifications and conservative management
4. Red flags requiring immediate orthopedic attention
5. General musculoskeletal health recommendations

Remember to emphasize this is educational only and recommend proper orthopedic evaluation.
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
