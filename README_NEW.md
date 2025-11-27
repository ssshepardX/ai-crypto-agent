# AI Crypto Agent - SaaS Platform

Yapay zeka motoruyla kripto piyasasını analiz eden gerçek zamanlı dashboard.

## 🎯 Mimari

### Backend (Python)
- **Layer 1**: Data Ingestion (Piyasa verisi)
- **Layer 2**: The Screener (Matematiksel filtreler - RSI, Hacim)
- **Layer 3**: AI Analyst (Gemini Pro analiz)
- **Storage**: Supabase PostgreSQL

### Frontend (Next.js)
- Dark mode cyberpunk UI
- Real-time signals dashboard
- Responsive design (Tailwind CSS)
- Live Supabase integration

## 🚀 Hızlı Başla

### Backend Setup
```bash
cd "crypto AI Advise"
pip install pandas openai python-dotenv google-generativeai supabase
python crypto_saas_backend_supabase.py
```

### Frontend Setup
```bash
cd ai-crypto-agent
npm install
npm run dev
```

## 📊 Tech Stack
- Backend: Python, Gemini 2.5-Flash, Supabase
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS

## 📈 Features
✅ Real-time AI analysis
✅ Technical indicators (RSI, MA)
✅ Sentiment analysis (Bullish/Bearish/Neutral)
✅ Cost-optimized architecture
✅ Dark mode UI
✅ Mobile responsive
✅ Supabase integration

## 🔄 Otomasyonu Kurulum

Windows Task Scheduler ile her 15 dakikada backend'i çalıştır:
1. TASK_SCHEDULER_SETUP.md dosyasını oku
2. PowerShell'de komutları çalıştır
