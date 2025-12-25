from dotenv import load_dotenv
import os
from minio import Minio

load_dotenv()

_minio_client = None
bucket_name = os.getenv("MINIO_BUCKET_NAME")

def get_minio_client():
    
    global _minio_client
    if _minio_client is None:
        _minio_client = Minio(
            os.getenv("MINIO_ENDPOINT") + ":" + os.getenv("MINIO_PORT"),
            access_key=os.getenv("MINIO_ACCESS_KEY"),
            secret_key=os.getenv("MINIO_SECRET_KEY"),
            secure=False,  # Use True for HTTPS, False for HTTP
        )
    return _minio_client

def get_minio_object(object_name):
    """
    Retrieve an object from MinIO storage.
    """
    client = get_minio_client()
    try:
        response = client.get_object(bucket_name, object_name)
        data = response.read()
        response.close()
        response.release_conn()
        return data
    except Exception as e:
        print(f"Error retrieving object {object_name} from bucket {bucket_name}: {e}")
        return None