# Random Forest în browser, cu WebAssembly

Un Random Forest pentru clasificare, scris în C++ (`rf.cpp`) și compilat în WebAssembly cu Emscripten. Pagina `index.html` încarcă un fișier CSV ales de utilizator, antrenează modelul direct în browser și afișează acuratețea pe un set de test. Datele nu părăsesc calculatorul.

| Fișier | Rol |
| --- | --- |
| `rf.cpp` | algoritmul Random Forest, în C++ |
| `index.html` | pagina |
| `app.js` | citește fișierul CSV, apelează modulul WebAssembly și afișează rezultatele |
| `rf-pur.js` | același algoritm, scris direct în JavaScript, pentru comparație |
| `date/examen.csv`, `date/fructe.csv` | două seturi de date de test |

Fișierele `rf.js` și `rf.wasm` nu se află în repository: le generează compilarea.

## 1. Instalarea Emscripten (o singură dată)

Emscripten este compilatorul care transformă codul C și C++ în WebAssembly. Se instalează cu `emsdk`:

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

Pe Windows, în Command Prompt, ultimele trei comenzi sunt `emsdk install latest`, `emsdk activate latest` și `emsdk_env.bat`.

`emsdk_env` pregătește doar terminalul curent; într-un terminal nou se rulează din nou. Instalarea se verifică cu `emcc --version`.

## 2. Compilarea

În directorul `random-forest-wasm`:

```bash
emcc rf.cpp -O3 -lembind -sMODULARIZE=1 -sEXPORT_ES6=1 -sEXPORT_NAME=createRandomForest -sALLOW_MEMORY_GROWTH=1 -o rf.js
```

- `-O3`: optimizarea maximă a codului;
- `-lembind`: biblioteca Embind, prin care clasa C++ `RandomForest` devine vizibilă în JavaScript;
- `-sMODULARIZE=1 -sEXPORT_ES6=1 -sEXPORT_NAME=createRandomForest`: `rf.js` devine un modul JavaScript care exportă funcția `createRandomForest()`;
- `-sALLOW_MEMORY_GROWTH=1`: memoria modulului crește la nevoie, pentru fișiere CSV mai mari;
- `-o rf.js`: numele fișierului generat. Alături apare `rf.wasm`, modulul compilat.

Ambele fișiere au doar câteva zeci de KB.

## 3. Rularea

Browserul nu încarcă modulele JavaScript și WebAssembly într-o pagină deschisă direct din fișier (`file://`), așa că pagina se deschide printr-un server local. În directorul `random-forest-wasm`:

```bash
python -m http.server 8000
```

Pe unele sisteme comanda este `python3`. Apoi se deschide în browser adresa `http://localhost:8000`. O alternativă este `emrun index.html`, care vine cu Emscripten.

În pagină se alege un fișier CSV, de exemplu `date/fructe.csv`, se stabilesc numărul de arbori și adâncimea maximă, apoi se apasă „Antrenează”.

## Formatul fișierului CSV

- primul rând conține numele coloanelor;
- ultima coloană conține clasa (text sau număr);
- celelalte coloane conțin valori numerice;
- separatorul este virgula sau punctul și virgula; în al doilea caz, ca în fișierele salvate de Excel în limba română, se acceptă și virgula zecimală;
- rândurile incomplete sau cu valori nenumerice sunt ignorate.

Fiecare al cincilea rând intră în setul de test (20%), celelalte în setul de antrenare.

## Seturile de date de test

- `examen.csv` (400 de rânduri): dacă un student promovează (`da` sau `nu`), după orele de studiu, prezență, temele predate și nota de la parțial. Coloana `ziua_nasterii` nu are legătură cu rezultatul.
- `fructe.csv` (450 de rânduri): măr, pară sau portocală, după greutate, diametru, alungire și rugozitatea cojii.

Datele sunt generate și au zgomot: câteva etichete sunt greșite intenționat, deci acuratețea nu ajunge la 100%.

## Ce se poate observa

- Cu 100 de arbori și adâncimea 8, acuratețea pe setul de test este de aproximativ 82% pentru `examen.csv` și 92% pentru `fructe.csv`.
- Importanța coloanelor arată pe ce se bazează modelul. La `examen.csv`, `ziua_nasterii` iese ultima, pentru că nu are legătură cu rezultatul.
- Opțiunea „Compară cu același algoritm scris în JavaScript” antrenează și varianta din `rf-pur.js`. Cele două variante dau exact aceleași predicții, dar varianta JavaScript durează de câteva ori mai mult (de 3–5 ori, în Chromium).
- Obiectul `RandomForest` creat din C++ se eliberează explicit, cu `delete()` (vezi `app.js`): memoria modulului WebAssembly nu este gestionată automat de JavaScript.
