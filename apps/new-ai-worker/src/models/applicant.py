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