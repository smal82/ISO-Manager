const distros = ["ubuntu-24.04.iso", "debian-12.iso", "fedora-40.iso", "arch-2024.iso", "mint-21.iso", "kali-2024.iso", "manjaro.iso", "pop-os.iso", "tails-6.iso", "opensuse.iso", "alma-9.iso", "rocky-9.iso", "gentoo.iso", "slackware.iso", "void.iso", "mx-23.iso", "endeavour.iso", "garuda.iso", "zorin-17.iso", "elementary.iso"];

window.historyCounters = {};
window.isMultipleMode = false;
window.blacklistedDistros = []; 

window.parseMagnetData = function(magnet) {
    if (!magnet || typeof magnet !== 'string') return null;
    
    let name = null;
    const dnMatch = magnet.match(/dn=([^&]+)/);
    if (dnMatch && dnMatch[1]) {
        try {
            name = decodeURIComponent(dnMatch[1].replace(/\+/g, ' '));
        } catch (e) {
            name = dnMatch[1].replace(/\+/g, ' ');
        }
    }

    let sizeGB = null;

    // 1️⃣ Prova a leggere la dimensione reale dal magnet
    const xlMatch = magnet.match(/xl=([^&]+)/);
    if (xlMatch && xlMatch[1]) {
        const bytes = parseInt(xlMatch[1], 10);
        if (!isNaN(bytes)) {
            sizeGB = (bytes / (1024 ** 3)).toFixed(2);
        }
    }

    // 2️⃣ Fallback: stima da nome file con logica avanzata
    if (sizeGB === null && name) {
        const upperName = name.toUpperCase();
        const is4K = upperName.includes("2160P") || upperName.includes("4K");
        const is1080p = upperName.includes("1080P");
        const is720p = upperName.includes("720P");
        const isSD = upperName.includes("SD") || upperName.includes("XVID") || upperName.includes("DVD");

        const isAV1 = upperName.includes("AV1");
        const isX265 = upperName.includes("X265") || upperName.includes("HEVC");
        const isX264 = upperName.includes("X264");

        const rand = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

        if (is4K) {
            if (isAV1) sizeGB = rand(12, 28);
            else if (isX265) sizeGB = rand(15, 35);
            else sizeGB = rand(40, 80);
        } else if (is1080p) {
            if (isAV1) sizeGB = rand(1.8, 4.5);
            else if (isX265) sizeGB = rand(2.5, 6);
            else sizeGB = rand(6, 12);
        } else if (is720p) {
            if (isX265 || isAV1) sizeGB = rand(0.8, 1.8);
            else sizeGB = rand(1.2, 3);
        } else if (isSD) {
            // Raffinamento per DVDRip pesanti (MKV, AC3, 5.1)
            if (upperName.includes("MKV") || upperName.includes("AC3") || upperName.includes("5.1")) {
                sizeGB = rand(1.4, 2.2);
            } else {
                sizeGB = rand(0.6, 1.4);
            }
        }
    }

    return { name, sizeGB };
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
        // Invertiamo l'ordine per mantenere la sequenza corretta nell'inserimento in cima
        lines.reverse().forEach(line => {
            const clean = line.trim();
            if (clean) {
                const data = window.parseMagnetData(clean);
                window.addNewTorrent(data.name, true, data.sizeGB, true);
            }
        });
        window.toggleInputMode();
    } else {
        const data = window.parseMagnetData(rawValue);
        window.addNewTorrent(data.name, true, data.sizeGB, true);
    }
    $('#magnet-field').val('');
};

window.removeTorrent = function(btn) {
    const $item = $(btn).closest('.torrent-item');
    const baseName = $item.attr('data-base-name');
    
    if (distros.includes(baseName)) {
        window.blacklistedDistros.push(baseName);
    }
    
    $item.fadeOut(300, function() {
        $(this).remove();
        window.updateStats();
        const activeCount = $('.active-download').length;
        if (activeCount < window.CONFIG.MAX_ACTIVE) {
            $('.torrent-item.queued').slice(0, window.CONFIG.MAX_ACTIVE - activeCount).each(function() { window.startAnimation($(this).attr('id')); });
        }
    });
};

