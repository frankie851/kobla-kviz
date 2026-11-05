// Nastavení webu Kobla Kvíz. Tady se mění jen tyhle hodnoty, nic jiného.
window.KOBLA_CONFIG = {
  // Adresa Google Apps Scriptu (web app, končí na /exec). Je veřejná, nejde o tajemství.
  // Prázdná adresa = demo režim: web ukazuje vymyšlená data z data/demo.json
  // a odeslání formuláře se jen předvede (nic se nikam neposílá).
  ADRESA_SKRIPTU: '',

  // Kontakty, které se ukážou na webu (patička, sekce Kontakt, chybové hlášky).
  // Prázdná hodnota = na webu se ukáže [DOPLNIT: …].
  KONTAKT: {
    email: '',      // např. 'ahoj@example.cz'
    telefon: '',    // např. '+420 600 000 000'
    facebook: '',   // celá adresa stránky, např. 'https://www.facebook.com/...'
    instagram: ''   // celá adresa profilu, např. 'https://www.instagram.com/...'
  }
};
