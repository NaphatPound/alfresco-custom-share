# Alfresco Community with Custom Share UI

## Prerequisites

- Docker Desktop (v24+) with at least **6GB RAM** allocated
- Docker Compose v2
- The built `alfresco-community-share` WAR artifacts in `alfresco-community-share/packaging/docker/target/`

## Project Structure

```
alfresco/
├── docker-compose.yaml                  # Main compose file (custom share)
├── document.md                          # This file
├── acs-deployment/                      # Upstream Alfresco deployment repo
│   └── docker-compose/
│       ├── community-compose.yaml       # Reference community compose
│       └── commons/base.yaml            # Traefik label definitions
└── alfresco-community-share/            # Custom Share UI source
    ├── share/src/main/
    │   ├── resources/alfresco/
    │   │   ├── templates/org/alfresco/  # FTL page templates
    │   │   └── site-webscripts/         # Web-scripts & config
    │   └── webapp/components/           # JS/CSS components
    │       ├── preview/                 # Web-preview plugins
    │       │   ├── PlainText.js         # Custom: plain text previewer
    │       │   ├── PlainText.css        # Custom: plain text styles
    │       │   ├── PdfJs.js             # PDF previewer
    │       │   ├── Image.js             # Image previewer
    │       │   ├── Video.js             # Video previewer
    │       │   └── Audio.js             # Audio previewer
    │       └── document-details/        # Document details panel CSS
    └── packaging/docker/
        ├── Dockerfile                   # Share Docker image build
        ├── substituter.sh               # Env variable substitution
        └── target/war/share/            # Built WAR (deploy artifacts)
```

## Quick Start

### Step 1: Build the Custom Share Image

```bash
cd alfresco-community-share/packaging/docker
docker build -t alfresco-share-custom:latest .
```

### Step 2: Start All Services

```bash
cd /path/to/alfresco
docker compose up -d
```

### Step 3: Verify

Wait 1-2 minutes for all services to start, then check:

```bash
docker compose ps
```

All containers should show `healthy` status.

## Access URLs

| Service            | URL                            |
|--------------------|--------------------------------|
| Share UI           | http://localhost:8080/share/    |
| Alfresco API       | http://localhost:8080/alfresco/ |
| Traefik Dashboard  | http://localhost:8888/          |
| Solr Admin         | http://localhost:8083/solr/     |
| ActiveMQ Console   | http://localhost:8161/          |

**Default credentials:** `admin` / `admin`

## Services Overview

| Service              | Image                                              | Port  | RAM    |
|----------------------|----------------------------------------------------|-------|--------|
| alfresco (repo)      | alfresco/alfresco-content-repository-community:25.3.0 | -   | 1900m  |
| share (custom UI)    | alfresco-share-custom:latest                       | -     | 1g     |
| postgres             | postgres:16.5                                      | 5432  | 512m   |
| solr6                | alfresco/alfresco-search-services:2.0.17           | 8083  | 2g     |
| activemq             | alfresco/alfresco-activemq:5.18-jre17-rockylinux8  | 8161  | 1g     |
| transform-core-aio   | alfresco/alfresco-transform-core-aio:5.3.0         | 8090  | 1536m  |
| proxy (traefik)      | traefik:3.6                                        | 8080  | 128m   |

## Custom UI Modifications

### PlainText Web-Preview Plugin

Text files (`.txt`) are rendered directly as raw monospace text with horizontal scrolling instead of being converted to PDF.

**Files:**
- `share/src/main/webapp/components/preview/PlainText.js` - Plugin logic
- `share/src/main/webapp/components/preview/PlainText.css` - Styles

**Configuration:**
- `web-preview.get.config.xml` - `text/plain` mapped to `PlainText` plugin
- `web-preview-js-dependencies.lib.ftl` - JS registered
- `web-preview-css-dependencies.lib.ftl` - CSS registered

## Development Workflow

### Making UI Changes

1. Edit source files under `alfresco-community-share/share/src/main/`

