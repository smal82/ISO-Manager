$(document).ready(function() {
    window.sessionStartTime = Date.now();
    window.historicalDataGB = 0;
    window.historicalSentGB = 0;
    window.totalFilesCompleted = 0;
    
    window.detectNetworkAndCalibrate(function() {
        window.manageWorkflow();
    });

    $('#toggle-mode').on('click', function() {
        window.toggleInputMode();
    });

    $('#add-magnet').on('click', function() {
        window.processInput();
    });

    // Delegazione evento per il tasto Invio (perché il campo cambia tra input e textarea)
    $(document).on('keypress', '#magnet-field', function(e) {
        if (e.which === 13 && !window.isMultipleMode) {
            window.processInput();
        }
    });

    $('#theme-toggle').on('click', function() {
        const body = $('body');
        const isDark = body.attr('data-theme') === 'dark';
        body.attr('data-theme', isDark ? 'light' : 'dark');
        $(this).text(isDark ? '🌙 Dark Mode' : '☀️ Light Mode');
    });
});