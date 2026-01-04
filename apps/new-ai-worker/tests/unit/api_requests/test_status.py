from src.services.api_client import APIClient
from src.config.constants import ApplicantStatus

def test_set_status_success():
    client = APIClient()
    applicant_id = 1

    status_code, response = client.set_status(applicant_id, ApplicantStatus.PROCESSING)
    assert status_code == 200

