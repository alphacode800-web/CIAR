# CIAR Super Platform Architecture

## Implemented Foundation

- **Frontend route:** `/super-platform`
- **Admin route:** `/admin/super-platform`
- **APIs:** `/api/super-platform/modules`, `/api/super-platform/banners`, `/api/super-platform/analytics`
- **Database models:** `PlatformModule`, `PlatformBanner`, `AdminMember`, plus dedicated listing tables for each visible business module.

## Module Visibility Rules

- 12 business modules are seeded as `VISIBLE`.
- 3 internal modules are seeded as `HIDDEN`.
- Hidden modules are excluded from the public homepage banners by default and managed from admin.

## Banner Rules

- One banner per module.
- Three images per banner (`imageUrl1`, `imageUrl2`, `imageUrl3`).
- Localized content fields for Arabic and English.

## Admin Permissions

- Users with `Role.ADMIN` are authorized.
- Optional extra admins/managers/editors can be managed in `AdminMember`.

## Storage Readiness

- Banner/media fields use URL-based storage and are compatible with S3/Cloudinary uploads via signed upload flow.
