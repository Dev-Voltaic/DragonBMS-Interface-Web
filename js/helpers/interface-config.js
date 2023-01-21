let interfaceConfig = {};

// adjust the interface according to config values
function updateConfig(){
    const lastColorMode = localStorage.getItem("lastColorMode") || "dark";

    const customColorForeground = localStorage.getItem("customColorForeground") || "#ffffff";
    const customColorBackground = localStorage.getItem("customColorBackground") || "#000000";

    // JSON.parse for string to boolean conversion
    const autoReadBMSConfigCalib = JSON.parse(localStorage.getItem("autoReadBMSConfigCalib") || true);

    // Times for data averaging intervals
    const bmsDataAveragingIntervalU = parseFloat(localStorage.getItem('averagingIntervalU') || "0.25");
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
        colorMode: lastColorMode,

        customColorForeground: customColorForeground,
        customColorBackground: customColorBackground,

        autoReadBMSConfigCalib: autoReadBMSConfigCalib,

        averagingIntervalU: bmsDataAveragingIntervalU,
        averagingIntervalI: bmsDataAveragingIntervalI,
        averagingIntervalT: bmsDataAveragingIntervalT,
        averagingIntervalCalib: bmsDataAveragingIntervalCalib,
        maxAveragingInterval: maxAveragingInterval
    };


    adjustColorMode(lastColorMode);
}


// hack to make color pickers render before filling them with their color
setTimeout(()=>{
    updateConfig();
}, 100);









interfaceBMSAutoReadConfigCalib.addEventListener("change", ()=>{
    localStorage.setItem('autoReadBMSConfigCalib', interfaceBMSAutoReadConfigCalib.checked);

    updateConfig();
});











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

