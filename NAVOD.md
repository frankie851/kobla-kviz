# Návod pro Davida – Kobla Kvíz

Tenhle návod tě provede vším, co musíš udělat sám: Google tabulkou, skriptem, Telegram botem a každodenní správou webu. Nemusíš nic programovat, jen klikat a kopírovat.

**Co budeš potřebovat:** Google účet (ten, ze kterého mají chodit e-maily), Telegram v mobilu, počítač s prohlížečem a zhruba 25–30 minut.

> Google ukazuje menu česky, nebo anglicky podle jazyka tvého účtu. Proto u důležitých tlačítek píšu obojí, např. **Nasadit (Deploy)**.

## Obsah
- [a) Google tabulka a příprava listů](#a-google-tabulka-a-příprava-listů)
- [b) Vložení skriptu a nasazení jako webová aplikace](#b-nasazení-skriptu-jako-webová-aplikace)
- [c) Telegram bot a chat ID](#c-telegram-bot-a-chat-id)
- [d) Tajné hodnoty a e-mail do Script Properties](#d-tajné-hodnoty-a-e-mail-do-script-properties)
- [e) Kam poslat adresu skriptu](#e-kam-poslat-adresu-skriptu)
- [f) Kontrolní seznam zkušební přihlášky](#f-kontrolní-seznam-zkušební-přihlášky)
- [g) Každodenní správa](#g-každodenní-správa)
- [h) Když se skript změní](#h-když-se-skript-změní)
- [i) Časté problémy](#i-časté-problémy)
- [j) Hezčí adresa webu (volitelné)](#j-hezčí-adresa-webu-volitelné)

---

## a) Google tabulka a příprava listů
*(asi 8 minut, v tomhle kroku vložíš i skript)*

1. Otevři **https://sheets.google.com** a přihlas se účtem, ze kterého mají chodit e-maily.
2. Klikni na velké **+ Prázdná (Blank)**. Otevře se nová tabulka.
3. Vlevo nahoře klikni na **Tabulka bez názvu** a přepiš ji na `Kobla Kvíz`.
4. V horním menu tabulky klikni **Rozšíření (Extensions) → Apps Script**. V nové záložce se otevře editor skriptu.
5. V editoru uvidíš soubor `Code.gs` s pár řádky (`function myFunction() …`). Klikni do textu, stiskni **Ctrl+A** (na Macu **Cmd+A**) a pak **Delete**. Editor musí být úplně prázdný.
6. V jiné záložce otevři kód skriptu na GitHubu:
   **https://github.com/frankie851/kobla-kviz/blob/main/apps-script/Code.gs**
   Vpravo nad kódem klikni na ikonu **dvou čtverečků (Copy raw file)**. Kód se zkopíruje.
7. Vrať se do editoru Apps Script a vlož kód: **Ctrl+V** (Mac **Cmd+V**).
8. Ulož ho ikonou **diskety (Uložit projekt / Save project)** nad kódem, nebo **Ctrl+S**.
9. Vlevo nahoře klikni na **Projekt bez názvu (Untitled project)** a pojmenuj ho `Kobla Kvíz skript`. Potvrď **Přejmenovat (Rename)**.
10. Nad kódem je lišta s tlačítkem **Spustit (Run)** a vedle něj rozbalovací seznam s názvem funkce. Rozbal ho a vyber **`pripravTabulku`**. Pak klikni **Spustit (Run)**.
11. Poprvé se Google zeptá na oprávnění:
    1. **Je vyžadována autorizace (Authorization required)** → **Zkontrolovat oprávnění (Review permissions)**.
    2. Vyber svůj Google účet.
    3. Objeví se varování **Google tuto aplikaci neověřil (Google hasn't verified this app)**. U vlastních skriptů je to normální: skript napsal tvůj projekt, ne cizí firma, a Google ho jen nekontroloval. Klikni dole na **Rozšířené (Advanced)** a pak na **Přejít na Kobla Kvíz skript (nebezpečné) / Go to Kobla Kvíz skript (unsafe)**.
    4. Google ukáže seznam oprávnění. Když jsou u nich zaškrtávátka, zaškrtni **Vybrat vše (Select all)**. Pak klikni **Povolit (Allow)**.

    **Proč skript tato oprávnění potřebuje:**
    | Oprávnění | K čemu |
    |---|---|
    | Zobrazení a úpravy tabulek Google | čte podniky a termíny, zapisuje přihlášky a chyby |
    | Odesílání e-mailů vaším jménem | posílá potvrzení týmům a upozornění tobě |
    | Připojení k externí službě | posílá zprávy na Telegram |

    Skript nic jiného nedělá. Jeho kód je veřejný v repozitáři a kdokoli si ho může přečíst.
12. Vrať se do záložky s tabulkou. Uvidíš okno **Hotovo. Vytvořené listy: …** a dole listy **Podniky, Terminy, Prihlasky, Vysledky, Hospody, Chyby**. Klikni **OK**.
13. Obnov stránku tabulky (**F5**). Za pár sekund se v horním menu objeví nová položka **Kobla Kvíz**. Odtud jde přípravu i zkoušku upozornění spustit bez editoru.

### Jak vyplnit podniky a termíny
V listech je ukázkový řádek, jehož `id` začíná na `vzor`. Web takové řádky ignoruje. Až vyplníš vlastní, ukázkové řádky smaž (pravým tlačítkem na číslo řádku → **Smazat řádek**).

**List `Podniky`:** jeden řádek = jedna hospoda.
| Sloupec | Co sem napsat | Příklad |
|---|---|---|
| `id` | krátký název bez mezer a háčků, už ho neměň | `lev` |
| `nazev` | název podniku | `Hostinec U Lva` |
| `mesto` | město nebo obec | `Prostějov` |
| `adresa` | ulice a číslo, město | `Náměstí 1, Prostějov` |
| `mapa_url` | odkaz na mapu: na mapy.cz najdi podnik → **Sdílet** → **Kopírovat odkaz** | `https://mapy.cz/s/...` |
| `popis` | jedna nebo dvě věty o podniku | `Velký sál a kuchyně do půlnoci.` |
| `aktivni` | `Ano` = ukázat na webu, `Ne` = skrýt | `Ano` |

**List `Terminy`:** jeden řádek = jeden kvízový večer.
| Sloupec | Co sem napsat | Příklad |
|---|---|---|
| `id` | jedinečný název termínu, už ho neměň | `lev-2026-11-14` |
| `podnik_id` | `id` podniku z listu Podniky, musí sedět přesně | `lev` |
| `datum` | den | `14.11.2026` |
| `cas` | začátek | `19:00` |
| `kapacita_tymu` | kolik týmů se vejde | `12` |
| `max_hracu` | nejvíc hráčů v jednom týmu | `6` |
| `startovne_kc` | cena **za osobu**, jen číslo | `50` |
| `uzaverka` | *nepovinné*: kdy skončí přihlašování, když dřív než začátek | `14.11.2026 12:00` |
| `stav` | `Otevřeno`, nebo `Zrušeno` | `Otevřeno` |
| `poznamka` | *nepovinné*: krátká veřejná poznámka k termínu | `Tematický večer: 90. léta` |

Na webu se ukazují jen budoucí termíny aktivních podniků. Přihlašování se samo uzavře v čase začátku (nebo v čase `uzaverka`).

---

## b) Nasazení skriptu jako webová aplikace
*(asi 4 minuty)*

1. V editoru Apps Script klikni vpravo nahoře na modré tlačítko **Nasadit (Deploy)** → **Nové nasazení (New deployment)**.
2. Vlevo u **Vyberte typ (Select type)** klikni na **ozubené kolečko** → **Webová aplikace (Web app)**.
3. Vyplň:
   - **Popis (Description):** `verze 1`
   - **Spustit jako (Execute as):** **Já (tvůj e-mail) / Me**
   - **Kdo má přístup (Who has access):** **Kdokoli (Anyone)**. Pozor, ne „Kdokoli s účtem Google“: web navštěvují lidé bez přihlášení a jinak by jim nefungoval.
4. Klikni **Nasadit (Deploy)**. Kdyby se Google znovu ptal na oprávnění, postupuj jako v bodě a) 11.
5. Objeví se **Adresa URL webové aplikace (Web app URL)**. Začíná `https://script.google.com/macros/s/` a končí `/exec`. Klikni **Kopírovat (Copy)** a ulož si ji třeba do poznámek. Pak **Hotovo (Done)**.
6. Zkouška: adresu vlož do nové záložky prohlížeče, na konec připiš `?akce=data` a stiskni Enter. Uvidíš text, který začíná `{"ok":true,` a obsahuje tvoje podniky a termíny. Žádné jméno, e-mail ani telefon tam být nesmí.

> **Proč „Kdokoli“ nevadí:** skript běží pod tvým účtem, ale návštěvník webu dostane jen veřejná data (podniky, termíny, počty volných míst, výsledky). Přihlášky s kontakty zůstávají jen v tvé tabulce.

---

## c) Telegram bot a chat ID
*(asi 5 minut)*

1. V Telegramu vyhledej **@BotFather** (má modrou fajfku) a klikni **Start**.
2. Pošli mu zprávu `/newbot`.
3. Zeptá se na **jméno** bota. Napiš třeba `Kobla Kvíz upozornění`.
4. Zeptá se na **uživatelské jméno**, které musí končit na `bot`. Napiš třeba `koblakviz_upozorneni_bot`. Když je obsazené, zkus jiné.
5. BotFather pošle zprávu s **tokenem**. Vypadá jako `1234567890:AAH...` (číslo, dvojtečka a dlouhý text).
   **Token je tajný jako heslo.** Nikomu ho neposílej, ani Claudovi, nedávej ho na web ani do GitHubu. Vložíš ho jen do Script Properties (krok d).
6. Ve zprávě od BotFathera klikni na odkaz na svého nového bota (`t.me/...`). Klikni **Start** a pošli mu třeba `ahoj`.
7. Zjisti **chat ID**. Do prohlížeče napiš tuhle adresu a místo `TOKEN` vlož svůj token (slovo `bot` před ním nech):
   ```
   https://api.telegram.org/botTOKEN/getUpdates
   ```
   V textu najdi `"chat":{"id":` a číslo za ním, např. `"chat":{"id":123456789,`. To číslo je **chat ID**. Je taky tajné.
   - Když vidíš jen `{"ok":true,"result":[]}`, pošli botovi další zprávu a stránku obnov.
   - Chceš upozornění do skupiny (např. s kolegy)? Přidej bota do skupiny, napiš do ní zprávu a postup zopakuj. ID skupiny začíná mínusem (`-100…`) a mínus k němu patří.

---

## d) Tajné hodnoty a e-mail do Script Properties
*(asi 3 minuty)*

1. V editoru Apps Script klikni vlevo na **ozubené kolečko – Nastavení projektu (Project Settings)**.
2. Sjeď dolů k **Vlastnosti skriptu (Script Properties)** a klikni **Přidat vlastnost skriptu (Add script property)**.
3. Postupně přidej tři vlastnosti. Další přidáš tlačítkem **Přidat vlastnost skriptu**.
   | Vlastnost (Property) | Hodnota (Value) |
   |---|---|
   | `TELEGRAM_TOKEN` | token od BotFathera |
   | `TELEGRAM_CHAT_ID` | chat ID z kroku c) 7 |
   | `ORGANIZATOR_EMAIL` | tvůj e-mail, kam mají chodit upozornění |
   Názvy piš přesně takhle, velkými písmeny a s podtržítkem.
