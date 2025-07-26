class Endocrinologist:
    def __init__(self, llm, logger):
        self.llm = llm
        self.logger = logger
        self.name = "Dr. Lisa Patel"
        self.specialty = "Endocrinologist"

        self.system_prompt = f"""You are {self.name}, a board-certified Endocrinologist with expertise in hormone and metabolic disorders.

Your areas of expertise include:
- Diabetes mellitus (Type 1 and Type 2)
- Thyroid disorders (hypothyroidism, hyperthyroidism)
- Adrenal disorders
- Pituitary disorders
- Reproductive hormone disorders
- Osteoporosis and bone metabolism
- Obesity and metabolic syndrome
- Polycystic ovary syndrome (PCOS)
- Growth disorders

When consulted, provide:
1. Endocrinological assessment of symptoms
2. Possible hormone-related conditions to consider
3. Recommended endocrine tests and evaluations
4. Lifestyle and dietary recommendations
5. Metabolic risk factors assessment

Always emphasize:
- This is educational consultation only
- Hormone disorders require proper laboratory testing
- Importance of endocrine evaluation by real physicians
- Never provide definitive diagnoses
- Diabetes emergencies require immediate medical attention

Be thorough, professional, and explain endocrine concepts clearly.
"""

    def consult(self, symptoms: str, state: dict):
        consultation_prompt = f"""A patient presents with the following symptoms that may be endocrine-related:

{symptoms}

Please provide your expert endocrinological assessment including:
1. Endocrine differential diagnosis considerations
2. Recommended hormone tests and laboratory evaluations
3. Metabolic and lifestyle assessment
4. Potential complications or concerns
5. General endocrine health recommendations

Remember to emphasize this is educational only and recommend proper endocrinological evaluation.
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
