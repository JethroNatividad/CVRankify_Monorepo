import pypdfium2 as pdfium
from io import BytesIO

def extract_pdf_text(path):
    """
    Extract text from a PDF file located at the given path or from bytes.
    """
    try:
        # If path is bytes, wrap it in BytesIO to create a file-like object
        if isinstance(path, bytes):
            file_obj = BytesIO(path)
            
        else:
            file_obj = open(path, "rb")
            
        pdf = pdfium.PdfDocument(file_obj)
        num_pages = len(pdf)
        text = ""
        for page_number in range(num_pages):
            page = pdf.get_page(page_number)
            text += page.get_textpage().get_text_range()
            text += "\n"
        pdf.close()

    except Exception as e:
        print(f"Error during PDF partitioning: {e}")
        text = ""

    return text.strip()