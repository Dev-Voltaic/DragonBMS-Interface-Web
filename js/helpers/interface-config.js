let interfaceConfig = {};

// adjust the interface according to config values
function updateConfig(){
    const filterBMSConnection = JSON.parse(localStorage.getItem("filterBMSConnection") || false);

    const lastColorMode = localStorage.getItem("lastColorMode") || "dark";

    const customColorForeground = localStorage.getItem("customColorForeground") || "#ffffff";
    const customColorBackground = localStorage.getItem("customColorBackground") || "#000000";

    // JSON.parse for string to boolean conversion
    const autoReadBMSConfigCalib = JSON.parse(localStorage.getItem("autoReadBMSConfigCalib") || true);

    const devTileActive = JSON.parse(localStorage.getItem("devTileActive") || true);

    // Times for data averaging intervals
    const bmsDataAveragingIntervalU = parseFloat(localStorage.getItem('averagingIntervalU') || "0.25");
    const bmsDataAveragingIntervalI = parseFloat(localStorage.getItem("averagingIntervalI") || "0.3");
    const bmsDataAveragingIntervalT = parseFloat(localStorage.getItem("averagingIntervalT") || "0.6");
    const bmsDataAveragingIntervalCalib = parseFloat(localStorage.getItem("averagingIntervalCalib") || "0.5");

    const maxAveragingInterval = Math.max(
        bmsDataAveragingIntervalU,
        bmsDataAveragingIntervalI,
        bmsDataAveragingIntervalT,
        bmsDataAveragingIntervalCalib
        );

    interfaceConfig = {
        filterBMSConnection: filterBMSConnection,

        colorMode: lastColorMode,

        customColorForeground: customColorForeground,
        customColorBackground: customColorBackground,

        autoReadBMSConfigCalib: autoReadBMSConfigCalib,
        devTileActive: devTileActive,

        averagingIntervalU: bmsDataAveragingIntervalU,
        averagingIntervalI: bmsDataAveragingIntervalI,
        averagingIntervalT: bmsDataAveragingIntervalT,
        averagingIntervalCalib: bmsDataAveragingIntervalCalib,
        maxAveragingInterval: maxAveragingInterval
    };
}


// hack to make color pickers render before filling them with their color
setTimeout(()=>{
    // get config values from localStorage
    updateConfig();
    // write values from localStorage into the input fields
    setInterfaceConfigValues();
}, 100);





function setInterfaceConfigValues(){
    adjustColorMode(interfaceConfig.colorMode);

    interfaceBMSAutoReadConfigCalib.checked = interfaceConfig.autoReadBMSConfigCalib;

    interfaceAveragingTimeU.value = interfaceConfig.averagingIntervalU;
    interfaceAveragingTimeI.value = interfaceConfig.averagingIntervalI;
    interfaceAveragingTimeT.value = interfaceConfig.averagingIntervalT;
    interfaceAveragingTimeCalib.value = interfaceConfig.averagingIntervalCalib;

    interfaceBMSFilterConnection.checked = interfaceConfig.filterBMSConnection;

    interfaceDevTileActive.checked = interfaceConfig.devTileActive;
}


interfaceBMSFilterConnection.addEventListener("change", ()=>{
    localStorage.setItem('filterBMSConnection', interfaceBMSFilterConnection.checked);

    updateConfig();
});


interfaceBMSAutoReadConfigCalib.addEventListener("change", ()=>{
    localStorage.setItem('autoReadBMSConfigCalib', interfaceBMSAutoReadConfigCalib.checked);

    updateConfig();
});

interfaceAveragingTimeU.addEventListener("change", ()=>{
    localStorage.setItem('averagingIntervalU', String(parseFloat(interfaceAveragingTimeU.value)));
    updateConfig();
});
interfaceAveragingTimeI.addEventListener("change", ()=>{
    localStorage.setItem('averagingIntervalI', String(parseFloat(interfaceAveragingTimeI.value)));
    updateConfig();
});
interfaceAveragingTimeT.addEventListener("change", ()=>{
    localStorage.setItem('averagingIntervalT', String(parseFloat(interfaceAveragingTimeT.value)));
    updateConfig();
});
interfaceAveragingTimeCalib.addEventListener("change", ()=>{
    localStorage.setItem('averagingIntervalCalib', String(parseFloat(interfaceAveragingTimeCalib.value)));
    updateConfig();
});












// Color Picker configuration (don't touch xD)

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

