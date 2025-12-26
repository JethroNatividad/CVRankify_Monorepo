import os
from src.services.resume_extraction import extract_pdf_text
import time
from src.storage.minio_client import get_minio_object

# Test for pdf file
def test_extract_pdf_text_from_file():
    test_pdf_path = os.path.join(os.path.dirname(__file__), "pdf", "Applicant_1_Resume.pdf")
    # calculate time taken to extract text

    start_time = time.time()
    extracted_text = extract_pdf_text(test_pdf_path)
    end_time = time.time()
    time_taken = end_time - start_time
    print(f"Time taken to extract text: {time_taken} seconds")
    print("Extracted Text from File:")
    print(extracted_text)

test_extract_pdf_text_from_file()

# Test for pdf coming from minio

def test_extract_pdf_text_from_minio():
    object_name = "resumes/2025/taatat-1766095591385.pdf"
    pdf_data = get_minio_object(object_name)
    if pdf_data is None:
        print(f"Failed to retrieve object {object_name} from MinIO.")
        return

    # calculate time taken to extract text
    start_time = time.time()
    extracted_text = extract_pdf_text(pdf_data)
    end_time = time.time()
    time_taken = end_time - start_time
    print(f"Time taken to extract text from MinIO object: {time_taken} seconds")
    print("Extracted Text from MinIO Object:")
    print(extracted_text)

# test_extract_pdf_text_from_minio()