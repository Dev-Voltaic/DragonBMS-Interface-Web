if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/DragonBMS-Interface-Web/serviceworker.js');
    });
}