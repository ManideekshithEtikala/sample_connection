
from abc import ABC, abstractmethod
class BaseLLM(ABC):
    @abstractmethod
    def generate(self, system: str, user: str):
        pass
    @abstractmethod
    def call_tool(self, system: str, user: str, tools: list):
        pass
