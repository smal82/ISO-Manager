window.sessionStartTime = Date.now();
window.totalFilesCompleted = 0;
window.historicalDataGB = 0.0;
window.historicalSentGB = 0.0;

const distros = ["ubuntu-24.04.iso", "debian-12.iso", "fedora-40.iso", "arch-2024.iso", "mint-21.iso", "kali-2024.iso", "manjaro.iso", "pop-os.iso", "tails-6.iso", "opensuse.iso", "alma-9.iso", "rocky-9.iso", "gentoo.iso", "slackware.iso", "void.iso", "mx-23.iso", "endeavour.iso", "garuda.iso", "zorin-17.iso", "elementary.iso"];

window.runSpeedtest = function(callback) {
    let progress = 0;
    const testInterval = setInterval(() => {
        progress += 5;
        $('#test-results').text(`Calibrazione: ${progress}%`);
        if (progress >= 100) {
            clearInterval(testInterval);
            window.CONFIG.MAX_GLOBAL_DOWNLOAD_MBPS = parseFloat((Math.random() * (95 - 40) + 40).toFixed(1));
            window.CONFIG.MAX_GLOBAL_UPLOAD_MBPS = parseFloat((window.CONFIG.MAX_GLOBAL_DOWNLOAD_MBPS * 0.2).toFixed(1));
            window.CONFIG.IS_CALIBRATED = true;
            $('#calibration-overlay').fadeOut(500, function() { $(this).remove(); if (callback) callback(); });
        }
    }, 50);
};

window.updateStats = function() {
    const activeOnes = $('.active-download');
    const seedingOnes = $('.seeding');
    const totalItems = $('.torrent-item').length;
    
    let totalDownSpeed = 0, totalUpSpeed = 0, currentLiveDownloadedGB = 0, currentLiveSentGB = 0;

    activeOnes.each(function() {
        totalDownSpeed += parseFloat($(this).attr('data-current-speed') || 0);
        totalUpSpeed += parseFloat($(this).attr('data-current-up-speed') || 0);
        currentLiveDownloadedGB += parseFloat($(this).attr('data-downloaded-gb') || 0);
        currentLiveSentGB += parseFloat($(this).attr('data-sent-gb') || 0);
    });
    seedingOnes.each(function() {
        totalUpSpeed += parseFloat($(this).attr('data-current-speed') || 0);
        currentLiveSentGB += parseFloat($(this).attr('data-sent-gb') || 0);
    });

    // Aggiornamento Riga Stati (4 colonne)
    $('#count-active').text(activeOnes.length);
    $('#count-queued').text($('.torrent-item.queued').length);
    $('#count-seeding').text(seedingOnes.length);
    $('#count-total').text(totalItems);
    
    // Aggiornamento Pannello Storico (3 colonne)
    $('#session-time').text(window.formatTime(Math.floor((Date.now() - window.sessionStartTime) / 1000)));
    $('#total-completed').text(window.totalFilesCompleted);
    $('#total-data').text(window.formatData(window.historicalDataGB + currentLiveDownloadedGB));
    $('#global-down-speed').text(totalDownSpeed.toFixed(1) + " MB/s");
    $('#global-up-speed').text(totalUpSpeed.toFixed(1) + " MB/s");
    $('#total-sent').text(window.formatData(window.historicalSentGB + currentLiveSentGB));
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
    window.updateStats();
};

