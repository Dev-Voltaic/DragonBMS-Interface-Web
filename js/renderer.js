// needed for queuing
let searchingForBMS = false;
let searchingForTacho = false;

// helper function for waiting until a condition is met
function until(conditionFunction) {

    const poll = resolve => {
        if (conditionFunction()) resolve();
        else setTimeout(_ => poll(resolve), 100);
    }

    return new Promise(poll);
}

// handler for the Nothing connected overlay - autoconnect bms
connectLastDeviceButton.addEventListener('click', async () => {
    if (!searchingForTacho) {
        searchingForBMS = true;
    } else {
        setAucotonnectBMSTextNoAutoconnect("Queued");
        await until(_ => searchingForTacho === false);
    }

    document.getElementById("inline-gauge").classList.add("inline-gauge-disabled");
    connectBMS();

    let bleBMSTimeout = false;

    // timeout
    setTimeout(() => {
        bleBMSTimeout = true;
        searchingForBMS = false;
    }, 5000);
});

// handler for the nothing connected overlay - autoconnect tacho
connectLastInlineButton.addEventListener('click', async () => {

    if (!searchingForBMS) {
        searchingForTacho = true;
    } else {
        setAucotonnectTachoTextNoAutoconnect("Queued");
        await until(_ => searchingForBMS === false);
    }

    connectTacho();


    let bleInlineTimeout = false;

    // timeout
    setTimeout(() => {
        bleInlineTimeout = true;
        searchingForTacho = false;
    }, 5000);
});




/*
MOVED CONFIG STUFF HERE
 */








function updateMainProcessConfig(){
    // get last value or send empty string if none is stored
    let lastBmsId = localStorage.getItem("lastBmsId") || "";
    let lastTachoId = localStorage.getItem("lastTachoId") || "";

    let config = {};
    config.lastBmsId = lastBmsId;
    config.lastTachoId = lastTachoId;
}
// give the config values to the main process upon initialisation
updateMainProcessConfig();

// adjust the main window according to config values
function updateConfig(){
    let lastDarkmode = localStorage.getItem("lastDarkmode") || "";

    if(lastDarkmode === "light"){
        adjustDarkmode(false); // for light mode
        darkMode = false;
    }

    // actually unnecessary since it's dark by default
    if(lastDarkmode === "dark"){
        adjustDarkmode(true); // for light mode
        darkMode = true;
    }
}
updateConfig();