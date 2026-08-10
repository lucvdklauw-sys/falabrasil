# FalaBrasil 🦜🇧🇷

Een premium, installeerbare Progressive Web App om Braziliaans Portugees te
leren vanuit het Nederlands. Module 1 ("Basiswoorden") bevat 300 essentiële
woorden verdeeld over 18 categorieën, met drie oefenvormen, spaced
repetition, Braziliaans-Portugese audio, een woordenboek, statistieken en
een vriendelijke toekan-mascotte ("Tuca").

Uitsluitend Nederlands ↔ Braziliaans Portugees — bewust niet generiek
multi-taal, zodat alles (woordkeuze, uitspraak, UX-copy) hier 100% op is
geoptimaliseerd.

## Starten (development)

```bash
npm install
npm run dev
```

Open de URL die Vite toont (standaard http://localhost:5173).

## Productie-build (PWA)

```bash
npm run build
npm run preview   # serveert de gebouwde app + service worker lokaal
```

De build in `dist/` is een volledige PWA: manifest, service worker
(offline app-shell caching via Workbox), eigen app-iconen (192/512/
maskable), iOS-metatags voor "Zet op beginscherm", en een installeerbare
ervaring op desktop, Android en iPhone. Serveer `dist/` via een (lokale)
webserver — bijvoorbeeld `npm run preview`, of upload naar elke statische
host (Vercel, Netlify, Cloudflare Pages, ...). PWA's vereisen HTTPS (of
localhost) om te installeren.

## Losse preview (geen server nodig)

```bash
npm run build:standalone
```

Bouwt `dist-standalone/`, waar je `standalone.html` gewoon kan
dubbelklikken om direct te openen (geen server, geen service worker —
puur voor snel bekijken/delen).

## Techniek

- React 19 + TypeScript + Vite
- TailwindCSS 4 (Braziliaanse kleuren: groen #009739, geel #FFDF00, blauw #002776)
- Framer Motion (met `prefers-reduced-motion` respect via `MotionConfig`)
- vite-plugin-pwa (Workbox) voor manifest + service worker + offline caching
- canvas-confetti, lazy geladen bij de eerste goede antwoord
- Browser Web Speech API (`speechSynthesis`) voor Braziliaans-Portugese audio
- Route-based code splitting (`React.lazy`) voor Woordenboek, Statistieken en Oefenscherm
- Alles lokaal opgeslagen (`localStorage`) — geen backend nodig voor de MVP

## Projectstructuur

```
src/
  types/          Domeinmodellen (Word, Category, UserProgress, SRS, ...)
  data/
    categories.ts 18 categorieën
    words.ts      300 woorden (auto-gegenereerd, zie scripts/gen_words.py + gen_ts.py)
  hooks/
    useProgress.ts     voortgang, hartjes, punten, streak, spaced repetition
    useTTS.ts          Braziliaans-Portugese tekst-naar-spraak
    useInstallPrompt.ts vangt het PWA-installatiemoment op
    useOnlineStatus.ts  offline-indicator
  utils/
    srs.ts          Leitner-achtige spaced repetition
    exercises.ts    sessie- en meerkeuze-opties opbouwen
    textMatch.ts    tolerante controle voor typ-oefeningen (accenten, kleine typefouten)
    encouragement.ts variatie in mascotte-feedback
    tips.ts         dagelijkse taaltip op het dashboard
  components/       UI-componenten (Dashboard, ExerciseView, Dictionary, Stats, ...)
  pwa.ts            service worker registratie + update-detectie
```

## Toegankelijkheid & performance

- Zichtbare focus-ring op elk interactief element, skip-link, `aria-live`
  feedback, toetsenbordsneltoetsen (1–4 voor meerkeuze, Esc om te sluiten)
- `lang="pt-BR"` op Portugese tekst zodat schermlezers correct uitspreken
- Contrastgecontroleerde kleuren (WCAG AA) voor badges en knoppen
- Code-splitting per scherm + lazy-loaded confetti houden de eerste load klein

## Klaar voor uitbreiding

De datastructuur (`src/types/index.ts`) is bewust taal- en niveau-agnostisch
opgezet, zodat je later kunt uitbreiden naar meer woorden (1.000/5.000+),
CEFR-niveaus A1–C2 (`level`-veld staat al op elk woord), nieuwe
talentrajecten, of nieuwe leermodules (grammatica, luisteren, spreken,
AI-gesprekken, examens — zie `LearningModule`/`SkillArea` in
`src/types/index.ts` als startpunt).

## Leerflow (didactisch ontwerp)

Een woord wordt nooit "koud" gevraagd. Per nieuw woord doorloopt de
leerling een vaste opbouw:

1. **Introductie** — NL-woord, PT-woord, grote luidsprekerknop (autoplay +
   herhalen), en de voorbeeldzin. Pas daarna "Verder".
2. **Meerkeuze NL → PT**
3. **Meerkeuze PT → NL** — na elk antwoord altijd feedback, audio én de
   voorbeeldzin (verplicht zichtbaar, niet alleen bij een fout antwoord).
4. **Typen** — pas ontgrendeld zodra dat woord minstens één keer goed is
   gekozen in BEIDE meerkeuze-richtingen (ooit, niet per se in dezelfde
   sessie). Dit wordt live bijgehouden per woord (`introduced`,
   `mcSourceToTargetCorrect`, `mcTargetToSourceCorrect` in `WordProgress`);
   zelfs als een leerling een meerkeuzevraag fout beantwoordt vlak vóór een
   geplande typ-oefening, wordt die typ-stap automatisch vervangen door een
   herkansing van de ontbrekende richting — typen verschijnt pas als het
   echt verdiend is.

Woorden die al volledig "afgestudeerd" zijn (beide richtingen ooit goed)
krijgen gewoon één herhalingsvraag via de bestaande spaced-repetition-logica
(willekeurig NL→PT, PT→NL, of typen).

## Kwaliteitsronde (samenvatting)

Naast de eerste bouw is de app kritisch nagelopen vanuit UX, front-end,
accessibility, performance en taalkundig oogpunt. Concrete verbeteringen:
volledige PWA-ondersteuning; een sessie-architectuur-bug gefixt waarbij een
lopende oefensessie kon herschudden na elk antwoord; toetsenbord- en
schermlezerondersteuning; contrastcorrecties; code-splitting en lazy
loading; speciale-tekens-toetsenbord (ã, õ, ç, ...) bij de typ-oefening;
een "oefen je fouten opnieuw"-flow; variatie in mascotte-feedback; en een
dagelijkse taaltip + doel-widget op het dashboard.
