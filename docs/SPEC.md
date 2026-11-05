# SPEC – Kobla Kvíz web
verze: v1 · datum: 2026-11-05

## Cíl a smysl
Web hospodského kvízu **Kobla Kvíz**, kde týmy zjistí, kde a kdy se hraje, a během minuty se přihlásí. Organizátor (David) dostane každou přihlášku hned do Google tabulky, na e-mail i na Telegram, tým dostane potvrzení e-mailem a plné termíny se samy uzavřou. Web má být chytlavý a moderní a má lákat i nové hospody, aby kvíz pořádaly u sebe.

## Uživatelé
- **Hráči a kapitáni týmů** z Prostějova a okolí (do ~50 km). Web otevírají hlavně na mobilu, často z odkazu na sociálních sítích. Chtějí rychle vidět, kdy a kde se hraje, kolik zbývá míst, a přihlásit tým.
- **Majitelé hospod.** Chtějí pochopit, co kvíz je, a domluvit si ho u sebe.
- **Organizátor David.** Není programátor. Web spravuje přes Google tabulku. Co se mění zřídka (texty, FAQ, fotky), mění s pomocí Clauda.

## Rozsah
**V rozsahu (v1):**
- hlavní stránka se sekcemi R1–R8 a podstránky Výsledky, Fotky a Zpracování osobních údajů
- přihláška týmu s hlídáním kapacity a přihláškou náhradníka
- formulář „Chci Kobla Kvíz u nás“ pro hospody
- Google tabulka a Google Apps Script (zápis, kapacita, e-maily, Telegram, veřejná data pro web)
- 5 návrhů designu k výběru, logo, favicon, obrázek pro sdílení
- návod pro Davida (`NAVOD.md`)

**Mimo rozsah (záměrně):**
- online platby startovného
- uživatelské účty a přihlašování hráčů
- celkový sezónní žebříček (struktura dat ho ale nesmí znemožnit – výsledky se ukládají po termínech s body)
- vícejazyčnost (web je jen česky)
- analytika, sledovací cookies, newsletter
- administrace na webu (správa probíhá v Google tabulce)
- automatický posun náhradníka na uvolněné místo (řeší David ručně v tabulce)
- vlastní doména (lze připojit později)

## Požadavky

### Hlavní stránka – sekce
- **R1 Úvod** – logo, krátký slogan, nejbližší kvíz (den, datum, čas, podnik, počet volných míst) a výrazné tlačítko *Přihlásit tým* viditelné na mobilu bez posouvání.
- **R2 Kde hrajeme** – karta pro každý aktivní podnik: název, město, adresa s odkazem na mapu, krátký popis, nejbližší termíny s počtem volných míst nebo stavem (Obsazeno / Uzavřeno / Zrušeno). Klik na termín předvyplní přihlášku.
- **R3 Přihláška** – formulář podle oddílu „Přihláška – pravidla“.
- **R4 Jak kvíz probíhá** – 4–5 kroků s ikonami: velikost týmu, počet kol, startovné, ceny, pravidla (texty jako návrh s `[DOPLNIT: …]`).
- **R5 Výsledky (náhled)** – pořadí posledního odehraného kvízu a odkaz na podstránku Výsledky.
- **R6 Fotky (náhled)** – pár fotek z posledního večera a odkaz na galerii. Když fotky nejsou, sekce se nezobrazí vůbec, ani v menu.
- **R7 Časté dotazy** – rozbalovací otázky a odpovědi (návrh 6–8 otázek s `[DOPLNIT: …]`, kde chybí fakta).
- **R8 Kontakt** – e-mail, telefon, odkazy na sociální sítě (`[DOPLNIT]`) a formulář „Chci Kobla Kvíz u nás“.

