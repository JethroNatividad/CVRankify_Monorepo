import requests
from typing import Tuple, Any, Optional
import logging
from src.config.settings import get_settings
from src.config.constants import ApplicantStatus

logger = logging.getLogger(__name__)

class APIClient:
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.api_base_url
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": self.settings.ai_service_api_key,
        }
    
    def _post(self, endpoint: str, data: dict) -> Tuple[int, dict]:
        """Generic POST request handler with error handling"""
        url = f"{self.base_url}{endpoint}"
        try:
            response = requests.post(
                url, 
                headers=self.headers, 
                json=data,
                timeout=30
            )
            response.raise_for_status()
            return response.status_code, response.json()
        except requests.RequestException as e:
            logger.error(f"API request failed: {endpoint} - {e}")
            raise
    
    def set_status(
        self, 
        applicant_id: int, 
        status: ApplicantStatus
    ) -> Tuple[int, dict]:
        """Update applicant status"""
        endpoint = "/api/trpc/applicant.updateStatusAI"
        data = {
            "json": {
                "applicantId": applicant_id,
                "statusAI": status.value,
            }
        }
        logger.info(f"Setting status for applicant {applicant_id} to {status.value}")
        return self._post(endpoint, data)
    
    def update_parsed_data(
        self,
        applicant_id: int, 
        parsed_data: dict
    ) -> Tuple[int, dict]:
        """Update applicant parsed data from CV extraction"""
        # Extract and format the parsed data
        formatted_data = {
            "parsedHighestEducationDegree": parsed_data.get("highestEducationDegree"),
            "parsedEducationField": parsed_data.get("educationField"),
            "parsedTimezone": parsed_data.get("timezone"),
            "parsedSkills": ", ".join(parsed_data.get("skills", [])),
            "parsedYearsOfExperience": 0,  # Currently set to 0, can be calculated later
            "parsedExperiences": parsed_data.get("experiencePeriods", [])
        }
        
        endpoint = "/api/trpc/applicant.updateParsedDataAI"
        data = {
            "json": {
                "applicantId": applicant_id,
                **formatted_data
            }
        }
        
        logger.info(f"Updating parsed data for applicant {applicant_id}")
        return self._post(endpoint, data)
    
    def queue_score_resume(self, applicant_id: int) -> Tuple[int, dict]:
        """Queue applicant resume for scoring"""
        endpoint = "/api/trpc/applicant.queueScoring"
        data = {
            "json": {
                "applicantId": applicant_id,
            }
        }
        logger.info(f"Queueing score for applicant {applicant_id}")
        return self._post(endpoint, data)