window.addNewTorrent = function(customName = null, triggerWorkflow = true) {
    let name = customName;
    if (!name) {
        const existingNames = $('.file-name').map(function() { return $(this).text(); }).get();
        const availableNames = distros.filter(d => !existingNames.includes(d));
        name = availableNames.length > 0 ? availableNames[Math.floor(Math.random() * availableNames.length)] : "iso-" + Math.random().toString(36).substr(2, 5).toUpperCase() + ".iso";
    }
    const id = 'tr-' + Math.random().toString(36).substr(2, 7);
    const sizeGB = (Math.random() * (window.CONFIG.MAX_SIZE_GB - window.CONFIG.MIN_SIZE_GB) + window.CONFIG.MIN_SIZE_GB).toFixed(2);
    
    const html = `
        <div class="torrent-item queued" id="${id}" data-size="${sizeGB}" data-current-speed="0" data-current-up-speed="0" data-downloaded-gb="0" data-sent-gb="0" data-remaining="999999">
            <div class="file-info"><span class="file-name">${name}</span><span class="file-size">${sizeGB} GB</span></div>
            <div class="progress-section">
                <div class="progress-container"><div class="progress-bar"></div><div class="progress-text">In attesa...</div></div>
                <div class="timer-row">
                    <span class="elapsed">Passato: 0s</span>
                    <span class="remaining">
                        <span class="desktop-label">Rimanente: </span>
                        <span class="mobile-label">ETA: </span>
                        <span class="time-value">--</span>
                    </span>
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
    const torrentStartTime = Date.now();
    const sizeGB = parseFloat($item.attr('data-size')), totalMB = sizeGB * 1024;
    let downloadedMB = 0, sentMB = 0;

    const interval = setInterval(() => {
        if (!$item.length || $item.parent().length === 0 || $item.hasClass('seeding')) { clearInterval(interval); return; }

        const activeCount = $('.active-download').length;
        const totalUpNodes = activeCount + $('.seeding').length;

        const currentSpeed = ((window.CONFIG.MAX_GLOBAL_DOWNLOAD_MBPS / activeCount) * (0.9 + Math.random() * 0.2)).toFixed(1);
        const currentUpSpeed = totalUpNodes > 0 ? ((window.CONFIG.MAX_GLOBAL_UPLOAD_MBPS / totalUpNodes) * (0.6 + Math.random() * 0.4)).toFixed(1) : 0;

        downloadedMB += (currentSpeed * (window.CONFIG.UPDATE_INTERVAL / 1000));
        sentMB += (currentUpSpeed * (window.CONFIG.UPDATE_INTERVAL / 1000));
        let percent = (downloadedMB / totalMB) * 100;
        const remaining = currentSpeed > 0 ? Math.round((totalMB - downloadedMB) / currentSpeed) : 999999;
        
        $item.attr('data-current-speed', currentSpeed).attr('data-current-up-speed', currentUpSpeed).attr('data-downloaded-gb', (downloadedMB / 1024).toFixed(4)).attr('data-sent-gb', (sentMB / 1024).toFixed(4)).attr('data-remaining', remaining);
        
        if (percent >= 100) {
            clearInterval(interval);
            window.totalFilesCompleted++;
            window.historicalDataGB += sizeGB;
            window.historicalSentGB += (sentMB / 1024);
            $item.removeClass('active-download').addClass('seeding').data('seeding-start', Date.now());
            $item.find('.progress-bar').css('width', '100%');
            $item.find('.progress-text').text('100%');
            
            // Gestione etichette a fine download
            $item.find('.time-value').text('');
            $item.find('.desktop-label').text('Finito');
            $item.find('.mobile-label').text('Fine');
            
            window.manageWorkflow();
            
            let seedSentMB = 0;
            const seedInt = setInterval(() => {
                if (!$item.length || $item.parent().length === 0) { window.historicalSentGB += (seedSentMB / 1024); clearInterval(seedInt); return; }
                const currentTotalUpNodes = $('.seeding').length + $('.active-download').length;
                const sSpeed = currentTotalUpNodes > 0 ? ((window.CONFIG.MAX_GLOBAL_UPLOAD_MBPS / currentTotalUpNodes) * (0.8 + Math.random() * 0.4)).toFixed(1) : 0;
                seedSentMB += (sSpeed * (window.CONFIG.UPDATE_INTERVAL / 1000));
                $item.attr('data-current-speed', sSpeed).attr('data-sent-gb', (seedSentMB / 1024).toFixed(4));
                $item.find('.speed-info').text(sSpeed + ' MB/s');
                $item.find('.elapsed').text('Seed da: ' + window.formatTime(Math.floor((Date.now() - $item.data('seeding-start')) / 1000)));
            }, window.CONFIG.UPDATE_INTERVAL);
            setTimeout(() => { $item.fadeOut(500, function() { $(this).remove(); window.manageWorkflow(); }); }, window.CONFIG.SEEDING_DURATION);
        } else {
            $item.find('.progress-bar').css('width', percent + '%');
            $item.find('.progress-text').text(Math.floor(percent) + '%');
            $item.find('.speed-info').text(currentSpeed + ' MB/s');
            $item.find('.elapsed').text('Passato: ' + window.formatTime(Math.floor((Date.now() - torrentStartTime) / 1000)));
            $item.find('.time-value').text(window.formatTime(remaining));
        }
    }, window.CONFIG.UPDATE_INTERVAL);
};