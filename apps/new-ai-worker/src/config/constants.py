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