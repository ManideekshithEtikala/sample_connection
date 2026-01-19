generate_jd_tool = {
    "name": "generate_job_description",
    "description": "Generate structured ATS friendly job description",
    "parameters": {
        "type": "object",
        "properties": {
            "job_title": {"type": "string"},
            "department": {"type": "string"},
            "experience": {"type": "string"},
            "responsibilities": {
                "type": "array",
                "items": {"type": "string"}
            },
            "skills": {
                "type": "array",
                "items": {"type": "string"}
            },
            "tools": {
                "type": "array",
                "items": {"type": "string"}
            },
            "reporting_to": {"type": "string"},
            "work_type": {"type": "string"},
            "achievements": {
                "type": "array",
                "items": {"type": "string"}
            }
        },
        "required": ["job_title", "skills"]
    }
}
