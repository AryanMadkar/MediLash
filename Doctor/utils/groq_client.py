import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()


class GroqClient:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")

        self.llm = ChatGroq(
            groq_api_key=self.api_key,
            model_name="openai/gpt-oss-120b",
            temperature=0.3,
            max_tokens=1000,
        )

    def get_llm(self):
        return self.llm

    def test_connection(self):
        try:
            response = self.llm.invoke("Hello, this is a test.")
            return True, "Connection successful"
        except Exception as e:
            return False, f"Connection failed: {str(e)}"
