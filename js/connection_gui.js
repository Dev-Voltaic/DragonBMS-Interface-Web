
// needed for queuing
let searchingForBMS = false;
let searchingForTacho = false;


// handler for the Nothing Connected overlay - Autoconnect bms
connectLastDeviceButton.addEventListener('click', async () => {
    if (!searchingForTacho) {
        searchingForBMS = true;
    } else {
        setAucotonnectBMSTextNoAutoconnect("Queued");
        await until(_ => searchingForTacho === false);
    }

    document.getElementById("inline-gauge").classList.add("inline-gauge-disabled");

    disconnect();
    connectBMS();

    let bleBMSTimeout = false;

    // timeout
    setTimeout(() => {
        bleBMSTimeout = true;
        searchingForBMS = false;
    }, 5000);
});

// handler for the nothing connected overlay - Autoconnect tacho
connectLastInlineButton.addEventListener('click', async () => {

    if (!searchingForBMS) {
        searchingForTacho = true;
    } else {
        setAucotonnectTachoTextNoAutoconnect("Queued");
        await until(_ => searchingForBMS === false);
    }

    disconnectInline();

    connectTacho();


    let bleInlineTimeout = false;

    // timeout
    setTimeout(() => {
        bleInlineTimeout = true;
        searchingForTacho = false;
    }, 5000);
});
















/*
    MANY FUNCTIONS FOR CONNECTION GUI
 */


function inlineConnected() {
    inlineGaugeDiv.classList.remove("inline-gauge-disabled");
    connectLastInlineOverlay.classList.add("hidden");

    /*
        if (!bleBMSConnected) {
            zoom.to({element: inlineGaugeTd, padding: 0, pan: false});
        }
        */
}

function inlineDisconnected(){
    inlineGaugeDiv.classList.add("inline-gauge-disabled");
    connectLastInlineOverlay.classList.remove("hidden");
}

inlineDisconnected();






function resetAutoconnectBMS(){
    autoConnectBMSError();

    setTimeout(()=>{
        autoconnectBMSText.innerHTML = "Connect</br>BMS";
        autoconnectBMSText.style.color = "";
    }, 1000);
}


function setAutoconnectBMSText(text) {
    autoconnectingBMSText.style.position = "inherit";
    autoconnectingBMSText.style.visibility = "visible";

    autoconnectBMSText.innerHTML = text;
}

function setAucotonnectBMSTextNoAutoconnect(text) {
    autoconnectBMSText.innerHTML = text;
}

function autoConnectBMSError() {
    autoconnectingBMSText.style.visibility = "";
    autoconnectingBMSText.style.position = "";
    autoconnectBMSText.innerHTML = "Didn't</br>work";
    autoconnectBMSText.style.color = "red";
}

function resetAutoconnectBMSSilent() {
    setTimeout(() => {
        autoconnectingBMSText.style.visibility = "";
        autoconnectingBMSText.style.position = "";
        autoconnectBMSText.innerHTML = "Connect</br>BMS";
        autoconnectBMSText.style.color = "";
    }, 1000);
}

function resetAutoconnectBMSSilentInstant() {
    autoconnectingBMSText.style.visibility = "";
    autoconnectingBMSText.style.position = "";
    autoconnectBMSText.innerHTML = "Connect</br>BMS";
    autoconnectBMSText.style.color = "";
}


function resetAutoconnectTacho() {
    autoconnectTachoError();

    setTimeout(() => {
        autoconnectTachoText.innerHTML = "Connect</br>Tacho";
        autoconnectTachoText.style.color = "";
    }, 1000);
}

function resetAutoconnectTachoSilent() {
    setTimeout(() => {
        autoconnectingBMSText.style.visibility = "";
        autoconnectingBMSText.style.position = "";
        autoconnectTachoText.innerHTML = "Connect</br>Tacho";
        autoconnectTachoText.style.color = "";
    }, 1000);
}

function resetAutoconnectTachoSilentInstant() {

    autoconnectingTachoText.style.visibility = "";
    autoconnectingTachoText.style.position = "";
    autoconnectTachoText.innerHTML = "Connect</br>Tacho";
    autoconnectTachoText.style.color = "";
}

function autoconnectTachoError() {
    autoconnectingTachoText.style.visibility = "";
    autoconnectingTachoText.style.position = "";
    autoconnectTachoText.innerHTML = "Didn't</br>work";
    autoconnectTachoText.style.color = "red";
}

function setAutoconnectTachoText(text) {
    autoconnectingTachoText.style.position = "inherit";
    autoconnectingTachoText.style.visibility = "visible";

    autoconnectTachoText.innerHTML = text;
}

function setAucotonnectTachoTextNoAutoconnect(text) {
    autoconnectTachoText.innerHTML = text;
}


function nothingConnectedOverlayTimeout() {
    let autoconnectContainer = document.getElementById("autoConnectContainer");
    autoconnectContainer.style.pointerEvents = "none";
    autoconnectContainer.style.filter = "grayscale(100%)";
    autoconnectContainer.style.opacity = "0.7";
    setTimeout(() => {
        autoconnectContainer.style.pointerEvents = "";
        autoconnectContainer.style.filter = "";
        autoconnectContainer.style.opacity = "";
    }, 4000);
}


connectLastInlineOverlay.addEventListener("click", () => {
    connectTacho();
    connectLastInlineOverlay.innerHTML = "<h2>Connecting..</h2>";
});



// for making the autoconnect do the "typing..."
let dotsCounter = 0;
function dotterBodge() {
    dotsCounter += 1;
    dotsCounter %= 5;
    autoconnectingBMSText.innerHTML = "Auto-connecting";
    autoconnectingTachoText.innerHTML = "Auto-connecting";
    for (let i = 0; i < dotsCounter; i++) {
        autoconnectingBMSText.innerHTML += '.';
        autoconnectingTachoText.innerHTML += '.';
    }
    setTimeout(dotterBodge, 200);
}
dotterBodge();


function disableNothingConnectedOverlay() {
    nothingConnectedOverlay.style.pointerEvents = "none";
    nothingConnectedOverlay.style.visibility = "hidden";

    // always hiding "Auto-connecting..." text when disabling the overlay
    autoconnectingTachoText.style.visibility = "";
    autoconnectingBMSText.style.visibility = "";
}

function enableNothingConnectedOverlay() {
    nothingConnectedOverlay.style.pointerEvents = "";
    nothingConnectedOverlay.style.visibility = "";
}


/// RESET FUNCTION FOR ABSOLUTELY EVERYTHING -
/// WHEN EITHER ONE LOOSES CONNECTION OR GETS DISCONNECTED


function resetInlineValues() {
    bleInlineDataPacket = [];

    dataLoggingBufferInline = [];
    inlineDataloggingAveragingBuffer = [];

    // reset range calculation stuff
    drivenDistanceOffset = -1;

    maxInlineValueBuffer = [];
}

function resetBMSValues() {
    remainingEnergy1 = 0;
    remainingEnergy2 = 0;
    remainingEnergy3 = 0;

    usedEnergy1 = 0;
    usedEnergy2 = 0;
    usedEnergy3 = 0;

    alertBuffer = 0;
    warningBuffer = 0;

    dataLoggingBufferBMS = [];

    averagingBuffer = [];
    averagingBufferV = [];
    averagingBufferA = [];
    averagingBufferT = [];
    maxValueBuffer = [];
}