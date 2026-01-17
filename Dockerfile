# Stage 1: Build the Node.js app
FROM node:25-alpine AS build-stage

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY client/. ./

# Build the app (for example, a React app or any other frontend)
RUN npm run build

# Stage 2: Set up the FastAPI app
FROM ghcr.io/astral-sh/uv:alpine AS final-stage

# Set working directory for the FastAPI app
WORKDIR /app

COPY server/pyproject.toml server/uv.lock .

# Install dependencies
RUN uv sync

# Copy the FastAPI app files
COPY server/. ./

# Copy built assets from the first stage to the final image
COPY --from=build-stage /app/dist /app/dist

# Expose port 10000 for FastAPI
EXPOSE 10000

# Run FastAPI using Uvicorn
CMD ["uv", "run", "fastapi", "run", "app/main.py", "--host", "0.0.0.0"]
