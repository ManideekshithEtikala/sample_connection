import json
from llm.registry import get_llm
from utils.prmpt_loader import load_prompt

llm = get_llm()

def generate_jd(profile: dict):
    """
    Generate a structured Job Description using LLM.

    Args:
        profile (dict): Employee profile data.

    Returns:
        dict: Parsed JSON JD.
    """
    prompt = load_prompt("jd_generator")

    system_prompt = prompt["role"]
    user_prompt = prompt["user_prompt"].replace(
        "{{profile}}",
        json.dumps(profile, indent=2)  # profile converted to JSON inside prompt
    )

    # LLM call
    jd_data = llm.generate(
        system=system_prompt,
        user=user_prompt
    )

    # Parse JSON response
     

    return jd_data
