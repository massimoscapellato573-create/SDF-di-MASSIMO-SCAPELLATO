# Contanti — Gestione Fondi

PWA personale per gestire i contanti fisici: stipendio, spese rapide, un
Fondo Lavoro con accantonamento mensile automatico, due fondi personalizzabili
(MacBook, Raffaella - Uscite) con obiettivi e stima della data di
raggiungimento, dashboard con grafici, cronologia e modalità chiara/scura.

Nessun build, nessuna dipendenza: solo HTML/CSS/JS, pensata per essere
installata su iPhone e su computer e per funzionare offline.

## Struttura

```
cash-app/
  index.html            punto d'ingresso, un'unica pagina
  manifest.webmanifest   metadati PWA (icone, shortcut, tema)
  service-worker.js       cache offline + notifiche locali
  css/styles.css          design system (chiaro/scuro, stile Apple)
  js/db.js                storage locale (IndexedDB)
  js/state.js             regole di business (fondi, allocazioni, obiettivi)
  js/charts.js            grafici SVG (donut, barre, linea) senza librerie
  js/notifications.js     notifiche locali
  js/sync.js              backup JSON + sync opzionale via Firebase
  js/app.js               interfaccia e navigazione
  icons/                   icone PWA generate
```

Aggiungere una funzione in futuro (nuovo tipo di fondo, nuova statistica,
nuovo grafico) significa aggiungere un fondo in `state.js`/`app.js` o una
nuova vista: l'architettura è divisa a livelli (dati → logica → grafici →
interfaccia) apposta per non dover riscrivere il resto.

## Come si usa

1. **Ho ricevuto lo stipendio** → inserisci l'importo, aggiungi al volo le
   spese immediate (es. benzina), poi conferma: l'app calcola in automatico
   quanto accantonare nel Fondo Lavoro (se non ancora fatto questo mese) e
   come dividere il resto tra i fondi personalizzati, con notifica quando il
   Fondo Lavoro è pronto.
2. **Aggiungi spesa / Altra entrata** → transazioni libere, sempre disponibili
   dal pulsante **+**.
3. **Obiettivi** → imposta un importo obiettivo per un fondo (es. MacBook Air
   M4, 1500 €): la data stimata di raggiungimento si basa sulla media dei
   versamenti mensili reali.
4. **Impostazioni** → tema, importo mensile del Fondo Lavoro, gestione fondi
   (aggiungi/rinomina/elimina, percentuali di suddivisione), notifiche,
   backup e sincronizzazione.

## Installazione come app

- **iPhone (Safari)**: apri il sito, tocca l'icona Condividi, poi
  "Aggiungi alla schermata Home".
- **Computer (Chrome/Edge)**: apri il sito, clicca l'icona di installazione
  nella barra degli indirizzi (o il pulsante di installazione nell'app).

Una volta installata, l'app funziona anche offline: i dati restano salvati
sul dispositivo (IndexedDB) e le pagine sono servite dalla cache del service
worker.

## Sincronizzazione tra dispositivi

Ci sono due livelli, entrambi in **Impostazioni → Sincronizzazione**:

### 1. Backup manuale (sempre disponibile)
"Esporta" scarica un file JSON con tutti i dati; "Importa" lo ripristina su
un altro dispositivo. Utile come trasferimento occasionale o come copia di
sicurezza.

### 2. Sincronizzazione automatica in tempo reale (opzionale, gratuita)
Per avere i dati sempre allineati tra telefono e computer serve un piccolo
progetto Firebase gratuito personale (nessuna chiave è inclusa nel codice,
resta tutto tuo):

1. Vai su <https://console.firebase.google.com/>, crea un progetto gratuito
   (piano *Spark*).
2. Nel progetto, vai su **Build → Firestore Database** e crea un database
   (modalità produzione va bene).
3. Imposta le regole di Firestore così (solo per uso personale — chi conosce
   il codice di coppia può leggere/scrivere il proprio documento):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /cashSync/{code} {
         allow read, write: if true;
       }
     }
   }
   ```
   Per maggiore sicurezza puoi restringere ulteriormente in base al tuo caso
   d'uso (es. richiedere Firebase Authentication).
4. Vai su **Impostazioni progetto → Generali**, in "Le tue app" aggiungi
   un'app Web, e copia l'oggetto di configurazione (`apiKey`, `projectId`,
   ecc.).
5. Nell'app, in Impostazioni → Sincronizzazione, attiva l'interruttore,
   incolla la configurazione copiata, genera (o scegli) un **codice di
   coppia** e premi "Connetti".
6. Sull'altro dispositivo, ripeti attivando la sincronizzazione con la
   **stessa configurazione e lo stesso codice**: da quel momento ogni
   modifica si propaga automaticamente in pochi secondi.

Senza questa configurazione l'app resta comunque completamente funzionante:
i dati restano semplicemente locali al dispositivo, con il backup manuale
come rete di sicurezza.

## Note su iOS e le notifiche

Le notifiche funzionano quando l'app è aperta o appena riavviata (es. subito
dopo aver registrato lo stipendio). iOS non permette, senza un server push
dedicato, di inviare notifiche mentre l'app è completamente chiusa: è una
limitazione della piattaforma, non dell'app. Se in futuro si aggiunge un
backend, questa parte può essere estesa con le vere notifiche push.
