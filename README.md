# StitchWorks Embroidery — Full-Stack Website

A production-ready starter for a **computer embroidery business** with two role-based portals:

- **Public site** — home, gallery, design detail, contact form, login/register
- **Client portal** — dashboard, browse designs, messaging, profile
- **Admin portal** — overview, design upload/edit/delete, message inbox + replies, client management, business settings, full activity log

> Stack: Node.js (Express) + MongoDB (Mongoose) backend, React + Vite + Tailwind frontend, JWT auth, Multer file uploads.

---

## Project structure

```
embroidery-site/
├── backend/        # Node + Express API
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/   (admin, auth, client, design, message)
│   │   ├── middleware/    (auth, errorHandler)
│   │   ├── models/        (User, Design, Message, SiteSettings, ActivityLog)
│   │   ├── routes/        (admin, auth, client, designs, messages, public)
│   │   ├── utils/         (jwt, logger, upload, seed)
│   │   └── server.js
│   ├── uploads/           (gitignored; auto-created)
│   ├── .env.example
│   └── package.json
├── frontend/       # React + Vite + Tailwind UI
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/    (PublicLayout, ClientLayout, AdminLayout, RequireAuth)
│   │   ├── context/       (AuthContext, SettingsContext)
│   │   ├── pages/         (public/, client/, admin/)
│   │   ├── utils/api.js
│   │   └── styles/app.css
│   └── package.json
└── docs/
    ├── API.md
    ├── DATABASE.md
    ├── DEPLOYMENT.md
    ├── ADMIN-GUIDE.md
    └── CLIENT-GUIDE.md
```

---

## Quick start (local development)

### Prerequisites

- **Node.js 18+**
- **MongoDB 6+** running locally **or** a MongoDB Atlas connection string
- npm (or pnpm/yarn)

### 1) Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET (long random), ADMIN_EMAIL, ADMIN_PASSWORD

npm install
npm run seed      # creates the first admin user from .env
npm run dev       # starts on http://localhost:5000
```

### 2) Frontend

```bash
cd frontend
cp .env.example .env   # optional; defaults to /api
npm install
npm run dev            # starts on http://localhost:5173
```

The frontend dev server proxies `/api` and `/uploads` to the backend.

### 3) First login

- Visit `http://localhost:5173/login`
- Sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env`
- You'll land on `/admin` (admin dashboard)

To create a client account, use `/register`.

---

## Features mapped to requirements

| Requirement | Implementation |
|---|---|
| Admin & Client roles, JWT auth, role-based access | `backend/src/middleware/auth.js`, `frontend/components/RequireAuth.jsx` |
| Admin-only design upload/delete | `POST /api/admin/designs`, `DELETE /api/admin/designs/:id` |
| Admin views/replies client messages | `GET /api/messages`, `POST /api/messages/:id/reply` |
| Admin dashboard overview | `GET /api/admin/overview` |
| Admin manages clients (disable / delete) | `PUT /api/admin/clients/:id/active`, `DELETE /api/admin/clients/:id` |
| Admin updates business info | `PUT /api/admin/settings` |
| Client browse + search designs | `GET /api/public/designs?q=&category=` |
| Client messages admin | `POST /api/messages/mine` |
| Client message history | `GET /api/messages/mine` |
| Client profile updates | `PUT /api/auth/profile` |
| Public contact form → admin inbox | `POST /api/messages/contact` |
| File uploads (images + embroidery formats) | `utils/upload.js` (Multer) |
| File preview | `<img>` for image MIME types, badge otherwise |
| Category filtering + search | `Design` text index + category enum |
| Secure file storage | Outside `public/` is not served; only `/uploads` static path |
| Notification/audit logging | Every privileged action writes an `ActivityLog` |
| Responsive design | Tailwind responsive utilities throughout |

---

## Available npm scripts

### backend
- `npm run dev` — nodemon
- `npm start` — production
- `npm run seed` — bootstrap first admin

### frontend
- `npm run dev`
- `npm run build`
- `npm run preview`

---

## Next steps / production hardening

- Replace JWT secret, set strong `ADMIN_PASSWORD`, enable HTTPS.
- Front the backend with nginx or a CDN; serve `/uploads` from object storage (S3, R2) for scale.
- Add email notifications by wiring SMTP/SES/Resend into the contact + message controllers.
- Add rate limits per-IP for `/api/auth/login` and `/api/messages/contact`.
- Add password reset and email verification flows.

See `docs/DEPLOYMENT.md` for a full deployment guide.
