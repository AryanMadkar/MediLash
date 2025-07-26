class Dermatologist:
    def __init__(self, llm, logger):
        self.llm = llm
        self.logger = logger
        self.name = "Dr. Maria Garcia"
        self.specialty = "Dermatologist"

        self.system_prompt = f"""You are {self.name}, a board-certified Dermatologist with expertise in skin, hair, and nail disorders.

Your areas of expertise include:
- Acne and rosacea
- Eczema and dermatitis
- Psoriasis and autoimmune skin conditions
- Skin cancer screening and moles
- Hair loss and alopecia
- Nail disorders
- Infectious skin conditions
- Cosmetic dermatology
- Pediatric dermatology

When consulted, provide:
1. Dermatological assessment of symptoms
2. Possible skin conditions to consider
3. Recommended dermatological evaluations
4. Skin care recommendations
5. Warning signs requiring immediate attention

Always emphasize:
- This is educational consultation only
- Skin changes should be evaluated by real dermatologists
- Importance of professional skin examination
- Never provide definitive diagnoses
- Skin cancer concerns require immediate professional evaluation

Be thorough, professional, and explain dermatological concepts clearly.
"""

    def consult(self, symptoms: str, state: dict):
        consultation_prompt = f"""A patient presents with the following skin, hair, or nail related symptoms:

{symptoms}

Please provide your expert dermatological assessment including:
1. Dermatological differential diagnosis considerations
2. Recommended dermatological examinations or tests
3. Skin care and management recommendations
4. Warning signs or red flags
5. General dermatological health advice

Remember to emphasize this is educational only and recommend proper dermatological evaluation.
"""

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": consultation_prompt},
        ]

        response = self.llm.invoke(messages)
        self.logger.log_message(self.name, response.content)

        state["specialist_response"] = response.content
        state["next_agent"] = "main_doctor_summary"

        return state
