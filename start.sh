#!/bin/bash
# start.sh — run WHbot on Linux / macOS

set -e
cd "$(dirname "$0")"

echo "============================================="
echo "  WHbot - WhatsApp Group Manager Bot"
echo "============================================="
echo

# Check .env
if [ ! -f ".env" ]; then
    echo "[ERROR] .env file not found!"
    echo "Copy .env.example to .env and set your BOT_TOKEN:"
    echo "  cp .env.example .env"
    exit 1
fi

# Install Node deps if needed
if [ ! -d "node_modules" ]; then
    echo "[SETUP] Installing Node.js dependencies..."
    npm install
fi

# Install Python deps if needed
if ! python3 -c "import telegram" 2>/dev/null; then
    echo "[SETUP] Installing Python dependencies..."
    pip3 install -r requirements.txt
fi

# Load .env
set -a
source .env
set +a

echo "[OK] Starting WHbot..."
echo
python3 WHbot.py
