# New AI Worker

## Development

### Hot Reload (Development Mode)

The worker includes a hot reload development server that automatically restarts when you make changes to Python files:

```bash
npm run dev
```

This will:
- Start the worker process
- Watch for changes to `.py` files in the project
- Automatically restart the worker when changes are detected
- Display clear console output for debugging

### Production Mode

To run the worker without hot reload (for production):

```bash
npm run start
```

## Testing

Run pytest for tests:

```bash
env/bin/pytest
```


```

## To create the finetuned models, run:
ollama create edu-timezone-extractor -f modelfiles/edu_timezone_extractor/Modelfile
ollama create experience-extractor -f modelfiles/experience_extractor/Modelfile
ollama create skills-extractor -f modelfiles/skills_extractor/Modelfile

ollama create edu-match -f modelfiles/edu_match/Modelfile
ollama create skills_score -f modelfiles/skills_score/Modelfile
ollama create exp_relevance_eval -f modelfiles/exp_relevance_eval/Modelfile
ollama create json_fixer -f modelfiles/json_fixer/Modelfile