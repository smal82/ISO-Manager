window.formatTime = function(seconds) {
    if (isNaN(seconds) || seconds === Infinity || seconds < 0) return "--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
        return `${h}h ${m}m ${s}s`;
    } else if (m > 0) {
        return `${m}m ${s}s`;
    }
    return `${s}s`;
};

window.formatData = function(gb) {
    if (isNaN(gb) || gb === null) return "0.00 GB";
    if (gb >= 1024) return (gb / 1024).toFixed(2) + " TB";
    return parseFloat(gb).toFixed(2) + " GB";
};