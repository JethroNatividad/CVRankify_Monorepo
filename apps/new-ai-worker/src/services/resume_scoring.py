
from src.config.constants import DEGREE_VALUES
from src.utils.ollama import query_ollama_model

def score_education_match(
    applicant_highest_degree: str,
    applicant_education_field: str,
    job_required_degree: str,
    job_education_field: str
):
    degree_score = 0

    # Calculate degree score
    applicant_highest_degree_value = DEGREE_VALUES.get(applicant_highest_degree, 0)
    job_required_degree_value = DEGREE_VALUES.get(job_required_degree, 0)

    if applicant_highest_degree_value > job_required_degree_value:
        bonus = (applicant_highest_degree_value - job_required_degree_value) * 10
        degree_score = 100 + bonus
    else:
        degree_score = (
            applicant_highest_degree_value / job_required_degree_value
        ) * 100


    # Calculate field score
    field_score = 0

    try:
        field_score = query_ollama_model(model="edu-match:latest", content=f"{job_education_field}, {applicant_education_field}", json_output=False)
        field_score = float(field_score)
    except Exception as e:
        raise ValueError(f"Failed to score education field match: {str(e)}") from e
    
    # Calculate overall education score
    overall_score = (degree_score * 0.6) + (field_score * 0.4)

    return overall_score

# TODO: Implement experience scoring function
# TODO: Implement skills scoring function
# TODO: Implement timezone scoring function