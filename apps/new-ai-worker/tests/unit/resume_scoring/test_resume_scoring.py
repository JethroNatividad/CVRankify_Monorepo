import pytest
from src.services.resume_scoring import score_education_match, score_skills_match, score_timezone_match


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
        {"name": "Python", "weight": 0.2},
        {"name": "Data Analysis", "weight": 0.8}
    ]
    applicant_skills = ["Python", "Machine Learning"]

    scored_skills = score_skills_match(job_skills, applicant_skills)

    assert 'job_skills' in scored_skills
    assert len(scored_skills['job_skills']) == 2
    assert scored_skills['job_skills'][0]['skill'] == 'Python'
    assert scored_skills['job_skills'][0]['weighted_score'] == 0.2
    assert scored_skills['job_skills'][1]['skill'] == 'Data Analysis'
    assert scored_skills['job_skills'][1]['weighted_score'] == 0.4  


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
