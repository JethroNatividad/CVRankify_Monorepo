from unstructured.partition.pdf import partition_pdf
from io import BytesIO

def extract_pdf_text(path):
    """
    Extract text from a PDF file located at the given path or from bytes.
    """
    try:
        # If path is bytes, wrap it in BytesIO to create a file-like object
        if isinstance(path, bytes):
            file_obj = BytesIO(path)
            elements = partition_pdf(
                file=file_obj, strategy="hi_res", infer_table_structure=True
            )
        else:
            # Otherwise treat it as a file path
            elements = partition_pdf(
                filename=path, strategy="hi_res", infer_table_structure=True
            )
        text = "\n".join([el.text for el in elements if el.text])

    except Exception as e:
        print(f"Error during PDF partitioning: {e}")
        text = ""

    return text.strip()