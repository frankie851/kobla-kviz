# Kobla Kvíz – pravidla pro Claude Code
Web hospodského kvízu Kobla Kvíz (Prostějov a okolí): statické stránky na GitHub Pages a Google Apps Script u Google tabulky pro přihlášky, kapacitu a upozornění. Majitel David není programátor. Všechno, co má udělat sám, mu piš česky krok za krokem s tím, kam kliknout.

## Struktura
- `index.html`, `vysledky.html`, `fotky.html`, `osobni-udaje.html` – stránky
- `assets/` – `css/`, `js/`, `img/` (logo, favicon, obrázek pro sdílení), `fonts/` (písma + licence), `fotky/` (`<RRRR-MM-DD>-<podnik>/` + `fotky.json`)
- `config.js` – adresa Apps Scriptu (veřejná). Prázdná = demo režim
- `data/demo.json` – vymyšlená ukázková data pro demo režim
- `apps-script/Code.gs` – kód, který David vkládá do Google Apps Scriptu ručně
- `navrhy/` – 5 návrhů designu a rozcestník `navrhy/index.html`
- `tests/` – testy logiky, spouští se `node --test tests/`
- `.github/workflows/pages.yml` – nasazení na GitHub Pages z hlavní větve
- `NAVOD.md` – návod pro Davida
- `docs/` – SPEC, PLAN, DECISIONS, HANDOFF (a KONTROLA po kontrole)
- `prompts/` – zadání úloh, neupravuj je

## Co platí při rozporu
Pořadí: rozhodnutí v `docs/DECISIONS.md` označená „Kdo: David“ → `docs/SPEC.md` → tento soubor → `docs/PLAN.md` → prompt sezení. Rozpor, který nemění to, co David dostane, vyřeš podle tohoto pořadí a zapiš do DECISIONS.md. Rozpor, který to mění, je důvod se Davida zeptat.

## Větve a nasazení
- Web se nasazuje jen z hlavní větve.
- Smíš-li pushovat do hlavní větve, pracuj v ní.
- Nesmíš-li, pracuj v pracovní větvi a před každou zastávkou a na konci sezení otevři (nebo aktualizuj) pull request do hlavní větve. Ve zprávě Davidovi napiš, ať ho sloučí tlačítkem *Merge pull request*. Větev a PR zapiš do `docs/HANDOFF.md`.
- Nové sezení začíná z hlavní větve. Proto nenechávej rozpracovanou práci jen v nesloučené větvi, když předáváš.

## Konvence
- HTML + CSS + JavaScript, bez frameworku a bez sestavovacího kroku. Žádné CDN ani Google Fonts – písma a knihovny ukládej do repozitáře.
- Pomocné nástroje pro vývoj (Playwright, převod SVG na PNG apod.) instaluj mimo repozitář nebo je přidej do `.gitignore`. Do repozitáře patří jen web, skript, testy a dokumenty.
- Logiku skriptu (kapacita, náhradníci, uzávěrka, duplicita, validace, výběr veřejných dat) piš jako čisté funkce bez volání Google služeb uvnitř, ať jde `Code.gs` načíst v Node (modul `vm`) a otestovat.
- Čitelný kód s krátkými českými komentáři. David bude web upravovat s Claudem i za několik měsíců.
- Texty webu česky, tykání. Chybějící fakta jako `[DOPLNIT: co přesně]`.
- Commity česky, malé a popisné.

## Pracovní pravidla – při provádění
- Na začátku sezení přečti `docs/HANDOFF.md` a `docs/PLAN.md`. Po každém kroku PLAN odškrtni (☐ → ☑ + datum).
- Rozhodnutí a předpoklady zapisuj do `docs/DECISIONS.md`.
- Na konci sezení, před každou zastávkou a když hrozí vyčerpání limitů, aktualizuj `docs/HANDOFF.md`.
- Na jeden problém max. 3 pokusy. Pak ho zapiš do HANDOFF jako otevřený a pokračuj jinou částí.
- Když se změní `apps-script/Code.gs` po prvním nasazení, napiš Davidovi krok za krokem, jak nový kód vložit a nasadit jako novou verzi tak, aby adresa skriptu zůstala stejná.

## Pracovní pravidla – při kontrole
- Když tě zadání staví do role kontrolora: kód ani dokumenty neměň (PLAN neodškrtávej, HANDOFF nepřepisuj). Jediný soubor, který zapíšeš a commitneš, je `docs/KONTROLA.md`. Dočasné změny pro zkoušku (např. jiná adresa v `config.js`) vrať a necommituj.

## Nikdy
- Tajné hodnoty (token Telegram bota, chat ID, hesla) do repozitáře – patří jen do Script Properties v Google Apps Scriptu. Repozitář je veřejný.
- Osobní údaje hráčů do repozitáře (ani v ukázkových datech – ta jsou vymyšlená). Záměrně veřejné jsou jen Davidovy kontakty na webu, které sám dodá, a fotky z akcí, které pošle.
- Odeslání čehokoli (přihláška, formulář hospod) na Davidův skutečný skript – zapsalo by se mu to do tabulky a rozeslaly by se e-maily a zprávy. Čtení veřejných dat (GET) je v pořádku. Zkoušku odeslání dělá David.
- Analytika, sledovací cookies a služby, které posílají data hráčů třetím stranám.

## Jen s Davidovým souhlasem
- Mazání souborů v `docs/`, `prompts/`, `assets/fotky/` a složky `navrhy/`, přepis historie gitu (force push).
- Cokoli, co stojí peníze (placené služby, doména).
- Změna zvoleného designu nebo rozhodnutí v `docs/DECISIONS.md` označených „Kdo: David“.
