from src.storage.minio_client import get_minio_object
from src.services.resume_extraction import extract_pdf_text
from src.services.resume_parser import parse_resume_text
from src.services.api_client import APIClient
from src.config.constants import ApplicantStatus


def extraction_worker(job):
    api_client = APIClient()
    applicant_id = job.data.get("applicantId")
    resume_path = job.data.get("resumePath")

    try:

        pdf_data = get_minio_object(resume_path)
        if pdf_data is None:
            raise ValueError(f"Failed to retrieve object {resume_path} from MinIO.")
        
        extracted_text = extract_pdf_text(pdf_data)
        # Set status to parsing
        api_client.set_status(applicant_id, ApplicantStatus.PARSING)

        parsed_resume = parse_resume_text(extracted_text)

        # Set status to processing
        api_client.set_status(applicant_id, ApplicantStatus.PROCESSING)

        # Update parsed data via API
        api_client.update_parsed_data(applicant_id, parsed_resume)

        # Queue for scoring
        api_client.queue_score_resume(applicant_id)

    except Exception as e:
        # Set status to failed
        api_client.set_status(applicant_id, ApplicantStatus.FAILED)

        # TODO: add description on database for failure reason
        
        print(f"Error processing applicant {applicant_id}: {e}")