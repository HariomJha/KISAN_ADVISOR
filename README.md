# Kisan Advisor (pilot)

Location-aware crop recommendations for Indian farmers.
Next.js (TypeScript, PWA) · next-intl (11 languages) · Leaflet map · FastAPI · PostgreSQL · Docker · GitHub Actions CI.

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


## Phase 1 notes
- Pages: `/{locale}`, `/services`, `/services/best-crop`, `/about`, `/contact`. Root `/` redirects to a language.
- Languages: hi, en, bn, mr, gu, kn, te, ta, or, ne, as, ml (12). Hindi and English are complete; the others are partial drafts
  (navigation, key labels, crop names) that fall back to English. Get native speakers to review them.
  See completeness: `python scripts/check_translations.py --list`.
- Districts: the API ships sample districts only. Load the full official list:
  1. Go to https://lgdirectory.gov.in/downloadDirectory.do, choose "All Districts of India" and download it as CSV.
  2. Copy it to `backend/districts.csv`.
  3. From `backend` with the venv active: `python -m app.import_districts districts.csv --replace`
  4. For production, set `DATABASE_URL` to the database's external URL and run the same command.
  Any CSV with state and district columns works. Unrecognised state names are listed so you can add aliases in `app/district_utils.py`.
- New backend routes: `GET /states`, `GET /districts?state=`; `POST /recommend` also accepts `district`, `village`, `lat`, `lon`.
- See `docs/ROADMAP.md` for the next phases.
