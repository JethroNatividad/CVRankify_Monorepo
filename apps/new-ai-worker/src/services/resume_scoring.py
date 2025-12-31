
import json
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


# TODO: Implement timezone scoring function
def tz_score(a_hours: float, b_hours: float) -> float:
    # convert to 0..24 circle
    a = (a_hours + 24) % 24
    b = (b_hours + 24) % 24
    d = abs(a - b)
    diff = min(d, 24 - d)  # minimal circular distance, in hours
    score = (1 - diff / 12) * 100  # 100 = same zone, 0 = 12h apart
    return max(0.0, min(100.0, score)), diff

def parse_timezone(tz_string):
    """
    Converts 'GMT+5:30' or 'UTC-4' into a float offset like 5.5 or -4.0
    """
    if "GMT" in tz_string:
        tz = tz_string.split("GMT")[-1]
    elif "UTC" in tz_string:
        tz = tz_string.split("UTC")[-1]
    else:
        return None  # Unknown format

    # Example tz: +5:30, -4, +8
    sign = 1
    if tz.startswith("-"):
        sign = -1
        tz = tz[1:]
    elif tz.startswith("+"):
        tz = tz[1:]

    # Split hour/min if needed
    if ":" in tz:
        hours, mins = tz.split(":")
        offset = sign * (float(hours) + float(mins) / 60)
    else:
        offset = sign * float(tz)

    return offset

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


# TODO: Implement experience scoring function