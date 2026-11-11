# RentRelay setup

## What is live in the frontend
- Mobile-number-only login screen and OTP verification flow (Supabase Auth).
- Separate List an Item form. A signed-in user can save a listing to Supabase.
- Product cards open details; Enter/Space also activates a focused card.
- Demo catalogue remains sample data until live listings are wired into the browse view.

## Required setup before real OTP/login works
1. Create a Supabase project.
2. In Authentication → Sign In / Providers, enable Phone.
3. Configure an SMS provider in Supabase Auth (for example Twilio). SMS provider charges may apply.
4. Copy the Project URL and anon/public key into the two constants at the top of `app.js`. Never put the service_role key in frontend code.
5. Run `supabase/schema.sql` in the Supabase SQL Editor. It creates the listings table and row-level security policies.

## Admin email notification for first-time registrations
1. Deploy `supabase/functions/notify-new-user/index.ts` as an Edge Function named `notify-new-user`.
2. Add Edge Function secrets `RESEND_API_KEY` and `RENTRELAY_WEBHOOK_SECRET`. Use a strong random webhook secret; do not commit either secret to GitHub.
3. In Supabase Database → Webhooks, create a webhook on schema `auth`, table `users`, event `INSERT`, pointing to the deployed function URL. Add header `x-rentrelay-webhook-secret` with the same secret.
4. Configure a verified sender domain in Resend and replace the example `from` address in the function with that verified sender.

The webhook runs only when a new auth user row is inserted, not on later logins. The email includes the phone number, user ID and registration time; do not add OTPs or passwords.

## Important
The public GitHub Pages site cannot keep private server keys. The frontend currently has placeholders, so real OTP and database writes remain disabled until the setup above is completed. This project is a prototype, not yet a production-ready marketplace.
