# CAS Waterpark – Adventure Park: The Lost Tickets

Browser-based 2D tropical adventure platformer built for **CAS Waterpark** (`https://games.caswaterpark.com`) using React, TypeScript, Tailwind CSS, Phaser 3, and the Web Audio API.

## Worlds & Gameplay

1. **World 01 — Swimming Pool Adventure**: Main pool, children's pool, inflatable bounce rings, diving boards, pool ladder, small water slide, and underwater passages.
2. **World 02 — Water Park Adventure**: Lazy river current, giant spiral water slide challenge, wave pool, moving platforms, splash traps, and tipping splash bucket.
3. **World 03 — Wildlife Park Adventure**: Elephant, Giraffe, and Zebra sanctuary habitats with interactive feeding stations, collapsing jungle bridges, rolling barrels, and timed gates.
4. **World 04 — Outbound Adventure**: Vertical climbing walls, rope ladders, swinging canyon ropes, high-speed Flying Fox ziplines, and the Golden Ticket summit finale.

## Local Development

```bash
npm install
npm run assets:build   # Regenerate /public/assets & /public/manifest/asset-manifest.json
npm run dev            # Runs on http://localhost:3000
```

## Production Build

```bash
npm run lint
npm run build
```

The production static bundle is emitted to `dist/` with all relative `/assets/...` and `/manifest/asset-manifest.json` files included.

## Hosting & Custom Domain (`games.caswaterpark.com`)

### Option A: Google Cloud Run (Nginx / Static Container) or Cloud Storage + Load Balancer
1. Build the static bundle (`npm run build`).
2. Serve `dist/` with SPA fallback (`try_files $uri $uri/ /index.html;`) and `Cache-Control: public, max-age=31536000, immutable` for `/assets/*` and `/src/assets/*`, and `no-cache` for `index.html`.
3. Map the custom domain `games.caswaterpark.com` in Cloud Run Domain Mappings or your CDN provider (Cloudflare / Vercel / Netlify).

### Required DNS Records
Configure the following DNS records at your `caswaterpark.com` DNS registrar:

- **Subdomain `CNAME` (Cloudflare / Vercel / Netlify / Cloud Run ghs):**
  - Type: `CNAME`
  - Host / Name: `games`
  - Target: `<your-hosting-target-hostname>` (e.g. `ghs.googlehosted.com` for Cloud Run domain mapping, or your static host edge domain)
  - TTL: Auto / 300s
- **SSL / HTTPS:** Enable managed TLS/HTTPS certificate for `games.caswaterpark.com` and enforce HTTPS redirects.

### Verification Checklist After DNS Propagation
- Visit `https://games.caswaterpark.com` and confirm valid TLS lock icon.
- Verify `/manifest/asset-manifest.json` and `/assets/ui/UI_002_menu_bg.jpg` return `HTTP 200` from `games.caswaterpark.com`.
