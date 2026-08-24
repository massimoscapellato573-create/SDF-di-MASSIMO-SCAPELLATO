# Bozze siti "POV" — sorgenti

Ogni file e' una pagina HTML completa e autonoma: foto incorporate in base64,
nessuna risorsa esterna a parte i Google Fonts. Si apre con un doppio clic.

## Come modificarli da un'altra chat o da un altro repository

I file qui sotto sono gia' pubblicati come Artifact. Per **aggiornare l'artifact
esistente invece di crearne uno nuovo**, la chat che ci lavora deve passare l'URL
dell'artifact al momento della pubblicazione. Senza quell'URL nasce un artifact
separato e il link vecchio resta indietro.

| File | Artifact da aggiornare |
|---|---|
| `cioccolateria-modica.html` | https://claude.ai/code/artifact/983cfee8-3801-47bc-acce-1095f65cf184 |
| `fioraio.html` | https://claude.ai/code/artifact/a94db271-60e4-47aa-8965-a3c172172bb3 |
| `officina.html` | https://claude.ai/code/artifact/69ff20bb-cd78-4342-a7b4-6c5956f3863d |
| `parrucchiere.html` | https://claude.ai/code/artifact/6f1c0d5b-6df0-41cc-8edd-c557a1da80f6 |
| `panificio.html` | https://claude.ai/code/artifact/5a3c67d1-75ae-47e9-b714-9b76dffc5028 |
| `caseificio.html` | https://claude.ai/code/artifact/d3c9c840-4ca5-414e-9dbf-85815a0f1d5e |
| `frantoio.html` | https://claude.ai/code/artifact/3c492c65-ebbe-4fd9-995c-8a7bcd825ebb |
| `ottica.html` | https://claude.ai/code/artifact/5cebe977-044f-42fc-a20f-d3ab84609b9f |
| `falegnameria.html` | https://claude.ai/code/artifact/4f220f27-f852-4103-a47e-29b201ae387f |
| `toelettatura.html` | https://claude.ai/code/artifact/6d7d8bbf-0294-4009-83b1-94066877866f |
| `fotovoltaico.html` | https://claude.ai/code/artifact/b432d04b-e4f9-4034-b384-409f37d57d98 |

## Da sapere prima di metterci mano

Rifatti a mano, con struttura propria: `cioccolateria-modica.html`, `fioraio.html`.

Gli altri nove sono ancora nati dallo stesso scheletro: cambiano colori,
caratteri, testi e l'oggetto 3D, ma l'ordine delle sezioni e' identico. Chi li rifa' dovrebbe cambiare proprio la
struttura, non solo la pelle: apertura diversa, sezioni in ordine diverso,
meccaniche di scorrimento diverse. `cioccolateria-modica.html` e' invece
costruito a mano ed e' il metro di paragone giusto.

## Regole tecniche rispettate (da non rompere)

- Solo caratteri ASCII: lettere accentate e trattini lunghi come entita' HTML.
- `overflow-x:hidden` solo sul body, mai sull'elemento `html` (rompe `position:sticky`).
- Elementi dentro le griglie con `min-width:0`; `img`, `input`, `select` con `max-width:100%`.
- Sul body: `overscroll-behavior-x:none` e `touch-action:pan-y pinch-zoom`.
- `prefers-reduced-motion` rispettato in ogni animazione.
- Niente scorrimento laterale a 360, 390 e 430 px di larghezza.
- Nome del cliente sempre coperto da una banda nera: intestazione, contatti, piede.
- Telefono 0932 000 000, P. IVA 00000000000, attivita' inventate della zona Ragusa/Modica.
- In fondo alla pagina, piccolo: "Design & sviluppo — MS Solutions".
