# DECISIONS – Kobla Kvíz web
Nejnovější nahoře. Každé rozhodnutí jednou; pozdější změna = nový záznam s odkazem na původní.
Agent: sem zapisuj svá rozhodnutí a předpoklady (D-006 a dál). Předpoklad, který má David potvrdit, označ „předpoklad k potvrzení“.

## D-019 · 2026-11-05 · Testy: `node --test tests/` přes `tests/index.js`
- **Zjištění:** Node 22 nebere složku jako argument `--test` (hledá soubor). Proto `tests/index.js` načte všechny `tests/*.test.js` a příkaz z CLAUDE.md `node --test tests/` funguje beze změny.
- **Pokrytí:** kapacita a náhradníci, souběh (simulovaný zámek a kontrolní test bez zámku, který přeplnění opravdu zachytí), pořadí zámek → čtení → zápis → uvolnění (i z kódu `Code.gs`), uzávěrka (půlnoc, přelom měsíce a roku, datum jako text i objekt), duplicita, validace, spam, výběr veřejných dat bez osobních údajů, selhání Telegramu (nefunkční token přes falešný `UrlFetchApp`) i e-mailu, české formáty webu.
- **Kdo:** agent.

## D-018 · 2026-11-05 · Návrh skriptu `apps-script/Code.gs`
- **Rozhodnutí:**
  - Logika jsou čisté funkce. Google služby dostává zpracování zvenku (objekt `s`), takže test ověří, že zámek obklopuje čtení i zápis.
  - Zámek: `LockService.getScriptLock().tryLock(20000)`. Když se ho nepodaří získat, web dostane „zkus to znovu“. Upozornění se posílají až po uvolnění zámku a každé zvlášť v `try/catch` → list `Chyby`.
  - Čtení listů `Podniky`, `Terminy`, `Vysledky` přes `getDisplayValues()` (text tak, jak ho vidí David). Tím se obchází posun časů u buněk s časem v tabulce. Objekt Date skript taky zvládne.
  - Časy se porovnávají jako text `yyyy-MM-dd HH:mm` v pásmu `Europe/Prague`.
  - Přípravná funkce nastaví tabulce české prostředí a pásmo Praha, formáty sloupců a rozbalovací volby (Ano/Ne, Otevřeno/Zrušeno, Potvrzeno/Náhradník/Zrušeno). Existující listy nepřepisuje.
  - Ukázkové řádky s `id` začínajícím `vzor` web ignoruje.
  - Mezipaměť veřejných dat 60 s, každá přihláška ji smaže (změna v tabulce se projeví do 1–2 min, K6).
  - Ochrana tabulky: text začínající `= + - @` dostane apostrof, aby se nezapsal jako vzorec.
  - Spam: skryté pole + minimální doba vyplnění 3 s (chybějící doba = odmítnuto).
  - Odkaz na mapu jen `http(s)://`.
  - E-mail týmu má „Odpovědět“ nastavené na `ORGANIZATOR_EMAIL`, aby odhlášení odpovědí došlo Davidovi.
  - Menu „Kobla Kvíz“ v tabulce (příprava listů, zkouška e-mailu a Telegramu).
- **Kdo:** agent.

## D-017 · 2026-11-05 · Ověření faktů o Google a Telegramu
- **Jak:** stránky developers.google.com a core.telegram.org nešly z prostředí přímo otevřít (síť je nepovoluje). Fakta jsem ověřil přes vyhledávač, který vrací úryvky z oficiálních stránek. Co nebylo v úryvcích, je označené jako **neověřeno ze zdroje** a prakticky se ověří na zastávkách 2 a 3.
- **Ověřeno (úryvky oficiálních stránek):**
  - nasazení *Deploy → New deployment → Web app* (developers.google.com/apps-script/guides/web),
  - nová verze se stejnou adresou *Deploy → Manage deployments → Edit → Version: New version → Deploy* (…/concepts/deployments),
  - odpověď ContentService se přesměruje na script.googleusercontent.com a klient musí přesměrování následovat (…/guides/content, „Redirects“),
  - kvóta e-mailů 100 příjemců/den pro gmail.com, 1 500 pro Workspace (…/guides/services/quotas – vyhledávač ukázal i starší úryvek s jinými čísly, proto v NAVOD „zhruba 100“), `MailApp.getRemainingDailyQuota()`,
  - LockService `tryLock` vrací true/false, `waitLock` vyhazuje výjimku,
  - CacheService max 100 KB na hodnotu a max 6 h,
  - Script Properties v *Project Settings → Script Properties → Add script property*,
  - Telegram `/newbot` u @BotFather, `sendMessage` s `chat_id` a `text`.
- **Neověřeno ze zdroje (z praxe a komunity):**
  - GET z prohlížeče je čitelný přes CORS po přesměrování,
  - POST s `Content-Type: text/plain` je bez předběžného dotazu a odpověď jde přečíst,
  - chat ID se dá zjistit přes `getUpdates` v prohlížeči,
  - přesné české popisky tlačítek v editoru.
  Ověří se na zastávkách 2 a 3.
