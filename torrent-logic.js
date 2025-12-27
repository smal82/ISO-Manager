const distros = ["ubuntu-24.04.iso", "debian-12.iso", "fedora-40.iso", "arch-2024.iso", "mint-21.iso", "kali-2024.iso", "manjaro.iso", "pop-os.iso", "tails-6.iso", "opensuse.iso", "alma-9.iso", "rocky-9.iso", "gentoo.iso", "slackware.iso", "void.iso", "mx-23.iso", "endeavour.iso", "garuda.iso", "zorin-17.iso", "elementary.iso"];

// Oggetto per tenere traccia di quante volte ogni distro è stata completata
window.historyCounters = {};

window.isMultipleMode = false;

window.parseMagnetName = function(magnet) {
    if (!magnet || typeof magnet !== 'string') return null;
    const dnMatch = magnet.match(/dn=([^&]+)/);
    if (dnMatch && dnMatch[1]) {
        try {
            return decodeURIComponent(dnMatch[1].replace(/\+/g, ' '));
        } catch (e) {
            return dnMatch[1].replace(/\+/g, ' ');
        }
    }
    return null;
};

window.toggleInputMode = function() {
    window.isMultipleMode = !window.isMultipleMode;
    const btn = $('#toggle-mode');
    const oldField = $('#magnet-field');
    const currentValue = oldField.val();
    let newField;

    if (window.isMultipleMode) {
        btn.text('Passa a singolo');
        newField = $('<textarea>', {
            id: 'magnet-field',
            class: 'magnet-field',
            placeholder: 'Incolla più magnet (uno per riga)...',
            style: 'height: 120px; width: 100%; resize: none; padding: 10px;'
        });
    } else {
        btn.text('Passa a multiplo');
        newField = $('<input>', {
            type: 'text',
            id: 'magnet-field',
            class: 'magnet-field',
            placeholder: 'Incolla Magnet Link qui...',
            style: 'height: 50px;'
        });
    }

    newField.val(currentValue);
    oldField.replaceWith(newField);
};

window.processInput = function() {
    const field = $('#magnet-field');
    const rawValue = field.val().trim();
    if (!rawValue) return;

    if (window.isMultipleMode) {
        const lines = rawValue.split(/\r?\n/);
        lines.forEach(line => {
            const clean = line.trim();
            if (clean) {
                const nameFromMagnet = window.parseMagnetName(clean);
                window.addNewTorrent(nameFromMagnet);
            }
        });
    } else {
        const nameFromMagnet = window.parseMagnetName(rawValue);
        window.addNewTorrent(nameFromMagnet);
    }
    field.val('');
};

window.sortTorrents = function() {
    const container = $('#torrent-list');
    const items = container.children('.torrent-item').get();
    
    items.sort(function(a, b) {
        const order = { 'active-download': 1, 'queued': 2, 'seeding': 3 };
        const classA = $(a).hasClass('active-download') ? 'active-download' : ($(a).hasClass('seeding') ? 'seeding' : 'queued');
        const classB = $(b).hasClass('active-download') ? 'active-download' : ($(b).hasClass('seeding') ? 'seeding' : 'queued');
        
        if (order[classA] !== order[classB]) return order[classA] - order[classB];

        const remA = parseInt($(a).attr('data-remaining-sec')) || 0;
        const remB = parseInt($(b).attr('data-remaining-sec')) || 0;
        return remA - remB;
    });
    
    $.each(items, function(i, li) { container.append(li); });
};

window.manageWorkflow = function() {
    if (!window.CONFIG.IS_CALIBRATED) return;
    const totalPresent = $('.torrent-item').length;
    if (totalPresent < window.CONFIG.FILL_LIMIT) {
        for (let i = 0; i < (window.CONFIG.FILL_LIMIT - totalPresent); i++) { window.addNewTorrent(null, false); }
    }
    const activeCount = $('.active-download').length;
    if (activeCount < window.CONFIG.MAX_ACTIVE) {
        $('.torrent-item.queued').slice(0, window.CONFIG.MAX_ACTIVE - activeCount).each(function() { window.startAnimation($(this).attr('id')); });
    }
    window.sortTorrents();
    window.updateStats();
};

window.addNewTorrent = function(customName = null, triggerWorkflow = true) {
    let name = customName;
    if (!name) {
        const existingNames = $('.file-name').map(function() { return $(this).text(); }).get();
        // Filtriamo le distro base che non sono attualmente in lista (con o senza suffisso)
        const availableDistros = distros.filter(d => {
            return !existingNames.some(existing => existing.startsWith(d.replace('.iso', '')));
        });

        if (availableDistros.length > 0) {
            const baseName = availableDistros[Math.floor(Math.random() * availableDistros.length)];
            const cleanBase = baseName.replace('.iso', '');
            
            // Incrementiamo o inizializziamo il contatore storico per questa distro
            if (!window.historyCounters[cleanBase]) {
                window.historyCounters[cleanBase] = 1;
                name = baseName;
            } else {
                window.historyCounters[cleanBase]++;
                name = `${cleanBase} (${window.historyCounters[cleanBase]}).iso`;
            }
        } else {
            name = "iso-" + Math.random().toString(36).substr(2, 5).toUpperCase() + ".iso";
        }
    }

    const id = 'tr-' + Math.random().toString(36).substr(2, 7);
    const sizeGB = (Math.random() * (window.CONFIG.MAX_SIZE_GB - window.CONFIG.MIN_SIZE_GB) + window.CONFIG.MIN_SIZE_GB).toFixed(2);
    const html = `
        <div class="torrent-item queued" id="${id}" data-size="${sizeGB}" data-current-speed="0" data-current-up-speed="0" data-downloaded-gb="0" data-sent-gb="0" data-remaining-sec="999999">
            <div class="file-info"><span class="file-name">${name}</span><span class="file-size">${sizeGB} GB</span></div>
            <div class="progress-section">
                <div class="progress-container"><div class="progress-bar"></div><div class="progress-text">In attesa...</div></div>
                <div class="timer-row">
                    <span class="elapsed">Passato: 0s</span>
                    <span class="remaining"><span class="desktop-label">Rimanente: </span><span class="mobile-label">ETA: </span><span class="time-value">--</span></span>
                    <span class="speed-info">0.0 MB/s</span>
                </div>
            </div>
        </div>`;
    $('#torrent-list').append(html);
    if (triggerWorkflow) window.manageWorkflow();
};

