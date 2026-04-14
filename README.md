# Cloudach — LLM Hosting Platform

## Full-stack with Docker Compose

Bring up the entire platform — dashboard, API gateway, Postgres, Redis, and a local
inference mock — with a single command:

```bash
cp .env.example .env          # review defaults (JWT_SECRET, etc.)
docker-compose up --build     # first boot builds images and runs DB migrations
```

| Service        | URL                       | Notes                               |
| -------------- | ------------------------- | ----------------------------------- |
| Dashboard      | http://localhost:3000     | Next.js app                         |
| API Gateway    | http://localhost:8080     | JWT-authenticated LLM proxy         |
| Postgres       | localhost:5432            | credentials: cloudach / cloudach    |
| Redis          | localhost:6379            | rate limiting & session cache       |
| vLLM mock      | http://localhost:8001     | local dev only; real GPU uses K8s   |

**First-time setup notes:**
- DB migrations run automatically on first boot via `docker-entrypoint-initdb.d/`.
- If you previously started the stack without `002_add_auth.sql`, remove the
  Postgres volume and restart: `docker-compose down -v && docker-compose up --build`
- To generate a strong `JWT_SECRET`: `openssl rand -hex 32`

## Local development (frontend only)

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel (recommended — free)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com → New Project → Import your repo
3. Vercel auto-detects Next.js — just click Deploy
4. Your site is live at yourproject.vercel.app

## Connect your custom domain (cloudach.com)

1. In Vercel dashboard → Project → Settings → Domains
2. Add "cloudach.com" and "www.cloudach.com"
3. In your domain registrar (GoDaddy / Namecheap / Cloudflare):
   - Add A record: @ → 76.76.21.21
   - Add CNAME: www → cname.vercel-dns.com
4. Wait 5–10 min for DNS to propagate — done!

## Project structure

```
cloudach/
├── pages/
│   ├── _app.jsx        # App wrapper
│   └── index.jsx       # Homepage
├── components/
│   ├── Logo.jsx        # Diamond logo SVG
│   ├── Nav.jsx         # Navigation bar
│   ├── Hero.jsx        # Hero + code window
│   ├── Features.jsx    # 6-feature grid
│   ├── Models.jsx      # Model cards
│   ├── Pricing.jsx     # How it works + pricing
│   └── Footer.jsx      # Footer
├── styles/
│   └── globals.css     # All styles
├── public/
│   └── favicon.svg     # Logo favicon
├── next.config.js
├── vercel.json
└── package.json
```
