# Deployment Guide

## Frontend (Vercel)

### Environment Variables
Set these in Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL` = https://ddfxfzcymthtqgcwtiha.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Supabase anon key)
- `GEMINI_API_KEY` = (Your Gemini API key)
- `SUPABASE_URL` = https://ddfxfzcymthtqgcwtiha.supabase.co
- `SUPABASE_KEY` = (Supabase service key)

### Deployment
1. Go to https://vercel.com/dashboard
2. Connect `ai-crypto-agent` repository
3. Add environment variables
4. Deploy

## Backend (GitHub Actions)

### Cron Schedule
Configured in `vercel.json` to run every 15 minutes:
```json
{
  "crons": [{
    "path": "/api/analyze",
    "schedule": "*/15 * * * *"
  }]
}
```

### Alternative: Manual Run
```bash
cd crypto AI Advise
python crypto_saas_backend_supabase.py
```

## Architecture

```
┌─────────────────────────────┐
│  Frontend (Vercel)          │
│  - Next.js Dashboard        │
│  - /api/analyze endpoint    │
└─────────────────────────────┘
           ↓
┌─────────────────────────────┐
│  Supabase (PostgreSQL)      │
│  - signals table            │
└─────────────────────────────┘
           ↑
┌─────────────────────────────┐
│  Backend (Python)           │
│  - Gemini AI Analysis       │
│  - 15min automated run      │
└─────────────────────────────┘
```

## Monitoring

### Vercel
- Dashboard → Deployments → View logs

### Backend
- Local: `python crypto_saas_backend_supabase.py`
- Check Supabase signals table for new entries

## Costs

- Vercel: Free tier
- Supabase: Free tier (100K rows)
- Gemini API: ~$0.30/month (estimated)
- Total: ~Free to $5/month