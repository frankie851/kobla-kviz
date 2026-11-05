---
projekt: Kobla Kvíz web
prompt: 01-kobla-kviz-web
verze: v1
datum: 2026-11-05
prostredi: Claude Code v cloudu (claude.ai/code), repozitář kobla-kviz
model: Opus 5.5
effort: High
rezim: B polo-samostatný se 3 zastávkami
navazuje_na: —
---

# Jak spustit (pro Davida)

1. Měj připravený veřejný repozitář `kobla-kviz` s nahraným balíčkem (postup je v `00-INDEX.md`, část „Než začneš“).
2. Otevři **claude.ai/code**, vyber repozitář `kobla-kviz` a založ nové sezení.
3. Vyber model **Opus 5.5** a effort **High** (v nabídce modelu, nebo napiš `/effort high`).
4. Zkopíruj vše od nadpisu „Kontext“ do konce a vlož jako první zprávu.
5. Co tě čeká – Claude Code pracuje sám a ozve se na třech zastávkách:
   - **Zastávka 1:** odkaz na 5 návrhů designu. Otevři je na mobilu i na počítači a napiš, který bereš (např. „Beru C“ nebo „Barvy z B, písmo a logo z D“). Ve stejné zprávě tě možná požádá o jedno či dvě kliknutí na GitHubu (zapnout zveřejňování, sloučit pull request). Napíše přesně kam.
   - **Zastávka 2:** pošle tě do `NAVOD.md`. Založíš Google tabulku, vložíš skript a vytvoříš Telegram bota (zhruba 20–30 minut). Pak mu pošleš adresu skriptu.
   - **Zastávka 3:** zkušební přihláška z mobilu podle kontrolního seznamu v `NAVOD.md`. Napíšeš mu, co přišlo a co ne.
6. Když sezení skončí nebo dojdou limity: pokud na GitHubu visí otevřený pull request, nejdřív ho sluč (*Merge pull request*). Pak v novém sezení (klidně Sonnet 5.5 · High) napiš: „Přečti CLAUDE.md a docs/HANDOFF.md a pokračuj podle docs/PLAN.md.“

---

## Kontext
Stavíš web hospodského kvízu **Kobla Kvíz**, který pořádá David v Prostějově a okolí (podniky do ~50 km). David má domluvené 3 a víc podniků a není programátor. Web bude spravovat přes Google tabulku a všechno, co musí udělat ručně, potřebuje česky krok za krokem s tím, kam kliknout.

Zadání vzniklo v rozhovoru s Davidem a je rozepsané v souborech repozitáře. Ty jsou závazné:
- `docs/SPEC.md` – požadavky R1–R12 a kritéria přijetí K1–K13,
- `docs/PLAN.md` – fáze a kroky,
- `docs/DECISIONS.md` – už přijatá rozhodnutí (technologie, kapacita a náhradníci, správa obsahu, název, tykání),
- `CLAUDE.md` – struktura, větve a nasazení, co platí při rozporu a co nikdy nedělat.

Kromě nich je repozitář prázdný. Texty, fotky ani logo zatím neexistují.

## Cíl
Veřejný web na GitHub Pages, kde týmy zjistí, kde a kdy se hraje, a přihlásí se. David přihlášku hned dostane do Google tabulky, na e-mail i na Telegram, tým dostane potvrzení a plné termíny se samy uzavřou. Web má být chytlavý a moderní a má lákat i nové hospody.

## Vstupy
- Než začneš, přečti `CLAUDE.md`, `docs/SPEC.md`, `docs/PLAN.md`, `docs/DECISIONS.md` a `docs/HANDOFF.md`.
- Co platí při rozporu mezi soubory a tímto promptem, říká `CLAUDE.md` v části „Co platí při rozporu“.
- Máš-li k dispozici skill pro návrh frontendu (např. `frontend-design`), použij ho při návrzích designu i při stavbě webu.

## Výstup
- Web v kořeni repozitáře podle struktury v `CLAUDE.md`, nasazený na GitHub Pages z hlavní větve.
- `apps-script/Code.gs`, testy v `tests/` a `NAVOD.md` pro Davida.
- `navrhy/` s 5 návrhy a rozcestníkem.
- Průběžně aktualizované `docs/PLAN.md`, `docs/DECISIONS.md` a `docs/HANDOFF.md`.
- Všechny texty pro Davida i na webu česky.

## Postup
Pracuj podle fází v `docs/PLAN.md`. K jednotlivým fázím:

