# CVRankify Monorepo

## Prerequisites

Ensure you have the following installed:
- Docker
- Bun
- Ollama

### System Dependencies (Linux/Debian)

You will need to install Tesseract OCR and Poppler utilities:

```bash
sudo apt install tesseract-ocr libtesseract-dev poppler-utils
```

## Configuration

Set the Ollama host environment variable:

```bash
export OLLAMA_HOST=http://hostname:11434
```

## Setup

1. Start the database and other services:
   ```bash
   docker compose up -d
   ```

2. Install dependencies and set up the environment/database:
   ```bash
   bun run setup
   ```

## Development

Start the development server:

```bash
bun run dev
```