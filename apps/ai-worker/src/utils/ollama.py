from ollama import Client
import json
import os


# Singleton Ollama client instance
_ollama_client = None

def get_ollama_client():
    """Get or create the singleton Ollama client instance."""
    global _ollama_client
    if _ollama_client is None:
        host = os.getenv("OLLAMA_HOST")
        _ollama_client = Client(host=host)
    return _ollama_client


def clean_response(response: str) -> str:
    response = response.split("</think>")[-1]
    # if response has ```json ... ```
    if response.startswith("```json"):
        response = response[len("```json") :]

    if response.startswith("```"):
        response = response[len("```") :]

    if response.endswith("```"):
        response = response[: -len("```")]
    return response.strip()


def query_ollama_model(model: str, content: str, think: bool = False, json_output: bool = True) -> dict:
    """
    Query an Ollama model and return cleaned JSON response.
    
    Args:
        model: The Ollama model name
        content: The content to send to the model
        think: Whether to enable thinking mode
        
    Returns:
        dict: Parsed JSON response
        
    Raises:
        ValueError: If JSON parsing fails
        RuntimeError: If model query fails
    """
    try:
        ollama_client = get_ollama_client()

        response = ollama_client.chat(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": content,
                },
            ],
            think=think,
        )
        
        cleaned_response = clean_response(response["message"]["content"])
        if json_output:
            return json.loads(cleaned_response)
        else:
            return cleaned_response
        
    except json.JSONDecodeError as e:
        error_msg = f"Failed to parse JSON from model '{model}': {str(e)}"
        raise ValueError(error_msg) from e
        
    except Exception as e:
        error_msg = f"Failed to query model '{model}': {str(e)}"
        raise RuntimeError(error_msg) from e


def preload_models():
    """
    Preload all Ollama models used by the application.
    This keeps models in memory and avoids reload delays on first use.
    """
    models_to_preload = [
        "edu-timezone-extractor:latest",
        "skills-extractor:latest", 
        "experience-extractor:latest",
        "edu-match:latest",
        "skills_score:latest",
        "exp_relevance_eval:latest"
    ]
    
    print("Preloading Ollama models...")
    ollama_client = get_ollama_client()
    
    # Simple test prompt to warm up each model
    test_prompt = "test"
    
    for model in models_to_preload:
        try:
            print(f"  Loading {model}...")
            # Make a simple call to load the model into memory
            ollama_client.chat(
                model=model,
                messages=[{"role": "user", "content": test_prompt}],
                think=False
            )
            print(f"  ✓ {model} loaded")
        except Exception as e:
            print(f"  ✗ Failed to load {model}: {str(e)}")
    
    print("Model preloading complete!\n")


def stream_ollama_model(model: str, content: str, think: bool = False):
    """
    Stream an Ollama model response in real-time.
    
    Args:
        model: The Ollama model name
        content: The content to send to the model
        think: Whether to enable thinking mode
        
    Yields:
        str: Chunks of the response as they arrive
    """
    try:
        ollama_client = get_ollama_client()
        
        for chunk in ollama_client.chat(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": content,
                },
            ],
            think=think,
            stream=True,
        ):
            if chunk.get("message", {}).get("content"):
                yield chunk["message"]["content"]
                
    except Exception as e:
        error_msg = f"Failed to stream model '{model}': {str(e)}"
        raise RuntimeError(error_msg) from e
    

# FOR TESTING PURPOSES ONLY
# print("🎤 Listening to AI...\n")

# for chunk in stream_ollama_model(
#     model="skills-extractor:latest",
#     content=resume_text,
#     think=False
# ):
#     print(chunk, end="", flush=True)

# print("\n\n✅ Done!")