// Hlavní stránka: nejbližší kvíz (R1), podniky a termíny (R2), výběr termínu v přihlášce (R3),
// náhled výsledků (R5) a fotek (R6).
(function () {
  'use strict';
  var C = window.Cesky;
  var K = window.Kobla;

  function el(tag, trida, text) {
    var e = document.createElement(tag);
    if (trida) e.className = trida;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function lzePrihlasit(t) { return t.stavKod === 'otevreno' || t.stavKod === 'obsazeno'; }

  function vyberTermin(id) {
    var sel = document.getElementById('f-termin');
    if (!sel) return;
    sel.value = id;
    sel.dispatchEvent(new Event('change'));
    var cil = document.getElementById('prihlaska');
    cil.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setTimeout(function () { sel.focus({ preventScroll: true }); }, 450);
  }

  function chybaNacteni(kam, nadpis) {
    kam.textContent = '';
    var box = el('div', 'chyba-nacteni');
    box.setAttribute('role', 'alert');
    box.appendChild(el('strong', '', nadpis));
    box.appendChild(el('p', '', 'Termíny se teď nepodařilo načíst. Zkus stránku za chvíli obnovit. Když to nepůjde, ' + K.kontaktText() + ' a přihlásíme tě ručně.'));
    kam.appendChild(box);
  }

  // ---------- R1 Nejbližší kvíz ----------
  function uvod(data) {
    var kupon = document.getElementById('nejblizsi');
    var tl = document.getElementById('tlacitko-prihlasit');
    var t = data.terminy.filter(function (x) { return x.stavKod !== 'zruseno'; })[0];
    kupon.textContent = '';
    kupon.appendChild(el('p', 'nad', 'Nejbližší kvíz'));
    if (!t) {
      kupon.appendChild(el('p', 'kdy', 'Brzy vypíšeme'));
      kupon.appendChild(el('p', 'kde', 'Nové termíny se chystají. Mrkni sem za pár dní.'));
      return;
    }
    kupon.appendChild(el('p', 'kdy', C.datumCas(t.datum, t.cas)));
    kupon.appendChild(el('p', 'kde', t.podnik.nazev + ', ' + t.podnik.mesto));
    kupon.appendChild(el('span', 'volno', K.stavText(t)));
    if (lzePrihlasit(t)) {
      tl.onclick = function (e) { e.preventDefault(); vyberTermin(t.id); };
    }
  }

  // ---------- R2 Kde hrajeme ----------
  function podniky(data) {
    var cil = document.getElementById('podniky');
    cil.textContent = '';
    if (!data.podniky.length) {
      cil.appendChild(el('p', 'zadne', 'Podniky brzy doplníme.'));
      return;
    }
    data.podniky.forEach(function (p) {
      var karta = el('article', 'podnik');
      karta.appendChild(el('p', 'mesto', p.mesto));
      karta.appendChild(el('h3', '', p.nazev));
      if (p.mapa_url) {
        var a = el('a', 'adresa', p.adresa);
        a.href = p.mapa_url; a.target = '_blank'; a.rel = 'noopener';
        a.setAttribute('aria-label', p.adresa + ' (otevře mapu v novém okně)');
        karta.appendChild(a);
      } else {
        karta.appendChild(el('span', 'adresa', p.adresa));
      }
      if (p.popis) karta.appendChild(el('p', 'popis', p.popis));
      var terminy = data.terminy.filter(function (t) { return t.podnik_id === p.id; });
      var dalsi = terminy.filter(lzePrihlasit)[0];
      if (dalsi) {
        var info = [];
        if (dalsi.startovne_kc !== '' && dalsi.startovne_kc !== undefined && dalsi.startovne_kc !== null) info.push('Startovné ' + C.kc(dalsi.startovne_kc) + ' za osobu');
        if (dalsi.max_hracu) info.push('tým až ' + C.pocet(Number(dalsi.max_hracu), C.HRACI));
        if (info.length) karta.appendChild(el('p', 'info', info.join(' · ')));
      }
      if (!terminy.length) {
        karta.appendChild(el('p', 'zadne', 'Další termín brzy vypíšeme.'));
      } else {
        var ul = el('ul', 'terminy');
        terminy.slice(0, 3).forEach(function (t) {
          var li = el('li');
          li.setAttribute('data-stav', t.stavKod);
          var radek = lzePrihlasit(t) ? el('a') : el('span', 'neaktivni');
          if (lzePrihlasit(t)) {
            radek.href = '#prihlaska';
            radek.setAttribute('aria-label', 'Přihlásit tým na ' + C.datumCas(t.datum, t.cas) + ', ' + K.stavText(t));
            radek.addEventListener('click', function (e) { e.preventDefault(); vyberTermin(t.id); });
          }
          radek.appendChild(el('span', 'datum', C.datumCas(t.datum, t.cas)));
          var tecky = el('span', 'tecky'); tecky.setAttribute('aria-hidden', 'true');
          radek.appendChild(tecky);
          radek.appendChild(el('span', 'stav', K.stavText(t)));
          if (t.poznamka) radek.appendChild(el('span', 'pozn', t.poznamka));
          li.appendChild(radek);
          ul.appendChild(li);
        });
        karta.appendChild(ul);
      }
      cil.appendChild(karta);
    });
  }

  // ---------- R3 Výběr termínu ve formuláři ----------
  function vyberTerminu(data) {
    var sel = document.getElementById('f-termin');
    var pocet = document.getElementById('f-pocet');
    var info = document.getElementById('f-termin-info');
    var puvodni = sel.value;
    sel.textContent = '';
    var prazdna = el('option', '', 'Vyber termín');
    prazdna.value = '';
    sel.appendChild(prazdna);
    var nabidka = data.terminy.filter(lzePrihlasit);
    nabidka.forEach(function (t) {
      var o = el('option', '', C.datumCas(t.datum, t.cas) + ' – ' + t.podnik.nazev + ', ' + t.podnik.mesto +
        (t.stavKod === 'obsazeno' ? ' (náhradník)' : ''));
      o.value = t.id;
      sel.appendChild(o);
    });
    if (!nabidka.length) prazdna.textContent = 'Teď není vypsaný žádný termín';
    sel.disabled = false;
    if (puvodni && nabidka.some(function (t) { return t.id === puvodni; })) sel.value = puvodni;

    function poZmene() {
      var t = data.terminy.filter(function (x) { return x.id === sel.value; })[0];
      if (!t) { info.hidden = true; return; }
      var max = Number(t.max_hracu) || 0;
      if (max) {
        pocet.max = max;
        document.getElementById('f-pocet-napoveda').textContent = 'Nejvíc ' + C.pocet(max, C.HRACI) + ' u stolu.';
      }
      var text = [];
      if (t.startovne_kc !== '' && t.startovne_kc !== undefined && t.startovne_kc !== null) text.push('Startovné ' + C.kc(t.startovne_kc) + ' za osobu, platí se na místě.');
      text.push(t.podnik.adresa + '.');
      if (t.stavKod === 'obsazeno') text.unshift('Termín je plný – přihláška se zapíše jako náhradník.');
      info.textContent = text.join(' ');
      K.opravMezery(info);
      info.hidden = false;
    }
    sel.onchange = poZmene;
    poZmene();
  }

  // ---------- R5 Výsledky (náhled) ----------
  function vysledky(data) {
    var kam = document.getElementById('vysledky-nahled');
    var kdy = document.getElementById('vysledky-kdy');
    kam.textContent = '';
    var v = data.vysledky[0];
    if (!v) {
      kdy.textContent = 'Výsledky se tu objeví po prvním odehraném kvízu.';
      kam.hidden = true;
      return;
    }
    kdy.textContent = C.datumCas(v.datum) + ' · ' + v.podnik_nazev + (v.mesto ? ', ' + v.mesto : '');
    (v.tymy || []).slice(0, 5).forEach(function (t) {
      var li = el('li');
      li.appendChild(el('span', 'poradi', t.poradi + '.'));
      li.appendChild(el('span', 'tym', t.tym));
      li.appendChild(el('span', 'body', C.pocet(t.body, ['bod', 'body', 'bodů'])));
      kam.appendChild(li);
    });
    kam.hidden = false;
  }

  // ---------- R6 Fotky (náhled) – bez fotek se sekce neukáže ----------
  function fotky() {
    K.nactiFotky().then(function (vecery) {
      var sekce = document.getElementById('fotky');
      if (!vecery.length) { sekce.hidden = true; return; }
      var v = vecery[0];
      var ul = document.getElementById('fotky-nahled');
      ul.textContent = '';
      document.getElementById('fotky-kdy').textContent = C.datumCas(v.datum) + ' · ' + v.podnik;
      v.fotky.slice(0, 4).forEach(function (f) {
        var soubor = typeof f === 'string' ? f : f.soubor;
        var li = el('li');
        var a = el('a');
        a.href = 'fotky.html#' + v.slozka;
        var img = el('img');
        img.src = 'assets/fotky/' + v.slozka + '/' + soubor;
        img.alt = (f.popis || 'Fotka z kvízu') + ' – ' + v.podnik;
        img.loading = 'lazy';
        img.decoding = 'async';
        a.appendChild(img);
        li.appendChild(a);
        ul.appendChild(li);
      });
      sekce.hidden = false;
      K.opravMezery(sekce);
    });
  }

  function vykresli(data) {
    uvod(data);
    podniky(data);
    vyberTerminu(data);
    vysledky(data);
    window.KoblaFormulare.prihlaska(data);
    K.opravMezery(document.getElementById('obsah'));
  }

  function nacti(znovu) {
    return K.nactiData(znovu).then(vykresli).catch(function () {
      chybaNacteni(document.getElementById('nejblizsi'), 'Ups, data se nenačetla');
      chybaNacteni(document.getElementById('podniky'), 'Ups, data se nenačetla');
      var sel = document.getElementById('f-termin');
      sel.textContent = '';
      var o = el('option', '', 'Termíny se nepodařilo načíst');
      o.value = '';
      sel.appendChild(o);
      document.getElementById('vysledky-kdy').textContent = 'Výsledky se teď nepodařilo načíst.';
      var z = document.getElementById('prihlaska-zprava');
      z.hidden = false;
      z.className = 'zprava zprava--chyba';
      z.textContent = 'Přihlášku teď nejde odeslat, protože se nenačetly termíny. Zkus stránku obnovit, nebo ' + K.kontaktText() + '.';
      document.querySelector('#form-prihlaska button[type="submit"]').disabled = true;
    });
  }

  window.KoblaFormulare.hospoda();
  fotky();
  nacti(false);
  // Po přihlášce znovu načíst volná místa (v ostrém provozu)
  document.addEventListener('kobla:prihlaseno', function () { if (!K.JE_DEMO) nacti(true); });
})();
