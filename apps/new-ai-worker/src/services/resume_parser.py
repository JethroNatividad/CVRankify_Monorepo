
from src.utils.ollama import query_ollama_model

def parse_resume_text(resume_text):
    """
    Parse the resume text using an AI model to extract structured information.
    """

    try:
        education_and_timezone = query_ollama_model(model="edu-timezone-extractor:latest", content=resume_text)
        skills = query_ollama_model(model="skills-extractor:latest", content=resume_text)
        experience = query_ollama_model(model="experience-extractor:latest", content=resume_text)

        parsed_resume = {
            **education_and_timezone,
            **skills,
            **experience,
        }

        return parsed_resume

    except Exception as e:
        raise ValueError(f"Failed to parse resume text: {str(e)}") from e