**Fáze 0 – zveřejňování.** Zjisti, jestli smíš pushovat do hlavní větve a jestli umíš GitHub Pages zapnout sám (např. přes `gh`, pokud ho máš). Nasazení nastav z hlavní větve (viz „Větve a nasazení“ v `CLAUDE.md`), aby web běžel na `https://<účet>.github.io/kobla-kviz/`. Co musí David udělat ručně (zapnout Pages: *Settings → Pages → Source: GitHub Actions*, sloučit pull request), na to kvůli tomu zvlášť nečekej. Přidej přesný postup do zprávy na zastávce 1 a mezitím pracuj na návrzích. Zjištění a zvolenou cestu zapiš do DECISIONS.md.

**Fáze 1 – 5 návrhů designu.** Každý návrh je samostatná úvodní stránka (`navrhy/a-<nazev>/index.html` až `navrhy/e-<nazev>/index.html`) se stejným ukázkovým obsahem z `data/demo.json`: úvod s nejbližším kvízem, Kde hrajeme se 3 podniky, sekce Přihláška s formulářem (zatím bez funkce), zkrácené Jak kvíz probíhá a patička. Každý má vlastní logo, písmo a barvy. Směry se musí lišit výrazně – barvami, písmem, kompozicí i náladou, ne jen odstínem. Pro inspiraci (nemusíš se jich držet): tmavý neon večerní hospody, hravý a barevný, retro pivní etiketa a dva vlastní. Písma vybírej podle pravidel ve SPEC (volná licence, česká diakritika). Rozcestník `navrhy/index.html` ukáže u každého směru náhled, dvě věty o náladě a odkaz. Pokud jde v prostředí spustit prohlížeč bez okna (např. Playwright, nainstalovaný mimo repozitář), udělej snímky každého návrhu na šířce 390 px a 1280 px do `navrhy/nahledy/`, prohlédni si je a oprav, co vypadá rozbitě. Když prohlížeč nainstalovat nejde, zapiš to a pokračuj bez snímků.
→ **ZASTÁVKA 1.** Pošli Davidovi odkaz na rozcestník, k němu jeden řádek o každém směru a ruční kroky z Fáze 0 (sloučit PR, zapnout Pages). Když web ještě neběží a nemáš snímky, nabídni náhled přes `https://raw.githack.com/<účet>/kobla-kviz/<větev>/navrhy/index.html` (funguje u veřejného repozitáře). Zeptej se, který směr bere, nebo co z kterého zkombinovat. Dál nepokračuj, dokud neodpoví. Jeho volbu zapiš do DECISIONS.md jako „Kdo: David“.

**Fáze 2 – celý web ve vybraném stylu**, zatím v demo režimu (prázdný `config.js`). Ukázková data musí být vymyšlená, ne skutečné podniky ani lidé, aby nikoho nemátla. Patří sem finální logo, favicon a obrázek pro sdílení 1200×630 ve formátu PNG. Převod z SVG udělej nástrojem nainstalovaným mimo repozitář, a když to nejde, zapiš to jako otevřené. Texty, u kterých neznáš fakta, napiš jako návrh s `[DOPLNIT: …]`.

**Fáze 3 – skript a návod.** Napiš `apps-script/Code.gs` podle oddílu „Skript“ ve SPEC a otestuj logiku v `tests/` (`node --test tests/`). Testy musí pokrýt kapacitu i pravidlo náhradníků, souběh dvou přihlášek na poslední místo (nasimulovaný zámek a ověření, že kód zámek opravdu používá kolem čtení i zápisu), uzávěrku, duplicitu, validaci, výběr veřejných dat bez osobních údajů a selhání Telegramu. Fakta o Google a Telegramu neber z paměti, ale ověř je v aktuální dokumentaci: jak nasadit web app a nasadit novou verzi se stejnou adresou, jak z prohlížeče volat skript a číst odpověď bez potíží s CORS, denní limity e-mailů a jak zjistit chat ID Telegramu. Když dokumentaci nejde otevřít, použij nejlepší znalost, označ ji v DECISIONS.md „neověřeno ze zdroje“ a ověř ji prakticky na zastávkách 2 a 3.
`NAVOD.md` piš pro člověka, který nikdy neprogramoval. Každý krok říká, kam kliknout. Obsahuje:
- a) založení Google tabulky a spuštění přípravné funkce, která vytvoří listy s ukázkovými řádky,
- b) vložení skriptu a jeho nasazení jako web app (včetně oprávnění, která Google bude chtít, a proč jsou potřeba),
- c) založení Telegram bota přes @BotFather a zjištění chat ID,
- d) vložení tajných hodnot a e-mailu pro upozornění do Script Properties,
- e) jak a kam poslat adresu skriptu,
- f) kontrolní seznam zkušební přihlášky (K3, K4, K6),
- g) každodenní správu: přidat podnik a termín, zrušit přihlášku, posunout náhradníka, zapsat výsledky, přidat fotky (pošle je Claudovi),
- h) co dělat, když se skript změní (vložit nový kód a nasadit novou verzi se stejnou adresou),
- i) časté problémy a jejich řešení,
- j) volitelně hezčí adresu přes bezplatnou organizaci na GitHubu.
→ **ZASTÁVKA 2.** Napiš Davidovi, ať projde body a)–e) v `NAVOD.md` (odhadni čas), a počkej na adresu skriptu.

