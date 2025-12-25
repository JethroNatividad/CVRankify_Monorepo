import os
from src.services.resume_extraction import extract_pdf_text
import time

# Test for pdf file
def test_extract_pdf_text_from_file():
    test_pdf_path = os.path.join(os.path.dirname(__file__), "pdf", "Test2.pdf")
    # calculate time taken to extract text

    start_time = time.time()
    extracted_text = extract_pdf_text(test_pdf_path)
    end_time = time.time()
    time_taken = end_time - start_time
    print(f"Time taken to extract text: {time_taken} seconds")
    print("Extracted Text from File:")
    print(extracted_text)

# Test for bytes input

test_extract_pdf_text_from_file()