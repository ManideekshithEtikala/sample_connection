import yaml

def load_prompt(name: str):
    with open(f"prompts/{name}.yaml", "r") as f:
        return yaml.safe_load(f)
