import pytest
from src.services.resume_scoring import score_education_match, score_skills_match, score_timezone_match, score_experience_match

def test_score_education_match_exact_match():
    """Test exact match of degree and field returns perfect score."""
    score = score_education_match(
        applicant_highest_degree="Bachelor",
        applicant_education_field="Computer Science",
        job_required_degree="Bachelor",
        job_education_field="Computer Science"
    )
    assert score == 100.0


def test_score_skills_match():
    """Test skills match scoring."""
    job_skills = [
        {"name": "Python", "weight": 10},
        {"name": "Data Analysis", "weight": 5}
    ]
    applicant_skills = ["Python", "Machine Learning"]

    result = score_skills_match(job_skills, applicant_skills)
    score = result['score']

    assert score >= 83.3



def test_score_timezone_match():
    """Test timezone match scoring."""
    result = score_timezone_match("GMT+8", "GMT+5")
    assert 'score' in result
    assert 'difference_in_hours' in result
    assert result['difference_in_hours'] == 3
    assert 0 <= result['score'] <= 100

    result = score_timezone_match("GMT-4", "GMT+4")
    assert result['difference_in_hours'] == 8
    assert 0 <= result['score'] <= 100

    result = score_timezone_match("GMT+2", "GMT+2")
    assert result['difference_in_hours'] == 0
    assert result['score'] == 100.0

def test_score_experience_match():
    """Test experience match scoring."""
    experience_periods = [
        {"startYear": "2016", "endYear": "2018","startMonth": "None", "endMonth": "None", "jobTitle": "Janitor"},
        {"startYear": "2018", "endYear": "2020", "startMonth": "None", "endMonth": "None", "jobTitle": "Software Engineer"},
        {"startYear": "2020", "endYear": "Present", "startMonth": "None", "endMonth": "None", "jobTitle": "Senior Software Engineer"},
    ]
    job_relevant_experience_years = 3
    job_title = "Software Engineer"

    result = score_experience_match(experience_periods, job_relevant_experience_years, job_title)

    score = result['score']
    years_of_experience = result['years_of_experience']

    assert years_of_experience == 8.0
    assert score >= 100.0