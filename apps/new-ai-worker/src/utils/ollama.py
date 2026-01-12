from ollama import Client
import json


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
        ollama_client = Client()

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
        ollama_client = Client()
        
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