// mostly no variables needed since they are very simply used as buttons


// BLUETOOTH
document.getElementById("tileBarConnectBMS").addEventListener("click", ()=>{
    connectBMS();
});

document.getElementById("tileBarConnectTacho").addEventListener("click", ()=>{
    connectTacho();
});

document.getElementById("tileBarDisconnect").addEventListener("click", ()=>{
    automaticReconnectTacho = false;
    automaticReconnectBMS = false;
    disconnect();
    disconnectInline();
});



// BOARD

document.getElementById("tileBarBoardInfo").addEventListener("click", ()=>{
    //contextBridge.send('read-board-info');
});
document.getElementById("tileBarBoardConfig").addEventListener("click", () => {
    // firstly open the config
    //contextBridge.send('board-config');

    // show alert that config can only be updated in "ready" or "operation" states
    // (open it second, so it appears above the config window)
    if(stateMachineStateBuffer !== 2 && stateMachineStateBuffer !== 4 && bleBMSConnected){
        setTimeout(()=>{
            //contextBridge.send("alert-config-not-editable");
        }, 300);
    }
});
document.getElementById("tileBarBoardCalib").addEventListener("click", () => {
    //contextBridge.send('board-calib');
});
document.getElementById("tileBarTachoConfig").addEventListener("click", () => {
    //contextBridge.send('board-inline-config');
});


let tileBarZoomin = document.getElementById("tileBarZoomIn");
tileBarZoomin.addEventListener("click", () => {
    zoom.to({element: selected_cell, padding: 0, pan: false});
    // "click" onto the same selected cell again to disable the selection
    tableEventListener(selected_cell);
});


// LOGGING

/*
document.getElementById("tileBarSelectDataloggingDirectory").addEventListener("click", () => {
    if (!bleBMSConnected && !bleInlineConnected) {
        //contextBridge.send("no-ble-connection-warning");
        return;
    }

    //contextBridge.send("select-logging-directory");
});

document.getElementById("tileBarStartDatalogging").addEventListener("click", () => {
    if (!bleBMSConnected && !bleInlineConnected) {
        //contextBridge.send("no-ble-connection-warning");
        return;
    }
    dataLoggingEnabled = true;

    document.getElementById("logging-span").classList.add("recording");

    let d = new Date();
    dataLoggingFileName = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() + "--" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds() + "-" + d.getMilliseconds() + ".csv";
});

document.getElementById("tileBarStopDatalogging").addEventListener("click", ()=>{
    dataLoggingEnabled = false;

    document.getElementById("logging-span").classList.remove("recording");
});



// ABOUT

document.getElementById("tileBarAbout").addEventListener("click", ()=>{
});

*/


// DARKMODE

document.getElementById("tileBarDarkmode").addEventListener("click", ()=>{
    toggleDarkmode();
});







// Chrome detection and Warning the user as BLE probably isn't available

if(!isChrome){
    table.classList.add("hidden");
    nothingConnectedOverlay.classList.add("hidden");
    settingsSwipeContainer.classList.add("hidden");
    getId("tilebar").classList.add("disabled");
    alert("This site is tailored around Progressive Wep App services that are only supported in full by Chrome.\nPlease open this site in Chrome only as we can't ensure functionality otherwise ;)");
}