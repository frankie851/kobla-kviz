# DECISIONS – Kobla Kvíz web
Nejnovější nahoře. Každé rozhodnutí jednou; pozdější změna = nový záznam s odkazem na původní.
Agent: sem zapisuj svá rozhodnutí a předpoklady (D-006 a dál). Předpoklad, který má David potvrdit, označ „předpoklad k potvrzení“.

## D-005 · 2026-11-05 · Texty tykáním
- **Rozhodnutí:** web hráčům tyká, tón je přátelský a vtipný.
- **Proč:** u hospodských kvízů obvyklé, působí uvolněně.
- **Zamítnuté alternativy:** vykání – formálnější, hůř sedí k hospodě.
- **Kdo:** předpoklad z návrhu, David může změnit.

## D-004 · 2026-11-05 · „Kobla“ jen jako název
- **Rozhodnutí:** „Kobla“ je jméno a používá se jen jako název kvízu. Žádný výklad významu, žádné slovní hříčky, žádná postava ani maskot.
- **Proč:** výslovné přání Davida.
- **Kdo:** David.

## D-003 · 2026-11-05 · Kapacita a náhradníci
- **Rozhodnutí:** skript hlídá kapacitu termínu. Po naplnění se nové přihlášky ukládají jako *Náhradník*, web ukáže „Obsazeno – přihlas se jako náhradník“. Náhradník se na uvolněné místo neposouvá automaticky, řeší to David v tabulce. Dokud má termín čekajícího náhradníka, každá nová přihláška je také náhradník, aby nový tým nepředběhl pořadník (tato pojistka je předpoklad z návrhu, David může změnit).
- **Proč:** chrání před přeplněním, je férové k náhradníkům a zůstává jednoduché.
- **Zamítnuté alternativy:** bez hlídání kapacity · veřejný seznam přihlášených týmů (David nechtěl).
- **Kdo:** David.

## D-002 · 2026-11-05 · Správa obsahu
- **Rozhodnutí:** podniky, termíny, kapacity a výsledky David spravuje v Google tabulce a web je načítá sám. Texty, FAQ, kontakty a fotky se mění v repozitáři s pomocí Clauda. Žebříček v1 = pořadí každého kvízu zvlášť.
- **Proč:** co se mění často, má jít změnit bez kódu. Co se mění zřídka, nemusí mít vlastní správu.
- **Kdo:** David.

## D-001 · 2026-11-05 · Technologie
- **Rozhodnutí:** statický web (HTML + CSS + JS, bez frameworku a sestavování) na GitHub Pages zdarma. Přihlášky a data přes Google Apps Script u Google tabulky. Upozornění e-mailem a přes Telegram bota. Token bota jen ve Script Properties.
- **Proč:** zdarma, bez serveru, nejméně věcí, které se můžou rozbít. Telegram nejde bezpečně volat přímo ze statické stránky, protože token by byl veřejný.
- **Zamítnuté alternativy:** služby formulářů typu Formspree (bez Telegramu a bez hlídání kapacity) · Netlify (další účet) · framework se sestavováním (složitější správa).
- **Kdo:** David (potvrdil technický návrh).
