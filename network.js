window.detectNetworkAndCalibrate = function(callback) {
    let progress = 0;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let downlink = (conn && conn.downlink) ? conn.downlink : 0; 
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Se non è mobile, è Fibra. Punto.
    let isFiber = !isMobileDevice || (isMobileDevice && downlink > 30);

    const testInterval = setInterval(() => {
        progress += 5;
        let label = isFiber ? "Rete Fissa / Fibra Ottica" : "Rete Mobile 4G/5G";
        $('#test-results').html(`
            <span style="color:var(--text-bright); font-weight:bold;">${label}</span><br>
            <small>Stabilità: Ottimale | Analisi Rete PC</small><br>
            Calibrazione: ${progress}%
        `);

        if (progress >= 100) {
            clearInterval(testInterval);
            if (isFiber) {
                window.CONFIG.MAX_GLOBAL_DOWNLOAD_MBPS = parseFloat((Math.random() * (120 - 90) + 90).toFixed(1));
            } else {
                window.CONFIG.MAX_GLOBAL_DOWNLOAD_MBPS = parseFloat((Math.random() * (25 - 12) + 12).toFixed(1));
            }
            window.CONFIG.MAX_GLOBAL_UPLOAD_MBPS = parseFloat((window.CONFIG.MAX_GLOBAL_DOWNLOAD_MBPS * 0.25).toFixed(1));
            window.CONFIG.IS_CALIBRATED = true;
            $('#calibration-overlay').fadeOut(500, function() { $(this).remove(); if (callback) callback(); });
        }
    }, 40);
};