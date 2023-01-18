let interfaceConfig = {};

// adjust the interface according to config values
function updateConfig(){
    const lastDarkMode = localStorage.getItem("lastDarkmode") || "";

    if(lastDarkMode === "light"){
        adjustDarkmode(false); // for light mode
        dark_mode = false;
    }

    // actually unnecessary since it's dark by default
    if(lastDarkMode === "dark"){
        adjustDarkmode(true); // for light mode
        dark_mode = true;
    }

    // Times for data averaging intervals
    const bmsDataAveragingIntervalU = parseFloat(localStorage.getItem("averagingIntervalU") || "0.25");
    const bmsDataAveragingIntervalI = parseFloat(localStorage.getItem("averagingIntervalU") || "0.3");
    const bmsDataAveragingIntervalT = parseFloat(localStorage.getItem("averagingIntervalU") || "0.6");
    const bmsDataAveragingIntervalCalib = parseFloat(localStorage.getItem("averagingIntervalU") || "0.5");

    const maxAveragingInterval = Math.max(
        bmsDataAveragingIntervalU,
        bmsDataAveragingIntervalI,
        bmsDataAveragingIntervalT,
        bmsDataAveragingIntervalCalib
        );

    interfaceConfig = {
        darkMode: lastDarkMode,
        averagingIntervalU: bmsDataAveragingIntervalU,
        averagingIntervalI: bmsDataAveragingIntervalI,
        averagingIntervalT: bmsDataAveragingIntervalT,
        averagingIntervalCalib: bmsDataAveragingIntervalCalib,
        maxAveragingInterval: maxAveragingInterval
    };
}


updateConfig();








/** Default configuration **/

Coloris({
    theme: 'polaroid',
});


/** Default configuration **/

Coloris({
    el: '.coloris',
    swatches: [
        '#264653',
        '#2a9d8f',
        '#e9c46a',
        '#f4a261',
        '#e76f51',
        '#d62828',
        '#023e8a',
        '#0077b6',
        '#0096c7',
        '#00b4d8',
        '#48cae4'
    ]
});

Coloris.setInstance('.foreground-color', {
    theme: 'polaroid'
});
Coloris.setInstance('.background-color', {
    theme: 'polaroid'
});

