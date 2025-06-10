# RAG Notebook Deployment Guide

This document outlines the steps to deploy the RAG Notebook application to a production environment.

## Prerequisites

- Docker and Docker Compose installed on your server
- Git
- Basic understanding of terminal commands

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/rag-notebook.git
cd rag-notebook/backend
```

### 2. Configure Environment Variables

Create your environment variables file:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual credentials:
- `DB_PASSWORD`: Strong password for your PostgreSQL database
- `JWT_SECRET`: Secret key for JWT token generation
- `OPENAI_API_KEY`: Your OpenAI API key
- `PINECONE_API_KEY`: Your Pinecone API key
- `PINECONE_INDEX_NAME`: Your Pinecone index name

### 3. Run the Deployment Script

Make the script executable and run it:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Check for the presence of a valid `.env` file
- Pull the latest Docker images
- Stop any existing deployment
- Start the new deployment
- Verify the status of all services

### 4. Access the Application

Once deployed, you can access:
- Frontend: http://your-server-ip
- Backend API: http://your-server-ip:3000

## Troubleshooting

### Checking Logs

To check logs for any of the services:

```bash
docker logs rag-notebook-backend
docker logs rag-notebook-frontend
docker logs rag-notebook-db
```

### Restarting Services

If you need to restart a service:

```bash
docker-compose -f docker-compose.prod.yaml restart backend
```

### Updating the Application

To update to the latest version:

```bash
git pull
./deploy.sh
```

## Backup and Restore

### Database Backup

```bash
docker exec rag-notebook-db pg_dump -U postgres rag_notebook > backup_$(date +%Y%m%d).sql
```

### Database Restore

```bash
cat backup_file.sql | docker exec -i rag-notebook-db psql -U postgres rag_notebook
``` 