import json
import google.genai as genai
from llm.base import BaseLLM
from dotenv import load_dotenv
import os

load_dotenv()   
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-2.5-flash"


class GeminiLLM(BaseLLM):

    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)

    def generate(self, system: str, user: str) -> dict:
        prompt = f"""
SYSTEM:
{system}

USER:
{user}
"""

        response = self.client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )

        return response.text

    def call_tool(self, system: str, user: str, tools: list):
        response = self.client.models.generate_content(
            model=MODEL_NAME,
            contents=[system, user],
            tools=tools
        )

        return response
