// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeText, renderToSvg } from "jsr:@openjs/denoqr";

type Payload = {
  email: string;
  agree: boolean;            // terms accepted
  newsletter: boolean;
  game: string;
  difficulty: string;
  score: number;
  description?: string;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "CyberTales <noreply@yourdomain.tld>";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function bad(msg: string, status = 400) {
  return new Response(JSON.stringify({ ok: false, error: msg }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method !== "POST") return bad("Use POST", 405);

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return bad("Invalid JSON");
  }

  const email = (payload.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("Invalid email");
  if (!payload.agree) return bad("Terms must be accepted");

  // 1) Upsert player
  {
    const { error } = await supabaseAdmin
      .from("players")
      .upsert({
        email,
        terms_accepted: true,
        newsletter: !!payload.newsletter,
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" });
    if (error) return bad(`DB upsert players: ${error.message}`, 500);
  }

  // 2) Insert score (trigger will increment submit_count)
  const { data: inserted, error: scoreErr } = await supabaseAdmin
    .from("scores")
    .insert({
      email,
      game: payload.game,
      difficulty: payload.difficulty,
      score: payload.score,
    })
    .select("id, qr_token")
    .single();

  if (scoreErr || !inserted) return bad(`DB insert score: ${scoreErr?.message}`, 500);

  const { id: scoreId, qr_token } = inserted;

  // 3) Build QR payload (minimal, just a token)
  const qrPayload = JSON.stringify({ t: qr_token }); // keep it small & privacy-friendly
  const svg = renderToSvg(encodeText(qrPayload), { pixelSize: 4 });

  // 4) Send email via Resend
  const subject = `Il tuo punteggio: ${payload.score} – ${payload.game} (${payload.difficulty})`;
  const desc = payload.description ??
    "Grazie per aver giocato con CyberTales! Mostra il QR allo staff per le attività successive.";

  const html = `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height:1.5">
    <h2>${subject}</h2>
    <p>${desc}</p>
    <ul>
      <li><strong>Gioco:</strong> ${payload.game}</li>
      <li><strong>Difficoltà:</strong> ${payload.difficulty}</li>
      <li><strong>Punteggio:</strong> ${payload.score}</li>
      <li><strong>Token:</strong> ${qr_token}</li>
    </ul>
    <p>QR da mostrare allo staff:</p>
    ${svg}
  </div>`.trim();

  const mailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [email],
      subject,
      html,
    }),
  });

  if (!mailRes.ok) {
    const text = await mailRes.text().catch(() => "");
    return bad(`Email send failed: ${text || mailRes.status}`, 502);
  }

  return new Response(
    JSON.stringify({ ok: true, scoreId, qr_token }),
    { headers: { "content-type": "application/json" } },
  );
});
