# LifePatch Security Specification

## Data Invariants
1. A user's profile (`/users/{userId}`) can only be created, read, updated, or deleted by the authenticated user whose `request.auth.uid == userId`.
2. A user's emergency contacts (`/users/{userId}/contacts/{contactId}`) can only be accessed or modified by that same authenticated user (`request.auth.uid == userId`), and the document's `userId` must equal `request.auth.uid`.
3. A user's safety events (`/users/{userId}/safetyEvents/{eventId}`) can only be created, listed, and read by that authenticated user (`request.auth.uid == userId`), preventing any cross-user data access or surveillance.
4. Users cannot modify another user's profile or inject orphaned contacts or events into another user's subcollections.
5. Unauthenticated callers are strictly blocked from reading or writing any data.

6. A user's real-time GPS location (`/users/{userId}/location/{locationDoc}`) can only be written, updated, or deleted by the owner (`request.auth.uid == userId`). It can only be read by the owner or by an authorized emergency contact when `isLiveSharing == true`. Arbitrary users are strictly blocked.
7. Safety events cannot be modified or deleted by anyone once logged (append-only audit log).

## Dirty Dozen Payloads & Test Scenarios
1. **Unauthenticated Read Profile**: Request without auth token to `/users/user123` -> PERMISSION_DENIED.
2. **Cross-User Profile Read**: Auth user `alice` attempting to read `/users/bob` -> PERMISSION_DENIED.
3. **Cross-User Profile Write**: Auth user `alice` attempting to write `/users/bob` -> PERMISSION_DENIED.
4. **Cross-User Contact Ingestion**: Auth user `alice` attempting to add a contact to `/users/bob/contacts/c1` -> PERMISSION_DENIED.
5. **Cross-User Contact Read**: Auth user `alice` attempting to read `/users/bob/contacts/c1` -> PERMISSION_DENIED.
6. **Cross-User Safety Event Read**: Auth user `alice` attempting to read `/users/bob/safetyEvents/e1` -> PERMISSION_DENIED.
7. **Cross-User Location Eavesdropping**: Auth user `alice` attempting to read `/users/bob/location/latest` without guardian authorization -> PERMISSION_DENIED.
8. **Cross-User Location Spoofing**: Auth user `alice` attempting to write GPS coordinates into `/users/bob/location/latest` -> PERMISSION_DENIED.
9. **Unauthenticated Location Access**: Anonymous request reading `/users/alice/location/latest` -> PERMISSION_DENIED.
10. **Corrupt Coordinate Range Poisoning**: Writing latitude > 90.0 or longitude > 180.0 into `/users/alice/location/latest` -> PERMISSION_DENIED.
11. **Tampering with Safety Events**: Attempting update or delete on `/users/alice/safetyEvents/e1` -> PERMISSION_DENIED.
12. **Owner Authorized Location Write & Read**: Owner `alice` reading and updating valid GPS coordinates to `/users/alice/location/latest` -> PERMISSION_ALLOWED.
