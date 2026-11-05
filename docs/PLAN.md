# PLAN – Kobla Kvíz web
Agent: po dokončení kroku ho odškrtni (☐ → ☑) a připiš datum. Pořadí fází neměň bez důvodu zapsaného do `docs/DECISIONS.md`. Požadavky (R…) a kritéria přijetí (K…) jsou v `docs/SPEC.md`.

## Fáze 0 – Příprava a zveřejňování
- ☐ Přečti `CLAUDE.md`, `docs/SPEC.md`, `docs/DECISIONS.md`, `docs/HANDOFF.md`
- ☐ Zjisti, do které větve smíš pushovat a zda umíš sám zapnout GitHub Pages — výsledek: DECISIONS.md
- ☐ Workflow `.github/workflows/pages.yml` (nasazuje z hlavní větve) a jednoduchá stránka „Brzy tu bude Kobla Kvíz“ — výstup: nasazení připravené
- ☐ Kostra repozitáře podle `CLAUDE.md` (složky, `config.js`, `data/demo.json` s vymyšlenými podniky a termíny)

## Fáze 1 – 5 návrhů designu
- ☐ 5 výrazně odlišných směrů v `navrhy/a-…/` až `navrhy/e-…/`, každý s vlastním logem
- ☐ Rozcestník `navrhy/index.html` (náhled + 2 věty ke každému směru + odkaz)
- ☐ Snímky na 390 px a 1280 px do `navrhy/nahledy/`, sám je prohlédni a oprav rozbité
- ☐ HANDOFF.md aktualizovat
**ZASTÁVKA 1:** David vybere směr (nebo kombinaci). Zapiš volbu do DECISIONS.md.

## Fáze 2 – Celý web ve zvoleném stylu (demo režim)
- ☐ Finální logo, favicon, obrázek pro sdílení 1200×630
- ☐ `index.html` se sekcemi R1–R8
- ☐ `vysledky.html` (R9), `fotky.html` (R10), `osobni-udaje.html` (R11), patička (R12)
- ☐ Formuláře (přihláška, hospody) s validací na webu a demo odesláním
- ☐ Texty s `[DOPLNIT: …]`, česká typografie a skloňování
- ☐ Kontrola na 390 / 768 / 1280 px

## Fáze 3 – Skript a návod
- ☐ `apps-script/Code.gs`: příprava listů, veřejná data (GET), akce `prihlaska` a `hospoda` (POST), zámek, mezipaměť, e-maily, Telegram, list Chyby
- ☐ Testy v `tests/` (kapacita, náhradník, souběh, uzávěrka, duplicita, validace, výběr veřejných dat bez osobních údajů, selhání Telegramu)
- ☐ Ověřit z dokumentace: nasazení web app, volání z prohlížeče (CORS), denní limity e-mailů, chat ID u Telegramu — zjištění do DECISIONS.md
- ☐ `NAVOD.md` (nastavení, zkušební přihláška, každodenní správa, časté problémy)
- ☐ HANDOFF.md aktualizovat
**ZASTÁVKA 2:** David provede ruční nastavení podle NAVOD.md a pošle adresu skriptu.

## Fáze 4 – Napojení a ověření
- ☐ Adresa skriptu do `config.js`, demo režim vypnutý
- ☐ Načtení veřejných dat ze skriptu (pokud je síť dostupná), jinak ověření proti demo datům
- ☐ Kontrola K1–K13: co jde ověřit odsud, ověř; zbytek předej Davidovi jako kontrolní seznam
- ☐ Prohledat repozitář včetně historie na tajné hodnoty a osobní údaje hráčů (K7)
- ☐ HANDOFF.md aktualizovat
**ZASTÁVKA 3:** David udělá zkušební přihlášku podle kontrolního seznamu v NAVOD.md (K3, K4, K6) a napíše výsledek. Co nefunguje, oprav (max. 3 pokusy na problém) a nech ho zkusit znovu.

## Fáze 5 – Předání
- ☐ `navrhy/` označit `noindex` a zeptat se Davida, zda složku smazat
- ☐ HANDOFF.md a závěrečná zpráva

## Stav
Poslední aktualizace: 2026-11-05 · Aktuální fáze: 0 (nezahájeno) · Blokováno: nic
