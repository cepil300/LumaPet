# LumaPet Cloud Save Security Specification

## 1. Data Invariants
1. A document in `/cloudSaves/{userId}` can only be read (`get`), created, updated, or deleted when `request.auth != null` and `userId == request.auth.uid`.
2. Collection-wide listing (`allow list`) on `/cloudSaves` is explicitly denied (`false`) to prevent any cross-user enumeration or query scraping.
3. All writes require verified Google authentication (`request.auth.token.email_verified == true`) and a valid `ownerId` matching `request.auth.uid`.
4. `ownerId` and `createdAt` are immutable after creation; `createdAt` on create and `updatedAt` on create/update must equal `request.time`.
5. No ghost/shadow fields are allowed (`hasAll` + `hasOnly` on top-level document and nested `inventory` and `cooldownsUntil` maps; `affectedKeys().hasOnly(...)` on update).
6. Every string field enforces strict `.size()` bounds and enum allowlists; every array enforces `.size()` limits and `.hasOnly(...)` element allowlists.

## 2. Adversarial ("Dirty Dozen") Payloads
1. Unauthenticated read/write to `/cloudSaves/uid1` -> `PERMISSION_DENIED`.
2. Cross-user read (`get`) by `uid2` on `/cloudSaves/uid1` -> `PERMISSION_DENIED`.
3. Collection `list` query on `/cloudSaves` by any signed-in user -> `PERMISSION_DENIED`.
4. Spoofed `ownerId` (`ownerId: "uid2"` inside `/cloudSaves/uid1`) -> `PERMISSION_DENIED`.
5. Unverified email token (`email_verified: false`) writing to `/cloudSaves/uid1` -> `PERMISSION_DENIED`.
6. Ghost field injection (`isAdmin: true` or `extraField: 1`) on create or update -> `PERMISSION_DENIED`.
7. Oversized `name` string (> 20 chars) or empty string (`""`) -> `PERMISSION_DENIED`.
8. Oversized or invalid `userId` document ID containing `.` or `/` or >128 chars -> `PERMISSION_DENIED`.
9. Client-forged `createdAt` or `updatedAt` timestamp not equal to `request.time` -> `PERMISSION_DENIED`.
10. Mutating immutable `createdAt` or `ownerId` on update -> `PERMISSION_DENIED`.
11. Unbounded or arbitrary string element injection into `unlockedAccessories` -> `PERMISSION_DENIED`.
12. Type poisoning (e.g. `coins: "999999"` string instead of number, or negative `hunger: -50`) -> `PERMISSION_DENIED`.
