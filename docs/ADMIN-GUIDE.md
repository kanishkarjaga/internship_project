# Admin user guide

This guide is for the embroidery business owner / staff who manage the site.

## Signing in

1. Open `https://your-site.com/login`.
2. Enter your admin email and password (these were set in `.env` on the server, and can be changed via your profile).
3. After login you land on **Admin → Overview**.

If you forgot the password, the server operator needs to reset it directly in MongoDB or by re-running the seed script.

## Overview

The dashboard shows three counters at the top:

- **Designs uploaded** — total designs in the library.
- **Registered clients** — accounts created by clients.
- **Open messages** — message threads not yet replied to.

Below that you'll see **Recent messages**, **Recent clients**, and the latest **Activity log** entries.

## Designs (`/admin/designs`)

Upload new embroidery files (PNG, JPG, SVG, PDF, AI, DST, PES, EXP, VP3, HUS, JEF, EPS) with a title, description, category, price, and tags.

- Click **+ Upload design**.
- Drag in the file (or pick one from your computer).
- Fill in metadata and click **Upload**.
- Existing designs can be **edited** (metadata only) or **deleted** (this also removes the file).

> Files larger than `MAX_UPLOAD_MB` (default 15 MB) will be rejected. Increase the env var if you need bigger files; also raise nginx `client_max_body_size`.

## Messages (`/admin/messages`)

Threads from both the **public contact form** and the **client dashboard** arrive here.

- Filter by status: `open`, `replied`, `closed`, `all`.
- Search by subject, body, name, or email.
- Click a thread to **read**, **reply**, or **close** it.

When a client sends a reply to a thread you'd previously closed, the thread is automatically reopened.

## Clients (`/admin/clients`)

- See every registered client with their email, company, and join date.
- Use **Disable** to block a client from logging in (they cannot see or do anything until re-enabled).
- Use **Delete** to permanently remove the account (this does not delete their past messages — the messages are retained as audit records; to scrub them, ask the server operator).

## Settings (`/admin/settings`)

Update your public-facing business information:

- Business name, tagline, about text
- Contact email, phone, address, hero image URL
- Social media links
- Notification flags (used by future email/push integrations)

These changes are reflected on the public home page immediately.

## Activity log (`/admin/activity`)

Every privileged action (logins, uploads, deletes, replies, profile changes) is recorded with timestamp, actor, and IP. Filter by action type (e.g. `message.reply`, `design.delete`).

This is your audit trail. Export or scrub with caution.

---

## Quick reference

| I want to… | Where to go |
|---|---|
| Add a new embroidery design | Designs → Upload |
| Remove a design that's no longer offered | Designs → Delete |
| Reply to a customer question | Messages → open thread → reply |
| Stop a troublesome client from logging in | Clients → Disable |
| Update the phone number on the website | Settings → Contact |
| See who uploaded what yesterday | Activity log |
