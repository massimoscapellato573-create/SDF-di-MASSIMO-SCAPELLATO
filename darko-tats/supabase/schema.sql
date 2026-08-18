-- darko.tats — schema per le richieste di appuntamento
-- Incolla tutto questo file in Supabase: Project > SQL Editor > New query > Run
-- Questo script è "sicuro": puoi rilanciarlo più volte senza errori.

create extension if not exists pgcrypto;

create table if not exists public.richieste (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text,
  telefono text,
  giorno date not null,
  ora text not null,
  idea text,
  stato text not null default 'in_attesa',
  acconto_importo numeric,
  note_admin text
);

-- Stato aggiornato: aggiunge "confermata" (pagato) e "bloccato" (bloccato da Pietro).
alter table public.richieste drop constraint if exists richieste_stato_check;
alter table public.richieste add constraint richieste_stato_check
  check (stato in ('in_attesa', 'accettata', 'confermata', 'rifiutata', 'bloccato'));

-- nome/telefono restano obbligatori per le richieste dei clienti, ma non per
-- i blocchi manuali di Pietro (che non hanno un cliente).
alter table public.richieste alter column nome drop not null;
alter table public.richieste alter column telefono drop not null;

-- Impedisce DAVVERO (non solo visivamente) due appuntamenti occupati sullo
-- stesso giorno+ora: se Pietro accetta o blocca un orario già preso, il
-- database rifiuta l'operazione invece di sovrapporre due prenotazioni.
create unique index if not exists richieste_slot_occupato_idx
  on public.richieste (giorno, ora)
  where stato in ('accettata', 'confermata', 'bloccato');

alter table public.richieste enable row level security;

-- Diritti di base sulla tabella (le regole RLS sotto restano il vero filtro)
grant usage on schema public to anon, authenticated;
grant select, insert on public.richieste to anon;
grant select, insert, update, delete on public.richieste to authenticated;

-- Chiunque (i clienti dal sito) può creare una richiesta, ma solo "in attesa"
-- e senza poter impostare da soli l'acconto o lo stato di accettazione.
drop policy if exists "clienti_possono_inserire" on public.richieste;
create policy "clienti_possono_inserire" on public.richieste
  for insert
  to public
  with check (stato = 'in_attesa' and acconto_importo is null);

-- Pietro può inserire righe con qualsiasi stato (usato per bloccare orari).
drop policy if exists "pietro_inserisce_tutto" on public.richieste;
create policy "pietro_inserisce_tutto" on public.richieste
  for insert
  to public
  with check (auth.role() = 'authenticated' and auth.email() = 'pietro.salice01@gmail.com');

-- Solo Pietro (autenticato con la sua email) vede, modifica ed elimina tutte le richieste.
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

drop policy if exists "pietro_elimina_tutto" on public.richieste;
create policy "pietro_elimina_tutto" on public.richieste
  for delete
  to public
  using (auth.role() = 'authenticated' and auth.email() = 'pietro.salice01@gmail.com');

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

-- Funzione pubblica: quali giorno+ora sono occupati (accettati, confermati o
-- bloccati) da oggi in poi. Usata dal calendario del sito per non far
-- scegliere a un cliente un orario già preso. Non espone nome/telefono/idea.
create or replace function public.slot_occupati()
returns table(giorno date, ora text)
language sql
security definer
set search_path = public
as $$
  select giorno, ora
  from public.richieste
  where stato in ('accettata', 'confermata', 'bloccato')
    and giorno >= current_date;
$$;

grant execute on function public.slot_occupati() to anon, authenticated;

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
