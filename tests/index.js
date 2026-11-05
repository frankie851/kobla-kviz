// Spouští se příkazem: node --test tests/
// (Node bere „tests/“ jako tento soubor a ten načte všechny *.test.js ve složce.)
const fs = require('fs');
const path = require('path');
fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort().forEach(f => require(path.join(__dirname, f)));
