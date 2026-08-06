# WHbot — single container: Python + Node.js + Chromium
#
# Build:  docker build -t whbot .
# Run:    docker run -p 8080:8080 -v whbot_data:/data \
#           -e BOT_TOKEN=... -e DATA_DIR=/data whbot

FROM python:3.12-slim-bookworm

ENV DEBIAN_FRONTEND=noninteractive \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_MAJOR=20

# System deps: Node.js + Chromium
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
         curl gnupg ca-certificates \
         chromium fonts-liberation \
         libnss3 libxss1 libasound2 libatk-bridge2.0-0 libgtk-3-0 \
    && curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Node deps first (cache-friendly)
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Python deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# App files
COPY . .

# Non-root user
RUN useradd --create-home --uid 10001 appuser \
    && mkdir -p /data \
    && chown -R appuser:appuser /app /data
USER appuser

ENV DATA_DIR=/data \
    BRIDGE_HOST=127.0.0.1 \
    BRIDGE_PORT=3000

EXPOSE 8080

CMD ["python", "WHbot.py"]
