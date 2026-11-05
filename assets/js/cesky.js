// Pomocné funkce pro češtinu: formát data a času, skloňování počtů a nezlomitelné mezery.
// Používá je web i návrhy. Funkce nic nevolají ven, jen převádějí text.
(function (glob) {
  'use strict';

  var DNY = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'];
  var DNY_CELE = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
  var NBSP = ' ';

  // "2026-11-14" -> Date (místní půlnoc). Jinak vrátí null.
  function naDatum(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  // Date -> "2026-11-14"
  function naIso(d) {
    function dve(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + dve(d.getMonth() + 1) + '-' + dve(d.getDate());
  }

  // "čt 14. 11. 2026 · 19:00" (s nezlomitelnými mezerami, aby se datum nerozdělilo na dva řádky)
  function datumCas(iso, cas) {
    var d = naDatum(iso);
    if (!d) return '';
    var text = DNY[d.getDay()] + NBSP + d.getDate() + '.' + NBSP + (d.getMonth() + 1) + '.' + NBSP + d.getFullYear();
    if (cas) text += NBSP + '·' + NBSP + cas;
    return text;
  }

  // "14. 11." – krátké datum bez roku
  function datumKratke(iso) {
    var d = naDatum(iso);
    if (!d) return '';
    return d.getDate() + '.' + NBSP + (d.getMonth() + 1) + '.';
  }

  // "čtvrtek"
  function denCely(iso) {
    var d = naDatum(iso);
    return d ? DNY_CELE[d.getDay()] : '';
  }

  // "čt"
  function denKratky(iso) {
    var d = naDatum(iso);
    return d ? DNY[d.getDay()] : '';
  }

  // Skloňování: tvar(1, ['místo','místa','míst']) -> "místo"
  function tvar(n, tvary) {
    n = Math.abs(Number(n));
    if (n === 1) return tvary[0];
    if (n >= 2 && n <= 4) return tvary[1];
    return tvary[2];
  }

  // pocet(3, ['místo','místa','míst']) -> "3 místa" (s nezlomitelnou mezerou)
  function pocet(n, tvary) {
    return n + NBSP + tvar(n, tvary);
  }

  var MISTA = ['volné místo', 'volná místa', 'volných míst'];
  var TYMY = ['tým', 'týmy', 'týmů'];
  var HRACI = ['hráč', 'hráči', 'hráčů'];

  // Za jednopísmenné předložky a spojky (k, s, v, z, o, u, a, i) dá nezlomitelnou mezeru.
  function nbsp(text) {
    return String(text).replace(/(^|[\s(„])([kKsSvVzZoOuUaAiI])\s+/g, '$1$2' + NBSP);
  }

  // Projde všechny textové uzly v prvku a opraví mezery (nesahá do formulářových polí a skriptů).
  function opravMezery(koren) {
    if (!koren || !glob.document) return;
    var chodec = glob.document.createTreeWalker(koren, 4 /* NodeFilter.SHOW_TEXT */, null);
    var uzel;
    while ((uzel = chodec.nextNode())) {
      var rodic = uzel.parentNode && uzel.parentNode.nodeName;
      if (rodic === 'SCRIPT' || rodic === 'STYLE' || rodic === 'TEXTAREA') continue;
      var novy = nbsp(uzel.nodeValue);
      if (novy !== uzel.nodeValue) uzel.nodeValue = novy;
    }
  }

  // Částka: 50 -> "50 Kč"
  function kc(n) {
    return n + NBSP + 'Kč';
  }

  glob.Cesky = {
    naDatum: naDatum, naIso: naIso, datumCas: datumCas, datumKratke: datumKratke,
    denCely: denCely, denKratky: denKratky, tvar: tvar, pocet: pocet, nbsp: nbsp,
    opravMezery: opravMezery, kc: kc, MISTA: MISTA, TYMY: TYMY, HRACI: HRACI, NBSP: NBSP
  };
})(typeof window !== 'undefined' ? window : globalThis);
