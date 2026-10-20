# Edzi Cloud Vault (opt-in, manual transfer only)

No third-party data access or cloud storage is enabled by default.
To activate, the repository owner must provision a private Supabase project, review
the terms for personal fitness data, and execute `edzi_snapshots.sql`.

On GitHub Actions web builds define:
- EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
- EXPO_PUBLIC_SUPABASE_ANON_KEY=<publishable key>

Both EXPO_PUBLIC_* values are distributed in the public client bundle. Never put a service-role
key, database password, SMTP secret or personal fitness data in this repository.

Configure Supabase Auth email OTP (six/eight-digit codes) and RLS as in the SQL file.
The user must explicitly log in and click either upload or restore after a confirmation.
Local storage remains canonical. Upload uses optimistic revision matching and can fail
on a conflict; never silently override concurrent writes.
Tokens remain in memory only: closing or refreshing a tab requires new sign-in.
Data is transmitted via TLS but **not end-to-end encrypted**; users should understand
their cloud provider can technically access their data. Do not enable for sensitive users
without a privacy/legal review, removal path and verified backup/restore test.
This release is **not** automatic multi-device synchronization.
