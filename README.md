# RentRelay — project setup and current status

RentRelay is a campus peer-to-peer rental marketplace prototype. It currently provides a sample catalogue, category and subcategory browsing, keyword search, daily-price filters, sorting, item detail pages, a rental-cost calculator, email OTP signup/login, and a public student listing form.

## What works in the frontend

- Browse the sample catalogue by category and subcategory.
- Search item titles, categories, conditions and descriptions.
- Filter by minimum and maximum daily price; sort by price or recent live listings.
- View item details and calculate an estimated rental total.
- Submit a public community listing without signing in, including a photo and pickup location; signed-in listings retain the member user ID.
- Create an account or sign in using email OTP. Mobile number is collected as contact information but is not SMS-verified.
- Live student listings are loaded from Supabase when the project is connected.

## Important prototype limitations

- Catalogue entries included in the source are **demo/sample items**, not confirmed real offers.
- The item detail rental calculator is an **estimate only**. It does not contact an owner, create a booking, or reserve availability.
- Online payments, deposits, refunds, booking approvals, cancellations, messaging, ratings/reviews, moderation workflows and dispute handling are not implemented.
- Email OTP verifies the email address only. A mobile number is not verified.
- Anonymous listings are allowed by the current database policy. Signed-in listings are associated with the member account, but identity and item ownership are not independently verified.
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

## 4. Frontend connection

The current `main` branch is already configured with this project URL and its public publishable key. Never put a service-role key or database password in browser code. If you rotate the publishable key, update `SUPABASE_ANON_KEY` in `app.js` and commit the change.

## 5. Optional admin email notification

The optional Supabase Edge Function lives in `supabase/functions/notify-new-user/`. Configure these server-side Supabase Function Secrets: `RENTRELAY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RENTRELAY_ADMIN_EMAIL` and `RENTRELAY_FROM_EMAIL` (a sender address verified with your email provider). Keep all values in Supabase Function Secrets, never in frontend code. The notification intentionally avoids including the user's mobile number or internal user ID.

## Pre-launch checklist

- [x] Configure Supabase URL and public publishable key in the frontend.
- [x] Create/update `listings`, `profiles`, policies, triggers and the `listing-images` bucket in Supabase.
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


## Current user experience

- Live community listings are loaded from Supabase and are prioritised in the featured section; demo examples remain clearly labelled.
- A signed-in member's listing stores their Auth user ID; anonymous community listings store no owner ID.
- Signed-in members can sign out from the header.
- The detail page calculates an estimated rental total only. Booking requests, owner contact, availability, payment, messaging and dispute handling are not live.
- Frontend JavaScript syntax and key UI wiring were checked after the latest changes. A real browser/device test and end-to-end signup/listing test are still required.