**Fáze 4 – napojení a ověření.** Vlož adresu skriptu do `config.js`. Je veřejná a web ji potřebuje, nejde o tajemství. Zkus načíst veřejná data ze skriptu (GET). Pokud se k němu z tvého prostředí nedostaneš (síť může být omezená), neobcházej to a ověř web proti demo datům. Na skutečný skript nic neodesílej (ani přihlášku, ani formulář hospod), zapsalo by se to Davidovi do tabulky a rozeslaly by se zprávy. Projdi K1–K13: co ověřit umíš, ověř.
→ **ZASTÁVKA 3.** Pošli Davidovi kontrolní seznam z `NAVOD.md` bod f) a počkej, co mu přišlo. Co nefunguje, oprav a nech ho zkusit znovu (max. 3 kola).

**Fáze 5 – předání.** Složku `navrhy/` nemaž. Označ ji `noindex` a v závěrečné zprávě se zeptej, jestli ji má odstranit.

## Pravidla a omezení
- „Kobla“ je jen název kvízu: žádný výklad významu, slovní hříčky ani maskot. David si to výslovně nepřeje.
- Repozitář je veřejný, protože GitHub Pages zdarma to vyžadují. Proto v něm nesmí být tajné hodnoty ani osobní údaje hráčů, ani v historii gitu. Davidovy kontakty, které sám dodá, a fotky z akcí jsou na webu záměrně.
- Žádné CDN, Google Fonts ani analytika. Přenos IP adres hráčů třetím stranám je problém kvůli GDPR a web má fungovat, i když cizí služba vypadne.
- Jednoduchost má přednost před chytrými triky. Web bude David upravovat s Claudem i za měsíce.
- Mimo rozsah je to, co uvádí SPEC v části „Mimo rozsah“. Napadne-li tě vylepšení navíc, nestav ho a napiš ho do závěrečné zprávy jako návrh.

## Režim práce a kdy se zastavit
- Režim B: mezi zastávkami pracuješ bez dotazů.
- Chybí-li údaj: použij rozumný předpoklad, zapiš ho do DECISIONS.md (u textů jako `[DOPLNIT: …]`) a pokračuj.
- Mimo zastávky se zastav a zeptej, jen když potřebuješ přístup nebo údaj, který má jen David, když by něco stálo peníze, když bys mazal data, nebo když rozpor mezi soubory mění to, co David dostane.
- Na jeden problém max. 3 pokusy. Pak ho zapiš do HANDOFF.md jako otevřený a pokračuj jinou částí.
- Po každém kroku odškrtni PLAN.md. HANDOFF.md aktualizuj před každou zastávkou a na konci sezení.

## Ověření a definice hotovo
Hotovo = splněná všechna kritéria K1–K13 v `docs/SPEC.md`. K3 a reálnou část K4 a K6 ověřuje David na zastávce 3, hotové jsou, až je potvrdí.
Před každou zastávkou a před závěrečnou zprávou:
- od Fáze 3 procházejí testy v `tests/`,
- od Fáze 2 jsi prohlédl všechny stránky na 390, 768 a 1280 px (snímky, nebo aspoň kontrola rozvržení v kódu, pokud prohlížeč nejde),
- prohledal jsi repozitář včetně historie na token, chat ID a e-maily a telefony hráčů (`git log -p` + hledání),
- všechny odkazy na webu vedou na existující stránky a kotvy,
- práce je v hlavní větvi, nebo v pull requestu, o jehož sloučení jsi Davida požádal.

## Závěrečná zpráva
Česky, 10–20 řádků, srozumitelně pro neprogramátora:
- adresa webu,
- co je hotovo a které K1–K13 jsou ověřené,
- co musí ověřit nebo doplnit David,
- seznam všech `[DOPLNIT]` a ve kterém souboru se mění,
- předpoklady, které jsi udělal,
- otázka, zda smazat složku `navrhy/`,
- 1–3 návrhy na další verzi (např. sezónní žebříček, vlastní doména).
