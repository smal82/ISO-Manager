# ISO Manager

![GitHub repo size](https://img.shields.io/github/repo-size/smal82/ISO-Manager?style=for-the-badge&color=blue)
![GitHub last commit](https://img.shields.io/github/last-commit/smal82/ISO-Manager?style=for-the-badge&color=brightgreen)
![jQuery](https://img.shields.io/badge/jquery-%230769AD.svg?style=for-the-badge&logo=jquery&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) 

**ISO Manager** è un simulatore avanzato di gestione download torrent, progettato per emulare l'esperienza d'uso di un client BitTorrent moderno direttamente nel browser. Il progetto si focalizza sulla gestione dinamica delle code, la visualizzazione in tempo reale delle statistiche di rete e l'automazione del workflow di download e seeding.

## 🌐 Demo Online

Puoi provare l'applicazione direttamente dal tuo browser al seguente indirizzo:
👉 **[https://smal82.github.io/ISO-Manager/](https://smal82.github.io/ISO-Manager/)**

## 🚀 Caratteristiche Principali

L'interfaccia dinamica permette una gestione fluida dei download attraverso progress bar animate e stati differenziati che distinguono i file in attesa, in download attivo e in fase di seeding. Il sistema supporta una doppia modalità di inserimento: è possibile aggiungere singoli link Magnet tramite un campo di testo standard oppure passare alla modalità textarea per incollare intere liste multiple. L'intera lista viene mantenuta costantemente organizzata grazie a un sistema di ordinamento intelligente che raggruppa i torrent per stato e li ordina per tempo rimanente stimato (ETA).

## 🧠 Algoritmi Implementati

Il realismo di ISO Manager è garantito dall'integrazione di diversi processi logici che lavorano in background.

### Euristica di Rilevamento Rete

All'apertura della pagina, il sistema avvia immediatamente una procedura di analisi euristica per calibrare i parametri di simulazione. Questo processo esegue un fingerprinting del dispositivo incrociando i dati del browser con le capacità teoriche della connessione rilevata. Se l'accesso avviene da un sistema desktop, l'algoritmo forza l'utilizzo di un profilo ottimizzato per Fibra Ottica, ignorando le limitazioni di risparmio dati tipiche dei dispositivi mobili. I risultati di questa analisi vengono utilizzati per impostare i limiti massimi di download e upload globali, garantendo che le prestazioni simulate siano coerenti con l'hardware e la rete effettiva dell'utente.

### Scheduling e Queue Management

L'algoritmo gestisce una coda FIFO (First-In, First-Out) condizionata che monitora costantemente il numero di download attivi. Nuovi processi vengono avviati automaticamente solo quando si liberano slot rispetto al limite massimo impostato, garantendo stabilità alla simulazione.

### Allocazione Dinamica della Banda

Per simulare la ripartizione reale della connessione, la velocità globale viene divisa tra i download attivi. Viene applicato un fattore di jitter casuale per evitare fluttuazioni piatte e innaturali, riflettendo il comportamento variabile delle reti P2P.

### Parsing Magnet Link

Attraverso espressioni regolari, l'algoritmo analizza i metadati dei link Magnet inseriti per estrarre il parametro del nome visualizzato (dn). Questo valore viene decodificato dal formato URL per assegnare automaticamente un nome leggibile e corretto ad ogni torrent aggiunto.

## 📄 Licenza

Questo progetto è distribuito sotto licenza **MIT**. Puoi consultare il testo completo della licenza direttamente qui:
[MIT License - ISO Manager](https://github.com/smal82/ISO-Manager/blob/main/LICENSE)