- **Kdo:** agent.

## D-016 · 2026-11-05 · Logo, favicon a obrázek pro sdílení
- **Rozhodnutí:** `assets/img/logo.svg` má text převedený na křivky (nástroj `opentype.js` mimo repozitář), takže nepotřebuje písmo a funguje i jako samostatný soubor. Favicon je kulatý bordó odznak s „K“ (`favicon.svg` + `favicon-32.png` + `apple-touch-icon.png`). Obrázek pro sdílení `sdileni.png` 1200×630. PNG jsem vyrobil přes Playwright (prohlížeč bez okna) mimo repozitář.
- **Pozor:** `og:image` má pevnou adresu `https://frankie851.github.io/kobla-kviz/…`. Při vlastní doméně nebo přesunu na organizaci se musí změnit v hlavičkách stránek.
- **Kdo:** agent.

## D-015 · 2026-11-05 · Kontakty v config.js, menu, nezlomitelné mezery
- **Rozhodnutí:** Davidovy kontakty (e-mail, telefon, Facebook, Instagram) jsou na jednom místě v `config.js` (`KONTAKT`) a web je doplní do patičky, sekce Kontakt, zásad osobních údajů i chybových hlášek. Prázdné = `[DOPLNIT: …]`. Jméno organizátora a správce údajů je zatím `[DOPLNIT]` přímo v HTML.
- **Proč:** David pak mění kontakt jen na jednom místě. CLAUDE.md popisuje `config.js` jako adresu skriptu, rozšíření nemění to, co David dostane.
- **Menu:** na mobilu je schované pod tlačítkem *Menu*, aby bylo tlačítko *Přihlásit tým* vidět bez posouvání (K2).
- **Mezery:** nezlomitelné mezery po jednopísmenných předložkách doplňuje `cesky.js` i do textů, které se načtou později.
- **Kdo:** agent.

## D-014 · 2026-11-05 · Startovné za osobu (potvrzeno)
- **Rozhodnutí:** `startovne_kc` je cena **za osobu**. Potvrzuje předpoklad D-010.
- **Kdo:** David.

## D-013 · 2026-11-05 · Zvolený design: C – Pivní etiketa
- **Rozhodnutí:** web bude ve stylu návrhu C (krémový papír, bordó, tmavě zelená, zlatá; písma Alfa Slab One + Bitter; logo jako oválná etiketa se stuhou). Úpravy podle Davida:
  - na počítači nenechávat po stranách loga zbytečně prázdné místo (úvod na širokém displeji ve dvou sloupcích: logo vlevo, nejbližší kvíz a tlačítko vpravo),
  - text „Prostějov a okolí“ v logu vede po elipse souběžně s okrajem etikety a nezasahuje do čar.
- **Kdo:** David.

## D-012 · 2026-11-05 · Zástupná stránka osobních údajů
- **Rozhodnutí:** `osobni-udaje.html` zatím jen zástupný text, aby odkaz ze souhlasu ve formuláři nikam nevedl naprázdno. Plný text (R11) přijde ve Fázi 2.
- **Kdo:** agent.

## D-011 · 2026-11-05 · Návrhy designu a náhledy
- **Rozhodnutí:** 5 směrů: A Neon, B Hravý, C Pivní etiketa, D Kvízový arch, E Elektrický. Všechny čtou stejná data z `data/demo.json` přes `navrhy/demo-plnic.js` a české formáty přes `assets/js/cesky.js` (ten se použije i ve finálním webu). Návrhy mají už teď `noindex`. Náhledy pro rozcestník jsou horní část stránky (JPEG, 390 a 1280 px) v `navrhy/nahledy/`. Celé stránky na 390, 768 a 1280 px jsem nafotil Playwrightem mimo repozitář, prohlédl a opravil (přetékající řádky termínů, překrývající se text v logu C, rozbitá mřížka kroků a slabší kontrast v E).
- **Proč:** stejný obsah = férové srovnání. Malé náhledy nezatěžují repozitář.
- **Kdo:** agent.

## D-010 · 2026-11-05 · Startovné za osobu (předpoklad k potvrzení)
- **Rozhodnutí:** sloupec `startovne_kc` v listu `Terminy` chápu jako Kč **za osobu**, ne za tým. Na webu se zobrazí např. „50 Kč za osobu“.
- **Proč:** u hospodských kvízů obvyklejší. SPEC to neříká.
- **Kdo:** agent – předpoklad k potvrzení Davidem.

## D-009 · 2026-11-05 · Formát veřejných dat a demo data
- **Rozhodnutí:** web čte jeden JSON: `podniky` (bez sloupce `aktivni`, jen aktivní), `terminy` (navíc `volno` a `stav` = otevreno / obsazeno / uzavreno / zruseno) a `vysledky` (po termínech, pořadí týmů s body). Stejný tvar vrací skript i `data/demo.json`. Demo data mají místo data pole `za_dni` (počet dní od dneška), aby ukázka nezastarala. Podniky, adresy („Ukázková 12“, „Vymyšlená 3“…) a týmy jsou vymyšlené, města jsou skutečná kvůli dojmu z regionu.
- **Proč:** jedna logika webu pro demo i ostrý provoz.
- **Kdo:** agent.