### Podstránky a patička
- **R9 Výsledky** (`vysledky.html`) – pořadí týmů a body pro každý odehraný kvíz, nejnovější nahoře, filtr podle podniku.
- **R10 Fotky** (`fotky.html`) – galerie po večerech (datum + podnik), zvětšení po kliknutí.
- **R11 Zpracování osobních údajů** (`osobni-udaje.html`) – krátký srozumitelný text: kdo údaje zpracovává (`[DOPLNIT: jméno správce]`), proč (organizace kvízu), jak dlouho (návrh: 12 měsíců od kvízu), jak požádat o výmaz, že se z akcí fotí a jak požádat o odstranění fotky. Označ jako návrh k ověření – nejde o právní radu.
- **R12 Patička** na všech stránkách – kontakty, odkaz na R11, rok.

### Přihláška – pravidla
- **Pole:** termín (nabízí jen budoucí, nezrušené termíny; u plného termínu označení *náhradník*), název týmu (2–40 znaků), počet hráčů (1 až `max_hracu` daného termínu), jméno kapitána, e-mail, telefon (povinný, kvůli domluvě na poslední chvíli), poznámka (volitelná, max. 500 znaků), souhlas se zpracováním údajů s odkazem na R11 (povinný). Ostatní pole jsou povinná.
- **Kapacita:** skript spočítá přihlášky se stavem *Potvrzeno* pro daný termín. Nová přihláška dostane stav *Potvrzeno*, jen když je jich méně než `kapacita_tymu` **a** termín nemá žádného čekajícího náhradníka. Jinak dostane stav *Náhradník*. Díky tomu nový tým nepředběhne náhradníky, když David uvolní místo; náhradníka na uvolněné místo posouvá David ručně. Rozhoduje vždy skript, ne web, protože web může ukazovat zastaralý stav. Web ukazuje „Obsazeno“, kdykoli by nová přihláška skončila jako náhradník.
- **Souběh:** dvě přihlášky na poslední místo ve stejnou chvíli → právě jedna je *Potvrzeno* (zámek na straně skriptu).
- **Uzávěrka:** přihlašování končí v čase začátku termínu, nebo dřív, pokud je vyplněný sloupec `uzaverka`.
- **Duplicita:** stejný název týmu na stejný termín (bez ohledu na velká/malá písmena a mezery navíc) se odmítne srozumitelnou hláškou.
- **Po odeslání:** zpráva na obrazovce (potvrzeno / náhradník / chyba), potvrzovací e-mail týmu (termín, podnik, adresa, startovné, jak se odhlásit – odpovědí na e-mail), e-mail organizátorovi a zpráva na Telegram.
- **Ochrana proti spamu:** skryté pole (honeypot) a minimální doba vyplnění formuláře, bez CAPTCHA.
- **Validace** na webu (okamžitá nápověda u pole) i ve skriptu (rozhodující).

### Formulář „Chci Kobla Kvíz u nás“
Pole: název podniku, město, kontaktní osoba, e-mail, telefon, přibližná kapacita (počet míst), zpráva, souhlas. Povinné jsou název podniku, město, kontaktní osoba, aspoň jeden z e-mailu a telefonu a souhlas. Výsledek se zapíše do listu `Hospody` a přijde e-mail a Telegram organizátorovi. Odesílatel uvidí poděkování na obrazovce. Ochrana proti spamu stejná jako u přihlášky.

### Data – Google tabulka
| List | Kdo plní | Sloupce |
|---|---|---|
| `Podniky` | David | `id`, `nazev`, `mesto`, `adresa`, `mapa_url`, `popis`, `aktivni` (Ano/Ne) |
| `Terminy` | David | `id`, `podnik_id`, `datum`, `cas`, `kapacita_tymu`, `max_hracu`, `startovne_kc`, `uzaverka` (volitelné), `stav` (Otevřeno/Zrušeno), `poznamka` |
| `Prihlasky` | skript (David mění jen `stav`) | `cas_odeslani`, `termin_id`, `tym`, `pocet_hracu`, `kapitan`, `email`, `telefon`, `poznamka`, `stav` (Potvrzeno/Náhradník/Zrušeno), `souhlas` |
| `Vysledky` | David | `termin_id`, `poradi`, `tym`, `body` |
| `Hospody` | skript | `cas_odeslani`, `podnik`, `mesto`, `kontaktni_osoba`, `email`, `telefon`, `kapacita`, `zprava`, `souhlas` |
| `Chyby` | skript | `cas`, `akce`, `popis` (např. selhání Telegramu) |

