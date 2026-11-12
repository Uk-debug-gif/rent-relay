# RentRelay — project setup and current status

RentRelay is a campus peer-to-peer rental marketplace prototype. It currently provides a sample catalogue, category and subcategory browsing, keyword search, daily-price filters, sorting, item detail pages, a rental-cost calculator, email OTP signup/login, and a public student listing form.

## What works in the frontend

- Browse the sample catalogue by category and subcategory.
- Search item titles, categories, conditions and descriptions.
- Filter by minimum and maximum daily price; sort by price or recent live listings.
- View item details and calculate an estimated rental total.
- Submit a listing without signing in, including a photo and pickup location, once Supabase is configured.
- Create an account or sign in using email OTP. Mobile number is collected as contact information but is not SMS-verified.
- Live student listings are loaded from Supabase when the project is connected.

## Important prototype limitations

- Catalogue entries included in the source are **demo/sample items**, not confirmed real offers.
- The item detail “Request to rent” control is a **calculator/demo interaction only**. It does not contact an owner, create a booking, or reserve availability.
- Online payments, deposits, refunds, booking approvals, cancellations, messaging, ratings/reviews, moderation workflows and dispute handling are not implemented.
- Email OTP verifies the email address only. A mobile number is not verified.
- Anonymous listings are allowed by the current database policy. The listing form does not establish who owns the item; do not treat a listing as verified.
- Public listing photos are served from a public Supabase Storage bucket. Do not upload sensitive or private images.

## 1. Create a Supabase project

1. Create a project at https://supabase.com/.
2. In Project Settings → API, copy the Project URL and the publishable/anon public key.
3. Never put a database password, service-role key or secret key in frontend code or GitHub.

## 2. Create / update the database

1. Open Supabase SQL Editor.
2. Run the complete contents of `supabase/schema.sql`.
3. Confirm that `listings` and `profiles` tables exist.
4. The schema enables row-level security, allows public reads and anonymous/authenticated listing inserts, and allows authenticated owners to update/delete only rows associated with their user ID. Anonymous rows have no owner account.

## 3. Configure email OTP

1. Open Authentication → Sign In / Providers → Email and enable email authentication.
2. Configure email templates to include the OTP token.
3. For real users, configure a custom SMTP provider and appropriate rate limits.
4. Add the GitHub Pages URL to Authentication → URL Configuration / Redirect URLs.

## 4. Connect the frontend

In `app.js`, replace only `SUPABASE_URL` and `SUPABASE_ANON_KEY` with the project's public URL and public anon/publishable key. Never use the service-role key in browser code. Commit the change and wait for GitHub Pages to deploy.

## 5. Optional admin email notification

The optional Supabase Edge Function lives in `supabase/functions/notify-new-user/`. Configure these server-side Supabase Function Secrets: `RENTRELAY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RENTRELAY_ADMIN_EMAIL` and `RENTRELAY_FROM_EMAIL` (a sender address verified with your email provider). Keep all values in Supabase Function Secrets, never in frontend code. The notification intentionally avoids including the user's mobile number or internal user ID.

## Pre-launch checklist

- [ ] Configure Supabase URL and public key.
- [ ] Run the latest `supabase/schema.sql`.
- [ ] Configure email OTP and production SMTP.
- [ ] Test anonymous listing submission and image upload.
- [ ] Test signup, login, and profile creation.
- [ ] Test category/search/price filters on desktop and mobile.
- [ ] Add a real booking-request flow with owner approval and availability.
- [ ] Add verified ownership/contact controls, reporting and moderation before opening to a wider campus.
- [ ] Add payment, refund and dispute processes only after the rental workflow and policies are defined.
- [ ] Run browser, accessibility, security and performance testing on real devices.

## Deploy

GitHub Pages: https://uk-debug-gif.github.io/rent-relay/

After changes reach `main`, wait for GitHub Pages to publish. Hard-refresh to bypass cached files (Mac: Command + Shift + R).


## Terms & Conditions acceptance

- New account signup requires an unticked, affirmative checkbox agreeing to `terms.html` and its Privacy Notice before an email OTP can be sent.
- Signup records the Terms version and acceptance timestamp in Supabase Auth user metadata; the profile trigger copies these values to `profiles`.
- Existing accounts can still sign in without re-accepting. If the terms materially change, a proper re-consent flow should be implemented.
- The legal page is a working draft, not a lawyer-certified compliance document. Before public/commercial launch, fill the operator's legal identity, address, customer support and grievance officer details and obtain Indian legal review.
- After changing the schema, run the latest `supabase/schema.sql` in Supabase SQL Editor.
