# Kisan Advisor (pilot)

Location-aware crop recommendations for Indian farmers.
Next.js (TypeScript, PWA) · FastAPI · PostgreSQL · Docker · GitHub Actions CI.

> Crop cost/yield/price values in `backend/app/seed_data.json` are SAMPLE data.
> Replace with verified figures (agronomist, state agri-university, Agmarknet, MSP) before real use.

## Install once
Git, Python 3.12, Node.js 20 LTS, Docker Desktop, VS Code.

## Run locally
```bash
# 1. Backend + Postgres
docker compose up --build        # API on http://localhost:8000/docs

# 2. Frontend (new terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                      # http://localhost:3000
```
Backend without Docker (uses SQLite):
```bash
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
pytest -q && uvicorn app.main:app --reload
```

## Deploy a live demo (free tiers; check current limits)
1. Push this repo to GitHub.
2. **Database + API on Render:** New > PostgreSQL, then New > Web Service from the repo,
   Root Directory `backend`, Runtime Docker. Env vars: `DATABASE_URL` (Postgres internal URL),
   `ALLOWED_ORIGINS` (your Vercel URL, set after step 3). Check `/health` and `/docs`.
3. **Frontend on Vercel:** Import the repo, Root Directory `frontend`,
   env var `NEXT_PUBLIC_API_URL` = your Render API URL. Deploy.
4. Go back to Render and set `ALLOWED_ORIGINS` to the Vercel URL, then redeploy the API.
5. Open the Vercel URL on your phone and use "Add to Home Screen".

## Roadmap
Bigha/regional units · district-level data · live weather (Open-Meteo) · mandi prices (Agmarknet)
· expert call-back form · crop photo disease check · move to AWS EKS (Terraform/Jenkins).
