# HANDOFF – Kobla Kvíz web
datum: 2026-11-05 · předává: Claude Code (sezení 1, prompt 01) · přebírá: Claude Code (pokračování po Zastávce 1)

## Stav jednou větou
Fáze 0 a 1 jsou hotové, čeká se na Zastávku 1: David vybírá design, slučuje pull request a zapíná GitHub Pages.

## Hotovo
- Workflow `.github/workflows/pages.yml` (nasazuje z `main`) a dočasná stránka „Brzy tu bude Kobla Kvíz“.
- Kostra: `config.js` (prázdný = demo), `data/demo.json` (vymyšlená data, termíny s `za_dni`), `assets/js/cesky.js` (data, skloňování, nezlomitelné mezery), písma v `assets/fonts/` (OFL, latin + latin-ext).
- 5 návrhů v `navrhy/a-neon`, `b-hravy`, `c-etiketa`, `d-arch`, `e-elektricky`, společný plnič `navrhy/demo-plnic.js`, rozcestník `navrhy/index.html`, náhledy `navrhy/nahledy/`. Všechny návrhy prohlédnuté na 390, 768 a 1280 px, bez vodorovného posouvání a bez chyb v konzoli.
- Rozhodnutí D-006 až D-012 v `docs/DECISIONS.md`.

## Rozpracováno
- Nic. Fáze 2 začne až po Davidově volbě designu.

## Další krok
1. Zapsat Davidovu volbu designu do DECISIONS.md jako „Kdo: David“.
2. Fáze 2 v `docs/PLAN.md`: finální logo (SVG s textem převedeným na křivky – např. `opentype.js` mimo repozitář), favicon, obrázek pro sdílení 1200×630 PNG, celý web v demo režimu.

## Větev a pull request
- Pracovní větev: `claude/sharp-shannon-r4gqnz` (do `main` toto sezení pushovat nesmí, viz D-006).
- Otevřený pull request ke sloučení: https://github.com/frankie851/kobla-kviz/pull/1 – David ho musí sloučit, než začne nové sezení.

## Adresy
- Web: https://frankie851.github.io/kobla-kviz/ (běží až po sloučení PR a zapnutí Pages)
- Rozcestník návrhů: https://frankie851.github.io/kobla-kviz/navrhy/ · dokud web neběží: https://raw.githack.com/frankie851/kobla-kviz/claude/sharp-shannon-r4gqnz/navrhy/index.html
- Skript (web app): —

## Otevřené otázky a rizika
- Startovné za osobu, nebo za tým? (D-010, předpoklad: za osobu)
- Fakta do textů – velikost týmu, počet kol, ceny, kontakty, sítě, správce údajů – zatím `[DOPLNIT: …]`.

## Jak navázat
Přečti v tomto pořadí: `CLAUDE.md` → `docs/HANDOFF.md` → `docs/PLAN.md` → `docs/DECISIONS.md` → `docs/SPEC.md`. Zvolený design (DECISIONS.md) neměň bez souhlasu Davida.
