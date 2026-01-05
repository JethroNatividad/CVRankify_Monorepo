from bullmq import Worker
import asyncio
import signal
from src.config.settings import get_settings

async def process(job, job_token):
    """Route jobs to appropriate handlers based on job name"""
    print(f"Processing job: {job.name} (ID: {job.id})")
    
    if job.name == "process-resume":
        # await asyncio.to_thread(handle_process_resume, job)
        return "ok"
    
    if job.name == "score-applicant":
        # await asyncio.to_thread(handle_score_applicant, job)
        return "ok"
    
    print(f"Unknown job type: {job.name}")
    return None

async def main():
    
    print("Starting worker...")
    
    # Load settings
    settings = get_settings()
    redis_url = f"redis://{settings.redis_host}:{settings.redis_port}"
    
    # Create an event that will be triggered for shutdown
    shutdown_event = asyncio.Event()

    def signal_handler(signal, frame):
        print("Signal received, shutting down.")
        shutdown_event.set()

    # Assign signal handlers to SIGTERM and SIGINT
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

    worker = Worker(
        settings.redis_queue_name,
        process,
        {"connection": redis_url},
    )

    print("Worker started successfully.")
    print(f"Listening for jobs on queue: {settings.redis_queue_name}")
    print(f"Connected to Redis at: {redis_url}")
    
    # Wait until the shutdown event is set
    await shutdown_event.wait()

    # close the worker
    print("Cleaning up worker...")
    await worker.close()
    print("Worker shut down successfully.")


if __name__ == "__main__":
    asyncio.run(main())