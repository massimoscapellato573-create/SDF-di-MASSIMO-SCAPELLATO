-- darko.tats — schema per le richieste di appuntamento
-- Incolla tutto questo file in Supabase: Project > SQL Editor > New query > Run

create extension if not exists pgcrypto;

create table if not exists public.richieste (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  telefono text not null,
  giorno date not null,
  ora text not null,
  idea text,
  stato text not null default 'in_attesa' check (stato in ('in_attesa', 'accettata', 'rifiutata')),
  acconto_importo numeric,
  note_admin text
);

alter table public.richieste enable row level security;

-- Chiunque (i clienti dal sito) può creare una richiesta, ma solo "in attesa"
-- e senza poter impostare da soli l'acconto o lo stato di accettazione.
create policy "clienti_possono_inserire" on public.richieste
  for insert
  to anon
  with check (stato = 'in_attesa' and acconto_importo is null);

-- Solo Pietro (autenticato con la sua email) vede e modifica tutte le richieste.
create policy "pietro_vede_tutto" on public.richieste
  for select
  to authenticated
  using (auth.email() = 'pietro.salice01@gmail.com');

create policy "pietro_modifica_tutto" on public.richieste
  for update
  to authenticated
  using (auth.email() = 'pietro.salice01@gmail.com')
  with check (auth.email() = 'pietro.salice01@gmail.com');

-- Funzione che permette al CLIENTE di controllare lo stato della propria
-- richiesta (conoscendo solo il codice/id ricevuto dopo l'invio), senza
-- poter leggere nome/telefono/idea delle richieste altrui.
create or replace function public.stato_richiesta(richiesta_id uuid)
returns table(stato text, acconto_importo numeric, giorno date, ora text)
language sql
security definer
set search_path = public
as $$
  select stato, acconto_importo, giorno, ora
  from public.richieste
  where id = richiesta_id;
$$;

grant execute on function public.stato_richiesta(uuid) to anon;

-- Abilita gli aggiornamenti in tempo reale per il pannello di Pietro
alter publication supabase_realtime add table public.richieste;
