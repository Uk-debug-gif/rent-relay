# RentRelay — project setup and status

RentRelay is a campus peer-to-peer rental marketplace prototype. The frontend includes a sample catalogue, category browsing, search, sorting, item details, a demo rental-price calculator, signup/login screens and a listing form.

## Current authentication behaviour

- Signup collects a mobile number, email address and full name.
- **Verification code is sent to the email address, not by SMS.**
- The mobile number is saved as profile metadata but is **not verified**.
- Returning users log in with an email verification code.
- A verified account receives a generated username in the profiles table.
- Listing submission requires an authenticated account and connected Supabase project.

## Step 1 — Create a Supabase project

1. Open https://supabase.com/ and create an account.
2. Create a new project and choose a strong database password. Save it privately.
3. Wait until the project is ready.
4. In Project Settings → API, copy the **Project URL** and the **publishable/anon public key**.
5. Never share the database password, service-role key or secret keys. Do not put them in frontend JavaScript.

## Step 2 — Create the database tables

1. In the Supabase dashboard, open SQL Editor.
2. Open this repository's `supabase/schema.sql`.
3. Copy the complete SQL into a new SQL query and click Run.
4. Confirm that `listings` and `profiles` tables exist in Table Editor.

RLS is enabled. Public visitors can read listings. Authenticated users can insert listings only when `owner_id` matches their own auth user ID. Owners can update/delete their own listings. Users can read only their own profile.

## Step 3 — Configure email OTP

1. Open Authentication → Sign In / Providers → Email and enable email authentication.
2. Configure signup confirmation and login email OTP templates to include the token, e.g. `Your RentRelay verification code is {{ .Token }}`.
3. For real users, configure a custom SMTP provider under Authentication → SMTP Settings. Supabase's default sender has restrictive testing limits.
4. Add the GitHub Pages URL to Authentication → URL Configuration → Site URL / Redirect URLs as appropriate.

## Step 4 — Connect the frontend

In `app.js`, replace only `SUPABASE_URL` and `SUPABASE_ANON_KEY` with the project's public values. Never use the service-role key in `app.js`. Commit the change, wait for GitHub Pages to deploy and hard-refresh the website.

## Step 5 — Optional admin email on new verified users

1. Deploy `supabase/functions/notify-new-user/index.ts` as an Edge Function named `notify-new-user`.
2. Set Edge Function secrets `RESEND_API_KEY` and `RENTRELAY_WEBHOOK_SECRET`.
3. Verify a sender domain with Resend and use that verified sender address in the function.
4. Create a Database Webhook on schema `auth`, table `users`, event **UPDATE**, targeting the Edge Function URL.
5. Add header `x-rentrelay-webhook-secret` with the same secret value.

The function notifies only when email changes from unverified to verified. Never put the Resend key or webhook secret in frontend code or GitHub.

## Not implemented yet

- SMS OTP / verified mobile numbers.
- Real booking requests, owner approval, cancellations or availability calendar.
- Online payments, refunds, deposits or dispute handling.
- Listing image upload/storage.
- Production-grade identity checks, moderation and abuse reporting.
- Renter-owner messaging.

The item detail request button is a **demo only**. It does not send a booking request or reserve an item. Sample catalogue items are not real offers.

## Test checklist

- [ ] Home page loads without a JavaScript console error.
- [ ] Navigation and mobile menu work.
- [ ] Categories and subcategory filters work.
- [ ] Search and price sorting work.
- [ ] Product cards open correct item details.
- [ ] Rental-day controls update total and return date.
- [ ] Log in opens login; signup link opens signup.
- [ ] List an item opens signup/login when signed out.
- [ ] After Supabase setup, email OTP signup/login succeeds.
- [ ] Authenticated user can create a listing and it appears in catalogue.
- [ ] Unauthenticated user cannot insert a listing directly (RLS check).
- [ ] Admin email is sent only after email verification and webhook setup.

## Deploy

GitHub Pages: https://uk-debug-gif.github.io/rent-relay/

After changes reach `main`, wait for GitHub Pages to publish. On desktop, use `Command + Shift + R` for a hard refresh.
