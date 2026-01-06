import json

def scoring_worker(job):
    applicant_id = job.data.get("applicantId")
    applicant_data = job.data.get("applicantData")
    job_data = job.data.get("jobData")


    try:
        
        applicant_data = json.loads(applicant_data)
        job_data = json.loads(job_data)

        # Score Skills


        
        pass
    except Exception as e:
        raise ValueError(f"Failed to score applicant {applicant_id}: {str(e)}") from e


