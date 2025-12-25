window.updateStats = function() {
    if (!window.CONFIG || !window.CONFIG.IS_CALIBRATED) return;

    const activeOnes = $('.active-download');
    const seedingOnes = $('.seeding');
    const totalItems = $('.torrent-item').length;
    
    let totalDownSpeed = 0;
    let totalUpSpeed = 0;
    let currentLiveDownloadedGB = 0;
    let currentLiveSentGB = 0;

    activeOnes.each(function() {
        totalDownSpeed += parseFloat($(this).attr('data-current-speed')) || 0;
        totalUpSpeed += parseFloat($(this).attr('data-current-up-speed')) || 0;
        currentLiveDownloadedGB += parseFloat($(this).attr('data-downloaded-gb')) || 0;
        currentLiveSentGB += parseFloat($(this).attr('data-sent-gb')) || 0;
    });

    seedingOnes.each(function() {
        totalUpSpeed += parseFloat($(this).attr('data-current-speed')) || 0;
        currentLiveSentGB += parseFloat($(this).attr('data-sent-gb')) || 0;
    });

    $('#count-active').text(activeOnes.length);
    $('#count-queued').text($('.torrent-item.queued').length);
    $('#count-seeding').text(seedingOnes.length);
    $('#count-total').text(totalItems);
    
    const sessionSeconds = Math.floor((Date.now() - window.sessionStartTime) / 1000);
    $('#session-time').text(window.formatTime(sessionSeconds));
    $('#total-completed').text(window.totalFilesCompleted || 0);
    
    const finalData = (parseFloat(window.historicalDataGB) || 0) + currentLiveDownloadedGB;
    $('#total-data').text(window.formatData(finalData));
    
    $('#global-down-speed').text(totalDownSpeed.toFixed(1) + " MB/s");
    $('#global-up-speed').text(totalUpSpeed.toFixed(1) + " MB/s");
    
    const finalSent = (parseFloat(window.historicalSentGB) || 0) + currentLiveSentGB;
    $('#total-sent').text(window.formatData(finalSent));
};

setInterval(() => {
    window.updateStats();
}, 1000);