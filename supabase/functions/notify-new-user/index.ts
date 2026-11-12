// Deploy as Supabase Edge Function: notify-new-user
// Configure secrets: RENTRELAY_WEBHOOK_SECRET and RESEND_API_KEY
// Webhook: schema auth, table users, event UPDATE (it only reacts when the email is newly verified).
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const expected = Deno.env.get("RENTRELAY_WEBHOOK_SECRET");
  const supplied = req.headers.get("x-rentrelay-webhook-secret");
  if (!expected || supplied !== expected) return new Response("Unauthorized", { status: 401 });
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const adminEmail = Deno.env.get("RENTRELAY_ADMIN_EMAIL");
  const fromEmail = Deno.env.get("RENTRELAY_FROM_EMAIL");
  if (!resendKey || !adminEmail || !fromEmail) return new Response("Email provider or recipient not configured", { status: 500 });
  const payload = await req.json();
  const user = payload.record;
  if (!user?.id) return new Response("Missing user record", { status: 400 });
  // Ignore every update except "email just got verified" (so logins don't send emails).
  const justVerified = !!user.email_confirmed_at && !payload.old_record?.email_confirmed_at;
  if (payload.type !== "UPDATE" || !justVerified) return new Response("Ignored", { status: 200 });
  const meta = user.raw_user_meta_data ?? {};
  const created = user.created_at ?? new Date().toISOString();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `RentRelay <${fromEmail}>`,
      to: [adminEmail],
      subject: "New RentRelay user registered",
      text: `A new user verified their email on RentRelay.\nName: ${meta.full_name ?? "Not provided"}\nEmail: ${user.email ?? "Not provided"}\nCreated at: ${created}`
    })
  });
  if (!response.ok) return new Response(await response.text(), { status: 502 });
  return new Response("Notification sent", { status: 200 });
});
