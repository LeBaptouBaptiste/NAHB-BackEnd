# Backend Deployment Guide

## GitHub Actions CI/CD

The backend repository includes a GitHub Actions workflow that automatically:
- ✅ Builds the Node.js application
- ✅ Runs tests with MongoDB
- ✅ Creates Docker image
- ✅ Saves Docker image as artifact
- 🔄 Pushes to Docker Hub (when configured)
- 🔄 Deploys to server (when configured)

## Quick Start

### 1. Enable GitHub Actions
The workflow is already configured in `.github/workflows/ci-cd.yml`. It will run automatically when you push code.

### 2. View Build Status
Check the "Actions" tab in your GitHub repository to see workflow runs.

## Deployment Steps

### Step 1: Setup Docker Hub

1. **Create Docker Hub Account**: [hub.docker.com](https://hub.docker.com)

2. **Create Repository**: Create a new repository named `rpgbook-backend`

3. **Add GitHub Secrets**:
   - Go to: **Settings → Secrets → Actions**
   - Add:
     - `DOCKER_USERNAME` - Your Docker Hub username
     - `DOCKER_PASSWORD` - Docker Hub access token (not password)

4. **Uncomment `docker-push` job** in `.github/workflows/ci-cd.yml`

### Step 2: Deploy to Production

Choose one of these deployment options:

#### Option A: Docker on VPS/Server

1. **Prepare your server**:
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin
```

2. **Create docker-compose.yml on server**:
```yaml
version: '3.8'
services:
  backend:
    image: yourusername/rpgbook-backend:latest
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - OLLAMA_BASE_URL=http://ollama:11434
    restart: unless-stopped
  
  mongodb:
    image: mongo:7.0
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

3. **Create .env file**:
```env
MONGODB_URI=mongodb://mongodb:27017/rpgbook
JWT_SECRET=your-secure-secret-here
```

4. **Add deployment to workflow**:
   - Add server SSH secrets to GitHub:
     - `SERVER_HOST`
     - `SERVER_USER`
     - `SERVER_SSH_KEY`
   - Uncomment the `deploy` job in the workflow

5. **Deploy**:
```bash
docker-compose pull
docker-compose up -d
```

#### Option B: Cloud Platforms

**Google Cloud Run:**
```bash
gcloud run deploy rpgbook-backend \
  --image yourusername/rpgbook-backend:latest \
  --platform managed \
  --region us-central1
```

**AWS ECS/Fargate:**
- Use the Docker image: `yourusername/rpgbook-backend:latest`
- Configure task definition with environment variables
- Set up load balancer and auto-scaling

**Azure Container Instances:**
```bash
az container create \
  --resource-group myResourceGroup \
  --name rpgbook-backend \
  --image yourusername/rpgbook-backend:latest \
  --ports 3000
```

## Environment Variables

### Required Environment Variables
```env
MONGODB_URI=mongodb://your-mongodb-uri
JWT_SECRET=your-jwt-secret
PORT=3000
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama2
```

### Optional Environment Variables
```env
NODE_ENV=production
CORS_ORIGIN=https://yourfrontend.com
```

## Required GitHub Secrets

Add these in: **Settings → Secrets and variables → Actions**

**For Docker Hub:**
- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub access token

**For Server Deployment (SSH):**
- `SERVER_HOST` - Your server IP or hostname
- `SERVER_USER` - SSH username (e.g., ubuntu, root)
- `SERVER_SSH_KEY` - Private SSH key for authentication

**For Production Environment:**
- `PROD_MONGODB_URI` - Production MongoDB connection string
- `PROD_JWT_SECRET` - Production JWT secret

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Add IP whitelist (or allow all: 0.0.0.0/0)
4. Create database user
5. Get connection string
6. Add to environment variables

### Self-Hosted MongoDB

```bash
# Using Docker Compose (included in example above)
docker-compose up -d mongodb
```

## Testing the Workflow

1. Make a change and push to your repository:
```bash
git add .
git commit -m "Update backend"
git push
```

2. Go to the "Actions" tab
3. Watch the workflow run:
   - Build and test
   - Docker image creation
   - (Optional) Docker push
   - (Optional) Deployment

## Monitoring

### Check Application Logs
```bash
# Docker logs
docker-compose logs -f backend

# Or specific container
docker logs -f container_name
```

### Health Check
```bash
curl http://your-server:3000/health
```

## Troubleshooting

### Build Failures
- Check Actions tab for detailed logs
- Verify Node version (20.x)
- Ensure all dependencies are in package.json

### Docker Build Issues
- Check Dockerfile syntax
- Verify base image availability
- Check build context

### Deployment Issues
- Verify all secrets are set correctly
- Check SSH key permissions (should be 600)
- Ensure Docker is running on target server
- Check firewall rules (port 3000)

### Database Connection
- Verify MongoDB URI format
- Check MongoDB is running
- Verify network connectivity
- Check IP whitelist in MongoDB Atlas

## Manual Deployment

If you need to deploy manually:

```bash
# Build Docker image
docker build -t rpgbook-backend .

# Tag for Docker Hub
docker tag rpgbook-backend:latest yourusername/rpgbook-backend:latest

# Push to Docker Hub
docker push yourusername/rpgbook-backend:latest

# On your server
docker pull yourusername/rpgbook-backend:latest
docker-compose up -d
```

## Next Steps

1. ✅ Set up Docker Hub account
2. ✅ Add Docker Hub secrets to GitHub
3. ✅ Uncomment docker-push job
4. ✅ Set up production MongoDB
5. ✅ Configure deployment target
6. ✅ Test with a push to main
7. ✅ Monitor first deployment
8. ✅ Set up logging and monitoring