4. Klikni **Uložit vlastnosti skriptu (Save script properties)**.
5. Vyzkoušej to: v tabulce klikni v menu **Kobla Kvíz → Vyzkoušet e-mail a Telegram**. Do minuty ti přijde zkušební e-mail a zpráva na Telegram a okno ukáže výsledek a zbývající denní limit e-mailů. Když se tam objeví „CHYBA“, podívej se do části [i) Časté problémy](#i-časté-problémy).

> Tajné hodnoty jsou jen ve Script Properties. Kód na GitHubu je veřejný a žádné klíče v něm nejsou.

---

## e) Kam poslat adresu skriptu
Pošli Claudovi do sezení v **claude.ai/code** (to, ve kterém web vzniká) zprávu:

> Adresa skriptu: `https://script.google.com/macros/s/…/exec`

Adresa skriptu **není tajná**, web ji potřebuje a bude vidět v souboru `config.js`. **Token ani chat ID Claudovi neposílej.**

Claude adresu vloží do webu, vypne ukázková data a ověří, že se data načítají. Pak tě požádá o zkušební přihlášku (krok f).

---

## f) Kontrolní seznam zkušební přihlášky
*(asi 10 minut, nejlépe z mobilu. Ověřuje kritéria K3, K4 a K6.)*

**Příprava v tabulce:** v listu `Terminy` přidej zkušební termín pro jeden aktivní podnik: `id` = `test-1`, datum zítra, čas `19:00`, `kapacita_tymu` = `2`, `max_hracu` = `6`, `startovne_kc` = `50`, `stav` = `Otevřeno`. Na webu bude vidět jen chvíli, po zkoušce ho smažeš.

| # | Co uděláš | Co má přijít / co máš vidět | ✓ |
|---|---|---|---|
| 1 | Otevři web na mobilu: **https://frankie851.github.io/kobla-kviz/**. Do 2 minut a po obnovení stránky (stažením dolů) | Vidíš své podniky a zkušební termín se stavem **2 volná místa**. Nikde není štítek „ukázková data“. *(K6)* | ☐ |
| 2 | Klikni na zkušební termín a přihlas tým `Test 1`. Jako e-mail dej **svůj druhý e-mail** (nebo e-mail kamaráda) | Na obrazovce **Hotovo! Tým „Test 1“ je přihlášený…** | ☐ |
| 3 | Podívej se do tabulky, list `Prihlasky` | Nový řádek s týmem `Test 1` a stavem **Potvrzeno** *(K3)* | ☐ |
| 4 | Zkontroluj svůj e-mail organizátora | E-mail **Přihláška: Test 1 (Potvrzeno)** se všemi údaji *(K3)* | ☐ |
| 5 | Zkontroluj Telegram | Zpráva **🟢 Nová přihláška** *(K3)* | ☐ |
| 6 | Zkontroluj e-mail, který jsi zadal do přihlášky (i složku Spam) | **Kobla Kvíz: přihláška potvrzena**: termín, podnik, adresa, startovné a jak se odhlásit *(K3)* | ☐ |
| 7 | Přihlas znovu tým `test 1` na stejný termín (malými písmeny) | Hláška, že tým už je přihlášený. Nic nového se nezapíše | ☐ |
| 8 | Na mobilu web **neobnovuj** (u termínu svítí „1 volné místo“). Na **počítači** otevři web a přihlas tým `Test 2` | **Hotovo**, termín je teď plný (2 ze 2) | ☐ |
| 9 | Na mobilu, pořád **bez obnovení**, přihlas tým `Test 3` | Skript rozhodne podle tabulky, ne podle starého stavu na mobilu: hláška **…je zapsaný jako náhradník**, v tabulce stav **Náhradník**, e-mail s textem NÁHRADNÍK *(K4)* | ☐ |
| 10 | Obnov web na mobilu | U zkušebního termínu **Obsazeno – přihlas se jako náhradník**, ve formuláři termín s „(náhradník)“ *(K4)* | ☐ |
| 11 | V tabulce změň `Test 1` na **Zrušeno** a obnov web | Termín dál ukazuje **Obsazeno**, protože čeká náhradník `Test 3` (nový tým ho nepředběhne). Když změníš `Test 3` na **Potvrzeno**, nic se nemění: místa jsou zase plná | ☐ |
| 12 | Do listu `Vysledky` přidej řádek k některému **už odehranému** termínu (nebo k termínu s dnešním datem a časem, který už minul): `termin_id`, `poradi` = 1, `tym` = `Test`, `body` = 10 | Do 2 minut se po obnovení objeví na stránce **Výsledky** *(K6)* | ☐ |
| 13 | **Úklid:** smaž v tabulce řádky `Test …` z `Prihlasky`, termín `test-1` z `Terminy` a zkušební výsledek z `Vysledky` | Web je zase čistý | ☐ |

**Co napsat Claudovi:** čísla řádků, které prošly, a u těch, které neprošly, co se stalo (klidně se screenshotem). Mrkni i do listu `Chyby`, jestli tam něco přibylo, a opiš to.

---

## g) Každodenní správa
Všechno níže děláš jen v Google tabulce. Web si změny načte sám, nejpozději do 2 minut (stačí obnovit stránku).

**Přidat podnik:** nový řádek v listu `Podniky`, `aktivni` = `Ano`. Skrýt podnik: `aktivni` = `Ne` (jeho výsledky zůstanou).

**Přidat termín:** nový řádek v listu `Terminy` (viz tabulka v části a). Každý termín má vlastní `id`, např. `lev-2026-12-05`.

**Zrušit termín:** ve sloupci `stav` vyber **Zrušeno**. Web ukáže „Zrušeno“ a přihlášky nepřijímá. Přihlášeným týmům napiš sám (e-maily jsou v listu `Prihlasky`).

**Zrušit přihlášku** (tým se odhlásil, třeba odpovědí na potvrzovací e-mail): v listu `Prihlasky` změň `stav` na **Zrušeno**. Místo se uvolní.

**Posunout náhradníka na uvolněné místo:**
1. V `Prihlasky` najdi náhradníky daného termínu. První na řadě je ten s nejstarším `cas_odeslani`.
2. Domluv se s ním (telefon a e-mail jsou v řádku). Když může, změň jeho `stav` na **Potvrzeno**. Když nemůže, změň ho na **Zrušeno** a zkus dalšího.
3. Důležité: **dokud u termínu čeká aspoň jeden náhradník, každá nová přihláška se zapíše jako náhradník**, i když je místo volné. Nový tým tak nepředběhne pořadník. Po uvolnění místa proto vždy vyřeš náhradníky.

**Uzavřít přihlašování dřív:** vyplň u termínu sloupec `uzaverka`, např. `14.11.2026 12:00`.

**Zapsat výsledky:** v listu `Vysledky` jeden řádek na tým: `termin_id`, `poradi`, `tym`, `body`. Na webu se ukážou, jakmile termín začal. Výsledky se ukládají po termínech, takže z nich jde později udělat i sezónní žebříček.

**Přidat fotky:** fotky z večera pošli Claudovi do nového sezení v claude.ai/code se zprávou třeba: „Přečti CLAUDE.md a přidej fotky z 14. 11. 2026, Hostinec U Lva (přiložené).“ Claude je zmenší, uloží do webu a připraví pull request. Ty ho sloučíš (*Merge pull request*). Pozor: smazaná fotka zůstává v historii repozitáře. Na web proto posílej jen fotky, se kterými jsou lidé v pořádku.

**Změnit texty, časté dotazy nebo kontakty:** napiš Claudovi v novém sezení, co se má změnit. Kontakty (e-mail, telefon, Facebook, Instagram) jsou v souboru `config.js` a stačí je změnit tam.

**Osobní údaje:** přihlášky starší než 12 měsíců smaž z listu `Prihlasky` (stejně tak list `Hospody`). Tak to slibují zásady na webu.

**List `Chyby`:** sem skript zapisuje, když se nepovede e-mail nebo Telegram. Přihláška se i tak vždy zapíše. Občas se do něj podívej.

**Limit e-mailů:** běžný účet Gmail smí ze skriptu poslat e-maily zhruba **100 příjemcům denně** (Google Workspace víc). Každá přihláška stojí 2 e-maily (týmu a tobě), takže to vystačí asi na 50 přihlášek za den. Kdyby limit došel, přihlášky se dál zapisují a chodí Telegram, jen e-maily ten den nepřijdou (uvidíš to v `Chyby`). Kolik zbývá, ukáže **Kobla Kvíz → Vyzkoušet e-mail a Telegram**.

---

## h) Když se skript změní
Když Claude upraví `apps-script/Code.gs`, napíše ti to. Nový kód vložíš takhle a **adresa skriptu zůstane stejná**:

1. Až budou změny v hlavní větvi (pull request sloučený), otevři **https://github.com/frankie851/kobla-kviz/blob/main/apps-script/Code.gs** a klikni na **dva čtverečky (Copy raw file)**.
2. V tabulce otevři **Rozšíření → Apps Script**. V editoru klikni do kódu, **Ctrl+A**, **Delete**, **Ctrl+V** a ulož (**Ctrl+S**).
3. Klikni **Nasadit (Deploy) → Spravovat nasazení (Manage deployments)**.
4. Vlevo vyber aktivní nasazení (`verze 1`) a nahoře klikni na **tužku – Upravit (Edit)**.
5. U **Verze (Version)** vyber **Nová verze (New version)** a do popisu napiš třeba `verze 2`.
6. Klikni **Nasadit (Deploy)**. Kdyby Google chtěl nová oprávnění, povol je jako v a) 11.

