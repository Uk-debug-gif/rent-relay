// Deploy as Supabase Edge Function: notify-new-user
// Configure secrets: RENTRELAY_WEBHOOK_SECRET and RESEND_API_KEY
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const expected = Deno.env.get("RENTRELAY_WEBHOOK_SECRET");
  const supplied = req.headers.get("x-rentrelay-webhook-secret");
  if (!expected || supplied !== expected) return new Response("Unauthorized", { status: 401 });
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return new Response("Email provider not configured", { status: 500 });
  const payload = await req.json();
  const user = payload.record;
  if (!user?.id) return new Response("Missing user record", { status: 400 });
  const phone = user.phone ?? "Not provided";
  const created = user.created_at ?? new Date().toISOString();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "RentRelay <onboarding@resend.dev>",
      to: ["pumakant246@gmail.com"],
      subject: "New RentRelay user registered",
      text: `A new user registered on RentRelay.\\nPhone: ${phone}\\nUser ID: ${user.id}\\nCreated at: ${created}`
    })
  });
  if (!response.ok) return new Response(await response.text(), { status: 502 });
  return new Response("Notification sent", { status: 200 });
});
