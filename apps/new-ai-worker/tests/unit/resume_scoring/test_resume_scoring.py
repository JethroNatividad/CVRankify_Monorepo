import pytest
from src.services.resume_scoring import score_education_match


def test_score_education_match_exact_match():
    """Test exact match of degree and field returns perfect score."""
    score = score_education_match(
        applicant_highest_degree="Bachelor",
        applicant_education_field="Computer Science",
        job_required_degree="Bachelor",
        job_education_field="Computer Science"
    )
    assert score == 100.0