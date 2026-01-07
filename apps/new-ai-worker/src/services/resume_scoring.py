
import json
from src.config.constants import DEGREE_VALUES, MONTH_MAP
from src.utils.ollama import query_ollama_model
from src.utils.timezone import tz_score, parse_timezone
from datetime import datetime

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
    # This is a weighed average match score, the weight is a points assigned to each skill based on its importance to the job.

    # applicant_skills: [str]

    try:
        payload = {
        "job_skills": [skill['name'] for skill in job_skills],
        "applicant_skills": applicant_skills
        }

        json_payload = json.dumps(payload, indent=2)

        # {"job_skills": [{"skill": str, "match_type": str, "from_cv": str or None, "score": float, "reason": str}]}
        scored_skills = query_ollama_model(model="skills_score:latest", content=json_payload)


        job_weight_map = {skill['name']: skill['weight'] for skill in job_skills}

        # 2. Calculate Total Possible Points
        total_job_skills_points = sum(job_weight_map.values())

        # 3. Calculate Matched Points
        total_matched_skill_points = 0.0

        final_score = 0.0
        
        for match in scored_skills["job_skills"]:
            skill_name = match['skill']
            
            # Get weight from the map
            weight = job_weight_map.get(skill_name, 0)
            
            # Multiply Weight by the Semantic Match Score (1.0 or 0.5)
            # 10 * 1.0 = 10
            # 5 * 0.5 = 2.5
            points_earned = weight * match['score']
            
            total_matched_skill_points += points_earned

        # 4. Final Calculation
        if total_job_skills_points > 0:
            final_score = (total_matched_skill_points / total_job_skills_points) * 100
        else:
            final_score = 0

        return {
            "score": final_score,
            "scored_skills": scored_skills['job_skills']
        }
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


def score_experience_match(experience_periods: list[dict], job_relevant_experience_years: int, job_title: str): 
    # takes in experience periods.
    # "experiencePeriods": [
    #     { "startYear": "2024", "startMonth": "None", "endYear": "Present", "endMonth": "None", "jobTitle": "Computer Programmer, City Medical Center" },
    #     { "startYear": "2023", "startMonth": "March", "endYear": "2023", "endMonth": "July", "jobTitle": "Tour Siri Star Coordinator, Travel and Tours" },
    #     { "startYear": "2022", "startMonth": "June", "endYear": "2022", "endMonth": "December", "jobTitle": "Admin Aide III (Programmer), Medical Center" },
    #     { "startYear": "2021", "startMonth": "December", "endYear": "2021", "endMonth": "December", "jobTitle": "Unicef Data Manager, Vaccination Team under DOH & CHO" },
    #     { "startYear": "2020", "startMonth": "None", "endYear": "2020", "endMonth": "None", "jobTitle": "Gemzon Facebook Teleconsultation Admin & Technical Clinic Support (Part-time)" },
    #     { "startYear": "2019", "startMonth": "May", "endYear": "2021", "endMonth": "October", "jobTitle": "Programmer, West Metro Medical Center" }
    #   ]

    print(experience_periods)

    try:
        payload = {
            "experiencePeriods": experience_periods,
            "jobTitle": job_title,
        }

        json_payload = json.dumps(payload, indent=2)
        # This returns the same experience periods list with an added field: relevant: bool

        added_relevant_experiences = query_ollama_model(model="exp_relevance_eval:latest", content=json_payload)

        experience_periods_with_relevance = added_relevant_experiences['experiencePeriods']


        # Calculate total relevant experience years

        current_year = datetime.now().year
        current_month = datetime.now().month

        ranges = []
        for exp in experience_periods_with_relevance:
            if not exp.get("relevant", False):
                continue

            start_year = int(exp["startYear"])
            start_month = MONTH_MAP.get(exp["startMonth"], 1)

            if exp["endYear"] == "Present":
                end_year = current_year
                end_month = current_month
            else:
                end_year = int(exp["endYear"])
                end_month = MONTH_MAP.get(exp["endMonth"], 1)

            start_index = start_year * 12 + start_month
            end_index = end_year * 12 + end_month

            ranges.append((start_index, end_index))
        if not ranges:
            return {
                "score": 0.0,
                "years_of_experience": 0.0,
                "experience_periods_with_relevance": experience_periods_with_relevance
            }
        
        ranges.sort()
        merged = [ranges[0]]

        for start, end in ranges[1:]:
            last_start, last_end = merged[-1]
            if start <= last_end:  # overlap or continuous
                merged[-1] = (last_start, max(last_end, end))
            else:
                merged.append((start, end))

        total_months = sum(end - start for start, end in merged)
        total_years = total_months // 12
        remaining_months = total_months % 12

        total_years_with_months = total_years + (remaining_months / 12)

        # Score calculation based on required years, if more than required, give bonus
        if total_years_with_months >= job_relevant_experience_years:
            bonus = (total_years_with_months - job_relevant_experience_years) * 3
            score = 100 + bonus
        else:
            score = (total_years_with_months / job_relevant_experience_years) * 100

        # return (relevant_experience, score, total_years_with_months)
        return {
            "score": score,
            "years_of_experience": total_years_with_months,
            "experience_periods_with_relevance": experience_periods_with_relevance
        }


    except Exception as e:
        raise ValueError(f"Failed to score experience match: {str(e)}") from e