// Credenziali del progetto Supabase — sostituisci questi due valori
// con quelli del tuo progetto (Project Settings > API).
// La ANON KEY è pubblica per design: la sicurezza è garantita dalle
// regole RLS definite in supabase/schema.sql, non dal nasconderla.
const SUPABASE_URL = "https://dhwkkcztwpatmyodllwb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_o-mSginc0mFjfpEl2_ieKw_yXIEUDae";

// Chiave pubblica per le notifiche push del pannello di Pietro (admin.html).
// È pubblica per design (il browser la usa per iscriversi); la chiave privata
// corrispondente resta solo lato server, nell'Edge Function che invia le notifiche.
const VAPID_PUBLIC_KEY = "BH10ne8XbfgSEIECvI6QmgJ1vEgOmZ7SIthMolta3bnu_Vw0E1SZaNdrYMNhpPb8pZgmaHghWoZT3QdDRjsne7Q";
