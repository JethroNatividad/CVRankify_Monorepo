from minio import Minio

from src.config.settings import get_settings


_minio_client = None
settings = get_settings()
bucket_name = settings.minio_bucket_name

def get_minio_client():
    
    global _minio_client
    if _minio_client is None:
        _minio_client = Minio(
            settings.minio_endpoint + ":" + str(settings.minio_port),
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
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