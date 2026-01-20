
from schema.schema import JDOutput
from pydantic import ValidationError
from utils.json_extractor import extract_json

def validate_jd_output(raw_text: str) -> JDOutput:
    try:
        parsed = extract_json(raw_text)
        return JDOutput.model_validate(parsed)

    except ValidationError as e:
        raise ValueError(f"Schema validation error: {e}")

    except Exception as e:
        raise ValueError(str(e))