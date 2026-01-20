import json
import re


def extract_json(text: str) -> dict:
    """
    Extract JSON object from LLM response safely.
    """
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # fallback: extract JSON inside text
    match = re.search(r"\{[\s\S]*\}", text)

    if not match:
        raise ValueError("No JSON object found in LLM output")

    return json.loads(match.group())
