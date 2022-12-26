if (navigator.serviceWorker) {
    navigator.serviceWorker.register (
        '/DragonBMS-Interface-Web/js/serviceworker/serviceworker.js',
        {scope: '/DragonBMS-Interface-Web/'}
    )
}