Formáty: `datum` je buňka typu datum (David píše např. `14.11.2026`), `cas` je čas `HH:MM` a `uzaverka` je datum a čas (např. `14.11.2026 12:00`). Skript musí zvládnout, že Google tabulka vrací datum jako objekt i jako text. `id` jsou krátké texty, které David vymyslí (např. `lev`, `lev-2026-11-14`); přípravná funkce do listů vloží ukázkové řádky, aby viděl, jak je psát.

Když David změní stav přihlášky na *Zrušeno*, místo se uvolní (projeví se při dalším načtení dat). Změna v tabulce se na webu projeví nejpozději do 2 minut.

### Skript – Google Apps Script
- **Veřejná data (GET):** aktivní podniky, budoucí termíny s počtem volných míst a stavem (otevřeno / obsazeno / uzavřeno / zrušeno) a výsledky odehraných kvízů. **Nikdy** neobsahují jména kapitánů, e-maily, telefony ani poznámky. Krátká mezipaměť (např. 60 s), kterou každá nová přihláška smaže.
- **Akce (POST):** `prihlaska` a `hospoda`, se stejnou validací a ochranou proti spamu jako na webu.
- **Tajné hodnoty a nastavení** jen ve Script Properties, nikdy v kódu ani v repozitáři: token Telegram bota a chat ID (tajné) a e-mail, na který chodí upozornění (není tajný, ale díky tomu zůstane kód v repozitáři obecný).
- **Odolnost:** zápis do tabulky má přednost. Selhání e-mailu nebo Telegramu nezpůsobí ztrátu přihlášky. Chyba se zapíše do listu `Chyby`.
- **Příprava:** funkce, kterou David spustí jedním kliknutím a která vytvoří listy s hlavičkami (a nepřepíše existující data).
- Časové pásmo projektu: `Europe/Prague`.

### Web – technika
- Statický web: HTML, CSS a JavaScript bez frameworku a bez sestavovacího kroku. Písma a knihovny jsou uložené v repozitáři. Žádné Google Fonts ani CDN – kvůli GDPR (přenos IP adres hráčů třetím stranám) a spolehlivosti.
- Písma: jen s volnou licencí (např. SIL OFL), s českou diakritikou (sada latin-ext), ve formátu WOFF2. Stáhnout se dají např. z npm balíčků `@fontsource/<písmo>`; soubor licence ulož vedle písma. Když stažení nejde, použij systémová písma a zapiš to.
- `config.js` obsahuje adresu skriptu (je veřejná, nejde o tajemství). Prázdná adresa = **demo režim**: data z `data/demo.json` s vymyšlenými podniky, nenápadný štítek „ukázková data“, odeslání formuláře se jen předvede.
- Během načítání se zobrazí kostra obsahu. Při nedostupném skriptu web ukáže srozumitelnou hlášku s kontaktem.
- Mobile first: primárně šířka 360–430 px, funguje do 1440 px a víc.
- Přístupnost: kontrast podle WCAG AA, popisky u všech polí, ovládání klávesnicí, viditelný fokus, respektování `prefers-reduced-motion`.
- Čeština: české formáty data a času („čt 14. 11. 2026 · 19:00“), správné skloňování počtů (1 místo / 2–4 místa / 5 a víc míst; 1 tým / 2–4 týmy / 5 a víc týmů), nezlomitelné mezery po jednopísmenných předložkách a spojkách.
- Sdílení a vyhledávače: `title`, `description`, obrázek pro sdílení 1200×630 s logem, favicon.
- Fotky: v repozitáři ve složce `assets/fotky/<RRRR-MM-DD>-<podnik>/`, zmenšené (delší strana max. 1600 px, kvalita ~80 %), seznam v `assets/fotky/fotky.json`. Načítají se líně, až při posunu k nim.

