
from src.utils.ollama import query_ollama_model
from datetime import datetime

def validate_year(year_str):
    """
    Validate if a year is reasonable for a resume (between 1950 and current year + 1).
    Returns the year as int if valid, None otherwise.
    """
    if not year_str or year_str == "None" or year_str.lower() == "present":
        return year_str
    
    try:
        year = int(year_str)
        current_year = datetime.now().year
        # Accept years between 1950 and current year + 1 (for future dates)
        if 1950 <= year <= current_year + 1:
            return str(year)
        return None
    except (ValueError, TypeError):
        return None

def filter_experience_periods(experience_data):
    """
    Filter out experience periods with invalid years.
    """
    if not experience_data or 'experiencePeriods' not in experience_data:
        return experience_data
    
    filtered_periods = []
    for period in experience_data.get('experiencePeriods', []):
        start_year = validate_year(period.get('startYear'))
        end_year = validate_year(period.get('endYear'))
        
        # Only keep periods where BOTH years are valid (or Present/None)
        # This filters out entries with corrupted data like year "200"
        if start_year is not None and end_year is not None:
            period['startYear'] = start_year
            period['endYear'] = end_year
            filtered_periods.append(period)
    
    experience_data['experiencePeriods'] = filtered_periods
    return experience_data

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

        # Filter out unreasonable years from experience
        experience = filter_experience_periods(experience)
        print("Experience after filtering:", experience)

        parsed_resume = {
            **education_and_timezone,
            **skills,
            **experience,
        }

        return parsed_resume

    except Exception as e:
        raise ValueError(f"Failed to parse resume text: {str(e)}") from e