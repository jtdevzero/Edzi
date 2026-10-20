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

Users may explicitly delete their remote snapshot from the Cloud Vault screen; local data stays intact. Full account deletion must additionally be handled in the Supabase Auth administration/privacy process.

## Optional AI Sensei edge function
Install `edzi_ai_usage.sql` and deploy `functions/hunter-coach/index.ts` as a Supabase Edge Function with JWT verification enabled. Set server-only secrets: ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, EDZI_ALLOWED_ORIGIN=https://jtdevzero.github.io. Never put secrets in EXPO_PUBLIC_* values. The browser uploads minimal counts only after explicit consent for each request. Five generations per user per UTC day are enforced by a privileged SQL RPC. Requires a live two-user authorization test, rate-limit check, provider privacy disclosure and administrator deployment.

## Optional guild multiplayer (authenticated, manual scores)
Install `edzi_guilds.sql` in the Supabase SQL Editor, then test with **two distinct authenticated accounts**:
- One user creates a guild and shares the randomly generated invite code.
- Another joins with the invite code, and both see only their own guild.
- Other unrelated users **must not** see guild names, members or weekly aggregates.
- Members choose a public nickname. Each user can belong to **one** guild.
- The weekly activity totals are self-reported/locally calculated and **only transmitted on manual button press**. Do not treat them as verified competition results. No body composition or personal training logs are uploaded through this feature.
- Leaving a guild deletes own membership and cascade-deletes shared weekly entries. Empty abandoned guilds may require a retention policy and admin cleanup.
- Run abuse/rate-limit checks for guild creation and invitation guessing before enabling in a public production app.
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are client-public, but do **not** configure them before running and verifying SQL RLS policies.