window.moveTorrent = function(btn, direction) {
    const $item = $(btn).closest('.torrent-item');
    if (direction === 'up') {
        const $prev = $item.prev('.torrent-item.queued');
        if ($prev.length) $item.insertBefore($prev);
    } else {
        const $next = $item.next('.torrent-item.queued');
        if ($next.length) $item.insertAfter($next);
    }
    const activeCount = $('.active-download').length;
    if (activeCount < window.CONFIG.MAX_ACTIVE) {
        $('.torrent-item.queued').slice(0, window.CONFIG.MAX_ACTIVE - activeCount).each(function() { window.startAnimation($(this).attr('id')); });
    }
};

window.sortTorrents = function() {
    const container = $('#torrent-list');
    const items = container.children('.torrent-item').get();
    
    items.sort(function(a, b) {
        const order = { 'active-download': 1, 'queued': 2, 'seeding': 3 };
        const classA = $(a).hasClass('active-download') ? 'active-download' : ($(a).hasClass('seeding') ? 'seeding' : 'queued');
        const classB = $(b).hasClass('active-download') ? 'active-download' : ($(b).hasClass('seeding') ? 'seeding' : 'queued');
        
        if (order[classA] !== order[classB]) return order[classA] - order[classB];
        if (classA === 'active-download') {
            const remA = parseInt($(a).attr('data-remaining-sec')) || 0;
            const remB = parseInt($(b).attr('data-remaining-sec')) || 0;
            return remA - remB;
        }
        return 0;
    });
    $.each(items, function(i, li) { container.append(li); });
};

window.manageWorkflow = function() {
    if (!window.CONFIG.IS_CALIBRATED) return;
    
    const totalPresent = $('.torrent-item').length;
    if (totalPresent === 0 && window.blacklistedDistros.length === 0) {
        for (let i = 0; i < window.CONFIG.FILL_LIMIT; i++) {
            window.addNewTorrent(null, false);
        }
    }
    
    const activeCount = $('.active-download').length;
    if (activeCount < window.CONFIG.MAX_ACTIVE) {
        $('.torrent-item.queued').slice(0, window.CONFIG.MAX_ACTIVE - activeCount).each(function() { window.startAnimation($(this).attr('id')); });
    }
    window.sortTorrents();
    window.updateStats();
};

