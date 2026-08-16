-- darko.tats — schema per le richieste di appuntamento
-- Incolla tutto questo file in Supabase: Project > SQL Editor > New query > Run
-- Questo script è "sicuro": puoi rilanciarlo più volte senza errori.

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

-- Diritti di base sulla tabella (le regole RLS sotto restano il vero filtro)
grant usage on schema public to anon, authenticated;
grant select, insert on public.richieste to anon;
grant select, insert, update on public.richieste to authenticated;

-- Chiunque (i clienti dal sito) può creare una richiesta, ma solo "in attesa"
-- e senza poter impostare da soli l'acconto o lo stato di accettazione.
-- "to public" invece di "to anon": la vera restrizione resta nel WITH CHECK,
-- questo evita problemi di riconoscimento del ruolo con le nuove chiavi API.
drop policy if exists "clienti_possono_inserire" on public.richieste;
create policy "clienti_possono_inserire" on public.richieste
  for insert
  to public
  with check (stato = 'in_attesa' and acconto_importo is null);

-- Solo Pietro (autenticato con la sua email) vede e modifica tutte le richieste.
drop policy if exists "pietro_vede_tutto" on public.richieste;
create policy "pietro_vede_tutto" on public.richieste
  for select
  to public
  using (auth.role() = 'authenticated' and auth.email() = 'pietro.salice01@gmail.com');

drop policy if exists "pietro_modifica_tutto" on public.richieste;
create policy "pietro_modifica_tutto" on public.richieste
  for update
  to public
  using (auth.role() = 'authenticated' and auth.email() = 'pietro.salice01@gmail.com')
  with check (auth.role() = 'authenticated' and auth.email() = 'pietro.salice01@gmail.com');

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

grant execute on function public.stato_richiesta(uuid) to anon, authenticated;

-- Abilita gli aggiornamenti in tempo reale per il pannello di Pietro
-- (solo se non è già stata aggiunta in un run precedente)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'richieste'
  ) then
    alter publication supabase_realtime add table public.richieste;
  end if;
end $$;
