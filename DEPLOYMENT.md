# Deployment Guide

This guide covers various deployment options for the Contentful Express Renderer, from simple cloud platforms to enterprise solutions.

## 🚀 Quick Deployment Options

### 1. Vercel (Recommended for Simplicity)

**Pros:** Zero-config, automatic scaling, generous free tier, excellent performance
**Cons:** Serverless limitations (10s timeout), cold starts

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add CONTENTFUL_SPACE_ID
vercel env add CONTENTFUL_ACCESS_TOKEN
vercel env add CONTENTFUL_PREVIEW_ACCESS_TOKEN
vercel env add CONTENTFUL_ENVIRONMENT
```

**Required file: `vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

### 2. Railway (Recommended for Express Apps)

**Pros:** Great for Node.js, persistent storage, databases, reasonable pricing
**Cons:** Smaller community, newer platform

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables in Railway dashboard
```

### 3. Render

**Pros:** Free tier with persistent storage, automatic SSL, easy scaling
**Cons:** Cold starts on free tier, slower than premium options

1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in dashboard

## 🏢 Production-Ready Options

### 4. DigitalOcean App Platform

**Pros:** Predictable pricing, good performance, managed infrastructure
**Cons:** Limited free tier

```yaml
# .do/app.yaml
name: contentful-renderer
services:
- name: web
  source_dir: /
  github:
    repo: your-username/your-repo
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: CONTENTFUL_SPACE_ID
    scope: RUN_TIME
  - key: CONTENTFUL_ACCESS_TOKEN
    scope: RUN_TIME
```

### 5. AWS (Elastic Beanstalk or ECS)

**Pros:** Highly scalable, enterprise-grade, extensive AWS ecosystem
**Cons:** Complex setup, higher learning curve

#### Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize and deploy
eb init
eb create
eb deploy
```

#### ECS with Docker
**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

### 6. Google Cloud Platform (Cloud Run)

**Pros:** Pay-per-use, automatic scaling, excellent cold start performance
**Cons:** Can be complex for beginners

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/contentful-renderer
gcloud run deploy --image gcr.io/PROJECT-ID/contentful-renderer --platform managed
```

## 🐳 Docker Deployment

### Docker Setup
```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create output directory
RUN mkdir -p output

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - CONTENTFUL_SPACE_ID=${CONTENTFUL_SPACE_ID}
      - CONTENTFUL_ACCESS_TOKEN=${CONTENTFUL_ACCESS_TOKEN}
      - CONTENTFUL_PREVIEW_ACCESS_TOKEN=${CONTENTFUL_PREVIEW_ACCESS_TOKEN}
      - CONTENTFUL_ENVIRONMENT=${CONTENTFUL_ENVIRONMENT}
      - PORT=3000
    volumes:
      - ./output:/app/output
    restart: unless-stopped
```

## ⚙️ Production Configuration

### Environment Variables for Production
```bash
# Required
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
CONTENTFUL_ENVIRONMENT=master

# Optional but recommended
NODE_ENV=production
PORT=3000
CONTENTFUL_PREVIEW_ACCESS_TOKEN=your_preview_token

# For monitoring (optional)
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn
```

### Production Optimizations

#### 1. Add Process Manager (PM2)
```bash
npm install -g pm2

# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'contentful-renderer',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}

# Start with PM2
pm2 start ecosystem.config.js --env production
```

#### 2. Add Logging
```bash
npm install winston morgan

# Add to server.js
const winston = require('winston');
const morgan = require('morgan');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use(morgan('combined'));
```

#### 3. Add Caching
```bash
npm install node-cache

# Add to server.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Cache Contentful responses
async function getCachedEntry(entryId) {
  const cacheKey = `entry-${entryId}`;
  let entry = cache.get(cacheKey);
  
  if (!entry) {
    entry = await contentfulClient.getEntry(entryId);
    cache.set(cacheKey, entry);
  }
  
  return entry;
}
```

## 🔒 Security for Production

### 1. Environment Security
- Use secrets management (AWS Secrets Manager, Azure Key Vault)
- Never commit `.env` files
- Rotate access tokens regularly

### 2. Application Security
```bash
npm install helmet express-rate-limit cors

# Add to server.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000'
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

## 📊 Monitoring & Analytics

### 1. Health Checks
```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### 2. Error Tracking (Sentry)
```bash
npm install @sentry/node

# Add to server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

## 💰 Cost Comparison

| Platform | Free Tier | Paid Plans Start | Best For |
|----------|-----------|------------------|----------|
| Vercel | 100GB bandwidth | $20/month | Static sites, serverless |
| Railway | $5 credit | $5/month | Full-stack apps |
| Render | 750 hours | $7/month | Simple deployments |
| DigitalOcean | $100 credit | $5/month | Predictable costs |
| AWS EB | 750 hours | ~$10/month | Enterprise scaling |
| Google Cloud Run | 2M requests | Pay-per-use | Variable traffic |

## 🎯 Recommendations by Use Case

### Small Project / Testing
- **Vercel** or **Railway** for simplicity
- Free tiers available
- Easy setup and deployment

### Medium Project / Production
- **Render** or **DigitalOcean App Platform**
- Better performance than free tiers
- Managed infrastructure

### Enterprise / High Traffic
- **AWS ECS/EKS** or **Google Cloud Run**
- Custom Docker deployments
- Full control over infrastructure
- Advanced monitoring and scaling

### Self-Hosted
- **DigitalOcean Droplet** with Docker
- **Linode** or **Vultr** VPS
- Full control, lower costs for consistent traffic

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Health check endpoint added
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Monitoring/alerting set up
- [ ] Backup strategy defined
- [ ] SSL certificate configured
- [ ] Domain name configured
- [ ] Performance testing completed
- [ ] Load testing completed