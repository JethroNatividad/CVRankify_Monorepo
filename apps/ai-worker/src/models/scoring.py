from pydantic import BaseModel, Field
from typing import Optional


class ExperiencePeriod(BaseModel):
    startYear: str
    startMonth: str
    endYear: str
    endMonth: str
    jobTitle: str
    relevant: Optional[bool] = None

class ExperiencePeriods(BaseModel):
    experiencePeriods: list[ExperiencePeriod] = Field(..., alias="experiencePeriods")