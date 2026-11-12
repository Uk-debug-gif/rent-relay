# RentRelay setup

## What is live in the frontend
- Browse by category → subcategory → item details page (sample listings).
- Sign up with **mobile number → email → full name → "Verify email"**. A code is emailed (Supabase email OTP).
  When the code is verified the user gets a **random username** (e.g. `student_48213`) created by the database.
- Log in with email + emailed code.
- A signed-in user can save a listing to Supabase (it then shows in the browse pages).
- The mobile number is saved on the profile but is **not** verified by SMS.

## Setup before real login works
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor (listings table + profiles table + username trigger).
3. Authentication → Sign In / Providers → **Email**: enabled, "Confirm email" ON.
4. Authentication → Emails → Templates: edit **both** "Confirm signup" and "Magic Link" so the email body contains `{{ .Token }}`
   (for example: `Your RentRelay code is {{ .Token }}`). New users receive "Confirm signup"; returning users receive "Magic Link".
5. Authentication → SMTP Settings: set up a **custom SMTP** (for example Resend). Supabase's built-in email sender is only for testing
   (very low hourly limit and it only delivers to your own team's addresses), so real users will not receive codes without this.
6. Copy the Project URL and anon/public key into the two constants at the top of `app.js`. Never put the service_role key in frontend code.

## Admin email notification for new verified users (optional)
1. Deploy `supabase/functions/notify-new-user/index.ts` as an Edge Function named `notify-new-user`.
2. Add Edge Function secrets `RESEND_API_KEY` and `RENTRELAY_WEBHOOK_SECRET` (strong random value; never commit them).
3. Database → Webhooks → create a webhook on schema `auth`, table `users`, event **UPDATE**, pointing to the function URL,
   with header `x-rentrelay-webhook-secret` set to the same secret. The function ignores everything except "email just verified".
4. Use a verified sender domain in Resend and replace the example `from` address.
The email includes name, email, mobile (unverified), user ID and time; never OTPs or passwords.

## Important
The public GitHub Pages site cannot keep private server keys. Until the two constants in `app.js` are filled, login and listing saves stay disabled.
This project is a prototype, not yet a production-ready marketplace.
