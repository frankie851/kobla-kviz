# PLAN – Kobla Kvíz web
Agent: po dokončení kroku ho odškrtni (☐ → ☑) a připiš datum. Pořadí fází neměň bez důvodu zapsaného do `docs/DECISIONS.md`. Požadavky (R…) a kritéria přijetí (K…) jsou v `docs/SPEC.md`.

## Fáze 0 – Příprava a zveřejňování
- ☑ Přečti `CLAUDE.md`, `docs/SPEC.md`, `docs/DECISIONS.md`, `docs/HANDOFF.md` (2026-11-05)
- ☑ Zjisti, do které větve smíš pushovat a zda umíš sám zapnout GitHub Pages — výsledek: DECISIONS.md (2026-11-05)
- ☑ Workflow `.github/workflows/pages.yml` (nasazuje z hlavní větve) a jednoduchá stránka „Brzy tu bude Kobla Kvíz“ — výstup: nasazení připravené (2026-11-05)
- ☑ Kostra repozitáře podle `CLAUDE.md` (složky, `config.js`, `data/demo.json` s vymyšlenými podniky a termíny) (2026-11-05)

## Fáze 1 – 5 návrhů designu
- ☑ 5 výrazně odlišných směrů v `navrhy/a-…/` až `navrhy/e-…/`, každý s vlastním logem (2026-11-05)
- ☑ Rozcestník `navrhy/index.html` (náhled + 2 věty ke každému směru + odkaz) (2026-11-05)
- ☑ Snímky na 390 px a 1280 px do `navrhy/nahledy/`, sám je prohlédni a oprav rozbité (2026-11-05)
- ☑ HANDOFF.md aktualizovat (2026-11-05)
**ZASTÁVKA 1:** David vybere směr (nebo kombinaci). Zapiš volbu do DECISIONS.md. ☑ David vybral C (D-013)

## Fáze 2 – Celý web ve zvoleném stylu (demo režim)
- ☑ Finální logo, favicon, obrázek pro sdílení 1200×630 (2026-11-05)
- ☑ `index.html` se sekcemi R1–R8 (2026-11-05)
- ☑ `vysledky.html` (R9), `fotky.html` (R10), `osobni-udaje.html` (R11), patička (R12) (2026-11-05)
- ☑ Formuláře (přihláška, hospody) s validací na webu a demo odesláním (2026-11-05)
- ☑ Texty s `[DOPLNIT: …]`, česká typografie a skloňování (2026-11-05)
- ☑ Kontrola na 390 / 768 / 1280 px (2026-11-05)

## Fáze 3 – Skript a návod
- ☑ `apps-script/Code.gs`: příprava listů, veřejná data (GET), akce `prihlaska` a `hospoda` (POST), zámek, mezipaměť, e-maily, Telegram, list Chyby (2026-11-05)
- ☑ Testy v `tests/` (kapacita, náhradník, souběh, uzávěrka, duplicita, validace, výběr veřejných dat bez osobních údajů, selhání Telegramu) (2026-11-05)
- ☑ Ověřit z dokumentace: nasazení web app, volání z prohlížeče (CORS), denní limity e-mailů, chat ID u Telegramu — zjištění do DECISIONS.md (2026-11-05)
- ☑ `NAVOD.md` (nastavení, zkušební přihláška, každodenní správa, časté problémy) (2026-11-05)
- ☑ HANDOFF.md aktualizovat (2026-11-05)
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
Poslední aktualizace: 2026-11-05 · Aktuální fáze: ZASTÁVKA 2 (David nastavuje tabulku, skript a Telegram) · Blokováno: adresa skriptu od Davida
