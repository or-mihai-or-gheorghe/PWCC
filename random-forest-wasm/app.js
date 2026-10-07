// app.js — leagă pagina de algoritmul Random Forest compilat în WebAssembly (rf.js și rf.wasm).

import { RandomForestJS } from './rf-pur.js';

const fisier = document.getElementById('fisier');
const arbori = document.getElementById('arbori');
const adancime = document.getElementById('adancime');
const compara = document.getElementById('compara');
const buton = document.getElementById('antreneaza');
const rezultate = document.getElementById('rezultate');

// 1. Încărcarea modulului WebAssembly. rf.js și rf.wasm apar abia după compilarea lui rf.cpp.
let wasm;
try {
  const { default: createRandomForest } = await import('./rf.js');
  wasm = await createRandomForest();
  rezultate.textContent = 'Modulul WebAssembly s-a încărcat. Alege un fișier CSV și apasă „Antrenează”.';
} catch (eroare) {
  rezultate.textContent =
    'Modulul WebAssembly nu s-a putut încărca (' + eroare.message + ').\n' +
    'Verifică două lucruri: ai compilat rf.cpp cu emcc și ai deschis pagina printr-un server local, ' +
    'nu direct din fișier (vezi README.md).';
  buton.disabled = true;
}

buton.addEventListener('click', async () => {
  if (fisier.files.length === 0) {
    rezultate.textContent = 'Alege mai întâi un fișier CSV.';
    return;
  }
  rezultate.textContent = 'Se antrenează...';
  await new Promise((gata) => setTimeout(gata, 20)); // lasă pagina să afișeze mesajul

  try {
    const date = citesteCsv(await fisier.files[0].text());
    const set = imparteDate(date);
    const nrArbori = Number(arbori.value);
    const adancimeMaxima = Number(adancime.value);

    // 2. Antrenarea în WebAssembly. Obiectele create din C++ se eliberează explicit, cu delete().
    const model = new wasm.RandomForest(nrArbori, adancimeMaxima, 2, 42);
    const rezultatWasm = ruleaza(model, set);
    const noduri = model.nodeCount();
    model.delete();

    let text = descriereDate(fisier.files[0].name, date, set) + '\n';
    text += `WebAssembly (C++): ${nrArbori} arbori, ${formatNumar(noduri)} noduri, antrenare în ${formatTimp(rezultatWasm.timp)}\n`;
    text += descriereRezultat(rezultatWasm, date, set);

    // 3. Opțional: același algoritm în JavaScript pur, pentru comparație.
    if (compara.checked) {
      const rezultatJs = ruleaza(new RandomForestJS(nrArbori, adancimeMaxima, 2, 42), set);
      const aceleasi = rezultatJs.predictii.every((v, i) => v === rezultatWasm.predictii[i]);
      const raport = rezultatJs.timp / rezultatWasm.timp;
      text += `\nJavaScript: antrenare în ${formatTimp(rezultatJs.timp)}, ` +
        `adică de ${raport.toFixed(1)} ori ${raport >= 1 ? 'mai mult' : 'mai puțin'} decât în WebAssembly.\n`;
      text += `Aceleași predicții ca în WebAssembly: ${aceleasi ? 'da' : 'nu'}\n`;
    }
    rezultate.textContent = text;
  } catch (eroare) {
    rezultate.textContent = 'Eroare: ' + eroare.message;
  }
});

// Citește un CSV cu antet: ultimele valori sunt clasele, celelalte coloane trebuie să fie numerice.
// Separatorul poate fi virgula sau punctul și virgula (ca în CSV-urile salvate de Excel în română).
function citesteCsv(text) {
  const linii = text.split(/\r?\n/).filter((linie) => linie.trim() !== '');
  if (linii.length < 2) throw new Error('fișierul nu are rânduri de date.');
  const separator = linii[0].includes(';') ? ';' : ',';
  const antet = linii[0].split(separator).map((camp) => camp.trim());
  const numar = (camp) => (camp === '' ? NaN : Number(separator === ';' ? camp.replace(',', '.') : camp));

  const valori = [];
  const etichete = [];
  let ignorate = 0;
  for (const linie of linii.slice(1)) {
    const campuri = linie.split(separator).map((camp) => camp.trim());
    const numere = campuri.slice(0, -1).map(numar);
    if (campuri.length !== antet.length || numere.some(Number.isNaN)) {
      ignorate++;
      continue;
    }
    valori.push(numere);
    etichete.push(campuri[campuri.length - 1]);
  }
  const clase = [...new Set(etichete)].sort();
  if (clase.length < 2) throw new Error('ultima coloană trebuie să conțină cel puțin două clase.');
  return { coloane: antet.slice(0, -1), clase, valori, etichete, ignorate };
}

