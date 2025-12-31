import pytest
from src.services.resume_scoring import score_education_match, score_skills_match


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

    # {'job_skills': [{'skill': 'Python', 'match_type': 'explicit', 'from_cv': 'Python', 'score': 1.0, 'reason': 'Exact match between job skill and CV skill', 'weighted_score': 0.2}, {'skill': 'Data Analysis', 'match_type': 'implied', 'from_cv': 'Machine Learning', 'score': 0.5, 'reason': 'Machine Learning often involves data analysis techniques', 'weighted_score': 0.4}]}

    assert 'job_skills' in scored_skills
    assert len(scored_skills['job_skills']) == 2
    assert scored_skills['job_skills'][0]['skill'] == 'Python'
    assert scored_skills['job_skills'][0]['weighted_score'] == 0.2
    assert scored_skills['job_skills'][1]['skill'] == 'Data Analysis'
    assert scored_skills['job_skills'][1]['weighted_score'] == 0.4  