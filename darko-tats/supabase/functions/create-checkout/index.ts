// Edge Function: crea una pagina di pagamento Stripe per l'acconto di una
// richiesta già accettata da Pietro. Su quella pagina (ospitata da Stripe,
// non dal nostro sito) il cliente può pagare con carta, Apple Pay o Google
// Pay — Stripe mostra da solo i pulsanti giusti in base al dispositivo.
//
// Chiamata dal browser (conferma.html) tramite sb.functions.invoke(...).
//
// Variabili d'ambiente richieste (Project Settings > Edge Functions > Secrets):
//   STRIPE_SECRET_KEY — chiave segreta Stripe (sk_test_... in test, sk_live_... in produzione)
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function fmtWhen(giorno: string, ora: string) {
  const dt = new Date(giorno + "T00:00:00");
  const label = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long" }).format(dt);
  return `${label} alle ${ora}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { richiesta_id } = await req.json();
    if (!richiesta_id) {
      return new Response(JSON.stringify({ error: "richiesta_id mancante" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: r, error } = await supabase
      .from("richieste")
      .select("id, stato, acconto_importo, giorno, ora")
      .eq("id", richiesta_id)
      .single();

    if (error || !r) {
      return new Response(JSON.stringify({ error: "Richiesta non trovata" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (r.stato !== "accettata" || !r.acconto_importo) {
      return new Response(JSON.stringify({ error: "Questa richiesta non è in attesa di pagamento" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const origin = req.headers.get("origin") || "https://darko-tats.netlify.app";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `Acconto appuntamento — ${fmtWhen(r.giorno, r.ora)}` },
            unit_amount: Math.round(Number(r.acconto_importo) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { richiesta_id: r.id },
      success_url: `${origin}/conferma.html?id=${r.id}&pay=success`,
      cancel_url: `${origin}/conferma.html?id=${r.id}&pay=annullato`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
