# Database schema (MongoDB / Mongoose)

All collections are in the `embroidery_site` database by default.

## `users`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | String | required |
| `email` | String | unique, lowercase |
| `passwordHash` | String | bcrypt |
| `role` | `'admin' \| 'client'` | indexed |
| `phone`, `company`, `address`, `avatar` | String | optional |
| `isActive` | Boolean | default `true` (admin can disable) |
| `lastLoginAt` | Date | |
| `createdAt`, `updatedAt` | Date | |

Indexes: `email` (unique), `role`.

## `designs`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `title` | String | text-searched |
| `description` | String | text-searched |
| `category` | enum | `floral`, `geometric`, `lettering`, `animals`, `logos`, `religious`, `kids`, `custom` |
| `tags` | [String] | text-searched |
| `price` | Number | ≥ 0 |
| `currency` | String | default `USD` |
| `fileUrl`, `fileName`, `fileMime`, `fileSize` | String/Number | uploaded via Multer |
| `thumbnailUrl` | String | optional |
| `uploadedBy` | ObjectId → User | admin who uploaded |
| `isPublished` | Boolean | default `true` |
| `downloadCount` | Number | default `0` |

Indexes: text index on `title`, `description`, `tags`; `category` indexed.

## `messages`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `client` | ObjectId → User | the thread owner (always a real user doc) |
| `subject` | String | |
| `body` | String | original message |
| `status` | `'open' \| 'replied' \| 'closed'` | |
| `source` | `'dashboard' \| 'contact'` | |
| `contactName`, `contactEmail` | String | populated for `contact` source |
| `replies` | [{ from, author, body, createdAt }] | thread |
| `lastReplyAt` | Date | |

Indexes: `client`, `status`.

## `site_settings`
A single doc with `singletonKey='global'` containing business info, contact info, socials, and notification flags.

## `activitylogs`
Append-only audit log. Every privileged controller call writes one entry.

| Field | Type |
|---|---|
| `actor` | ObjectId → User (nullable) |
| `actorRole` | `admin` / `client` / `anonymous` |
| `action` | e.g. `design.create`, `auth.login`, `message.reply` |
| `targetType`, `targetId` | string ids |
| `meta` | Object |
| `ip` | string |
| `createdAt` | Date (indexed) |

---

## Schema (Mongoose) quick reference

- `backend/src/models/User.js`
- `backend/src/models/Design.js`
- `backend/src/models/Message.js`
- `backend/src/models/SiteSettings.js`
- `backend/src/models/ActivityLog.js`

To re-derive the schema diagrams above, run:

```bash
cd backend
npm install
node -e "
const m = ['User','Design','Message','SiteSettings','ActivityLog']
  .map(n => require('./src/models/' + n.charAt(0).toLowerCase() + n.slice(1)));
m.forEach(M => console.log(M.modelName, Object.keys(M.schema.paths)));
"
```
