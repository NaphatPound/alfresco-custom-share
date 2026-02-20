# Alfresco Community with Custom Share UI

Alfresco Content Services (Community) running on Docker Compose with a **custom-built Share frontend** that includes a PlainText web-preview plugin for rendering `.txt` files with horizontal scrolling.

## Prerequisites

- **Docker Desktop** v24+ with at least **6GB RAM** allocated
- **Docker Compose** v2

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/NaphatPound/alfresco-custom-share.git
cd alfresco-custom-share

# 2. Build the custom Share image
cd alfresco-community-share/packaging/docker
docker build -t alfresco-share-custom:latest .
cd ../../..

# 3. Start all services
docker compose up -d

# 4. Wait for services to become healthy (~2 minutes)
docker compose ps
```

Once all services show `healthy`, open **http://localhost:8080/share/** and log in with `admin` / `admin`.

## Services

| Service            | Image                                                 | RAM   |
|--------------------|-------------------------------------------------------|-------|
| alfresco (repo)    | alfresco/alfresco-content-repository-community:25.3.0 | 1900m |
| share (custom UI)  | alfresco-share-custom:latest                          | 1g    |
| postgres           | postgres:16.5                                         | 512m  |
| solr6              | alfresco/alfresco-search-services:2.0.17              | 2g    |
| activemq           | alfresco/alfresco-activemq:5.18-jre17-rockylinux8     | 1g    |
| transform-core-aio | alfresco/alfresco-transform-core-aio:5.3.0            | 1536m |
| proxy              | traefik:3.6                                           | 128m  |

## Access URLs

| Service           | URL                            |
|-------------------|--------------------------------|
| Share UI          | http://localhost:8080/share/    |
| Alfresco REST API | http://localhost:8080/alfresco/ |
| Traefik Dashboard | http://localhost:8888/          |
| Solr Admin        | http://localhost:8083/solr/     |
| ActiveMQ Console  | http://localhost:8161/          |

**Default login:** `admin` / `admin`

## Custom UI: PlainText Preview Plugin

Text files (`.txt`) are rendered as raw monospace text with **horizontal scrolling** and **line numbers**, instead of being converted to PDF.

**Plugin files** (inside `alfresco-community-share`):

```
share/src/main/webapp/components/preview/PlainText.js    # Plugin logic
share/src/main/webapp/components/preview/PlainText.css    # Styles
```

## Development: Making UI Changes

1. Edit source files under `alfresco-community-share/share/src/main/`

2. Copy changed files into the Docker build target:
   ```bash
   # JS/CSS files
   cp share/src/main/webapp/components/preview/MyFile.js \
      packaging/docker/target/war/share/components/preview/MyFile.js

   # FTL/XML template files
   cp share/src/main/resources/alfresco/templates/org/alfresco/my-page.ftl \
      packaging/docker/target/war/share/WEB-INF/classes/alfresco/templates/org/alfresco/my-page.ftl
   ```

3. Rebuild and restart Share:
   ```bash
   cd alfresco-community-share/packaging/docker
   docker build -t alfresco-share-custom:latest .
   cd ../../..
   docker compose up -d share --force-recreate
   ```

## Common Commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Stop and wipe all data
docker compose down -v

# Restart Share only (after UI changes)
docker compose up -d share --force-recreate

# View logs
docker compose logs -f share
docker compose logs -f alfresco

# Test API
curl -u admin:admin http://localhost:8080/alfresco/api/-default-/public/alfresco/versions/1/people/admin
```

## Ports

| Port  | Service                       |
|-------|-------------------------------|
| 8080  | Traefik proxy (main entry)    |
| 8083  | Solr (mapped from 8983)       |
| 8090  | Transform service             |
| 8161  | ActiveMQ web console          |
| 8888  | Traefik dashboard             |
| 5432  | PostgreSQL                    |
| 5672  | AMQP                          |
| 61616 | OpenWire                      |
| 61613 | STOMP                         |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Share won't start | Check `alfresco` is healthy first: `docker inspect --format='{{.State.Health.Status}}' alfresco-alfresco-1` |
| Port 5432 conflict | Another PostgreSQL is running. Stop it or change the port in `docker-compose.yaml` |
| Out of memory | Ensure Docker Desktop has at least 6GB RAM. Full stack uses ~8GB |
| UI changes not visible | Clear browser cache or use incognito. Share caches JS/CSS aggressively |

## Documentation

See [document.md](document.md) for detailed architecture, project structure, key source paths, and guide for adding new web-preview plugins.
