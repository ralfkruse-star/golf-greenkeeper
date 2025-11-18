# Docker Setup - Golf Greenkeeper

This document explains how to run the Golf Greenkeeper Management System using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Start All Services

```bash
# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
```

### 2. Initialize Database

```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate deploy

# Seed database with sample data
docker-compose exec app npm run seed
```

### 3. Access Services

- **Application**: http://localhost:3000
- **Database Admin (Adminer)**: http://localhost:8080
  - Server: `postgres`
  - Username: `postgres`
  - Password: `postgres`
  - Database: `golf_greenkeeper`
- **MQTT Broker**: mqtt://localhost:1883
- **MQTT WebSocket**: ws://localhost:9001

### 4. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes all data)
docker-compose down -v
```

## Services

### PostgreSQL Database
- **Port**: 5432
- **Database**: golf_greenkeeper
- **User**: postgres
- **Password**: postgres (change in production!)
- **Volume**: `postgres_data`

### Redis Cache
- **Port**: 6379
- **Persistence**: AOF (Append-Only File)
- **Volume**: `redis_data`

### MQTT Broker (Mosquitto)
- **MQTT Port**: 1883
- **WebSocket Port**: 9001
- **Config**: `docker/mosquitto/mosquitto.conf`
- **Volumes**: `mosquitto_data`, `mosquitto_logs`
- **Anonymous**: Enabled (disable in production!)

### Next.js Application
- **Port**: 3000
- **Build**: Multi-stage optimized build
- **User**: Non-root (nextjs:nodejs)
- **Health Check**: `/api/health` endpoint

### Adminer (Database UI)
- **Port**: 8080
- **Profile**: dev (not started by default)
- **Start**: `docker-compose --profile dev up -d adminer`

## Development Mode

To run in development mode with hot-reload:

1. Update `docker-compose.yml` - uncomment the volume mounts in the `app` service:

```yaml
volumes:
  - .:/app
  - /app/node_modules
  - /app/.next
```

2. Change the command to development mode:

```yaml
command: npm run dev
```

3. Restart the app service:

```bash
docker-compose up -d app
```

## Production Deployment

### 1. Environment Variables

Create a `.env` file with production values:

```bash
# Copy example
cp .env.example .env

# Edit with production values
nano .env
```

**Important**: Change these secrets!
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `POSTGRES_PASSWORD`

### 2. Secure MQTT Broker

Edit `docker/mosquitto/mosquitto.conf`:

```conf
# Disable anonymous access
allow_anonymous false

# Enable password file
password_file /mosquitto/config/password.txt
```

Create password file:

```bash
# Create password for user 'mqtt_user'
docker-compose exec mqtt mosquitto_passwd -c /mosquitto/config/password.txt mqtt_user
```

### 3. Use HTTPS

For production, use a reverse proxy (Nginx, Traefik, Caddy) with SSL certificates.

Example Nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name greenkeeper.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Database Connection Issues

```bash
# Check database health
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U postgres -d golf_greenkeeper
```

### Application Won't Start

```bash
# Check app logs
docker-compose logs app

# Restart app
docker-compose restart app

# Rebuild app
docker-compose up -d --build app
```

### MQTT Connection Issues

```bash
# Check MQTT broker status
docker-compose ps mqtt

# View MQTT logs
docker-compose logs mqtt

# Test MQTT connection
docker-compose exec mqtt mosquitto_sub -t '#' -v
```

### Reset Everything

```bash
# Stop and remove all containers, volumes, and networks
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up -d --build
```

## Useful Commands

```bash
# View running containers
docker-compose ps

# View resource usage
docker stats

# Execute command in container
docker-compose exec app npm run test

# Access container shell
docker-compose exec app sh

# View app logs (follow)
docker-compose logs -f app

# Rebuild specific service
docker-compose up -d --build app

# Scale service (if stateless)
docker-compose up -d --scale app=3
```

## Backup & Restore

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres golf_greenkeeper > backup.sql

# Compressed backup
docker-compose exec postgres pg_dump -U postgres golf_greenkeeper | gzip > backup.sql.gz
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T postgres psql -U postgres golf_greenkeeper < backup.sql

# From compressed backup
gunzip -c backup.sql.gz | docker-compose exec -T postgres psql -U postgres golf_greenkeeper
```

### Backup Volumes

```bash
# Backup all volumes
docker run --rm \
  -v golf-greenkeeper_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz -C /data .
```

## Monitoring

### Health Checks

```bash
# Check health status
docker-compose ps

# Manually trigger health check
docker inspect --format='{{json .State.Health}}' golf-greenkeeper-app | jq
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service with timestamps
docker-compose logs -f --timestamps app

# Last 100 lines
docker-compose logs --tail=100 app
```

## Performance Optimization

### Resource Limits

Add resource limits in `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Caching

The Dockerfile uses multi-stage builds for optimal caching:
- Dependencies cached separately
- Only rebuilds when package.json changes
- Source code changes don't invalidate dependency cache

## Security Best Practices

1. **Never commit secrets** - Use `.env` files (not committed)
2. **Change default passwords** - Update postgres, MQTT passwords
3. **Run as non-root** - Application runs as `nextjs` user
4. **Use SSL/TLS** - Always use HTTPS in production
5. **Update regularly** - Keep base images updated
6. **Scan images** - Use `docker scan` to check for vulnerabilities
7. **Limit network exposure** - Only expose necessary ports
8. **Use secrets management** - Consider Docker Secrets or HashiCorp Vault

## CI/CD Integration

### Build & Push

```bash
# Build image
docker build -t golf-greenkeeper:latest .

# Tag for registry
docker tag golf-greenkeeper:latest registry.example.com/golf-greenkeeper:latest

# Push to registry
docker push registry.example.com/golf-greenkeeper:latest
```

### Docker Registry

```yaml
# In docker-compose.yml
services:
  app:
    image: registry.example.com/golf-greenkeeper:${VERSION:-latest}
```

## Next Steps

1. Review and update environment variables in `.env`
2. Configure MQTT authentication for production
3. Set up SSL certificates with Let's Encrypt
4. Configure backup automation
5. Set up monitoring (Prometheus, Grafana)
6. Configure log aggregation (ELK Stack, Loki)
