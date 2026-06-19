# Deployment guide

This guide covers a simple, low-cost production deployment using:

- **MongoDB Atlas** for the database
- **Render / Railway / Fly.io / any VPS** for the backend (Node.js)
- **Vercel / Netlify / Cloudflare Pages / static-host** for the frontend (static SPA)
- **Cloudflare R2 / AWS S3** (optional) for offloading design files

For a single-server deployment (one VPS), see the bottom of this file.

---

## 1) Database — MongoDB Atlas

1. Create a free Atlas cluster.
2. Add a database user and whitelist the IPs that will connect (or `0.0.0.0/0` for dev).
3. Copy the connection string — set it as `MONGO_URI`.

## 2) Backend

### Environment variables (production)
```
NODE_ENV=production
PORT=5000
CLIENT_ORIGIN=https://your-site.example
MONGO_URI=mongodb+srv://...
JWT_SECRET=<long-random-string>
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
MAX_UPLOAD_MB=15
```

### Run
```bash
cd backend
npm ci --omit=dev
npm run seed   # creates first admin
npm start
```

### Recommended hosting
- **Render** — Web Service, build `npm install`, start `npm start`, free plan works for small loads.
- **Railway** — same.
- **Fly.io** — fly launch; add a small volume if you want to persist `uploads/`.
- **VPS (DigitalOcean, Hetzner, OVH)** — see "Single VPS" below.

### Reverse proxy
Run behind nginx with HTTPS via Let's Encrypt:

```nginx
server {
  listen 443 ssl http2;
  server_name api.yoursite.com;

  ssl_certificate /etc/letsencrypt/live/api.yoursite.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.yoursite.com/privkey.pem;

  client_max_body_size 20m;

  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Process management: systemd or pm2.

```ini
# /etc/systemd/system/embroidery.service
[Unit]
Description=Embroidery API
After=network.target

[Service]
WorkingDirectory=/opt/embroidery/backend
EnvironmentFile=/opt/embroidery/backend/.env
ExecStart=/usr/bin/node src/server.js
Restart=always
User=embroidery

[Install]
WantedBy=multi-user.target
```

---

## 3) Frontend

```bash
cd frontend
npm ci
npm run build
```

The build output is in `dist/`. It's a static SPA — host anywhere.

### Vercel / Netlify
- Build command: `npm run build`
- Output dir: `dist`
- Set `VITE_API_BASE=https://api.yoursite.com/api`

### Cloudflare Pages
- Build command: `npm run build`
- Output dir: `dist`

### Hosting with the API on the same domain
Put the SPA behind nginx and have nginx proxy `/api` to the Node server:

```nginx
server {
  listen 443 ssl http2;
  server_name yoursite.com;

  ssl_certificate /etc/letsencrypt/live/yoursite.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yoursite.com/privkey.pem;

  root /opt/embroidery/frontend/dist;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /uploads/ {
    proxy_pass http://127.0.0.1:5000;
  }

  location / {
    try_files $uri /index.html;
  }
}
```

---

## 4) (Optional) Offload uploads to S3/R2

For real scale, swap the local `uploads/` storage for S3-compatible storage:

1. Add `@aws-sdk/client-s3` and `multer-s3` to `backend`.
2. Change `utils/upload.js` to use `multer-s3`.
3. Set `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and a public bucket policy (or front with CloudFront).
4. The frontend's `fileUrl()` helper already handles absolute URLs.

---

## 5) Single VPS quick recipe (Ubuntu)

```bash
# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx

# App
sudo mkdir -p /opt/embroidery && sudo chown $USER /opt/embroidery
cd /opt/embroidery
git clone <your-repo> .
cd backend && cp .env.example .env && nano .env
npm ci --omit=dev && npm run seed && cd ..
cd frontend && cp .env.example .env && nano .env
npm ci && npm run build && cd ..

# Run backend with pm2
sudo npm install -g pm2
pm2 start backend/src/server.js --name embroidery-api
pm2 save && pm2 startup

# nginx + TLS
sudo tee /etc/nginx/sites-available/embroidery <<'EOF'
server { listen 80; server_name yoursite.com; }
EOF
# (Then enable + certbot --nginx)
```

---

## 6) Hardening checklist

- [ ] Set strong `JWT_SECRET` and rotate periodically.
- [ ] Change the seeded admin password after first login.
- [ ] Enable HTTPS (Let's Encrypt).
- [ ] Set `CLIENT_ORIGIN` to your production frontend URL.
- [ ] Increase `MAX_UPLOAD_MB` only as needed; pair with `client_max_body_size` in nginx.
- [ ] Add email notifications (Resend, SES, SMTP) for new messages.
- [ ] Set up daily MongoDB backups (Atlas does this automatically on paid tiers).
- [ ] Add Sentry / OpenTelemetry for error tracking.
- [ ] Add CI/CD (GitHub Actions) to run `npm test`/`npm run build` on push.
