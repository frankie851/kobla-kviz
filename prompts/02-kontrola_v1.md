---
projekt: Kobla Kvíz web
prompt: 02-kontrola
verze: v1
datum: 2026-11-05
prostredi: Claude Code v cloudu (claude.ai/code), repozitář kobla-kviz, NOVÉ sezení
model: Opus 5.5
effort: High
rezim: C samostatný
navazuje_na: 01-kobla-kviz-web (spustit až po jeho závěrečné zprávě)
---

# Jak spustit (pro Davida)

1. Spusť, až prompt 01 skončí závěrečnou zprávou a web běží. Pokud na GitHubu visí otevřený pull request, nejdřív ho sluč.
2. Otevři **claude.ai/code**, vyber repozitář `kobla-kviz` a založ **nové** sezení, ne to, ve kterém web vznikal. Kontrolor nemá vidět, jak web vznikal, jinak by jen potvrdil sám sebe.
3. Vyber model **Opus 5.5** a effort **High**.
4. Zkopíruj vše od nadpisu „Kontext“ do konce a vlož.
5. Výsledkem je soubor `docs/KONTROLA.md` s verdiktem a nálezy. Opravy pak spustíš promptem `prompts/03-opravy_v1.md`.

---

## Kontext
Jsi kontrolor webu hospodského kvízu Kobla Kvíz. Web vznikl v jiném sezení podle `docs/SPEC.md` a ty jsi u toho nebyl – to je záměr. Majitel David není programátor a web spravuje přes Google tabulku a Google Apps Script (`apps-script/Code.gs`). Tvým úkolem je najít chyby dřív, než je najdou hráči. Kód ani dokumenty neměň (viz `CLAUDE.md`, „Pracovní pravidla – při kontrole“).

## Cíl
Zjistit, jestli je web připravený ke spuštění. Hlavně hledej, co by vedlo ke ztrátě přihlášky, přeplnění termínu, úniku osobních údajů hráčů nebo tajného klíče, nebo k nefunkčnímu webu na mobilu.

## Vstupy
- `docs/SPEC.md` – požadavky R1–R12 a kritéria přijetí K1–K13
- `CLAUDE.md`, `docs/DECISIONS.md`, `docs/HANDOFF.md` (adresa webu a skriptu)
- hlavní větev repozitáře včetně historie gitu – kontroluješ ji, protože z ní se web nasazuje
- nasazený web na adrese z `docs/HANDOFF.md`; když není dostupný, kontroluj místní kopii a napiš to do zprávy
- `NAVOD.md`

## Co smíš a nesmíš
- Smíš číst veřejná data ze skutečného skriptu (GET), např. kvůli K7.
- Na skutečný skript nic neodesílej – ani přihlášku, ani formulář hospod. Zapsalo by se to do Davidovy tabulky a rozeslaly by se e-maily a zprávy.
- Pokusné testy, Playwright a další pomocné nástroje dávej mimo repozitář (např. do dočasné složky). Dočasné změny v pracovní kopii (např. nefunkční adresa v `config.js` pro zkoušku nedostupného skriptu) vrať a necommituj.
- Davidovy kontakty a jméno správce na webu a fotky z akcí jsou veřejné záměrně, nejsou nález.

## Postup
1. **Kritéria přijetí:** u každého K1–K13 urči *splněno / nesplněno / odsud nejde ověřit* a připiš jednou větou proč.
2. **Bezpečnost:** prohledej repozitář včetně historie (`git log -p`) na token Telegramu, chat ID a e-maily a telefony hráčů. Z kódu `Code.gs` ověř, že veřejná data (GET) nikdy neobsahují jména kapitánů, e-maily, telefony ani poznámky, a že tajné hodnoty se čtou jen ze Script Properties.
3. **Logika přihlášek:** spusť `node --test tests/`. Pak čti kód kapacity, náhradníků, zámku, uzávěrky a duplicity a hledej případy, které testy nepokrývají. Například: termín kolem půlnoci a na přelomu měsíce, datum jako text i jako objekt, zrušený termín, kapacita 0, David změní kapacitu po naplnění, uvolněné místo při čekajícím náhradníkovi, název týmu s jinými velkými písmeny nebo mezerami, prázdný nebo divně zapsaný telefon, honeypot vyplněný robotem, selhání e-mailu. Vlastní pokusné testy smíš spustit (mimo repozitář), popiš je v nálezech.
4. **Web:** pokud jde spustit prohlížeč bez okna, projdi všechny stránky na 390, 768 a 1280 px. Kontroluj češtinu (skloňování počtů, formáty data a času, překlepy, anglické zbytky), kontrast, ovládání klávesnicí, chybové hlášky formuláře, chování při nedostupném skriptu a jestli je vypnutý demo režim (pokud je skript napojený). Bez prohlížeče kontroluj aspoň z kódu a napiš to do zprávy.
5. **Návod:** projdi `NAVOD.md` očima člověka, který nikdy neprogramoval. Kde by se zasekl, co chybí, kde neví, kam kliknout? Je tam i postup pro nasazení nové verze skriptu?
6. **Texty k doplnění:** vypiš všechna `[DOPLNIT]` s cestou k souboru.

## Výstup – `docs/KONTROLA.md`
```markdown
# KONTROLA – Kobla Kvíz web
datum: <RRRR-MM-DD> · model: <model, effort>

## Verdikt
<Připraveno ke spuštění | Spustit po opravách | Nespouštět> – <1–2 věty proč>

## Kritéria přijetí
| K | Stav | Proč |
|---|---|---|
| K1 | splněno / nesplněno / nejde ověřit | … |

## Nálezy
### Kritické (ztráta přihlášky, přeplnění, únik dat nebo klíče)
- **N-1** <soubor:řádek> – co se stane · jak to ověřit · návrh opravy slovy
### Důležité
### Drobné

## Co musí ověřit David
- <krok, co má vidět>

## Texty k doplnění
- `<soubor>` – [DOPLNIT: …]
```
Nálezy čísluj N-1, N-2… napříč všemi skupinami, ať se na ně dá odkázat.

Verdikt: aspoň jeden kritický nález → *Nespouštět*. Jen důležité a drobné nálezy → *Spustit po opravách*. Jen drobné nebo žádné → *Připraveno ke spuštění*.

Commitni jen `docs/KONTROLA.md`. Smíš-li pushovat do hlavní větve, commitni ho tam. Jinak otevři pull request a v závěrečné zprávě požádej Davida o sloučení, aby opravné sezení soubor našlo.

## Ověření a definice hotovo
- [ ] Každé K1–K13 má stav a zdůvodnění.
- [ ] Každý nález má místo v kódu, dopad, způsob ověření a návrh opravy.
- [ ] Verdikt odpovídá pravidlu výše.
- [ ] Žádný jiný soubor v repozitáři se nezměnil (`git status` před commitem).

## Závěrečná zpráva
5–10 řádků česky pro Davida: verdikt, počet nálezů podle závažnosti, 1–3 nejdůležitější nálezy jednou větou, co má ověřit sám a případně který pull request má sloučit.
