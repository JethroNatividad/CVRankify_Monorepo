from dotenv import load_dotenv

load_dotenv()

_minio_client = None

def get_minio_client():
    from minio import Minio
    import os
    
    global _minio_client
    if _minio_client is None:
        _minio_client = Minio(
            os.getenv("MINIO_ENDPOINT") + ":" + os.getenv("MINIO_PORT"),
            access_key=os.getenv("MINIO_ACCESS_KEY"),
            secret_key=os.getenv("MINIO_SECRET_KEY"),
            secure=False,  # Use True for HTTPS, False for HTTP
        )
    return _minio_client