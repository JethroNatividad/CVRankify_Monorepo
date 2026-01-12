
from src.utils.ollama import query_ollama_model

def parse_resume_text(resume_text):
    """
    Parse the resume text using an AI model to extract structured information.
    """

    try:
        print("Parsing resume text with AI model...")
        education_and_timezone = query_ollama_model(model="edu-timezone-extractor:latest", content=resume_text)
        print("Education and Timezone extracted:", education_and_timezone)
        print("Extracting skills and experience...")
        
        skills = query_ollama_model(model="skills-extractor:latest", content=resume_text)
        print("Skills extracted:", skills)
        print("Extracting experience...")

        experience = query_ollama_model(model="experience-extractor:latest", content=resume_text)
        print("Experience extracted:", experience)

        parsed_resume = {
            **education_and_timezone,
            **skills,
            **experience,
        }

        return parsed_resume

    except Exception as e:
        raise ValueError(f"Failed to parse resume text: {str(e)}") from e