## D-008 · 2026-11-05 · Písma
- **Rozhodnutí:** písma z npm balíčků `@fontsource/*` (stažené mimo repozitář), do `assets/fonts/<pismo>/` uložené jen řezy latin + latin-ext ve WOFF2, s CSS (`unicode-range`) a licencí `OFL.txt` (SIL Open Font License). Všechna obsahují českou diakritiku.
- **Proč:** SPEC – bez Google Fonts a CDN, volná licence, čeština.
- **Poznámka:** po výběru designu zůstanou písma nepoužitých směrů kvůli složce `navrhy/`. Smažou se, až se smaže `navrhy/`.
- **Kdo:** agent.

## D-007 · 2026-11-05 · Nasazení na GitHub Pages
- **Rozhodnutí:** workflow `.github/workflows/pages.yml` nasazuje web při každé změně v hlavní větvi `main` (a ručně v záložce Actions). Na web jde všechno kromě `docs/`, `prompts/`, `tests/`, `apps-script/` a souborů `.md` (ty jsou jen v repozitáři). Adresa webu bude `https://frankie851.github.io/kobla-kviz/`.
- **Ručně (David):** jednou zapnout Pages: *Settings → Pages → Build and deployment → Source: GitHub Actions*.
- **Kdo:** agent.

## D-006 · 2026-11-05 · Větve (zjištění Fáze 0)
- **Zjištění:** toto sezení smí pushovat jen do pracovní větve `claude/sharp-shannon-r4gqnz` (nastavení prostředí Claude Code). Do `main` pushovat nesmí. Nastavení repozitáře (zapnutí Pages) změnit neumí – nemá nástroj s přístupem k *Settings* repozitáře (`gh` je v tomto prostředí jen pro vyhledávání).
- **Rozhodnutí:** pracuji v pracovní větvi a před každou zastávkou otevřu nebo aktualizuji pull request do `main`. David ho sloučí tlačítkem *Merge pull request*. Pages zapne David ručně (D-007).
- **Kdo:** agent.

## D-005 · 2026-11-05 · Texty tykáním
- **Rozhodnutí:** web hráčům tyká, tón je přátelský a vtipný.
- **Proč:** u hospodských kvízů obvyklé, působí uvolněně.
- **Zamítnuté alternativy:** vykání – formálnější, hůř sedí k hospodě.
- **Kdo:** předpoklad z návrhu, David může změnit.

## D-004 · 2026-11-05 · „Kobla“ jen jako název
- **Rozhodnutí:** „Kobla“ je jméno a používá se jen jako název kvízu. Žádný výklad významu, žádné slovní hříčky, žádná postava ani maskot.
- **Proč:** výslovné přání Davida.
- **Kdo:** David.

## D-003 · 2026-11-05 · Kapacita a náhradníci
- **Rozhodnutí:** skript hlídá kapacitu termínu. Po naplnění se nové přihlášky ukládají jako *Náhradník*, web ukáže „Obsazeno – přihlas se jako náhradník“. Náhradník se na uvolněné místo neposouvá automaticky, řeší to David v tabulce. Dokud má termín čekajícího náhradníka, každá nová přihláška je také náhradník, aby nový tým nepředběhl pořadník (tato pojistka je předpoklad z návrhu, David může změnit).
- **Proč:** chrání před přeplněním, je férové k náhradníkům a zůstává jednoduché.
- **Zamítnuté alternativy:** bez hlídání kapacity · veřejný seznam přihlášených týmů (David nechtěl).
- **Kdo:** David.

## D-002 · 2026-11-05 · Správa obsahu
- **Rozhodnutí:** podniky, termíny, kapacity a výsledky David spravuje v Google tabulce a web je načítá sám. Texty, FAQ, kontakty a fotky se mění v repozitáři s pomocí Clauda. Žebříček v1 = pořadí každého kvízu zvlášť.
- **Proč:** co se mění často, má jít změnit bez kódu. Co se mění zřídka, nemusí mít vlastní správu.
- **Kdo:** David.

## D-001 · 2026-11-05 · Technologie
- **Rozhodnutí:** statický web (HTML + CSS + JS, bez frameworku a sestavování) na GitHub Pages zdarma. Přihlášky a data přes Google Apps Script u Google tabulky. Upozornění e-mailem a přes Telegram bota. Token bota jen ve Script Properties.
- **Proč:** zdarma, bez serveru, nejméně věcí, které se můžou rozbít. Telegram nejde bezpečně volat přímo ze statické stránky, protože token by byl veřejný.
- **Zamítnuté alternativy:** služby formulářů typu Formspree (bez Telegramu a bez hlídání kapacity) · Netlify (další účet) · framework se sestavováním (složitější správa).
- **Kdo:** David (potvrdil technický návrh).
