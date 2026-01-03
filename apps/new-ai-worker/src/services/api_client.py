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