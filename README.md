# Cloudach — LLM Hosting Platform

## Local development

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
