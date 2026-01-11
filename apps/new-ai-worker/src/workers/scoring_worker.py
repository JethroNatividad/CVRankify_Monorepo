import json
from src.services.resume_scoring import score_education_match, score_skills_match, score_timezone_match, score_experience_match
from src.services.api_client import APIClient
from src.config.constants import ApplicantStatus

def scoring_worker(job):
    api_client = APIClient()
    applicant_id = job.data.get("applicantId")
    applicant_data = job.data.get("applicantData")
    job_data = job.data.get("jobData")

    try:
        
        applicant_data = json.loads(applicant_data)
        job_data = json.loads(job_data)

        # Score Skills

        applicant_skills = [skill.strip() for skill in applicant_data['parsedSkills'].split(",")]
        job_skills = job_data['skills']

        skills_result =  score_skills_match(job_skills, applicant_skills)

        skills_score = skills_result['score']
        scored_skills = skills_result['scored_skills']
        is_disqualified = skills_result['disqualified']

        api_client.update_matched_skills(applicant_id, scored_skills)

        if is_disqualified:
            api_client.set_status(applicant_id, ApplicantStatus.DISQUALIFIED, "Applicant disqualified due to missing required skills.")
            print({
                "applicant_id": applicant_id,
                "reason": "Disqualified due to missing required skills."
            })
            return

        # Score Education
        education_score = score_education_match(
            applicant_highest_degree=applicant_data['parsedHighestEducationDegree'],
            applicant_education_field=applicant_data['parsedEducationField'],
            job_required_degree=job_data['educationDegree'],
            job_education_field=job_data['educationField']
        )

    
        # Score Timezone
        timezone_result = score_timezone_match(applicant_data['parsedTimezone'], job_data['timezone'])
        timezone_score = timezone_result['score']

        # Score Experience
        experience_periods = applicant_data['experiences']
        job_relevant_experience_years = job_data['yearsOfExperience']
        job_title = job_data['title']

        experience_result = score_experience_match(experience_periods, job_relevant_experience_years, job_title)
        experience_score = experience_result['score']
        experience_periods_with_relevance = experience_result['experience_periods_with_relevance']
        total_experience_years = experience_result['years_of_experience']

        api_client.update_applicant_experience_relevance(applicant_id, experience_periods_with_relevance)


        # Calculate Overall Score with Weights
        overall_score = (
            education_score * float(job_data['educationWeight']) +
            skills_score * float(job_data['skillsWeight']) +
            timezone_score * float(job_data['timezoneWeight']) +
            experience_score * float(job_data['experienceWeight'])
        )

        api_client.update_applicant_scores(
            applicant_id,
            skills_score,
            experience_score,
            education_score,
            timezone_score,
            overall_score,
            total_experience_years,
        )

        # Set status to completed
        api_client.set_status(applicant_id, ApplicantStatus.COMPLETED)

        print({
            "applicant_id": applicant_id,
            "education_score": education_score,
            "skills_score": skills_score,
            "timezone_score": timezone_score,
            "experience_score": experience_score,
            "overall_score": overall_score
        })

    except Exception as e:
        print(f"Error scoring applicant {applicant_id}: {e}")
        api_client.set_status(applicant_id, ApplicantStatus.FAILED, f"Failed to score resume: {e}")