window.addNewTorrent = function(customName = null, triggerWorkflow = true, fixedSize = null, isManual = false) {
    let fullName = customName;
    const existingNames = $('.file-name').map(function() { return $(this).attr('title'); }).get();

    if (!fullName) {
        const availableDistros = distros.filter(d => 
            !existingNames.some(existing => existing.startsWith(d.replace('.iso', ''))) && 
            !window.blacklistedDistros.includes(d)
        );
        
        if (availableDistros.length > 0) {
            fullName = availableDistros[Math.floor(Math.random() * availableDistros.length)];
        } else {
            return; 
        }
    }

    let baseName, extension;
    const lastDotIndex = fullName.lastIndexOf('.');
    if (lastDotIndex > 0 && fullName.length - lastDotIndex <= 5) {
        baseName = fullName.substring(0, lastDotIndex);
        extension = fullName.substring(lastDotIndex);
    } else {
        baseName = fullName;
        extension = "";
    }

    let finalFullName;
    // La numerazione progressiva scatta solo se il file è già stato visto nel seeding
    if (!isManual && window.historyCounters[baseName] !== undefined) {
        window.historyCounters[baseName]++;
        finalFullName = `${baseName} (${window.historyCounters[baseName]})${extension}`;
    } else {
        finalFullName = baseName + extension;
    }

    const splitIndex = Math.max(0, finalFullName.length - 10);
    const part1 = finalFullName.substring(0, splitIndex);
    const part2 = finalFullName.substring(splitIndex);

    const id = 'tr-' + Math.random().toString(36).substr(2, 7);
    const sizeGB = fixedSize ? fixedSize : (Math.random() * (window.CONFIG.MAX_SIZE_GB - window.CONFIG.MIN_SIZE_GB) + window.CONFIG.MIN_SIZE_GB).toFixed(2);
    
    const html = `
        <div class="torrent-item queued" id="${id}" data-base-name="${fullName}" data-size="${sizeGB}" data-current-speed="0" data-current-up-speed="0" data-downloaded-gb="0" data-sent-gb="0" data-remaining-sec="999999">
            <div class="file-info">
                <div class="name-box">
                    <div class="file-name" title="${finalFullName}">
                        <span class="name-part-1">${part1}</span>
                        <span class="name-part-2">${part2}</span>
                    </div>
                    <div class="move-controls">
                        <button class="btn-up" onclick="window.moveTorrent(this, 'up')">▲</button>
                        <button class="btn-down" onclick="window.moveTorrent(this, 'down')">▼</button>
                        <button class="btn-remove" onclick="window.removeTorrent(this)">✕</button>
                    </div>
                </div>
                <span class="file-size">${sizeGB} GB</span>
            </div>
            <div class="progress-section">
                <div class="progress-container"><div class="progress-bar"></div><div class="progress-text">In attesa...</div></div>
                <div class="timer-row">
                    <span class="elapsed">Passato: 0s</span>
                    <span class="remaining"><span class="desktop-label">Rimanente: </span><span class="mobile-label">ETA: </span><span class="time-value">--</span></span>
                    <span class="speed-info">0.0 MB/s</span>
                </div>
            </div>
        </div>`;

    if (isManual) {
        const lastActive = $('.active-download').last();
        if (lastActive.length) {
            $(html).insertAfter(lastActive);
        } else {
            $('#torrent-list').prepend(html);
        }
    } else {
        $('#torrent-list').append(html);
    }

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
        
        $item.attr('data-current-speed', currentSpeed)
             .attr('data-current-up-speed', currentUpSpeed)
             .attr('data-downloaded-gb', (downloadedMB / 1024).toFixed(4))
             .attr('data-sent-gb', (sentMB / 1024).toFixed(4))
             .attr('data-remaining-sec', remainingSec);
        
        if (percent >= 100) {
            clearInterval(interval);
            window.totalFilesCompleted++;
            window.historicalDataGB = (parseFloat(window.historicalDataGB) || 0) + sizeGB;
            window.historicalSentGB = (parseFloat(window.historicalSentGB) || 0) + (sentMB / 1024);
            
            $item.removeClass('active-download').addClass('seeding');
            const seedingStartTime = Date.now();
            const originalFullName = $item.attr('data-base-name');
            const originalSize = $item.attr('data-size');
            
            const lastDot = originalFullName.lastIndexOf('.');
            const base = lastDot > 0 ? originalFullName.substring(0, lastDot) : originalFullName;
            if (window.historyCounters[base] === undefined) {
                window.historyCounters[base] = 0;
            }

            $item.find('.progress-bar').css('width', '100%');
            $item.find('.progress-text').text('100%');
            $item.find('.desktop-label').text('Completato');
            $item.find('.mobile-label').text('Fine');
            $item.find('.time-value').text('');
            
            window.sortTorrents();
            window.manageWorkflow();
            
            let seedSentMB = 0;
            const seedInt = setInterval(() => {
                if (!$item.length || !$item.hasClass('seeding')) { 
                    window.historicalSentGB = (parseFloat(window.historicalSentGB) || 0) + (seedSentMB / 1024);
                    clearInterval(seedInt); 
                    return; 
                }
                const currentTotalUpNodes = $('.seeding').length + $('.active-download').length;
                const sSpeed = ((window.CONFIG.MAX_GLOBAL_UPLOAD_MBPS / currentTotalUpNodes) * (0.8 + Math.random() * 0.4)).toFixed(1);
                seedSentMB += (sSpeed * (window.CONFIG.UPDATE_INTERVAL / 1000));
                
                $item.find('.speed-info').text(sSpeed + ' MB/s');
                $item.find('.elapsed').text('Seed: ' + window.formatTime(Math.floor((Date.now() - seedingStartTime) / 1000)));
            }, window.CONFIG.UPDATE_INTERVAL);
            
            setTimeout(() => { 
                $item.fadeOut(500, function() { 
                    $(this).remove(); 
                    window.addNewTorrent(originalFullName, true, originalSize, false);
                    window.manageWorkflow(); 
                }); 
            }, window.CONFIG.SEEDING_DURATION);
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
