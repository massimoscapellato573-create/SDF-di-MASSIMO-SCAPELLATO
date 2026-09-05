// Edge Function: riceve da Stripe la conferma che un pagamento è andato a
// buon fine e segna la richiesta come "confermata". Questa è la fonte di
// verità per i pagamenti online: la pagina conferma.html si limita a
// leggere lo stato, non lo cambia mai da sola.
//
// Va collegata su https://dashboard.stripe.com/webhooks a un endpoint che
// punta a questa funzione, in ascolto sull'evento "checkout.session.completed".
//
// IMPORTANTE: a differenza di create-checkout, questa funzione va deployata
// con la verifica del JWT DISATTIVATA (Stripe la chiama direttamente, senza
// alcuna chiave Supabase) — la sicurezza qui è garantita dalla firma Stripe,
// controllata sotto con STRIPE_WEBHOOK_SECRET.
//
// Variabili d'ambiente richieste (Project Settings > Edge Functions > Secrets):
//   STRIPE_SECRET_KEY      — stessa chiave usata da create-checkout
//   STRIPE_WEBHOOK_SECRET  — "Signing secret" mostrato da Stripe alla creazione del webhook (whsec_...)
// (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono già disponibili di default)

import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSecret,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error("Firma webhook non valida:", err);
    return new Response(`Firma non valida: ${err}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const richiestaId = session.metadata?.richiesta_id;
    if (richiestaId && session.payment_status === "paid") {
      const { error } = await supabase
        .from("richieste")
        .update({ stato: "confermata" })
        .eq("id", richiestaId)
        .eq("stato", "accettata");
      if (error) console.error("Errore aggiornando la richiesta:", error);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
