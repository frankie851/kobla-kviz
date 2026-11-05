---
projekt: Kobla Kvíz web
prompt: 03-opravy
verze: v1
datum: 2026-11-05
prostredi: Claude Code v cloudu (claude.ai/code), repozitář kobla-kviz, nové sezení
model: Opus 5.5
effort: High
rezim: B polo-samostatný
navazuje_na: 02-kontrola (docs/KONTROLA.md)
---

# Jak spustit (pro Davida)

1. Spusť po kontrole, až je `docs/KONTROLA.md` v hlavní větvi (případný pull request kontroly nejdřív sluč).
2. Otevři **claude.ai/code**, vyber repozitář `kobla-kviz` a založ nové sezení.
3. Vyber model **Opus 5.5** a effort **High**.
4. V části „Které nálezy“ níže přepiš seznam, pokud nechceš opravit všechny.
5. Zkopíruj vše od nadpisu „Kontext“ do konce a vlož.

---

## Kontext
Web hospodského kvízu Kobla Kvíz je hotový a kontrolor v jiném sezení zapsal nálezy do `docs/KONTROLA.md`. Pravidla projektu jsou v `CLAUDE.md`, požadavky v `docs/SPEC.md`, rozhodnutí v `docs/DECISIONS.md`, stav v `docs/HANDOFF.md`. Majitel David není programátor.

## Které nálezy
Všechny kritické a důležité nálezy z `docs/KONTROLA.md`. Drobné jen tehdy, když oprava nemění vzhled ani chování webu, jinak je vypiš v závěrečné zprávě jako návrh.

## Postup
1. Přečti `CLAUDE.md`, `docs/HANDOFF.md`, `docs/KONTROLA.md` a části `docs/SPEC.md`, kterých se nálezy týkají.
2. Pošli Davidovi seznam oprav, které uděláš (u každé N-… jedna věta), a počkej na jeho „OK“.
3. Oprav je jednu po druhé. U logiky skriptu nejdřív napiš test, který chybu zachytí, pak ji oprav a test spusť.
4. Ke každé opravě zapiš řádek do `docs/DECISIONS.md` (nález, co se změnilo) a do `docs/KONTROLA.md` u nálezu připiš „opraveno <datum>“. Jinak KONTROLA neměň.
5. Pokud se změnil `apps-script/Code.gs`, napiš Davidovi krok za krokem, jak nový kód vložit a nasadit jako novou verzi se stejnou adresou (viz `NAVOD.md`, bod h).

## Pravidla
- Opravuj jen nálezy z KONTROLA.md. Nic navíc.
- Pravidla „Nikdy“ a „Jen s Davidovým souhlasem“ z `CLAUDE.md` platí i tady, včetně zákazu odesílat cokoli na skutečný skript.
- Na jeden nález max. 3 pokusy, pak ho označ jako neopravený a pokračuj.

## Ověření a definice hotovo
- [ ] Každý vybraný nález je opravený, nebo je u něj napsáno proč ne.
- [ ] `node --test tests/` prochází.
- [ ] Změněné stránky jsi prohlédl na 390 a 1280 px.
- [ ] Práce je v hlavní větvi, nebo v pull requestu, o jehož sloučení jsi Davida požádal.
- [ ] `docs/HANDOFF.md` je aktuální.

## Závěrečná zpráva
5–10 řádků česky: co je opravené, co ne a proč, jestli musí David znovu nasadit skript a co má zkusit (např. znovu zkušební přihlášku).
