# Deploy Uprite Medical

Everything is prepped (`.gitignore`, `.vercelignore` are in place). Run these on your Mac.

## 1. Create the Git repo (Terminal)

Open Terminal and paste:

```bash
cd ~/Downloads/uprite-medical
rm -rf .git                     # clears a partial repo from setup
git init
git add -A
git commit -m "Initial commit: Uprite Medical website"
git branch -M main
```

## 2. Push to GitHub

Create a new EMPTY repo at https://github.com/new (name it e.g. `uprite-medical`, no README/license).
Then, replacing YOURNAME with your GitHub username:

```bash
git remote add origin https://github.com/YOURNAME/uprite-medical.git
git push -u origin main
```

(If you have the GitHub CLI, you can do it in one step instead:
`gh repo create uprite-medical --private --source=. --push`)

## 3. Deploy on Vercel (easiest: import the repo)

1. Go to https://vercel.com/new
2. Import the `uprite-medical` GitHub repo you just pushed.
3. Framework preset: **Other**. Leave build/output settings empty (it's a static site).
4. Click **Deploy**.

Vercel serves the static pages and runs `api/contact.js` as a serverless function automatically. Every future `git push` will auto-deploy.

### Alternative: Vercel CLI (no GitHub needed)

```bash
npm i -g vercel
cd ~/Downloads/uprite-medical
vercel          # follow prompts -> creates the project
vercel --prod   # promotes to production
```

## 4. Turn on the contact form email (optional, do anytime)

The contact form works without this — it falls back to opening the visitor's email app.
To have submissions emailed to the front desk instead:

1. Create a free account at https://resend.com and verify your sending domain.
2. In Vercel: Project → Settings → Environment Variables, add:
   - `RESEND_API_KEY` = your Resend key (required)
   - `LEAD_TO` = frontdesk@upritemedical.com (optional, this is the default)
   - `LEAD_FROM` = `Uprite Website <noreply@upritemedical.com>` (optional; must be a verified domain)
3. Redeploy (Vercel → Deployments → ... → Redeploy) so the new variable is picked up.

## Custom domain

Vercel → Project → Settings → Domains → add `upritemedical.com` (or a subdomain) and follow the DNS steps.
