import json
from src.services.resume_scoring import score_education_match, score_skills_match, score_timezone_match, score_experience_match

def scoring_worker(job):
    applicant_id = job.data.get("applicantId")
    applicant_data = job.data.get("applicantData")
    job_data = job.data.get("jobData")

    try:
        
        applicant_data = json.loads(applicant_data)
        job_data = json.loads(job_data)

        # Score Education
        education_score = score_education_match(
            applicant_highest_degree=applicant_data['parsedHighestEducationDegree'],
            applicant_education_field=applicant_data['parsedEducationField'],
            job_required_degree=job_data['educationDegree'],
            job_education_field=job_data['educationField']
        )

        # Score Skills

        applicant_skills = [skill.strip() for skill in applicant_data['parsedSkills'].split(",")]
        job_skills = job_data['skills']

        skills_result =  score_skills_match(job_skills, applicant_skills)

        skills_score = skills_result['score']
        scored_skills = skills_result['scored_skills']

        # TODO: Update skills with scored_skills


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

        # TODO: Update database score experience_result['experience_periods_with_relevance']


        # Calculate Overall Score with Weights
        overall_score = (
            education_score * float(job_data['educationWeight']) +
            skills_score * float(job_data['skillsWeight']) +
            timezone_score * float(job_data['timezoneWeight']) +
            experience_score * float(job_data['experienceWeight'])
        )

        # TODO: Update applicant record with all scores

        # update_applicant_scores(
        #     applicant_id,
        #     skills_score,
        #     experience_score,
        #     education_score,
        #     timezone_score,
        #     overall_score,
        #     total_years_with_months,
        # )

        print({
            "applicant_id": applicant_id,
            "education_score": education_score,
            "skills_score": skills_score,
            "timezone_score": timezone_score,
            "experience_score": experience_score,
            "overall_score": overall_score
        })
    except Exception as e:
        # TODO: Handle failure, e.g., log error, update applicant status
        raise ValueError(f"Failed to score applicant {applicant_id}: {str(e)}") from e