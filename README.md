# RAG Notebook

RAG Notebook is a full-stack application for document management and AI-powered retrieval augmented generation. The system allows users to upload documents, chat with AI about their content, generate summaries, study notes, and more.

![RAG Notebook Screenshot](screenshot.png)

## System Architecture

The application is built with a modern tech stack:

### Backend
- Node.js with Express (TypeScript)
- PostgreSQL database with Prisma ORM
- OpenAI API integration
- Pinecone vector database for document embeddings

### Frontend
- React with TypeScript
- Tailwind CSS with Shadcn UI components
- React Router for navigation
- Tanstack Query for data fetching

## Features

- **Document Management**: Upload, organize, and manage documents
- **AI Chat**: Interact with your documents through a chat interface
- **Vector Search**: Find relevant information across your document library
- **Document Notes**: Auto-generate summaries and study notes
- **User Management**: Multi-user support with authentication

## Project Structure

```
rag-notebook/
├── backend/           # Express backend API
│   ├── prisma/        # Database schema and migrations
│   ├── src/           # Source code
│   ├── Dockerfile     # Production Docker configuration
│   └── README.md      # Backend-specific documentation
│
├── frontend/          # React frontend application
│   ├── src/           # Source code
│   ├── Dockerfile     # Production Docker configuration
│   └── README.md      # Frontend-specific documentation
│
└── README.md          # This file
```

## Development Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- OpenAI API key
- Pinecone account and API key

### Backend Setup

```bash
cd backend
cp .env.example .env  # Configure your environment variables
npm install
npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Deployment

For production deployment, see the detailed instructions in the backend and frontend README files.

## License

MIT
