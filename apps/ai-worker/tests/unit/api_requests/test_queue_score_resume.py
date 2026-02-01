import pytest
from src.services.api_client import APIClient

def test_queue_score_resume():
    client = APIClient()
    applicant_id = 1

    status_code, response = client.queue_score_resume(applicant_id)

    assert status_code == 200