# WHbot — WhatsApp Group Manager Telegram Bot

A **single-file** Python Telegram bot that bulk-adds contacts from a `.vcf`
file into a WhatsApp group. Everything is in `WHbot.py` — the Node.js
WhatsApp bridge is embedded inside it and written to disk automatically.

---

## 📁 Folder structure

```
WHbot/
├── WHbot.py            ← THE bot (single file, run this)
├── requirements.txt    ← Python dependencies
├── package.json        ← Node.js dependencies (whatsapp-web.js)
├── Procfile            ← Railway/Render start command
├── Dockerfile          ← Docker deployment
├── .env.example        ← Copy to .env and fill in your BOT_TOKEN
├── .gitignore
├── start.bat           ← Double-click to start on Windows
├── start.sh            ← Run on Linux/macOS
└── scripts/
    ├── postinstall.js          ← Runs after npm install
    └── patch-whatsapp-web.js  ← Fixes for WhatsApp Web 2.3000.x
```

---

## 🚀 How to start the bot

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| Python | 3.9+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| Chrome/Edge | any | Already installed on most PCs |

---

### ▶️ Windows (easiest)

1. Open the `WHbot` folder
2. Copy `.env.example` → `.env` and open `.env` in Notepad
3. Replace `BOT_TOKEN=` with your token from [@BotFather](https://t.me/BotFather)
4. **Double-click `start.bat`** — it installs everything and starts the bot

---

### ▶️ Linux / macOS

```bash
# 1. Go into the folder
cd WHbot

# 2. Copy and edit the env file
cp .env.example .env
nano .env          # set BOT_TOKEN=your_token_here

# 3. Run the start script
chmod +x start.sh
./start.sh
```

---

### ▶️ Manual start (any OS)

```bash
cd WHbot

# Install Python deps
pip install -r requirements.txt

# Install Node deps (needed for WhatsApp bridge)
npm install

# Copy and fill in the env file
cp .env.example .env
# Edit .env and set BOT_TOKEN=

# Start the bot
# Windows:
python WHbot.py

# Linux/macOS:
python3 WHbot.py
```

---

## 🤖 How to use the bot

Once the bot is running, open Telegram and message your bot:

| Step | You do | Bot does |
|---|---|---|
| 1 | Send `/login` | Bot sends a QR code image |
| 2 | Scan the QR in WhatsApp → Settings → Linked Devices → Link a Device | Bot confirms login |
| 3 | Send `/join https://chat.whatsapp.com/xxxxx` | Bot joins the group |
| 4 | Promote the linked number to **Admin** in the group | Bot detects it automatically |
| 5 | Send your **`.vcf`** contacts file | Bot shows a confirmation button |
| 6 | Tap ✅ **Start adding** | Bot adds contacts in batches and reports |

### Bot commands
```
/start   — show help
/login   — link your WhatsApp (scan QR)
/logout  — unlink WhatsApp
/join    — join a group by invite link
/status  — show current status
/cancel  — cancel the current operation
```

---

## 🚂 Deploy to Railway

1. Push the `WHbot` folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Set environment variables:
   - `BOT_TOKEN` = your Telegram bot token (**required**)
   - `DATA_DIR` = `/data`
4. Add a **Volume** mounted at `/data` (so WhatsApp session survives restarts)
5. Railway auto-detects the `Procfile` and runs `python WHbot.py`

---

## 🐳 Deploy with Docker

```bash
cd WHbot
docker build -t whbot .
docker run -d \
  -p 8080:8080 \
  -v whbot_data:/data \
  -e BOT_TOKEN=your_token_here \
  -e DATA_DIR=/data \
  whbot
```

---

## ⚙️ Configuration (.env)

| Variable | Default | Description |
|---|---|---|
| `BOT_TOKEN` | — | **Required.** Get from [@BotFather](https://t.me/BotFather) |
| `ALLOWED_USER_ID` | 0 | Lock bot to one Telegram user ID (0 = anyone) |
| `BATCH_SIZE` | 4 | How many contacts to add per batch |
| `BATCH_DELAY_SECONDS` | 30 | Delay between batches (reduces ban risk) |
| `DEFAULT_COUNTRY_CODE` | 91 | Country code for numbers without one (91=India, 1=US, 44=UK) |
| `DATA_DIR` | `.` | Where to save session data (use `/data` on Railway) |
| `PORT` | 8080 | Health-check port (auto-set by Railway) |

---

## ⚠️ Important notes

- **WhatsApp ToS:** This uses an unofficial library (`whatsapp-web.js`). Keep
  batch sizes small and delays generous to reduce ban risk.
- The WhatsApp session is saved in `.wwebjs_auth/` — on cloud hosts, always
  use a persistent volume or you'll have to re-scan the QR after every restart.
- Group invite links expire — if `/join` fails, get a fresh link.
- VCF numbers without a country code get `DEFAULT_COUNTRY_CODE` prepended.

---

## 🔧 Troubleshooting

| Problem | Fix |
|---|---|
| `Bridge failed to start` | Run `npm install` in the WHbot folder |
| QR never appears | Make sure Chrome/Chromium is installed |
| `BOT_TOKEN` error | Check your `.env` file has the correct token |
| Session lost after restart | Mount a persistent volume at `DATA_DIR` |
