// Formuláře: přihláška týmu (R3) a „Chci Kobla Kvíz u nás“ (R8).
// Web kontroluje pole hned (nápověda u pole), ale rozhoduje vždy skript.
(function () {
  'use strict';
  var C = window.Cesky;
  var K = window.Kobla;
  var START = Date.now(); // ochrana proti robotům: jak dlouho se formulář vyplňoval

  // ---------- Kontroly polí ----------
  function txt(el) { return String(el.value || '').trim(); }
  function jeEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s); }
  function cistyTelefon(s) { return String(s).replace(/[\s\-().\/]/g, ''); }
  function jeTelefon(s) { return /^\+?\d{9,15}$/.test(cistyTelefon(s)); }

  function ukazChybu(el, zprava) {
    var pole = el.closest('.pole, .souhlas');
    var id = el.id + '-chyba';
    var p = document.getElementById(id);
    if (zprava) {
      if (!p) {
        p = document.createElement('span');
        p.className = 'chyba-pole';
        p.id = id;
        (pole || el.parentNode).appendChild(p);
      }
      p.textContent = zprava;
      el.setAttribute('aria-invalid', 'true');
      var popsano = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      if (popsano.indexOf(id) < 0) { popsano.push(id); el.setAttribute('aria-describedby', popsano.join(' ')); }
    } else {
      if (p) p.remove();
      el.removeAttribute('aria-invalid');
      var zbytek = (el.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== id; });
      if (zbytek.length) el.setAttribute('aria-describedby', zbytek.join(' ')); else el.removeAttribute('aria-describedby');
    }
  }

  // Napojí kontroly na pole: při opuštění pole a při psaní (když už chyba svítí)
  function napojKontroly(form, pravidla) {
    Object.keys(pravidla).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var kontrola = function () { ukazChybu(el, pravidla[id](el)); };
      el.addEventListener('blur', kontrola);
      el.addEventListener('change', kontrola);
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') kontrola(); });
    });
  }

  function zkontrolujVse(pravidla) {
    var prvni = null;
    Object.keys(pravidla).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var chyba = pravidla[id](el);
      ukazChybu(el, chyba);
      if (chyba && !prvni) prvni = el;
    });
    if (prvni) prvni.focus();
    return !prvni;
  }

  function zprava(el, druh, radky) {
    el.hidden = false;
    el.className = 'zprava zprava--' + druh;
    el.textContent = '';
    radky.forEach(function (r) { var p = document.createElement('p'); p.textContent = r; el.appendChild(p); });
    K.opravMezery(el);
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function zamknout(tlacitko, ano, text) {
    tlacitko.disabled = ano;
    if (ano) { tlacitko.dataset.text = tlacitko.textContent; tlacitko.textContent = text; }
    else if (tlacitko.dataset.text) tlacitko.textContent = tlacitko.dataset.text;
  }

  function odeslatAZpracovat(form, udaje, data, vystup, priUspechu) {
    var tl = form.querySelector('button[type="submit"]');
    // Robot vyplnil skryté pole: tváříme se, že je hotovo, a nic neposíláme.
    if (udaje.web) { priUspechu({ ok: true, stav: 'Potvrzeno' }); return; }
    zamknout(tl, true, 'Odesílám…');
    K.odeslat(udaje, data)
      .then(function (odp) {
        if (odp && odp.ok) { priUspechu(odp); form.reset(); return; }
        var chyba = (odp && odp.chyba) || 'Něco se nepovedlo.';
        if (odp && odp.pole) {
          var el = form.querySelector('[name="' + odp.pole + '"]');
          if (el) ukazChybu(el, chyba);
        }
        zprava(vystup, 'chyba', [chyba]);
      })
      .catch(function () {
        zprava(vystup, 'chyba', ['Odeslání se nepovedlo. Zkontroluj připojení a zkus to znovu.', 'Když to nepůjde ani potom, ' + K.kontaktText() + '.']);
      })
      .then(function () { zamknout(tl, false); });
  }

  // ---------- Přihláška týmu ----------
  // data = načtená data webu (kvůli termínům a max. počtu hráčů)
  function prihlaska(data) {
    var form = document.getElementById('form-prihlaska');
    if (!form || form.dataset.napojeno) return;
    form.dataset.napojeno = '1';
    var vystup = document.getElementById('prihlaska-zprava');
    var sel = document.getElementById('f-termin');
    var pocet = document.getElementById('f-pocet');

    function termin() {
      return data.terminy.filter(function (t) { return t.id === sel.value; })[0] || null;
    }
    function maxHracu() { var t = termin(); return t ? Number(t.max_hracu) || 0 : 0; }

    var pravidla = {
      'f-termin': function (el) { return el.value ? '' : 'Vyber termín.'; },
      'f-tym': function (el) { var n = txt(el).length; return n >= 2 && n <= 40 ? '' : 'Napiš název týmu (2 až 40 znaků).'; },
      'f-pocet': function (el) {
        var n = Number(el.value), max = maxHracu() || Number(el.max) || 99;
        return Number.isInteger(n) && n >= 1 && n <= max ? '' : 'Počet hráčů musí být 1 až ' + max + '.';
      },
      'f-kapitan': function (el) { var n = txt(el).length; return n >= 2 && n <= 60 ? '' : 'Napiš jméno kapitána.'; },
      'f-email': function (el) {
        if (!txt(el)) return 'Napiš e-mail, přijde na něj potvrzení.';
        return jeEmail(txt(el)) ? '' : 'Zkontroluj e-mail, něco v něm chybí.';
      },
      'f-telefon': function (el) {
        if (!txt(el)) return 'Napiš telefon, ať se můžeme domluvit i na poslední chvíli.';
        return jeTelefon(txt(el)) ? '' : 'Telefon má mít aspoň 9 číslic.';
      },
      'f-poznamka': function (el) { return txt(el).length <= 500 ? '' : 'Poznámka může mít nejvýš 500 znaků.'; },
      'f-souhlas': function (el) { return el.checked ? '' : 'Bez souhlasu tě nemůžeme přihlásit.'; }
    };
    napojKontroly(form, pravidla);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      vystup.hidden = true;
      if (!zkontrolujVse(pravidla)) return;
      var t = termin();
      var udaje = {
        akce: 'prihlaska',
        termin_id: sel.value,
        tym: txt(document.getElementById('f-tym')),
        pocet_hracu: Number(pocet.value),
        kapitan: txt(document.getElementById('f-kapitan')),
        email: txt(document.getElementById('f-email')),
        telefon: txt(document.getElementById('f-telefon')),
        poznamka: txt(document.getElementById('f-poznamka')),
        souhlas: document.getElementById('f-souhlas').checked,
        web: document.getElementById('f-web').value,
        doba_ms: Date.now() - START
      };
      var kdy = t ? C.datumCas(t.datum, t.cas) + ', ' + t.podnik.nazev : '';
      odeslatAZpracovat(form, udaje, data, vystup, function (odp) {
        var radky;
        if (odp.stav === 'Náhradník') {
          radky = ['Termín je plný, tým „' + udaje.tym + '“ je zapsaný jako náhradník (' + kdy + ').',
            'Když se místo uvolní, ozveme se ti. Potvrzení přijde e-mailem.'];
        } else {
          radky = ['Hotovo! Tým „' + udaje.tym + '“ je přihlášený: ' + kdy + '.',
            'Potvrzení ti přijde e-mailem. Kdybys nemohl(a), odpověz na něj a uvolníš místo dalším.'];
        }
        if (odp.demo) radky.push('Tohle je ukázka – web zatím běží s vymyšlenými daty a nic se neodeslalo.');
        zprava(vystup, odp.stav === 'Náhradník' ? 'nahradnik' : 'ok', radky);
        START = Date.now();
        document.dispatchEvent(new CustomEvent('kobla:prihlaseno'));
      });
    });
  }

  // ---------- Formulář pro hospody ----------
  function hospoda() {
    var form = document.getElementById('form-hospoda');
    if (!form) return;
    var vystup = document.getElementById('hospoda-zprava');
    var email = document.getElementById('h-email');
    var telefon = document.getElementById('h-telefon');

    function asponJedenKontakt() { return txt(email) || txt(telefon); }
    var pravidla = {
      'h-podnik': function (el) { var n = txt(el).length; return n >= 2 && n <= 80 ? '' : 'Napiš název podniku.'; },
      'h-mesto': function (el) { var n = txt(el).length; return n >= 2 && n <= 60 ? '' : 'Napiš město nebo obec.'; },
      'h-osoba': function (el) { var n = txt(el).length; return n >= 2 && n <= 60 ? '' : 'Napiš, s kým se máme domluvit.'; },
      'h-email': function (el) {
        if (!txt(el)) return asponJedenKontakt() ? '' : 'Vyplň e-mail, nebo telefon.';
        return jeEmail(txt(el)) ? '' : 'Zkontroluj e-mail, něco v něm chybí.';
      },
      'h-telefon': function (el) {
        if (!txt(el)) return asponJedenKontakt() ? '' : 'Vyplň telefon, nebo e-mail.';
        return jeTelefon(txt(el)) ? '' : 'Telefon má mít aspoň 9 číslic.';
      },
      'h-kapacita': function (el) {
        if (!txt(el)) return '';
        var n = Number(el.value);
        return Number.isInteger(n) && n >= 1 && n <= 1000 ? '' : 'Napiš přibližný počet míst jako číslo.';
      },
      'h-zprava': function (el) { return txt(el).length <= 1000 ? '' : 'Zpráva může mít nejvýš 1000 znaků.'; },
      'h-souhlas': function (el) { return el.checked ? '' : 'Bez souhlasu ti nemůžeme odpovědět.'; }
    };
    napojKontroly(form, pravidla);
    // když se doplní jeden kontakt, zmizí chyba u druhého
    [email, telefon].forEach(function (el) {
      el.addEventListener('input', function () {
        if (asponJedenKontakt()) { [email, telefon].forEach(function (x) { if (!txt(x)) ukazChybu(x, ''); }); }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      vystup.hidden = true;
      if (!zkontrolujVse(pravidla)) return;
      var udaje = {
        akce: 'hospoda',
        podnik: txt(document.getElementById('h-podnik')),
        mesto: txt(document.getElementById('h-mesto')),
        kontaktni_osoba: txt(document.getElementById('h-osoba')),
        email: txt(email),
        telefon: txt(telefon),
        kapacita: txt(document.getElementById('h-kapacita')),
        zprava: txt(document.getElementById('h-zprava')),
        souhlas: document.getElementById('h-souhlas').checked,
        web: document.getElementById('h-web').value,
        doba_ms: Date.now() - START
      };
      odeslatAZpracovat(form, udaje, null, vystup, function (odp) {
        var radky = ['Díky! Zprávu jsme dostali a brzy se ozveme.'];
        if (odp.demo) radky.push('Tohle je ukázka – web zatím běží s vymyšlenými daty a nic se neodeslalo.');
        zprava(vystup, 'ok', radky);
        START = Date.now();
      });
    });
  }

  window.KoblaFormulare = { prihlaska: prihlaska, hospoda: hospoda, jeEmail: jeEmail, jeTelefon: jeTelefon };
})();
