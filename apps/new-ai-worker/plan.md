I'll read through your ai-worker directory to understand the codebase and create a comprehensive refactoring plan. 

Read [](file:///home/jet/Projects/CVRankify_Monorepo/apps/ai-worker/ai.py)

Read [](file:///home/jet/Projects/CVRankify_Monorepo/apps/ai-worker/api.py)

Read [](file:///home/jet/Projects/CVRankify_Monorepo/apps/ai-worker/scoring.py)

Read [](file:///home/jet/Projects/CVRankify_Monorepo/apps/ai-worker/extract2.py)

Read [](file:///home/jet/Projects/CVRankify_Monorepo/apps/ai-worker/utils.py)

Read [](file:///home/jet/Projects/CVRankify_Monorepo/apps/ai-worker/prompts.py)

Read [](file:///home/jet/Projects/CVRankify_Monorepo/apps/ai-worker/requirements.txt#1-1), lines 1 to 100

Read [](file:///home/jet/Projects/CVRankify_Monorepo/apps/ai-worker/readme.md)

Now let me create a comprehensive refactoring plan based on the codebase analysis:

## 🔧 AI-Worker Refactoring Plan

After analyzing your entire ai-worker directory, here's a structured refactoring plan with examples:

---

### **Current Issues Identified:**

1. **Poor Separation of Concerns** - Business logic mixed with worker orchestration
2. **Hardcoded Values** - URLs, API endpoints, timeouts scattered throughout
3. **No Error Handling Strategy** - Inconsistent exception handling
4. **Code Duplication** - Repeated patterns in API calls and JSON parsing
5. **No Configuration Management** - Environment variables used directly
6. **Lack of Type Safety** - Minimal type hints
7. **No Logging Strategy** - Print statements everywhere
8. **Tight Coupling** - Direct dependencies between modules
9. **No Testing Structure** - No tests visible
10. **Missing Data Models** - Using raw dicts instead of data classes

---

### **Proposed New Structure:**

```
ai-worker/
├── src/
│   ├── __init__.py
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py          # Centralized configuration
│   │   └── constants.py         # Constants and enums
│   ├── models/
│   │   ├── __init__.py
│   │   ├── applicant.py         # Applicant data models
│   │   ├── job.py               # Job data models
│   │   └── scoring.py           # Scoring result models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── resume_extraction.py # Resume text extraction
│   │   ├── ai_extraction.py     # AI data extraction
│   │   ├── scoring_service.py   # All scoring logic
│   │   └── api_client.py        # API communication
│   ├── workers/
│   │   ├── __init__.py
│   │   ├── base.py              # Base worker class
│   │   ├── extraction_worker.py # Resume extraction worker
│   │   └── scoring_worker.py    # Scoring worker
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logging.py           # Logging utilities
│   │   ├── json_utils.py        # JSON parsing utilities
│   │   └── validators.py        # Validation functions
│   └── storage/
│       ├── __init__.py
│       └── minio_client.py      # MinIO client wrapper
├── tests/
│   ├── __init__.py
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── main.py                       # Entry point
├── requirements.txt
├── requirements-dev.txt          # Dev dependencies
├── .env.example
└── README.md
```

---

### **Detailed Refactoring Examples:**

#### **1. Configuration Management**

**Create `src/config/settings.py`:**

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # MinIO Configuration
    minio_endpoint: str
    minio_port: str
    minio_access_key: str
    minio_secret_key: str
    minio_bucket_name: str
    minio_use_ssl: bool = False
    
    # Redis Configuration
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    
    # API Configuration
    api_base_url: str = "http://localhost:3000"
    ai_service_api_key: str
    
    # Worker Configuration
    queue_name: str = "cvrankify-jobs"
    worker_concurrency: int = 5
    
    # AI Model Configuration
    ollama_base_url: str = "http://localhost:11434"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

**Create `src/config/constants.py`:**

```python
from enum import Enum

class ApplicantStatus(str, Enum):
    PENDING = "pending"
    PARSING = "parsing"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class EducationDegree(str, Enum):
    NONE = "None"
    HIGH_SCHOOL = "High School"
    BACHELOR = "Bachelor"
    MASTER = "Master"
    PHD = "PhD"
    UNKNOWN = "Unknown"

class SkillMatchType(str, Enum):
    EXPLICIT = "explicit"
    IMPLIED = "implied"
    MISSING = "missing"

DEGREE_VALUES = {
    EducationDegree.NONE: 0,
    EducationDegree.HIGH_SCHOOL: 1,
    EducationDegree.BACHELOR: 2,
    EducationDegree.MASTER: 3,
    EducationDegree.PHD: 4,
}

MONTH_MAP = {
    "January": 1, "February": 2, "March": 3, "April": 4,
    "May": 5, "June": 6, "July": 7, "August": 8,
    "September": 9, "October": 10, "November": 11, "December": 12,
    "None": 1, None: 1,
}
```

---

#### **2. Data Models with Pydantic**

**Create `src/models/applicant.py`:**

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ExperiencePeriod(BaseModel):
    id: Optional[int] = None
    job_title: str = Field(alias="jobTitle")
    start_year: str = Field(alias="startYear")
    end_year: str = Field(alias="endYear")
    start_month: str = Field(default="None", alias="startMonth")
    end_month: str = Field(default="None", alias="endMonth")
    is_relevant: Optional[bool] = Field(default=False, alias="isRelevant")
    applicant_id: Optional[int] = Field(default=None, alias="applicantId")
    
    class Config:
        populate_by_name = True

class ApplicantData(BaseModel):
    id: int
    name: str
    email: str
    resume: str
    status_ai: str = Field(alias="statusAI")
    parsed_highest_education_degree: Optional[str] = Field(None, alias="parsedHighestEducationDegree")
    parsed_education_field: Optional[str] = Field(None, alias="parsedEducationField")
    parsed_timezone: Optional[str] = Field(None, alias="parsedTimezone")
    parsed_skills: Optional[str] = Field(None, alias="parsedSkills")
    parsed_years_of_experience: Optional[int] = Field(None, alias="parsedYearsOfExperience")
    experiences: List[ExperiencePeriod] = []
    job_id: int = Field(alias="jobId")
    
    class Config:
        populate_by_name = True

class ResumeExtractionResult(BaseModel):
    highest_education_degree: str = Field(alias="highestEducationDegree")
    education_field: str = Field(alias="educationField")
    timezone: str
    skills: List[str]
    experience_periods: List[dict] = Field(alias="experiencePeriods")
    
    class Config:
        populate_by_name = True
```

**Create scoring.py:**

```python
from pydantic import BaseModel
from typing import List, Optional

class SkillMatch(BaseModel):
    job_skill: str
    match_type: str
    applicant_skill: str
    score: float
    reason: Optional[str] = ""

class ScoringResult(BaseModel):
    skills_score: float
    experience_score: float
    education_score: float
    timezone_score: float
    overall_score: float
    total_years_experience: float
    matched_skills: List[SkillMatch]
    relevant_experiences: List[dict]
```

---

#### **3. Service Layer Refactoring**

**Create `src/services/api_client.py`:**

```python
import requests
from typing import Tuple, Any, Optional
import logging
from src.config.settings import get_settings
from src.config.constants import ApplicantStatus
from src.models.scoring import SkillMatch

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
        """Update parsed resume data"""
        endpoint = "/api/trpc/applicant.updateParsedDataAI"
        
        data = {
            "json": {
                "applicantId": applicant_id,
                "parsedHighestEducationDegree": parsed_data.get("highestEducationDegree"),
                "parsedEducationField": parsed_data.get("educationField"),
                "parsedTimezone": parsed_data.get("timezone"),
                "parsedSkills": ", ".join(parsed_data.get("skills", [])),
                "parsedYearsOfExperience": 0,
                "parsedExperiences": parsed_data.get("experiencePeriods", []),
            }
        }
        logger.info(f"Updating parsed data for applicant {applicant_id}")
        return self._post(endpoint, data)
    
    def update_matched_skills(
        self,
        applicant_id: int,
        matched_skills: List[SkillMatch]
    ) -> Tuple[int, dict]:
        """Update matched skills"""
        endpoint = "/api/trpc/applicant.updateApplicantMatchedSkillsAI"
        
        skills_data = [skill.model_dump() for skill in matched_skills]
        data = {
            "json": {
                "applicantId": applicant_id,
                "matchedSkills": skills_data,
            }
        }
        logger.info(f"Updating {len(matched_skills)} matched skills for applicant {applicant_id}")
        return self._post(endpoint, data)
    
    def update_scores(
        self,
        applicant_id: int,
        scores: dict
    ) -> Tuple[int, dict]:
        """Update applicant scores"""
        endpoint = "/api/trpc/applicant.updateApplicantScoresAI"
        
        data = {
            "json": {
                "applicantId": applicant_id,
                **scores
            }
        }
        logger.info(f"Updating scores for applicant {applicant_id}")
        return self._post(endpoint, data)
```

**Create `src/services/scoring_service.py`:**

```python
from typing import Tuple, List
from ollama import Client
import logging
from src.config.constants import DEGREE_VALUES, MONTH_MAP
from src.models.scoring import SkillMatch, ScoringResult
from src.models.applicant import ExperiencePeriod
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class ScoringService:
    def __init__(self):
        self.client = Client()
    
    def score_education_match(
        self,
        applicant_degree: str,
        applicant_field: str,
        job_degree: str,
        job_field: str,
    ) -> float:
        """Score education match based on degree level and field"""
        
        # Calculate degree score
        applicant_value = DEGREE_VALUES.get(applicant_degree, 0)
        job_value = DEGREE_VALUES.get(job_degree, 0)
        
        if applicant_value > job_value:
            bonus = (applicant_value - job_value) * 10
            degree_score = 100 + bonus
        else:
            degree_score = (applicant_value / job_value) * 100 if job_value > 0 else 0
        
        # Calculate field score using AI model
        try:
            response = self.client.chat(
                model="edu-match",
                messages=[{
                    "role": "user",
                    "content": f"{job_field}, {applicant_field}",
                }],
                think=False,
            )
            field_score = float(response["message"]["content"].strip())
        except (ValueError, KeyError) as e:
            logger.error(f"Error getting field score: {e}")
            field_score = 0
        
        overall_score = (degree_score * 0.6) + (field_score * 0.4)
        logger.info(f"Education score: degree={degree_score:.2f}, field={field_score:.2f}, overall={overall_score:.2f}")
        
        return round(overall_score, 2)
    
    def score_skills_match(
        self,
        job_skills: List[str],
        applicant_skills: List[str]
    ) -> Tuple[float, List[SkillMatch]]:
        """Score skills match using AI model"""
        
        if not job_skills:
            return 0.0, []
        
        data = {
            "job_skills": job_skills,
            "cv_skills": applicant_skills,
        }
        
        try:
            response = self.client.chat(
                model="skills_score",
                messages=[{
                    "role": "user",
                    "content": json.dumps(data, indent=2),
                }],
                think=False,
            )
            
            skills_match_json = self._parse_skills_response(
                response["message"]["content"].strip()
            )
            
            # Calculate average score
            total_score = sum(
                skill.get("score", 0) 
                for skill in skills_match_json["job_skills"]
            )
            avg_score = total_score / len(job_skills)
            
            # Convert to SkillMatch models
            matched_skills = [
                SkillMatch(
                    job_skill=s["skill"],
                    match_type=s["match_type"],
                    applicant_skill=s.get("from_cv") or "",
                    score=s["score"],
                    reason=s.get("reason", "")
                )
                for s in skills_match_json["job_skills"]
            ]
            
            logger.info(f"Skills match score: {avg_score:.2f}")
            return round(avg_score * 100, 2), matched_skills
            
        except Exception as e:
            logger.error(f"Error scoring skills: {e}")
            return 0.0, []
    
    def _parse_skills_response(self, response: str) -> dict:
        """Parse skills response with fallback to json_fixer model"""
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            logger.warning("Invalid JSON from skills_score, using json_fixer")
            try:
                fixed_response = self.client.chat(
                    model="json_fixer",
                    messages=[{"role": "user", "content": response}],
                    think=False,
                )
                return json.loads(fixed_response["message"]["content"].strip())
            except Exception as e:
                logger.error(f"json_fixer failed: {e}")
                return {"job_skills": []}
    
    def score_experience_years(
        self,
        experience_periods: List[ExperiencePeriod],
        job_required_years: int,
        job_title: str
    ) -> Tuple[List[dict], float, float]:
        """Score experience based on relevant years"""
        
        if not experience_periods:
            return [], 0.0, 0.0
        
        # Get relevant experiences using AI
        relevant_experiences = self._get_relevant_experiences(
            experience_periods, 
            job_title
        )
        
        # Calculate total relevant years
        total_years = self._calculate_total_years(relevant_experiences)
        
        # Calculate score
        if total_years >= job_required_years:
            bonus = (total_years - job_required_years) * 3
            score = 100 + bonus
        else:
            score = (total_years / job_required_years) * 100 if job_required_years > 0 else 0
        
        logger.info(f"Experience score: {score:.2f} ({total_years:.1f} years)")
        return relevant_experiences, round(score, 2), round(total_years, 2)
    
    def _get_relevant_experiences(
        self,
        experiences: List[ExperiencePeriod],
        job_title: str
    ) -> List[dict]:
        """Determine which experiences are relevant using AI"""
        
        data = {
            "experiencePeriods": [exp.model_dump() for exp in experiences],
            "jobTitle": job_title,
        }
        
        try:
            response = self.client.chat(
                model="exp_relevance_eval",
                messages=[{
                    "role": "user",
                    "content": json.dumps(data, indent=2),
                }],
                think=False,
            )
            
            result = json.loads(response["message"]["content"].strip())
            return result.get("experiencePeriods", [])
            
        except Exception as e:
            logger.error(f"Error getting relevant experiences: {e}")
            return []
    
    def _calculate_total_years(self, experiences: List[dict]) -> float:
        """Calculate total years from overlapping experience periods"""
        
        relevant = [exp for exp in experiences if exp.get("relevant", False)]
        if not relevant:
            return 0.0
        
        current_year = datetime.now().year
        current_month = datetime.now().month
        
        # Convert to month ranges
        ranges = []
        for exp in relevant:
            start_year = int(exp["startYear"])
            start_month = MONTH_MAP.get(exp.get("startMonth"), 1)
            
            if exp["endYear"] == "Present":
                end_year = current_year
                end_month = current_month
            else:
                end_year = int(exp["endYear"])
                end_month = MONTH_MAP.get(exp.get("endMonth"), 1)
            
            start_index = start_year * 12 + start_month
            end_index = end_year * 12 + end_month
            ranges.append((start_index, end_index))
        
        # Merge overlapping ranges
        ranges.sort()
        merged = [ranges[0]]
        
        for start, end in ranges[1:]:
            last_start, last_end = merged[-1]
            if start <= last_end:
                merged[-1] = (last_start, max(last_end, end))
            else:
                merged.append((start, end))
        
        # Calculate total months
        total_months = sum(end - start for start, end in merged)
        return total_months / 12
    
    def calculate_timezone_score(
        self,
        applicant_tz: str,
        job_tz: str
    ) -> Tuple[float, float]:
        """Calculate timezone compatibility score"""
        
        def parse_timezone(tz_string: str) -> Optional[float]:
            """Parse GMT/UTC timezone string to float offset"""
            if "GMT" in tz_string:
                tz = tz_string.split("GMT")[-1]
            elif "UTC" in tz_string:
                tz = tz_string.split("UTC")[-1]
            else:
                return None
            
            sign = 1
            if tz.startswith("-"):
                sign = -1
                tz = tz[1:]
            elif tz.startswith("+"):
                tz = tz[1:]
            
            if ":" in tz:
                hours, mins = tz.split(":")
                offset = sign * (float(hours) + float(mins) / 60)
            else:
                offset = sign * float(tz)
            
            return offset
        
        try:
            applicant_offset = parse_timezone(applicant_tz)
            job_offset = parse_timezone(job_tz)
            
            if applicant_offset is None or job_offset is None:
                return 0.0, 0.0
            
            # Calculate circular distance
            a = (applicant_offset + 24) % 24
            b = (job_offset + 24) % 24
            d = abs(a - b)
            diff = min(d, 24 - d)
            
            score = (1 - diff / 12) * 100
            score = max(0.0, min(100.0, score))
            
            logger.info(f"Timezone score: {score:.2f} (gap: {diff:.1f}h)")
            return round(score, 2), round(diff, 2)
            
        except Exception as e:
            logger.error(f"Error calculating timezone score: {e}")
            return 0.0, 0.0
```

---

#### **4. Worker Refactoring**

**Create `src/workers/base.py`:**

```python
from abc import ABC, abstractmethod
from typing import Any
import logging

logger = logging.getLogger(__name__)

class BaseWorker(ABC):
    """Base class for all workers"""
    
    def __init__(self):
        self.logger = logger
    
    @abstractmethod
    async def process(self, job: Any, job_token: str) -> str:
        """Process a job"""
        pass
    
    def handle_error(self, job: Any, error: Exception):
        """Handle job processing errors"""
        self.logger.error(f"Error processing job {job.id}: {error}", exc_info=True)
```

**Create `src/workers/extraction_worker.py`:**

```python
import asyncio
from typing import Any
import logging
from src.workers.base import BaseWorker
from src.services.api_client import APIClient
from src.services.resume_extraction import ResumeExtractionService
from src.services.ai_extraction import AIExtractionService
from src.storage.minio_client import MinIOStorage
from src.config.constants import ApplicantStatus

logger = logging.getLogger(__name__)

class ExtractionWorker(BaseWorker):
    """Worker for processing resume extraction jobs"""
    
    def __init__(self):
        super().__init__()
        self.api_client = APIClient()
        self.minio = MinIOStorage()
        self.extraction_service = ResumeExtractionService()
        self.ai_service = AIExtractionService()
    
    async def process(self, job: Any, job_token: str) -> str:
        """Process resume extraction job"""
        
        applicant_id = job.data.get("applicantId")
        resume_path = job.data.get("resumePath")
        
        logger.info(f"Processing extraction for applicant {applicant_id}")
        
        try:
            # Set status to parsing
            await asyncio.to_thread(
                self.api_client.set_status,
                applicant_id,
                ApplicantStatus.PARSING
            )
            
            # Download and extract text from resume
            resume_data = await asyncio.to_thread(
                self.minio.get_object,
                resume_path
            )
            
            resume_text = await asyncio.to_thread(
                self.extraction_service.extract_text,
                resume_data
            )
            
            # Extract structured data using AI
            parsed_data = await asyncio.to_thread(
                self.ai_service.extract_resume_data,
                resume_text
            )
            
            # Update parsed data
            await asyncio.to_thread(
                self.api_client.update_parsed_data,
                applicant_id,
                parsed_data
            )
            
            # Set status to processing and queue scoring
            await asyncio.to_thread(
                self.api_client.set_status,
                applicant_id,
                ApplicantStatus.PROCESSING
            )
            
            await asyncio.to_thread(
                self.api_client.queue_score_resume,
                applicant_id
            )
            
            logger.info(f"Successfully processed extraction for applicant {applicant_id}")
            return "ok"
            
        except Exception as e:
            self.handle_error(job, e)
            await asyncio.to_thread(
                self.api_client.set_status,
                applicant_id,
                ApplicantStatus.FAILED
            )
            raise
```

**Create `src/workers/scoring_worker.py`:**

```python
import asyncio
import json
from typing import Any
import logging
from src.workers.base import BaseWorker
from src.services.api_client import APIClient
from src.services.scoring_service import ScoringService
from src.models.applicant import ApplicantData
from src.models.job import JobData
from src.config.constants import ApplicantStatus

logger = logging.getLogger(__name__)

class ScoringWorker(BaseWorker):
    """Worker for processing applicant scoring jobs"""
    
    def __init__(self):
        super().__init__()
        self.api_client = APIClient()
        self.scoring_service = ScoringService()
    
    async def process(self, job: Any, job_token: str) -> str:
        """Process applicant scoring job"""
        
        applicant_id = job.data.get("applicantId")
        logger.info(f"Scoring applicant {applicant_id}")
        
        try:
            # Parse job data
            applicant_data = ApplicantData(**json.loads(job.data.get("applicantData")))
            job_data = JobData(**json.loads(job.data.get("jobData")))
            
            # Validate weights
            self._validate_weights(job_data)
            
            # Calculate all scores
            scores = await asyncio.to_thread(
                self._calculate_all_scores,
                applicant_data,
                job_data
            )
            
            # Update all results
            await self._update_results(applicant_id, scores)
            
            # Set status to completed
            await asyncio.to_thread(
                self.api_client.set_status,
                applicant_id,
                ApplicantStatus.COMPLETED
            )
            
            logger.info(f"Successfully scored applicant {applicant_id}")
            return "ok"
            
        except Exception as e:
            self.handle_error(job, e)
            await asyncio.to_thread(
                self.api_client.set_status,
                applicant_id,
                ApplicantStatus.FAILED
            )
            raise
    
    def _calculate_all_scores(
        self,
        applicant_data: ApplicantData,
        job_data: JobData
    ) -> dict:
        """Calculate all scoring components"""
        
        # Education score
        education_score = self.scoring_service.score_education_match(
            applicant_data.parsed_highest_education_degree,
            applicant_data.parsed_education_field,
            job_data.education_degree,
            job_data.education_field,
        )
        
        # Skills score
        job_skills = job_data.skills.split(", ")
        applicant_skills = applicant_data.parsed_skills.split(", ")
        skills_score, matched_skills = self.scoring_service.score_skills_match(
            job_skills,
            applicant_skills
        )
        
        # Experience score
        relevant_exp, experience_score, total_years = self.scoring_service.score_experience_years(
            applicant_data.experiences,
            job_data.years_of_experience,
            job_data.title
        )
        
        # Timezone score
        timezone_score, hour_gap = self.scoring_service.calculate_timezone_score(
            applicant_data.parsed_timezone,
            job_data.timezone
        )
        
        # Overall score
        overall_score = (
            skills_score * job_data.skills_weight +
            experience_score * job_data.experience_weight +
            education_score * job_data.education_weight +
            timezone_score * job_data.timezone_weight
        )
        
        return {
            "skills_score": skills_score,
            "experience_score": experience_score,
            "education_score": education_score,
            "timezone_score": timezone_score,
            "overall_score": round(overall_score, 2),
            "total_years": total_years,
            "matched_skills": matched_skills,
            "relevant_experiences": relevant_exp,
        }
    
    async def _update_results(self, applicant_id: int, scores: dict):
        """Update all scoring results"""
        
        # Update matched skills
        await asyncio.to_thread(
            self.api_client.update_matched_skills,
            applicant_id,
            scores["matched_skills"]
        )
        
        # Update experience relevance
        await asyncio.to_thread(
            self.api_client.update_experience_relevance,
            applicant_id,
            scores["relevant_experiences"]
        )
        
        # Update scores
        score_data = {
            "skillsScoreAI": scores["skills_score"],
            "experienceScoreAI": scores["experience_score"],
            "educationScoreAI": scores["education_score"],
            "timezoneScoreAI": scores["timezone_score"],
            "overallScoreAI": scores["overall_score"],
            "parsedYearsOfExperience": scores["total_years"],
        }
        
        await asyncio.to_thread(
            self.api_client.update_scores,
            applicant_id,
            score_data
        )
    
    def _validate_weights(self, job_data: JobData):
        """Validate that weights sum to 1.0"""
        weight_sum = (
            job_data.skills_weight +
            job_data.experience_weight +
            job_data.education_weight +
            job_data.timezone_weight
        )
        
        if abs(weight_sum - 1.0) > 0.001:
            raise ValueError(
                f"Invalid weights for job {job_data.id}. "
                f"Sum must equal 1.0, got {weight_sum}"
            )
```

---

#### **5. Logging Setup**

**Create `src/utils/logging.py`:**

```python
import logging
import sys
from pathlib import Path

def setup_logging(log_level: str = "INFO", log_file: str = None):
    """Configure logging for the application"""
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    
    handlers = [console_handler]
    
    # File handler (optional)
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        handlers.append(file_handler)
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        handlers=handlers
    )
    
    # Reduce noise from third-party libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
```

---

#### **6. Updated Main Entry Point**

**Update `main.py`:**

```python
import asyncio
import signal
import logging
from bullmq import Worker
from src.config.settings import get_settings
from src.utils.logging import setup_logging
from src.workers.extraction_worker import ExtractionWorker
from src.workers.scoring_worker import ScoringWorker

logger = logging.getLogger(__name__)

async def process(job, job_token):
    """Route jobs to appropriate workers"""
    
    if job.name == "process-resume":
        worker = ExtractionWorker()
        return await worker.process(job, job_token)
    
    elif job.name == "score-applicant":
        worker = ScoringWorker()
        return await worker.process(job, job_token)
    
    else:
        logger.warning(f"Unknown job type: {job.name}")
        return None

async def main():
    # Setup
    settings = get_settings()
    setup_logging(log_level="INFO", log_file="logs/worker.log")
    
    logger.info("Starting AI worker...")
    
    # Shutdown event
    shutdown_event = asyncio.Event()
    
    def signal_handler(sig, frame):
        logger.info(f"Received signal {sig}, initiating shutdown...")
        shutdown_event.set()
    
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    # Create worker
    redis_connection = f"redis://{settings.redis_host}:{settings.redis_port}"
    worker = Worker(
        settings.queue_name,
        process,
        {"connection": redis_connection},
    )
    
    logger.info(f"Worker started, listening on queue: {settings.queue_name}")
    
    # Wait for shutdown
    await shutdown_event.wait()
    
    # Cleanup
    logger.info("Shutting down worker...")
    await worker.close()
    logger.info("Worker shut down successfully")

if __name__ == "__main__":
    asyncio.run(main())
```

---

### **Summary of Benefits:**

1. ✅ **Separation of Concerns** - Clear boundaries between layers
2. ✅ **Type Safety** - Pydantic models with validation
3. ✅ **Configuration Management** - Centralized settings
4. ✅ **Error Handling** - Consistent patterns with proper logging
5. ✅ **Testability** - Services can be easily mocked
6. ✅ **Maintainability** - Smaller, focused modules
7. ✅ **Scalability** - Easy to add new workers or services
8. ✅ **Code Reusability** - Shared utilities and base classes

Would you like me to implement these refactorings for you?