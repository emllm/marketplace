# 🤖 AI Email Distribution System

Generate and deploy applications via email using AI.

## 🚀 Quick Start

1. **Setup Environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

2. **Start System**
```bash
docker-compose up -d
```

3. **Access Services**
- **Marketplace**: http://localhost:3000
- **API**: http://localhost:8000
- **Database**: localhost:5432

## 💬 How It Works

1. **Chat with AI** → Describe what app you need
2. **AI Generates** → Complete app with Docker setup  
3. **Email Delivery** → App sent to your email
4. **One-Click Deploy** → Auto-deploy from email

## 📧 Example Usage

Send email or use marketplace chat:
```
"Create a dashboard showing sales data with charts"
```

AI generates complete Python/React app and emails it to you.

## 🔧 Requirements

- Docker & Docker Compose
- OpenAI API key
- Gmail account with app password

## 📞 Support

Check logs: `docker-compose logs -f`