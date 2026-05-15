(function () {
    var el = document.getElementById('clock');
    function tick() {
        var now = new Date();
        el.textContent =
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0');
    }
    tick();
    setInterval(tick, 1000);
}());
