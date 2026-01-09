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

