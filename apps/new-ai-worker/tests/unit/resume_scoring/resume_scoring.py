from src.services.resume_scoring import score_education_match
import time


def test_score_education_match():
    start_time = time.time()
    score = score_education_match(
        applicant_highest_degree="Bachelor",
        applicant_education_field="Computer Science",
        job_required_degree="Bachelor",
        job_education_field="Computer Science"
    )
    end_time = time.time()
    print(f"Score: {score}")
    print(f"Time taken: {end_time - start_time} seconds")

test_score_education_match()