**Nikdy nepoužívej „Nové nasazení (New deployment)“**, to vytvoří novou adresu a web by přestal fungovat. Kdyby se to stalo, pošli novou adresu Claudovi.

---

## i) Časté problémy

| Co se děje | Co zkontrolovat |
|---|---|
| Web píše **„Ups, data se nenačetla“** | 1) Otevři adresu skriptu s `?akce=data` (b 6). Ukáže se text `{"ok":true…`? 2) Kdo má přístup musí být **Kdokoli (Anyone)**: Nasadit → Spravovat nasazení → tužka. 3) V editoru vlevo **Spuštění (Executions)** ukáže chyby. 4) Podívej se do listu `Chyby`. |
| Přihláška hlásí chybu, nebo se nezapíše | Totéž co výše. Po změně kódu jsi nasadil **novou verzi** (krok h)? Nepřejmenoval jsi list nebo sloupec? Názvy listů a hlaviček musí zůstat přesně jako po přípravě. |
| Nechodí zprávy na Telegram | List `Chyby`: **401** = špatný token. **400 chat not found** = špatné chat ID, nebo jsi botovi neklikl **Start**. „chybí TELEGRAM_TOKEN“ = vlastnost chybí nebo je jinak pojmenovaná. |
| Nechodí e-maily | Podívej se do složky Spam. Vyplnil jsi `ORGANIZATOR_EMAIL`? Nevyčerpal jsi denní limit (g)? |
| Termín se na webu neukazuje | Je podnik `aktivni` = `Ano`? Sedí `podnik_id` přesně s `id` podniku? Je datum v budoucnosti a zapsané jako datum (`14.11.2026`)? Nezačíná `id` na `vzor`? |
| Změna v tabulce se neprojevila | Počkej 1–2 minuty (skript si data krátce pamatuje) a obnov stránku. |
| Změna webu na GitHubu se neprojevila | Je pull request sloučený? Na GitHubu v záložce **Actions** musí mít poslední běh zelenou fajfku. |
| Google varuje „aplikace není ověřená“ | U vlastních skriptů je to normální, viz a) 11. |
| V tabulce je místo data číslo (např. 46340) | Označ sloupec → **Formát → Číslo → Datum**. |

