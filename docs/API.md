# API documentation

Base URL: `/api`

Auth: send `Authorization: Bearer <token>` for protected routes.
Tokens come from `POST /auth/login` or `POST /auth/register`.

All responses are JSON. Errors look like `{ "message": "..." }` with a 4xx/5xx status; sometimes `details` is included.

---

## Auth

### `POST /auth/register`
Create a client account.

Body:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "verysecret123",
  "phone": "+1 555 0123",
  "company": "Acme",
  "address": "1 Main St"
}
```
Returns: `{ token, user }`

### `POST /auth/login`
Body:
```json
{ "email": "jane@example.com", "password": "verysecret123" }
```
Returns: `{ token, user }`

### `GET /auth/me`
Authenticated. Returns `{ user }`.

### `PUT /auth/profile`
Authenticated. Update name/phone/company/address/avatar.

### `PUT /auth/password`
Authenticated. Body: `{ currentPassword, newPassword }`.

---

## Public (no auth)

### `GET /public/designs?q=&category=&page=&limit=`
Browse published designs.

### `GET /public/designs/categories`
List categories.

### `GET /public/settings`
Public business info (name, tagline, contact, socials).

---

## Designs

### `GET /designs/categories`
List categories (duplicate of public; admin/client use too).

### `GET /designs/:id`
Get one design. Unpublished designs are only visible to admins.

### `GET /me/designs/:id/download`  *(auth required)*
Download the source file. Increments `downloadCount`.

---

## Messages

### `POST /messages/contact`
Public. Send a message from the contact form. Body: `{ name, email, subject, body }`.

### `GET /messages/mine`  *(client)*
List the signed-in client's threads.

### `POST /messages/mine`  *(client)*
Create a thread. Body: `{ subject, body }`.

### `GET /messages/mine/:id`  *(client)*
Read one of your own threads.

### `POST /messages/mine/:id/reply`  *(client)*
Reply to your own thread. Body: `{ body }`.

### `GET /messages`  *(admin)*
List all threads. Query: `status`, `q`, `page`, `limit`.

### `GET /messages/:id`  *(admin)*
Read any thread.

### `POST /messages/:id/reply`  *(admin)*
Reply to any thread. Body: `{ body }`.

### `POST /messages/:id/close`  *(admin)*
Mark a thread closed.

---

## Admin

All require `Authorization: Bearer <admin token>`.

### `GET /admin/overview`
Returns:
```json
{
  "counts": { "designs": 0, "clients": 0, "openMessages": 0 },
  "recentMessages": [...],
  "recentClients": [...],
  "recentLogs": [...],
  "settings": {...}
}
```

### `GET /admin/activity?action=&page=&limit=`
Paginated `ActivityLog`.

### Designs
- `GET /admin/designs?q=&category=&page=&limit=`
- `POST /admin/designs` — multipart form. Fields:
  - `file` (required): design file
  - `title`, `description`, `category`, `price`, `currency`, `tags` (csv), `isPublished`
- `PUT /admin/designs/:id` — update metadata
- `DELETE /admin/designs/:id` — delete (also unlinks file)

### Clients
- `GET /admin/clients?q=&page=&limit=`
- `PUT /admin/clients/:id/active` — body `{ isActive: true|false }`
- `DELETE /admin/clients/:id`

### Settings
- `GET /admin/settings`
- `PUT /admin/settings` — body: any of `businessName`, `tagline`, `contactEmail`, `contactPhone`, `address`, `heroImage`, `aboutText`, `socials`, `notifications`

---

## Examples

```bash
# Login as admin
curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@embroidery.local","password":"ChangeMe123!"}'

# Upload a design
TOKEN=...
curl -s -X POST http://localhost:5000/api/admin/designs \
  -H "Authorization: Bearer $TOKEN" \
  -F file=@/path/to/design.png \
  -F title="Floral Wreath" \
  -F description="Hand-digitized botanical pattern." \
  -F category=floral \
  -F price=12.50
```
