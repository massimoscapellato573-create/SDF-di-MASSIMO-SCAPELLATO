// Edge Function: invia una notifica push a tutti i dispositivi di Pietro
// quando arriva una nuova richiesta di appuntamento da un cliente.
//
// Va collegata a una Database Webhook su Supabase (tabella "richieste",
// evento INSERT) — vedi le istruzioni fornite a parte per il collegamento.
//
// Variabili d'ambiente richieste (Project Settings > Edge Functions > Secrets):
//   VAPID_PUBLIC_KEY   — stessa chiave pubblica usata in supabase-config.js
//   VAPID_PRIVATE_KEY  — chiave privata, NON va mai nel sito
//   VAPID_SUBJECT      — es. "mailto:pietro.salice01@gmail.com"
// (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono già disponibili di default)

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT")!,
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!
);

const fmtOra = (d: string) => {
  const dt = new Date(d + "T00:00:00");
  return new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long" }).format(dt);
};

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    // Notifica solo per le nuove richieste vere dei clienti, non per i
    // blocchi che Pietro crea da sé (non serve avvisarlo di sé stesso).
    if (!record || record.stato !== "in_attesa") {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const { data: subs, error: subsErr } = await supabase
      .from("push_subscriptions")
      .select("*");
    if (subsErr) throw subsErr;
    if (!subs || !subs.length) {
      return new Response(JSON.stringify({ sent: 0, reason: "no subscriptions" }), { status: 200 });
    }

    const { count } = await supabase
      .from("richieste")
      .select("id", { count: "exact", head: true })
      .eq("stato", "in_attesa");

    const title = "darko.tats — nuova richiesta";
    const body = `${record.nome || "Un cliente"} vorrebbe ${fmtOra(record.giorno)} alle ${record.ora}`;
    const payloadStr = JSON.stringify({ title, body, url: "/admin.html", badgeCount: count ?? 1 });

    let sent = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payloadStr
        );
        sent++;
      } catch (err) {
        // Iscrizione scaduta o non più valida: la rimuoviamo.
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }

    return new Response(JSON.stringify({ sent }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
