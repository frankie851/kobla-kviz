# HANDOFF – Kobla Kvíz web
datum: 2026-11-05 · předává: Claude Code (sezení 1, prompt 01) · přebírá: Claude Code (pokračování po Zastávce 2)

## Stav jednou větou
Fáze 0–3 hotové. Web ve stylu C běží v demo režimu, skript, testy a návod jsou připravené. Čeká se na Zastávku 2: David nastavuje tabulku, skript a Telegram podle `NAVOD.md` a pošle adresu skriptu.

## Hotovo
- Fáze 0 a 1 (nasazení, kostra, 5 návrhů v `navrhy/`), PR #1 sloučený.
- David vybral design C (D-013), startovné je za osobu (D-014).
- Fáze 2: `index.html` (R1–R8), `vysledky.html`, `fotky.html`, `osobni-udaje.html`, patička. Styly `assets/css/styl.css`, skripty `assets/js/` (`kobla.js` = data, kontakty, menu, odeslání; `formulare.js`; `uvod.js`; `vysledky.js`; `fotky.js`; `cesky.js`). Logo, favicon a `sdileni.png` v `assets/img/`.
- Kontrola v prohlížeči (Playwright mimo repozitář) na 390, 768 a 1280 px: bez vodorovného posouvání a bez chyb v konzoli. Ověřeno: K2, formuláře (chyby, demo odeslání), K9 (nedostupný skript), K10 (fotky skryté i zobrazené), filtr výsledků, klávesnice a menu, kontrast AA.
- Fáze 3: `apps-script/Code.gs`, testy `node --test tests/` (51 testů, všechny prochází), `NAVOD.md` a)–j).
- Kontrola repozitáře včetně historie: žádný token, chat ID ani kontakty hráčů.

## Rozpracováno
- Nic.

## Další krok
1. Až David pošle adresu skriptu: vložit ji do `config.js` (`ADRESA_SKRIPTU`). Tím se vypne demo režim.
2. Zkusit načíst veřejná data GET (`?akce=data`). Síť prostředí může `script.google.com` blokovat, pak ověřit proti demo datům. **Nic na skript neodesílat.**
3. Projít K1–K13, aktualizovat HANDOFF, PR, a pak ZASTÁVKA 3 (kontrolní seznam `NAVOD.md` f).

## Větev a pull request
- Pracovní větev: `claude/sharp-shannon-r4gqnz` (do `main` toto sezení pushovat nesmí, viz D-006).
- PR #1 sloučený. Otevřený PR s Fází 2 a 3: https://github.com/frankie851/kobla-kviz/pull/2 – David ho musí sloučit, než začne nové sezení.

## Adresy
- Web: https://frankie851.github.io/kobla-kviz/ – první nasazení selhalo, protože při sloučení PR #1 ještě nebyly zapnuté Pages („Get Pages site failed“). Po zapnutí *Settings → Pages → Source: GitHub Actions* se web nasadí při dalším sloučení (nebo *Actions → Re-run all jobs*). Z prostředí agenta se na github.io nedostanu (síť), ověřuje David.
- Rozcestník návrhů: https://frankie851.github.io/kobla-kviz/navrhy/
- Skript (web app): — (čeká se na Davida)

## Otevřené otázky a rizika
- `[DOPLNIT]` texty: velikost týmu, počet kol a otázek, typy kol, ceny, platba hotově/kartou, délka kvízu, příchod předem, pravidla (mobil), jméno organizátora, správce údajů, lhůta 12 měsíců, kontakty v `config.js`.
- CORS a POST `text/plain` neověřené z oficiální dokumentace (D-017) – ověří se na zastávce 3.
- Akce `actions/checkout@v4` a `configure-pages@v5` hlásí upozornění na Node 20 (zatím jen varování, běží na Node 24).

## Jak navázat
Přečti v tomto pořadí: `CLAUDE.md` → `docs/HANDOFF.md` → `docs/PLAN.md` → `docs/DECISIONS.md` → `docs/SPEC.md`. Zvolený design (DECISIONS.md D-013) neměň bez souhlasu Davida.
