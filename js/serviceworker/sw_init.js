if (navigator.serviceWorker) {
    navigator.serviceWorker.register (
        '/DragonBMS-Interface-Web/serviceworker.js',
        {scope: '/DragonBMS-Interface-Web/'}
    )
}