2. Copy changed files to the build target:
   ```bash
   # For webapp files (JS, CSS):
   cp share/src/main/webapp/components/preview/MyFile.js \
      packaging/docker/target/war/share/components/preview/MyFile.js

   # For webscript/template files (FTL, XML, JS):
   cp share/src/main/resources/alfresco/templates/org/alfresco/my-page.ftl \
      packaging/docker/target/war/share/WEB-INF/classes/alfresco/templates/org/alfresco/my-page.ftl
   ```

3. Rebuild and restart share:
   ```bash
   cd alfresco-community-share/packaging/docker
   docker build -t alfresco-share-custom:latest .

   cd /path/to/alfresco
   docker compose up -d share --force-recreate
   ```

4. Wait for share to become healthy (~30s):
   ```bash
   docker inspect --format='{{.State.Health.Status}}' alfresco-share-1
   ```

### Key Source Paths for UI Customization

| What                     | Source Path                                                             |
|--------------------------|-------------------------------------------------------------------------|
| Page templates (FTL)     | `share/src/main/resources/alfresco/templates/org/alfresco/`             |
| Page definitions (XML)   | `share/src/main/resources/alfresco/site-data/pages/`                    |
| Template instances       | `share/src/main/resources/alfresco/site-data/template-instances/`       |
| Web-preview plugins      | `share/src/main/webapp/components/preview/`                             |
| Preview config           | `share/src/main/resources/alfresco/site-webscripts/org/alfresco/components/preview/` |
| Document details CSS     | `share/src/main/webapp/components/document-details/`                    |
| YUI grid/layout CSS      | `share/src/main/webapp/css/yui-fonts-grids.css`                         |

### Adding a New Web-Preview Plugin

1. Create `share/src/main/webapp/components/preview/MyPlugin.js`:
   ```javascript
   Alfresco.WebPreview.prototype.Plugins.MyPlugin = function(wp, attributes) {
      this.wp = wp;
      this.attributes = YAHOO.lang.merge(
         Alfresco.util.deepCopy(this.attributes), attributes);
      return this;
   };

   Alfresco.WebPreview.prototype.Plugins.MyPlugin.prototype = {
      attributes: {},
      report: function() { /* return nothing if supported */ },
      display: function() {
         var el = this.wp.getPreviewerElement();
         var url = this.wp.getContentUrl(false);
         // Render content into el
         return null;
      }
   };
   ```

2. Add condition in `web-preview.get.config.xml`:
   ```xml
   <condition mimeType="application/x-my-type">
      <plugin>MyPlugin</plugin>
   </condition>
   ```

3. Register in `web-preview-js-dependencies.lib.ftl` and `web-preview-css-dependencies.lib.ftl`

## Common Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Stop and remove volumes (clean start)
docker compose down -v

# View logs
docker compose logs -f share
docker compose logs -f alfresco

# Restart only share after UI changes
docker compose up -d share --force-recreate

# Check health of all services
docker compose ps

# Test API
curl -u admin:admin http://localhost:8080/alfresco/api/-default-/public/alfresco/versions/1/people/admin
```

## Ports Used

| Port  | Service         |
|-------|-----------------|
| 8080  | Traefik proxy   |
| 8083  | Solr (mapped from 8983) |
| 8090  | Transform service |
| 8161  | ActiveMQ web console |
| 8888  | Traefik dashboard |
| 5432  | PostgreSQL      |
| 5672  | AMQP            |
| 61616 | OpenWire        |
| 61613 | STOMP           |

## Troubleshooting

**Share won't start:** Check that `alfresco` is healthy first. Share depends on it.
```bash
docker inspect --format='{{.State.Health.Status}}' alfresco-alfresco-1
```

**Port conflict on 5432:** Another PostgreSQL may be running. Stop it or change the port in `docker-compose.yaml`.

**Out of memory:** Ensure Docker Desktop has at least 6GB RAM allocated. The full stack uses ~8GB.

**Preview not updating after code change:** Clear browser cache or use incognito. Share caches JS/CSS aggressively.
