# ISO Manager
![GitHub repo size](https://img.shields.io/github/repo-size/smal82/ISO-Manager?style=for-the-badge&color=blue)
![GitHub last commit](https://img.shields.io/github/last-commit/smal82/ISO-Manager?style=for-the-badge&color=brightgreen)
![GitHub license](https://img.shields.io/github/license/smal82/ISO-Manager?style=for-the-badge&color=orange)
![jQuery](https://img.shields.io/badge/jquery-%230769AD.svg?style=for-the-badge&logo=jquery&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)

**ISO Manager** è un simulatore avanzato di gestione download torrent, progettato per emulare l'esperienza d'uso di un client BitTorrent moderno direttamente nel browser. Il progetto si focalizza sulla gestione dinamica delle code, la visualizzazione in tempo reale delle statistiche di rete e l'automazione del workflow di download e seeding.

## 🚀 Caratteristiche Principali

* **Interfaccia Dinamica**: Gestione fluida dei download con progress bar animate e stati differenziati (In attesa, Download, Seeding).
* **Dual Input Mode**: Supporto per l'inserimento di singoli link Magnet o liste multiple tramite il passaggio dinamico tra `input` e `textarea`.
* **Auto-Calibrazione**: Rilevamento intelligente del tipo di rete (Fibra vs Mobile) per adattare i limiti di banda.
* **Ordinamento Intelligente**: Lista sempre organizzata per stato e tempo rimanente (ETA).

## 🧠 Algoritmi Implementati

Il cuore di ISO Manager è basato su diversi algoritmi che ne garantiscono il realismo:

### 1. Scheduling e Queue Management

L'algoritmo gestisce una coda **FIFO (First-In, First-Out)** condizionata. Controlla costantemente i torrent in stato `queued` e li sposta in `active-download` solo se il numero di slot attivi impostato (`MAX_ACTIVE`) non è stato raggiunto.

### 2. Allocazione Dinamica della Banda

Simula la spartizione della banda tra i peer. La velocità globale viene ripartita tra i download attivi utilizzando un **fattore di jitter** (moltiplicatore casuale tra 0.9 e 1.1). Questo evita fluttuazioni piatte e simula l'instabilità reale delle reti P2P.

### 3. Ordinamento Multi-Livello (Sorting)

Applica una logica di ordinamento a due chiavi di priorità:

1. **Priorità di Stato**: Raggruppa i torrent (Attivi > In coda > Seeding).
2. **Priorità Temporale**: All'interno del gruppo attivo, ordina i file per **tempo rimanente (ETA)**, portando in cima quelli più vicini al completamento.

### 4. Parsing Magnet Link (Regex Extraction)

Utilizza espressioni regolari per analizzare i metadati dei link Magnet. L'algoritmo estrae il parametro `dn` (Display Name) e lo decodifica dal formato URL (*percent-encoding*), assegnando automaticamente il nome corretto al torrent.

### 5. Euristica di Rilevamento Rete

Un algoritmo di fingerprinting incrocia i dati di `navigator.userAgent` e delle Network Information API. Su sistemi desktop (Windows/Mac), l'algoritmo forza i parametri di una rete **Fibra Ottica**, superando le limitazioni di risparmio dati dei browser mobile.

## 🛠️ Installazione

1. Clona la repo:
```bash
git clone https://github.com/smal82/ISO-Manager.git

```
2. Apri il file `index.html` nel tuo browser.

## 📄 Licenza

Questo progetto è distribuito sotto licenza **MIT**. Consulta il file [LICENSE](https://www.google.com/search?q=LICENSE) per maggiori dettagli.
