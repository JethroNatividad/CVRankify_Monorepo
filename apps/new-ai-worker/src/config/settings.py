from dotenv import load_dotenv
import os
load_dotenv()


class Settings:
    def __init__(self):
        self.minio_endpoint: str = self._get_required_env("MINIO_ENDPOINT")
        self.minio_port: int = int(self._get_required_env("MINIO_PORT"))
        self.minio_access_key: str = self._get_required_env("MINIO_ACCESS_KEY")
        self.minio_secret_key: str = self._get_required_env("MINIO_SECRET_KEY")
        self.minio_bucket_name: str = self._get_required_env("MINIO_BUCKET_NAME")
        
        self.redis_host: str = self._get_required_env("REDIS_HOST")
        self.redis_port: int = int(self._get_required_env("REDIS_PORT"))
        self.redis_queue_name: str = self._get_required_env("REDIS_QUEUE_NAME")
        
        self.ai_service_api_key: str = self._get_required_env("AI_SERVICE_API_KEY")
    
    def _get_required_env(self, key: str) -> str:
        value = os.getenv(key)
        if value is None:
            raise ValueError(f"Required environment variable '{key}' is not set")
        return value

def get_settings() -> Settings:
    return Settings()