// Fiecare al cincilea rând intră în setul de test (20%), celelalte în setul de antrenare.
function imparteDate(date) {
  const nrColoane = date.coloane.length;
  const antrenare = [];
  const test = [];
  date.valori.forEach((rand, i) => ((i + 1) % 5 === 0 ? test : antrenare).push(i));
  if (test.length === 0) throw new Error('sunt prea puține rânduri pentru un set de test.');

  const matrice = (indici) => Float64Array.from(indici.flatMap((i) => date.valori[i]));
  const clase = (indici) => Int32Array.from(indici, (i) => date.clase.indexOf(date.etichete[i]));
  return {
    nrColoane,
    xAntrenare: matrice(antrenare),
    yAntrenare: clase(antrenare),
    xTest: matrice(test),
    yTest: clase(test),
  };
}

function ruleaza(model, set) {
  const inceput = performance.now();
  model.fit(set.xAntrenare, set.yAntrenare, set.nrColoane);
  const timp = performance.now() - inceput;
  return {
    timp,
    predictii: model.predict(set.xTest),
    importanta: Array.from(model.featureImportances()),
  };
}

function descriereDate(nume, date, set) {
  return `Fișier: ${nume}\n` +
    `Rânduri: ${date.valori.length}` + (date.ignorate > 0 ? ` (ignorate, incomplete sau nenumerice: ${date.ignorate})` : '') + '\n' +
    `Coloane folosite: ${date.coloane.join(', ')}\n` +
    `Clase: ${date.clase.join(', ')}\n` +
    `Antrenare: ${set.yAntrenare.length} rânduri; test: ${set.yTest.length} rânduri (fiecare al cincilea rând)\n`;
}

function descriereRezultat(rezultat, date, set) {
  const k = date.clase.length;
  const corecte = rezultat.predictii.filter((p, i) => p === set.yTest[i]).length;
  let text = `Acuratețe pe setul de test: ${(100 * corecte / set.yTest.length).toFixed(1)}% ` +
    `(${corecte} din ${set.yTest.length})\n\n`;

  // Matricea de confuzie: câte rânduri din fiecare clasă reală au primit fiecare clasă prezisă.
  const latime = Math.max(6, ...date.clase.map((c) => c.length)) + 2;
  const matrice = Array.from({ length: k }, () => new Array(k).fill(0));
  set.yTest.forEach((real, i) => matrice[real][rezultat.predictii[i]]++);
  text += 'Matricea de confuzie (rânduri: clasa reală; coloane: clasa prezisă)\n';
  text += ''.padEnd(latime) + date.clase.map((c) => c.padStart(latime)).join('') + '\n';
  matrice.forEach((rand, i) => {
    text += date.clase[i].padEnd(latime) + rand.map((v) => String(v).padStart(latime)).join('') + '\n';
  });

  text += '\nImportanța coloanelor\n';
  const latimeNume = Math.max(...date.coloane.map((c) => c.length)) + 2;
  date.coloane
    .map((nume, i) => ({ nume, valoare: rezultat.importanta[i] }))
    .sort((a, b) => b.valoare - a.valoare)
    .forEach(({ nume, valoare }) => {
      text += nume.padEnd(latimeNume) + `${(100 * valoare).toFixed(1)}%`.padStart(7) + '  ' +
        '█'.repeat(Math.round(40 * valoare)) + '\n';
    });
  return text;
}

function formatTimp(ms) {
  return ms < 10 ? `${ms.toFixed(1)} ms` : `${Math.round(ms)} ms`;
}

// Numerele de cel puțin cinci cifre primesc un spațiu îngust între grupele de câte trei cifre.
function formatNumar(n) {
  return n < 10000 ? String(n) : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
