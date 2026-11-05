# Kobla Kvíz – mapa balíčku
Navrženo: 2026-11-05 · Opus 5.5 (chat v projektu Hospodský kvíz)

## Rozhodnutí v kostce
| Prostředí | Návrh | Provedení | Kontrola | Režim | Úroveň dokumentace |
|---|---|---|---|---|---|
| Claude Code v cloudu, repozitář `kobla-kviz` | Opus 5.5 · chat | Opus 5.5 · High | Opus 5.5 · High v novém sezení + David ručně | B se 3 zastávkami | 2 |

## Než začneš (jednou, asi 5 minut)
1. Na GitHubu klikni **New repository**: název `kobla-kviz`, zvol **Public**, zaškrtni **Add a README file** a klikni **Create repository**.
   Repozitář musí být veřejný, jinak ho GitHub Pages zdarma nezveřejní. Nevadí to, protože v něm nebudou žádné klíče ani osobní údaje hráčů.
2. V repozitáři klikni **Add file → Upload files** a do okna přetáhni **obsah** rozbalené složky `kobla-kviz` (soubory `00-INDEX.md`, `CLAUDE.md` a složky `docs` a `prompts`). Klikni **Commit changes**.
   Na GitHubu má potom být `CLAUDE.md` přímo v kořeni a vedle něj složky `docs` a `prompts`. Pokud se objeví o úroveň níž ve složce `kobla-kviz/`, nahrál jsi celou složku místo jejího obsahu – smaž ji a zkus to znovu.
3. Otevři **claude.ai/code**, vyber repozitář `kobla-kviz` a založ nové sezení.
4. Pokračuj podle „Jak spustit“ v `prompts/01-kobla-kviz-web_v1.md`.

## Pořadí spuštění
| # | Prompt | Prostředí · model · effort | Vstup | Výstup | Kdo dává OK |
|---|---|---|---|---|---|
| 1 | `prompts/01-kobla-kviz-web_v1.md` | Claude Code cloud · Opus 5.5 · High | `CLAUDE.md`, `docs/*` | web na GitHub Pages, `apps-script/Code.gs`, `NAVOD.md` | David na 3 zastávkách: výběr designu · adresa skriptu · výsledek zkušební přihlášky |
| 2 | `prompts/02-kontrola_v1.md` | Claude Code cloud, **nové** sezení · Opus 5.5 · High | hotový repozitář a web | `docs/KONTROLA.md` s verdiktem | — |
| 3 | `prompts/03-opravy_v1.md` | Claude Code cloud, nové sezení · Opus 5.5 · High | `docs/KONTROLA.md` | opravený web | David schválí seznam oprav |

## Co tě čeká během promptu 01
1. **Zastávka 1** – odkaz na 5 návrhů designu. Otevři je na mobilu i na počítači a napiš, který bereš, nebo co z kterého zkombinovat. Ve stejné zprávě tě Claude Code možná požádá o jedno či dvě kliknutí na GitHubu (zapnout GitHub Pages, sloučit pull request).
2. **Zastávka 2** – `NAVOD.md`: Google tabulka, skript a Telegram bot (zhruba 20–30 minut klikání). Pak pošleš adresu skriptu.
3. **Zastávka 3** – zkušební přihláška z mobilu podle kontrolního seznamu v `NAVOD.md`. Napíšeš, co přišlo a co ne.
4. **Konec** – závěrečná zpráva se seznamem textů k doplnění (`[DOPLNIT]`).

## Pull requesty
Pokud Claude Code nesmí zapisovat rovnou do hlavní větve, pošle ti pull request. Na GitHubu ho otevři a klikni **Merge pull request** → **Confirm merge**. Teprve potom se změny objeví na webu a uvidí je i další sezení.

## Když dojdou limity nebo sezení skončí
Claude Code zapisuje stav do `docs/HANDOFF.md`. Pokud visí otevřený pull request, nejdřív ho sluč. Pak v novém sezení (klidně Sonnet 5.5 · High) napiš:
„Přečti CLAUDE.md a docs/HANDOFF.md a pokračuj podle docs/PLAN.md.“

## Soubory
- `CLAUDE.md` – stálá pravidla, Claude Code ho čte sám při každém startu
- `docs/SPEC.md` – co a proč: požadavky R1–R12 a kritéria přijetí K1–K13
- `docs/PLAN.md` – fáze a kroky, Claude Code je odškrtává
- `docs/DECISIONS.md` – rozhodnutí: prvních 5 z návrhu, další doplňuje Claude Code
- `docs/HANDOFF.md` – předávka mezi sezeními, plní Claude Code
- `prompts/01-…`, `02-…`, `03-…` – zadání ke spuštění
