import pytest
from src.services.api_client import APIClient
from src.config.constants import ApplicantStatus

def test_set_status_success():
    client = APIClient()
    applicant_id = 1

    parsed_data = {'highestEducationDegree': 'Bachelor', 'educationField': 'Information Technology', 'timezone': 'GMT+8', 'skills': ['Communication', 'Multitasking', 'Adaptability', 'Time Management', 'MS Office', 'MS Excel', 'PowerPoint', 'Video Editing', 'Document Filing', 'Teamwork'], 'experiencePeriods': [{'startYear': '2019', 'startMonth': 'August', 'endYear': '2019', 'endMonth': 'December', 'jobTitle': 'IT Specialist (Intern)'}, {'startYear': '2022', 'startMonth': 'None', 'endYear': '2023', 'endMonth': 'None', 'jobTitle': 'Secretary'}]}

    status_code, response = client.update_parsed_data(applicant_id, parsed_data)

    print("Update Parsed Data Response:", response)

    assert status_code == 200