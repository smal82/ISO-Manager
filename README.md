# ISO Manager

![GitHub repo size](https://img.shields.io/github/repo-size/smal82/ISO-Manager?style=for-the-badge&color=blue)
![GitHub last commit](https://img.shields.io/github/last-commit/smal82/ISO-Manager?style=for-the-badge&color=brightgreen)
![jQuery](https://img.shields.io/badge/jquery-%230769AD.svg?style=for-the-badge&logo=jquery&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) 

> **[Versione Italiana disponibile qui](README.it.md)**

**ISO Manager** is an advanced torrent download management simulator designed to emulate the user experience of a modern BitTorrent client directly in the browser. The project focuses on dynamic queue management, real-time network statistics visualization, and download/seeding workflow automation.

## ✨ Recent Updates & UI Refinement

The latest iteration of the project introduced significant improvements focused on usability and queue management precision:

### 🧩 Dynamic Middle-Truncation
To ensure maximum readability on every device, an intelligent file name display logic was implemented. Unlike standard methods that cut text at the end, ISO Manager uses a combination of **JavaScript and CSS Flexbox** to always preserve the file extension and the last few characters. The system dynamically evaluates available space: if the name fits, it appears in full; otherwise, an ellipsis cut is applied exactly in the middle, ensuring a clean aesthetic on both Desktop and Mobile.

### 🗑️ Selective Management & Dynamic Queue
Download list control has been enhanced with new features:
* **Manual Deletion:** You can now remove individual torrents directly from the queue ("Waiting" state).
* **Intelligent Blacklist:** If a user deletes one of the default distros loaded at startup, the system automatically adds it to a temporary blacklist. This prevents the software from re-inserting the same file during automatic fill cycles in the current session.
* **Fill-Limit Flexibility:** At startup, the app strictly respects the configured `FILL_LIMIT` (default 20), but allows the user to voluntarily reduce the queue size through manual deletion without forcing the restoration of unwanted files.

### 📱 Mobile-First Optimization
The interface has been refined for touch. Sorting controls (Move Up/Down) and the remove button have been resized and spaced to prevent accidental touches, improving the user experience on smartphones.

## 🌐 Online Demo

Try the application directly in your browser:
👉 **[https://smal82.github.io/ISO-Manager/](https://smal82.github.io/ISO-Manager/)**

## 📸 Interface Preview

<p align="center">
<img src="1.png" width="400" alt="Screenshot 1">
<img src="2.png" width="400" alt="Screenshot 2">
<img src="3.png" width="400" alt="Screenshot 3">
<img src="4.png" width="400" alt="Screenshot 4">
<img src="5.png" width="400" alt="Screenshot 5">
</p>

## 🚀 Key Features

ISO Manager's interface offers maximum flexibility: users can instantly toggle between **light and dark modes**. The input system is dual and intelligent: users can paste a single magnet link or activate multiple mode to process **entire lists of magnets at once**. Once added, torrents are managed by an automatic queue system with animated progress bars and differentiated states (Waiting, Downloading, Seeding), keeping the list sorted by status and Estimated Time of Arrival (ETA).

## 🧠 Analysis & Implemented Algorithms

Simulation realism is guaranteed by integrated logical processes operating in synergy.

### Network Detection Heuristics
Upon opening, the system starts a heuristic analysis to calibrate the experience. This process performs device fingerprinting by crossing browser technical data with detected connection capabilities. On desktop systems, the algorithm forces a Fiber Optic optimized profile. These results calibrate global bandwidth limits (download/upload) and simulated peer speeds.

### Queue Management & Scheduling
The system implements a conditioned FIFO (First-In, First-Out) scheduling algorithm. It monitors active processes in real-time and automatically starts queued torrents only when bandwidth slots become available, respecting stability limits defined during calibration.

### Bandwidth Distribution & Parsing
Data traffic simulation uses a dynamic allocation algorithm that distributes global speed among all active downloads. A random jitter factor is applied to simulate P2P protocol variations. Simultaneously, every link is analyzed via regular expressions to extract the *Display Name* (dn) parameter, assigning readable names to each file.

### Multi-Level Sorting Logic
Torrents are constantly reorganized according to a two-key hierarchy. Primary priority is dictated by process status (Active, Queued, Seeding), while secondary priority sorts files within the same group by ETA.

## 📄 License

This project is distributed under the **MIT License**.
[MIT License - ISO Manager](https://github.com/smal82/ISO-Manager/blob/main/LICENSE)
