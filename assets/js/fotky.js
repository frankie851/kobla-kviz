// Podstránka Fotky (R10): galerie po večerech, zvětšení po kliknutí, šipky a Esc.
(function () {
  'use strict';
  var C = window.Cesky;
  var K = window.Kobla;
  var galerie = document.getElementById('galerie');
  var dialog = document.getElementById('prohlizec');
  var foto = document.getElementById('prohlizec-foto');
  var popis = document.getElementById('prohlizec-popis');
  var vsechny = []; // seznam všech fotek pro listování
  var aktualni = 0;
  var spoustec = null;

  function el(tag, trida, text) {
    var e = document.createElement(tag);
    if (trida) e.className = trida;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function ukaz(i) {
    aktualni = (i + vsechny.length) % vsechny.length;
    var f = vsechny[aktualni];
    foto.src = f.src;
    foto.alt = f.alt;
    popis.textContent = f.titulek + ' · ' + (aktualni + 1) + '/' + vsechny.length;
  }

  function otevri(i, tlacitko) {
    spoustec = tlacitko;
    ukaz(i);
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
  }

  function zavri() {
    if (dialog.close) dialog.close(); else dialog.removeAttribute('open');
  }

  dialog.addEventListener('close', function () { if (spoustec) spoustec.focus(); });
  dialog.addEventListener('click', function (e) {
    var krok = e.target.closest('[data-krok]');
    if (krok) { ukaz(aktualni + Number(krok.getAttribute('data-krok'))); return; }
    if (e.target.closest('[data-zavrit]') || e.target === dialog || e.target.tagName === 'FIGURE') zavri();
  });
  dialog.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') ukaz(aktualni + 1);
    if (e.key === 'ArrowLeft') ukaz(aktualni - 1);
  });

  K.nactiFotky().then(function (vecery) {
    galerie.textContent = '';
    if (!vecery.length) {
      galerie.appendChild(el('p', 'prazdne', 'Fotky z prvních večerů sem brzy přidáme.'));
      return;
    }
    vecery.forEach(function (v) {
      var blok = el('section', 'vecer-fotky');
      blok.id = v.slozka;
      var titulek = C.datumCas(v.datum) + ' · ' + v.podnik;
      blok.appendChild(el('h2', '', C.datumCas(v.datum)));
      blok.appendChild(el('p', 'kde', v.podnik));
      var ul = el('ul', 'fotky-mrizka');
      v.fotky.forEach(function (f) {
        var soubor = typeof f === 'string' ? f : f.soubor;
        var src = 'assets/fotky/' + v.slozka + '/' + soubor;
        var alt = (f.popis || 'Fotka z kvízu') + ' – ' + v.podnik;
        var index = vsechny.length;
        vsechny.push({ src: src, alt: alt, titulek: titulek });
        var li = el('li');
        var tl = el('button');
        tl.type = 'button';
        tl.setAttribute('aria-label', 'Zvětšit fotku ' + (index + 1));
        var img = el('img');
        img.src = src; img.alt = alt; img.loading = 'lazy'; img.decoding = 'async';
        tl.appendChild(img);
        tl.addEventListener('click', function () { otevri(index, tl); });
        li.appendChild(tl);
        ul.appendChild(li);
      });
      blok.appendChild(ul);
      galerie.appendChild(blok);
    });
    K.opravMezery(galerie);
    // odkaz z hlavní stránky na konkrétní večer
    if (location.hash) { var cil = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (cil) cil.scrollIntoView(); }
  });
})();
