# Docker Integration Plan

This plan guides you through "containerizing" your application. Think of Docker as a way to package your app with everything it needs (Node.js, Redis, environment variables) so it works exactly the same on your machine, a coworker's machine, or a server.

## 1. Key Concepts (The "Why")

- **Image**: A snapshot of your application (like a recipe). It contains your code and Node.js.
- **Container**: A running instance of an image (like the cake made from the recipe).
- **Dockerfile**: The instructions to build the Image.
- **Docker Compose**: A tool to run multiple containers (App + Redis) together and connect them.

## 2. Proposed Files

### [NEW] [Dockerfile](file:///Dockerfile)
Your recipe for the Express App.

```dockerfile
# Start with a lightweight Node.js operating system
FROM node:20-alpine

# Create a folder inside the container for your app
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of your code
COPY . .

# Build the TypeScript code
RUN npm run build

# Open the port your app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
```

### [NEW] [.dockerignore](file:///.dockerignore)
Tells Docker what **NOT** to copy into the container (keeps it small and fast).

```text
node_modules
dist
.git
.env
```

### [NEW] [docker-compose.yml](file:///docker-compose.yml)
The manager that runs everything together.

**Crucial Feature**: We strictly configure Redis with `noeviction` as requested.

```yaml
services:
  # Your Express API
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379 
      # We reference the service name 'redis' above
    depends_on:
      - redis
    # Mount current directory to /app in container for hot-reloading (optional for dev)
    volumes:
      - .:/app
      - /app/node_modules

  # Redis Database
  redis:
    image: redis:alpine
    # IMPORTANT: Enforce noeviction policy
    command: redis-server --maxmemory-policy noeviction
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

## 3. How to Use It

1.  **Start everything**:
    ```bash
    docker-compose up --build
    ```
2.  **Stop everything**:
    ```bash
    docker-compose down
    ```

## 4. Verification

We will verify by:
1.  Running `docker-compose up`.
2.  Checking logs to see Redis starting with the correct config.
3.  Adding a job to the queue and ensuring it persists.