Když si nevíš rady, otevři nové sezení v claude.ai/code a napiš: „Přečti CLAUDE.md a docs/HANDOFF.md. Problém: …“ a přilož screenshot.

---

## j) Hezčí adresa webu (volitelné)
Teď je web na `https://frankie851.github.io/kobla-kviz/`. Hezčí adresu typu `https://koblakviz.github.io/` můžeš mít zdarma přes organizaci na GitHubu:

1. Na GitHubu klikni vpravo nahoře na **+ → New organization → Create a free organization**. Název zvol třeba `koblakviz` (bude v adrese).
2. V repozitáři `kobla-kviz` otevři **Settings → General**, sjeď dolů do **Danger Zone → Transfer ownership** a převeď repozitář na novou organizaci.
3. Pak v **Settings → General** přejmenuj repozitář na `koblakviz.github.io` (přesně název organizace + `.github.io`).
4. V **Settings → Pages** zkontroluj, že **Source** je **GitHub Actions**.
5. Napiš Claudovi, ať upraví adresy v hlavičkách stránek (obrázek pro sdílení) a v dokumentech. Claude bude potřebovat přístup k repozitáři v organizaci (claude.ai → nastavení GitHubu).

Stará adresa pak přestane fungovat. Udělej to proto dřív, než web začneš sdílet. Vlastní doménu (např. `koblakviz.cz`) jde připojit později, ale stojí peníze za registraci domény.
