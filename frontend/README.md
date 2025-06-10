# RAG Notebook Frontend

The frontend application for the RAG Notebook system, built with React and TypeScript.

## Development Setup

To run the application in development mode:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

This will start the development server at `http://localhost:5173`.

## Building for Production

To build the application for production:

```bash
npm run build
```

This generates static files in the `dist` directory.

## Docker Build

To build the Docker image:

```bash
docker build -t username/rag-notebook-frontend:latest .
```

Replace `username` with your Docker registry username.

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```
VITE_API_URL=http://your-backend-api-url
```

For local development, you can use:

```
VITE_API_URL=http://localhost:3000
```

## Deployment

The frontend application is designed to be deployed as a Docker container alongside the backend service using Docker Compose. See the main project README for complete deployment instructions.

## Features

- Document management
- Chat interface with AI
- Vector search functionality
- Document notes and summaries
- Authentication and user management

## Architecture

The frontend application follows a component-based architecture using React and TypeScript. Key technologies used:

- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Router
- Tanstack Query
- Sonner toast notifications
