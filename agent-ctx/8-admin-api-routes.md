# Task: Create Admin Dashboard API Routes

**Status**: ✅ Completed

## Summary

Created 6 new admin API routes for the CIAR admin dashboard. All routes follow existing project conventions (Zod validation, `@/lib/db` import, error handling, JSDoc comments).

## Files Created

### 1. `/api/admin/analytics` (GET)
- Returns comprehensive dashboard analytics
- Project counts: total, published, featured, draft
- Total views across all projects
- Translation count, contact submission count, user count
- Projects by category breakdown (raw SQL for SQLite BigInt compatibility)
- Recent contact submissions (last 10)
- Top 5 projects by views (with translated names)
- Monthly project creation trend (last 6 months)

### 2. `/api/admin/activity-log` (GET)
- Generates activity log from existing database records
- Aggregates: projects, contact submissions, translations, users, media
- Supports `limit` query param (default 50, max 100)
- Returns `{ id, type, message, timestamp, user? }` entries sorted by timestamp desc

### 3. `/api/admin/contacts` (GET, DELETE)
- **GET**: Paginated contact submissions with search and date filtering
  - Params: `page`, `limit`, `search` (name/email/subject), `dateFrom`, `dateTo`
  - Returns: `{ submissions, total, page, totalPages }`
- **DELETE**: Delete submission by `?id=xxx`
  - Validates existence before deletion, returns 404 if not found

### 4. `/api/admin/users` (GET)
- Lists all users excluding passwords
- Returns: `{ users: [...] }` with id, name, email, role, avatar, createdAt, updatedAt

### 5. `/api/admin/home-sections` (GET, PUT)
- **GET**: Returns home_sections setting (defaults to 6 predefined sections)
- **PUT**: Validates and saves section configuration
- Each section: `{ id, name, visible, order }`
- Uses existing settings service for persistence

### 6. `/api/admin/bulk-actions` (POST)
- Actions: `publish`, `unpublish`, `feature`, `unfeature`, `delete`
- Validates projectIds array (1-100 items)
- Verifies projects exist before operation
- Returns: `{ success, affected }`

## Technical Notes
- Used `$queryRaw` (not `$queryRawUnsafe`) for category grouping due to SQLite BigInt serialization
- All mutations validated with Zod `safeParse` returning 400 with `flatten()` details
- All routes have try/catch with 500 fallback and console.error logging
- ESLint: 0 errors (pre-existing chart-bar.tsx error is unrelated)