### Design
- Chytlavý, moderní, zapamatovatelný. Musí fungovat na mobilu v hospodě: čitelné písmo, velká tlačítka, dobrý kontrast i při slabém světle.
- Nejdřív **5 výrazně odlišných směrů** (barvy, písmo, kompozice, nálada), z nichž David vybere, případně zkombinuje.
- „Kobla“ je jméno. Používá se jen jako název kvízu: žádný výklad významu, žádné slovní hříčky na něj a žádná postava ani maskot.
- Logo: SVG, čitelné od 32 px (favicon) po velké rozměry, funguje na světlém i tmavém pozadí.
- Animace střídmě, nesmí zpomalit načtení stránky.

### Texty
- Česky, tykání, přátelský a vtipný tón, krátké věty.
- Neznámá fakta jako návrh s `[DOPLNIT: co přesně]` (startovné, velikost týmu, počet kol, ceny, kontakty, sítě, správce údajů).

## Omezení
- Vše zdarma: GitHub Pages, Google Apps Script, Telegram bot. Denní limity Google (počet e-mailů) se ověří v dokumentaci a uvedou v `NAVOD.md`.
- Repozitář je veřejný (GitHub Pages zdarma), takže v něm nikdy nejsou tajné hodnoty ani osobní údaje hráčů.
- Osobní údaje hráčů (přihlášky, kontakty, poznámky) leží jen v Davidově Google tabulce.
- Záměrně veřejné jsou: Davidovy kontakty a jméno správce údajů na webu (jen ty, které David sám dodá, do té doby `[DOPLNIT]`) a fotky z akcí, které David pošle. Smazaná fotka zůstane v historii gitu. Úplné odstranění z historie je přepis historie, a ten jen s Davidovým souhlasem.
- Texty o osobních údajích jsou návrh k ověření, ne právní rada.

## Kritéria přijetí
- [ ] **K1** Web běží na veřejné adrese GitHub Pages a po každé změně v hlavní větvi se sám aktualizuje.
- [ ] **K2** Na mobilu (390 px) jde přihlásit tým bez přibližování a bez vodorovného posouvání. Tlačítko *Přihlásit tým* je v úvodu vidět bez posouvání.
- [ ] **K3** Zkušební přihláška se zapíše do listu `Prihlasky`, přijde e-mail organizátorovi, zpráva na Telegram a potvrzovací e-mail týmu. *(ověřuje David)*
- [ ] **K4** U plného termínu web ukáže „Obsazeno“ a nabídne přihlášku náhradníka. Skript zapíše stav *Náhradník*, i když web ukazoval zastaralý stav.
- [ ] **K5** Dvě souběžné přihlášky na poslední místo → právě jedna *Potvrzeno*. Ověřeno testem s nasimulovaným zámkem a kontrolou kódu, že zámek obklopuje čtení stavu i zápis přihlášky.
- [ ] **K6** Nový řádek v listech `Podniky`, `Terminy` nebo `Vysledky` se na webu objeví nejpozději do 2 minut bez zásahu do kódu.
- [ ] **K7** Veřejná data ze skriptu ani nic v repozitáři (včetně historie) neobsahuje osobní údaje hráčů, token ani chat ID.
- [ ] **K8** Selhání Telegramu nebo e-mailu nezpůsobí ztrátu přihlášky (ověřeno testem s nefunkčním tokenem).
- [ ] **K9** Při nedostupném skriptu web ukáže srozumitelnou hlášku s kontaktem místo prázdné stránky.
- [ ] **K10** Existují všechny sekce a stránky R1–R12. Fotky se skryjí, když žádné nejsou. Výsledky jde filtrovat podle podniku.
- [ ] **K11** Čeština bez chyb: skloňování počtů, české formáty data a času, žádné anglické zbytky v rozhraní.
- [ ] **K12** Přístupnost: kontrast AA, popisky polí, ovládání klávesnicí, `prefers-reduced-motion`.
- [ ] **K13** `NAVOD.md` provede neprogramátora nastavením tabulky, skriptu a Telegramu i každodenní správou. Každý krok říká, kam kliknout.

## Otevřené otázky
- Konkrétní texty a fakta označená `[DOPLNIT]` – doplní David po prvním nasazení.
- Vlastní doména – později, až bude potřeba.