window.startAnimation = function(id) {
    const $item = $('#' + id);
    if (!$item.length || $item.hasClass('active-download')) return;
    $item.removeClass('queued').addClass('active-download');
    window.sortTorrents();
    
    const torrentStartTime = Date.now();
    const sizeGB = parseFloat($item.attr('data-size')), totalMB = sizeGB * 1024;
    let downloadedMB = 0, sentMB = 0;
    
    const interval = setInterval(() => {
        if (!$item.length || $item.hasClass('seeding')) { clearInterval(interval); return; }
        const activeCount = $('.active-download').length;
        const totalUpNodes = activeCount + $('.seeding').length;
        const currentSpeed = ((window.CONFIG.MAX_GLOBAL_DOWNLOAD_MBPS / activeCount) * (0.9 + Math.random() * 0.2)).toFixed(1);
        const currentUpSpeed = totalUpNodes > 0 ? ((window.CONFIG.MAX_GLOBAL_UPLOAD_MBPS / totalUpNodes) * (0.6 + Math.random() * 0.4)).toFixed(1) : 0;
        downloadedMB += (currentSpeed * (window.CONFIG.UPDATE_INTERVAL / 1000));
        sentMB += (currentUpSpeed * (window.CONFIG.UPDATE_INTERVAL / 1000));
        let percent = (downloadedMB / totalMB) * 100;
        const remainingSec = currentSpeed > 0 ? Math.round((totalMB - downloadedMB) / currentSpeed) : 0;
        
        $item.attr('data-current-speed', currentSpeed).attr('data-current-up-speed', currentUpSpeed).attr('data-downloaded-gb', (downloadedMB / 1024).toFixed(4)).attr('data-sent-gb', (sentMB / 1024).toFixed(4)).attr('data-remaining-sec', remainingSec);
        
        if (percent >= 100) {
            clearInterval(interval);
            window.totalFilesCompleted++;
            window.historicalDataGB = (parseFloat(window.historicalDataGB) || 0) + sizeGB;
            window.historicalSentGB = (parseFloat(window.historicalSentGB) || 0) + (sentMB / 1024);
            
            $item.removeClass('active-download').addClass('seeding').data('seeding-start', Date.now()).attr('data-remaining-sec', 999999);
            window.sortTorrents();

            $item.find('.progress-bar').css('width', '100%');
            $item.find('.progress-text').text('100%');
            $item.find('.time-value').text('');
            $item.find('.desktop-label').text('Completato');
            $item.find('.mobile-label').text('Fine');
            
            window.manageWorkflow();
            
            let seedSentMB = 0;
            const seedInt = setInterval(() => {
                if (!$item.length) { 
                    window.historicalSentGB = (parseFloat(window.historicalSentGB) || 0) + (seedSentMB / 1024);
                    clearInterval(seedInt); 
                    return; 
                }
                const currentTotalUpNodes = $('.seeding').length + $('.active-download').length;
                const sSpeed = ((window.CONFIG.MAX_GLOBAL_UPLOAD_MBPS / currentTotalUpNodes) * (0.8 + Math.random() * 0.4)).toFixed(1);
                seedSentMB += (sSpeed * (window.CONFIG.UPDATE_INTERVAL / 1000));
                $item.attr('data-current-speed', sSpeed).attr('data-sent-gb', (seedSentMB / 1024).toFixed(4));
                $item.find('.speed-info').text(sSpeed + ' MB/s');
                $item.find('.elapsed').text('Seed: ' + window.formatTime(Math.floor((Date.now() - $item.data('seeding-start')) / 1000)));
            }, window.CONFIG.UPDATE_INTERVAL);
            
            setTimeout(() => { $item.fadeOut(500, function() { $(this).remove(); window.manageWorkflow(); }); }, window.CONFIG.SEEDING_DURATION);
        } else {
            $item.find('.progress-bar').css('width', percent + '%');
            $item.find('.progress-text').text(Math.floor(percent) + '%');
            $item.find('.speed-info').text(currentSpeed + ' MB/s');
            $item.find('.elapsed').text('Passato: ' + window.formatTime(Math.floor((Date.now() - torrentStartTime) / 1000)));
            $item.find('.time-value').text(window.formatTime(remainingSec));
            if (Math.random() > 0.98) window.sortTorrents();
        }
    }, window.CONFIG.UPDATE_INTERVAL);
};
