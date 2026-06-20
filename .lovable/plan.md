## Scope

Build a complete admin control center + business operations layer for Favour Computer Services on top of the existing storefront. This is a very large build — I'll deliver it in **3 sequential phases**, each shippable on its own. You approve this plan once, then I execute Phase 1 → 2 → 3 in subsequent turns, pausing only if something requires your input.

---

## Phase 1 — Foundation: Auth, Roles, Schema, Core Admin Shell

**Database (one migration)**
- `app_role` enum + `user_roles` table + `has_role()` security-definer function (per the user-roles security pattern)
- `business_settings` (singleton row: company info, till, paybill, account, payment instructions, address, phones, whatsapp)
- `quotes` (unified pipeline — source: cctv / livestream / product / general / contact; name, email, phone, package, message, status, internal_notes, metadata jsonb)
- `bookings` (live-streaming events: event_type, event_date, event_location, package, requirements, status)
- `pickup_reservations` (order_id, reservation_number, pickup_code, status)
- `service_packages` (kind: cctv|livestream, name, price, description, features[], equipment[], sort_order, active)
- `promotions` (product_id, percent_off, price_override, starts_at, ends_at, active)
- `inventory_movements` (product_id, delta, reason, admin_id)
- `admin_audit_log` (admin_id, action, entity, entity_id, details jsonb)
- Add to `products`: `archived_at`, `is_new_arrival`, `is_on_offer`, `offer_starts_at`, `offer_ends_at`, `offer_percent`, `offer_price`, `images jsonb[]`, `warranty`
- RLS + GRANTs on every table (admin-only writes via `has_role`, public read where appropriate)
- Seed `business_settings` with current values; seed initial CCTV + livestream packages from the existing static data

**Auth & admin gate**
- `_authenticated/` already managed. Add `_authenticated/admin/route.tsx` that gates on `has_role('admin')`
- First-admin bootstrap: server fn that promotes the first signed-in user if no admins exist (one-time)

**Email notifications**
- Set up Lovable Emails infra (check domain → setup_email_infra → scaffold_transactional_email)
- Templates: `quote-submitted-admin`, `booking-submitted-admin`, `quote-received-customer`, `booking-received-customer`, `pickup-confirmation`
- All admin notifications → bensonmurage254@gmail.com

**Admin shell**
- `/admin` layout with sidebar nav (Dashboard, Products, Categories, Brands, Inventory, Quotes, Bookings, Pickups, Services, Promotions, Settings, Audit Log)
- Dashboard with KPI cards (open quotes, low stock, pending pickups, today's bookings)

---

## Phase 2 — Catalog, Inventory, Promotions, Settings

**Products admin** (`/admin/products`)
- Table with search/filter (status, category, condition, stock), bulk actions
- Create/Edit drawer: all fields incl. multi-image upload to Supabase Storage `product-images` bucket, drag-reorder, specs editor, warranty, flags (Featured, New Arrival, Best Seller, On Offer), offer fields
- Archive / Restore / Delete

**Categories & Brands admin**
- CRUD + reorder (sort_order) + brand logo upload to `brand-logos` bucket

**Inventory admin** (`/admin/inventory`)
- Add / reduce / adjust stock (writes `inventory_movements` + updates `products.stock`)
- Low-stock & out-of-stock views
- History per product

**Promotions admin** (`/admin/promotions`)
- CRUD, link to product, % or fixed price, date window
- Server fn computes effective price; cron-style check on read deactivates expired
- Product card & PDP show discount badge, original price, sale price, end date

**Business Settings** (`/admin/settings`)
- One form editing the singleton row
- Header / footer / checkout / contact page all read from settings (no hardcoded payment info anywhere)

---

## Phase 3 — Services, Quotes, Bookings, Pickup, Audit

**Service management** (`/admin/services`)
- CCTV packages CRUD (Home / Small Business / School / Enterprise editable, can add more)
- Live-streaming packages CRUD
- Public CCTV & Live-Streaming pages now read from DB

**Quote forms (public)**
- Per-CCTV-package "Request Quote" button → modal form (name, phone, email, location, package, notes)
- Live-streaming booking form (full event fields)
- Contact form + product inquiry button on PDP — all funnel into `quotes` / `bookings`
- Zod validation, success confirmation UI, email notifications

**Quote & Booking admin**
- `/admin/quotes` list, filter by source/status, detail drawer with status pipeline (New → Contacted → Quoted → Converted/Cancelled), internal notes
- `/admin/bookings` same pattern with livestream-specific fields & status set

**Store pickup**
- Checkout adds Delivery vs Pickup toggle (pickup address shown from settings)
- On order place: generate reservation_number + pickup_code; deduct inventory
- `/admin/pickups` list with Mark Ready / Picked Up / Cancelled
- Customer pickup confirmation email

**Audit trail**
- Helper `logAudit()` called from all admin write server fns
- `/admin/audit` table view with filters

---

## Technical notes

- Stack: TanStack Start server functions (`requireSupabaseAuth` + role check inside handler), Supabase RLS, Lovable Cloud
- Images: Supabase Storage public buckets `product-images`, `brand-logos`
- Emails: Lovable built-in email infra (no external provider)
- No edge functions — all server logic via `createServerFn`
- All admin pages under `_authenticated/admin/` with admin-role beforeLoad gate

---

## What I need from you

Just approve. I'll execute Phase 1 next turn. If you want me to skip a piece (e.g. "skip audit log", "skip promotions"), tell me now.
