
import json
from src.config.constants import DEGREE_VALUES
from src.utils.ollama import query_ollama_model
from src.utils.timezone import tz_score, parse_timezone

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

def score_skills_match(job_skills, applicant_skills):
    # job_skills: [{name: str, weight: float}]
    # weight of all skills must sum to 1

    # applicant_skills: [str]

    try:
        payload = {
        "job_skills": [skill['name'] for skill in job_skills],
        "applicant_skills": applicant_skills
        }

        json_payload = json.dumps(payload, indent=2)

        # {"job_skills": [{"skill": str, "match_type": str, "from_cv": str or None, "score": float, "reason": str}]}
        scored_skills = query_ollama_model(model="skills_score:latest", content=json_payload)

        # Calculate weighted score, add a new field 'weighted_score' to each skill
        for skill in scored_skills['job_skills']:
            skill_weight = next((s['weight'] for s in job_skills if s['name'] == skill['skill']), 0)
            skill['weighted_score'] = skill['score'] * skill_weight

        return scored_skills
    except Exception as e:
        raise ValueError(f"Failed to score skills match: {str(e)}") from e


def score_timezone_match(applicant_timezone: str, job_timezone: str):
    # BOTH are in "GMT+X" or "GMT-X" format str
    try:
        applicant_offset = parse_timezone(applicant_timezone)
        job_offset = parse_timezone(job_timezone)

        if applicant_offset is None or job_offset is None:
            raise ValueError("Invalid timezone format")

        score, diff = tz_score(applicant_offset, job_offset)
        return {
            "score": score,
            "difference_in_hours": diff
        }
    except Exception as e:
        raise ValueError(f"Failed to score timezone match: {str(e)}") from e


def score_experience_match(experience_periods: list[dict]): 
    # takes in experience periods.
    # "experiencePeriods": [
#     { "startYear": "2024", "startMonth": "None", "endYear": "Present", "endMonth": "None", "jobTitle": "Computer Programmer, City Medical Center" },
#     { "startYear": "2023", "startMonth": "March", "endYear": "2023", "endMonth": "July", "jobTitle": "Tour Siri Star Coordinator, Travel and Tours" },
#     { "startYear": "2022", "startMonth": "June", "endYear": "2022", "endMonth": "December", "jobTitle": "Admin Aide III (Programmer), Medical Center" },
#     { "startYear": "2021", "startMonth": "December", "endYear": "2021", "endMonth": "December", "jobTitle": "Unicef Data Manager, Vaccination Team under DOH & CHO" },
#     { "startYear": "2020", "startMonth": "None", "endYear": "2020", "endMonth": "None", "jobTitle": "Gemzon Facebook Teleconsultation Admin & Technical Clinic Support (Part-time)" },
#     { "startYear": "2019", "startMonth": "May", "endYear": "2021", "endMonth": "October", "jobTitle": "Programmer, West Metro Medical Center" }
#   ]


    pass