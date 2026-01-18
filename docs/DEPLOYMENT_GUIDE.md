# Deployment Guide

## CodeReview AI - Installation & Deployment

This guide covers all deployment options for CodeReview AI.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development](#2-local-development)
3. [Docker Deployment](#3-docker-deployment)
4. [Render Deployment](#4-render-deployment)
5. [Manual Deployment](#5-manual-deployment)
6. [Database Setup](#6-database-setup)
7. [SSL/TLS Configuration](#7-ssltls-configuration)
8. [Scaling](#8-scaling)
9. [Monitoring](#9-monitoring)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

### 1.1 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 20 GB | 50+ GB SSD |
| Node.js | 20.x | 20.x LTS |
| PostgreSQL | 15.x | 15.x |
| Redis | 7.x | 7.x |

### 1.2 Required Accounts

- **Git Platform**: GitHub, GitLab, Bitbucket, or Azure DevOps account
- **AI Provider**: At least one of:
  - OpenAI API key
  - Anthropic API key
  - Google AI API key

### 1.3 Domain & DNS (Production)

- A domain name pointing to your server
- SSL certificate (Let's Encrypt recommended)

---

## 2. Local Development

### 2.1 Clone Repository

```bash
git clone https://github.com/yourusername/codereview-ai.git
cd codereview-ai
```

### 2.2 Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

### 2.3 Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2.4 Access Services

| Service | URL | Description |
|---------|-----|-------------|
| Client | http://localhost:3000 | Frontend application |
| Server (Strapi) | http://localhost:1337 | CMS admin panel |
| Microservice | http://localhost:4000 | API endpoints |

### 2.5 Initial Strapi Setup

1. Open http://localhost:1337/admin
2. Create your admin account
3. Configure content types permissions
4. Generate API token for microservice

---

## 3. Docker Deployment

### 3.1 Production Docker Compose

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

### 3.2 Environment Variables (Production)

Create `.env` with production values:

```bash
# Database
POSTGRES_USER=codereview
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=codereview

# Redis
REDIS_PASSWORD=<strong-password>

# Strapi
APP_KEYS=<generated-keys>
API_TOKEN_SALT=<generated-salt>
ADMIN_JWT_SECRET=<generated-secret>
TRANSFER_TOKEN_SALT=<generated-salt>
JWT_SECRET=<generated-secret>

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# GitHub Integration
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
GITHUB_WEBHOOK_SECRET=<webhook-secret>

# Public URLs
PUBLIC_STRAPI_URL=https://api.yourdomain.com
PUBLIC_MICROSERVICE_URL=https://engine.yourdomain.com
PUBLIC_CLIENT_URL=https://yourdomain.com
```

### 3.3 Generate Secrets

```bash
# Generate random keys
openssl rand -base64 32  # For each secret/salt
openssl rand -hex 32     # Alternative format
```

### 3.4 Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream client {
        server client:3000;
    }

    upstream server {
        server server:1337;
    }

    upstream microservice {
        server microservice:4000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com api.yourdomain.com engine.yourdomain.com;
        return 301 https://$host$request_uri;
    }

    # Client
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        location / {
            proxy_pass http://client;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Strapi API
    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        client_max_body_size 50M;

        location / {
            proxy_pass http://server;
            proxy_http_version 1.1;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Host $host;
        }
    }

    # Microservice API
    server {
        listen 443 ssl http2;
        server_name engine.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        location / {
            proxy_pass http://microservice;
            proxy_http_version 1.1;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Host $host;
        }
    }
}
```

### 3.5 SSL Certificates

Using Let's Encrypt:

```bash
# Install certbot
apt-get install certbot

# Generate certificates
certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com -d engine.yourdomain.com

# Copy to nginx directory
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
```

### 3.6 Start Production Stack

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 4. Render Deployment

### 4.1 Prerequisites

- Render account (https://render.com)
- GitHub repository connected to Render

### 4.2 Deploy Using Blueprint

1. Fork/push repository to GitHub
2. In Render Dashboard, click "New" → "Blueprint"
3. Connect your repository
4. Select the repository containing `render.yaml`
5. Click "Apply"

### 4.3 Configure Environment Variables

After deployment, configure these in Render Dashboard:

**codereview-server:**
- `STRAPI_API_TOKEN` - Generate in Strapi admin

**codereview-microservice:**
- `STRAPI_API_TOKEN` - Same as above
- `OPENAI_API_KEY` - Your OpenAI key
- `ANTHROPIC_API_KEY` - Your Anthropic key
- `GITHUB_APP_ID` - Your GitHub App ID
- `GITHUB_APP_PRIVATE_KEY` - GitHub App private key
- `GITHUB_WEBHOOK_SECRET` - Webhook secret

### 4.4 Custom Domains

1. Go to each service in Render
2. Settings → Custom Domains
3. Add your domain
4. Configure DNS records as shown

### 4.5 Verify Deployment

```bash
# Check health endpoints
curl https://your-client.onrender.com/api/health
curl https://your-server.onrender.com/_health
curl https://your-microservice.onrender.com/api/v1/health
```

---

## 5. Manual Deployment

### 5.1 Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install nginx
sudo apt install -y nginx
```

### 5.2 Clone and Build

```bash
# Clone repository
git clone https://github.com/yourusername/codereview-ai.git
cd codereview-ai

# Install dependencies
npm install

# Build each service
cd Client && npm install && npm run build && cd ..
cd Server && npm install && npm run build && cd ..
cd Microservice && npm install && npm run build && cd ..
```

### 5.3 PM2 Process Manager

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'codereview-client',
      cwd: './Client',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'codereview-server',
      cwd: './Server',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 1337
      }
    },
    {
      name: 'codereview-microservice',
      cwd: './Microservice',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
EOF

# Start all services
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

---

## 6. Database Setup

### 6.1 Create Database

```sql
-- Connect to PostgreSQL
sudo -u postgres psql

-- Create user
CREATE USER codereview WITH PASSWORD 'your_password';

-- Create database
CREATE DATABASE codereview OWNER codereview;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE codereview TO codereview;

-- Exit
\q
```

### 6.2 Run Migrations

Strapi handles migrations automatically on first start.

### 6.3 Backup Database

```bash
# Create backup
pg_dump -U codereview -h localhost codereview > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U codereview -h localhost codereview < backup_20260115.sql
```

### 6.4 Automated Backups

```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/var/backups/codereview
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U codereview codereview | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-db.sh" | crontab -
```

---

## 7. SSL/TLS Configuration

### 7.1 Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com -d engine.yourdomain.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

### 7.2 Strong SSL Configuration

Add to nginx server blocks:

```nginx
# SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;

# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
```

---

## 8. Scaling

### 8.1 Horizontal Scaling

#### Client (Next.js)
```yaml
# docker-compose.prod.yml
client:
  deploy:
    replicas: 3
```

#### Microservice
```yaml
microservice:
  deploy:
    replicas: 3
```

### 8.2 Load Balancing

```nginx
upstream client {
    least_conn;
    server client1:3000;
    server client2:3000;
    server client3:3000;
}
```

### 8.3 Redis Cluster

For high availability:

```yaml
redis:
  image: redis:7-alpine
  command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000
```

### 8.4 Database Read Replicas

```bash
# On primary
postgresql.conf:
  wal_level = replica
  max_wal_senders = 3

# On replica
primary_conninfo = 'host=primary port=5432 user=replicator password=...'
```

---

## 9. Monitoring

### 9.1 Health Checks

```bash
# Client
curl http://localhost:3000/api/health

# Server
curl http://localhost:1337/_health

# Microservice
curl http://localhost:4000/api/v1/health
```

### 9.2 Log Management

```bash
# View Docker logs
docker-compose logs -f --tail=100

# View PM2 logs
pm2 logs

# Centralized logging with Loki
docker run -d --name loki grafana/loki:latest
```

### 9.3 Metrics

Add Prometheus metrics endpoint to microservice:

```typescript
import { collectDefaultMetrics, Registry } from 'prom-client';

const register = new Registry();
collectDefaultMetrics({ register });

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### 9.4 Alerting

Example with webhook:

```bash
# Check service health every minute
*/1 * * * * curl -sf http://localhost:4000/api/v1/health || curl -X POST https://hooks.slack.com/... -d '{"text":"Microservice is down!"}'
```

---

## 10. Troubleshooting

### 10.1 Common Issues

#### Services won't start

```bash
# Check logs
docker-compose logs <service-name>

# Check port conflicts
netstat -tulpn | grep -E '(3000|1337|4000|5432|6379)'

# Restart services
docker-compose restart
```

#### Database connection failed

```bash
# Check PostgreSQL is running
systemctl status postgresql

# Test connection
psql -U codereview -h localhost -d codereview

# Check pg_hba.conf for local connections
```

#### Redis connection failed

```bash
# Check Redis is running
redis-cli ping

# Check Redis auth
redis-cli -a <password> ping
```

#### Webhook not received

1. Verify webhook URL is publicly accessible
2. Check webhook secret matches
3. Review microservice logs for signature validation errors
4. Ensure firewall allows incoming connections

### 10.2 Performance Issues

```bash
# Check resource usage
docker stats

# Check slow queries
psql -U codereview -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Check Redis memory
redis-cli INFO memory
```

### 10.3 Getting Help

- Check logs: `docker-compose logs -f`
- GitHub Issues: https://github.com/yourusername/codereview-ai/issues
- Community: https://github.com/yourusername/codereview-ai/discussions

---

## Appendix A: Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_USER` | Yes | Database username |
| `POSTGRES_PASSWORD` | Yes | Database password |
| `POSTGRES_DB` | Yes | Database name |
| `REDIS_PASSWORD` | Production | Redis password |
| `APP_KEYS` | Yes | Strapi app keys (comma-separated) |
| `API_TOKEN_SALT` | Yes | Strapi API token salt |
| `ADMIN_JWT_SECRET` | Yes | Strapi admin JWT secret |
| `JWT_SECRET` | Yes | JWT signing secret |
| `OPENAI_API_KEY` | One required | OpenAI API key |
| `ANTHROPIC_API_KEY` | One required | Anthropic API key |
| `GOOGLE_AI_API_KEY` | One required | Google AI API key |
| `GITHUB_APP_ID` | For GitHub | GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY` | For GitHub | GitHub App private key |
| `GITHUB_WEBHOOK_SECRET` | For GitHub | Webhook signature secret |
| `ENCRYPTION_KEY` | Yes | Key for encrypting stored API keys |

## Appendix B: Docker Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache

# View logs
docker-compose logs -f <service>

# Execute command in container
docker-compose exec <service> <command>

# Remove all data (DESTRUCTIVE)
docker-compose down -v
```

## Appendix C: Upgrade Guide

```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose build

# Apply database migrations (if any)
docker-compose exec server npm run strapi database:migrate

# Restart services
docker-compose up -d
```
