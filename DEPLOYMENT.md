# Vercel Deployment Guide

## 1. Frontend Deploy (ai-crypto-agent)

### Vercel Dashboard'ta:
1. https://vercel.com/dashboard
2. "Add New..." → "Project"
3. GitHub'da `ai-crypto-agent` seç
4. Environment Variables ekle:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://ddfxfzcymthtqgcwtiha.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   GEMINI_API_KEY = AIzaSyC8c6xKcpdvDFivZuoao9k4lhHzuik6Dfg
   SUPABASE_URL = https://ddfxfzcymthtqgcwtiha.supabase.co
   SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. Deploy tıkla

## 2. Vercel Cron Konfigürasyonu

### Otomatik 15 dakika interval:
- Frontend proje deploy edildikten sonra
- `vercel.json`'da cron tanımlı
- Vercel Pro gerekli (~$20/month)

### Cron Endpoint Test:
```bash
curl https://your-vercel-domain.vercel.app/api/analyze
```

## 3. Backend Deploy (ai-crypto-advise-shepard)

### Alternatif: GitHub Actions Automation
1. Backend repo'sunda `.github/workflows/` klasörü oluştur
2. `backend-cron.yml` ekle
3. 15 dakikada bir çalışacak

```yaml
name: Crypto Backend Cron
on:
  schedule:
    - cron: '*/15 * * * *'
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      - run: pip install -r requirements.txt
      - env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
        run: python crypto_saas_backend_supabase.py
```

### Secrets Ekle:
1. Backend repo'su → Settings → Secrets
2. Ekle:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`

## 4. Architecture Overview

```
┌─────────────────────────────────────┐
│   Frontend (Vercel)                 │
│   - React + Next.js                 │
│   - Dashboard (/api/analyze)        │
│   - Cron: Her 15 dakika             │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│   Supabase (PostgreSQL)             │
│   - signals table                   │
│   - Real-time queries               │
└─────────────────────────────────────┘
         ↑
┌─────────────────────────────────────┐
│   Backend (GitHub Actions)          │
│   - Python + Gemini                 │
│   - 15 min cron çalışması           │
└─────────────────────────────────────┘
```

## 5. Monitoring

### Vercel:
- Dashboard → Deployments
- Analytics → Requests

### GitHub Actions:
- Backend repo → Actions → Workflow runs
- Çalışma zamanları ve logs görülebilir

## 6. Troubleshooting

### Cron çalışmıyorsa:
1. Vercel Pro check (cron Pro-only feature)
2. Environment variables check
3. `vercel.json` syntax kontrol

### Backend hata veriyor:
1. GitHub Actions logs kontrol
2. Secrets ayarları verify
3. `requirements.txt` güncel mi

## 7. Cost Analysis

| Service | Cost |
|---------|------|
| Vercel Pro (Cron) | $20/month |
| Supabase (Free tier) | Free (100K rows) |
| Gemini API | ~$0.30/month |
| GitHub Actions | Free (2000 min/month) |
| **Total** | **~$20/month** |

## 8. Live URLs

- Frontend: https://your-vercel-url.vercel.app
- API: https://your-vercel-url.vercel.app/api/analyze
- Backend Repo: https://github.com/ssshepardX/ai-crypto-advise-shepard
