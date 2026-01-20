import json
import time
from llm.registry import get_llm
from utils.prmpt_loader import load_prompt
from utils.validator import validate_jd_output

llm = get_llm()

MAX_RETRIES = 3
BACKOFF_SECONDS = 1.5


def validate_jd(jd):
    """Validate essential fields of the JD."""
    missing_fields = []
    if not jd.job_title:
        missing_fields.append("job_title")
    if not jd.required_skills or len(jd.required_skills) == 0:
        missing_fields.append("required_skills")
    if not jd.key_responsibilities or len(jd.key_responsibilities) == 0:
        missing_fields.append("key_responsibilities")

    if missing_fields:
        raise ValueError(f"Missing or empty fields: {', '.join(missing_fields)}")
    return True


def self_correction_prompt(base_prompt, error_msg):
    """Return the prompt to use when the previous attempt failed."""
    return (
        base_prompt
        + "\n\n"
        + f"""
Previous output failed validation.

Error:
{error_msg}

You must:
- return ONLY valid JSON
- strictly follow the output schema
- do not add explanations
- do not wrap in markdown
- ensure all required fields exist
- arrays must never be empty

Regenerate the job description now.
"""
    )


def attempt_jd_generation(system_prompt, user_prompt):
    """Single attempt to generate JD."""
    jd_data = llm.generate(system=system_prompt, user=user_prompt)
    jd = validate_jd_output(jd_data)
    validate_jd(jd)
    return jd


def generate_jd(profile: dict):
    """
    Production-grade JD generation with:
    - schema validation
    - retry logic
    - self-correction
    - exponential backoff
    """

    prompt = load_prompt("jd_generator")
    system_prompt = prompt["role"]

    base_user_prompt = prompt["user_prompt"].replace(
        "{{profile}}", json.dumps(profile, indent=2)
    )

    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"🤖 JD generation attempt {attempt}")
            return attempt_jd_generation(system_prompt, base_user_prompt)

        except Exception as e:
            last_error = e
            print(f"⚠️ Attempt {attempt} failed → {e}")
            base_user_prompt = self_correction_prompt(base_user_prompt, str(e))

            if attempt < MAX_RETRIES:
                # Exponential backoff
                time.sleep(BACKOFF_SECONDS * (2 ** (attempt - 1)))

    # Hard failure after all retries
    raise RuntimeError(
        f"JD generation failed after {MAX_RETRIES} attempts"
    ) from last_error
