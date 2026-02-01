import pytest
from src.services.resume_scoring import score_education_match, score_skills_match, score_timezone_match, score_experience_match

applicant = {'id': 19, 'createdAt': '2025-10-09T16:18:05.826Z', 'updatedAt': '2025-10-09T19:19:54.241Z', 'name': 'BOT', 'email': 'bot@email.com', 'resume': 'resumes/2025/bot-1760026685155.pdf', 'statusAI': 'processing', 'parsedHighestEducationDegree': 'Bachelor', 'parsedEducationField': 'Computer Science', 'parsedTimezone': 'GMT+8', 'parsedSkills': 'C++ Programming Language, Visual Basic 6.0, PHP Scripting Language, HTML/CSS, Mysql Database, Joomla, Adobe Photoshop (any version), Adobe Illustrator, Adobe Dreamweaver, Adobe Flash, Adobe After Effects', 'parsedYearsOfExperience': 14, 'skillsScoreAI': '0', 'experienceScoreAI': '0', 'educationScoreAI': '0', 'timezoneScoreAI': '0', 'overallScoreAI': '0', 'skillsFeedbackAI': None, 'experienceFeedbackAI': None, 'educationFeedbackAI': None, 'timezoneFeedbackAI': None, 'overallFeedbackAI': None, 'currentStage': 0, 'interviewStatus': 'pending', 'interviewNotes': None, 'jobId': 5, 'experiences': [{'id': 1, 'createdAt': '2025-10-09T19:19:54.051Z', 'updatedAt': '2025-10-09T19:19:54.051Z', 'jobTitle': 'Graphic Artist', 'startYear': '2011', 'endYear': 'Present', 'startMonth': 'April', 'endMonth': 'None', 'isRelevant': False, 'applicantId': 19}]}
job = {'id': 5, 'createdAt': '2025-08-20T18:30:19.479Z', 'updatedAt': '2025-08-20T18:30:19.479Z', 'title': 'Data Scientist', 'description': "Join our data team as a Data Scientist to extract insights from large datasets and drive data-informed decision making across the organization. You will develop machine learning models, conduct statistical analysis, create predictive algorithms, and work with stakeholders to translate business questions into analytical solutions.\n\nThe role involves working with various data sources, building dashboards and reports, and presenting findings to both technical and non-technical audiences. We're looking for someone with strong analytical skills and the ability to work with complex datasets to solve challenging business problems.\n\nKey Responsibilities:\n- Develop and deploy machine learning models and algorithms\n- Conduct statistical analysis and data mining\n- Create data visualizations and dashboards\n- Collaborate with business stakeholders to identify opportunities\n- Design and implement A/B tests and experiments\n- Build data pipelines and ETL processes\n- Present findings and recommendations to leadership\n- Stay current with latest developments in data science and ML\n\nThis is an excellent opportunity to work with cutting-edge data science technologies and make a significant impact on business strategy and operations.", 'skills': 'Python, R, SQL, Machine Learning, TensorFlow, Pandas, NumPy, Tableau, Power BI, Statistics, A/B Testing, Data Visualization', 'yearsOfExperience': 3, 'educationDegree': 'Master', 'educationField': 'Data Science', 'timezone': 'GMT+1', 'skillsWeight': '0.5', 'experienceWeight': '0.2', 'educationWeight': '0.2', 'timezoneWeight': '0.1', 'interviewing': 0, 'interviewsNeeded': 2, 'hires': 0, 'hiresNeeded': 1, 'isOpen': True, 'createdById': 'cmekb012x0001ln2w562lrr62'}

def test_scoring_applicant():
    """Test scoring an applicant against a job description."""
    # Score Education Match
    education_score = score_education_match(
        applicant_highest_degree=applicant['parsedHighestEducationDegree'],
        applicant_education_field=applicant['parsedEducationField'],
        job_required_degree=job['educationDegree'],
        job_education_field=job['educationField']
    )

    # Score Skills Match
    job_skills = [{"name": skill.strip(), "weight": 0.1} for skill in job['skills'].split(",")]
    applicant_skills = [skill.strip() for skill in applicant['parsedSkills'].split(",")]

    skills_result = score_skills_match(job_skills, applicant_skills)

    total_skills_score = skills_result['score']

    # Score Timezone Match
    timezone_score_data = score_timezone_match(applicant['parsedTimezone'], job['timezone'])

    # Score Experience Match
    experience_periods = applicant['experiences']
    job_relevant_experience_years = job['yearsOfExperience']
    job_title = job['title']

    experience_score_data = score_experience_match(experience_periods, job_relevant_experience_years, job_title)


    result = {
        "education_score": education_score,
        "skills_score": total_skills_score,
        "timezone_score": timezone_score_data['score'],
        "experience_score": experience_score_data['score'],
        "total_score_with_weights": (
            education_score * float(job['educationWeight']) +
            total_skills_score * float(job['skillsWeight']) +
            timezone_score_data['score'] * float(job['timezoneWeight']) +
            experience_score_data['score'] * float(job['experienceWeight'])
        )
    }

    print(result)