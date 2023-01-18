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
    if(boardInfoContainer.classList.contains("hidden")){
        boardInfoContainer.classList.remove("hidden");
        scrollToElement(boardInfoContainer);
    }else{
        boardInfoContainer.classList.add("hidden");

        scrollToElement(table);
    }
});
document.getElementById("tileBarBoardConfig").addEventListener("click", () => {
    if(settingsContainer.classList.contains("hidden")){
        settingsContainer.classList.remove("hidden");
        visualiseSettingsAvailable();
    }
    scrollToElement(boardConfigContainer);

    // normally there would be an else add hidden to the class list
    // here, there is not, because there is a separate "hide settings" option
});
document.getElementById("tileBarBoardCalib").addEventListener("click", () => {
    if(settingsContainer.classList.contains("hidden")){
        settingsContainer.classList.remove("hidden");
        visualiseSettingsAvailable();
    }
    scrollToElement(boardCalibContainer);
});
document.getElementById("tileBarTachoConfig").addEventListener("click", () => {
    if(settingsContainer.classList.contains("hidden")){
        settingsContainer.classList.remove("hidden");
        visualiseSettingsAvailable();
    }
    scrollToElement(inlineConfigContainer);
});


let tileBarZoomIn = document.getElementById("tileBarZoomIn");
tileBarZoomIn.addEventListener("click", () => {
    zoom.to({element: selected_cell, padding: 0, pan: false});
    // "click" onto the same selected cell again to disable the selection
    tableEventListener(selected_cell);
    /// yet re-enable the "Zoom IN/Out" button
    tileBarZoomIn.classList.remove("hidden");
})

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

*/

// ABOUT (INTERFACE INFO)

// toggle about window
document.getElementById("tileBarAbout").addEventListener("click", ()=>{
    // copy version number from tilebar into about interface
    getId("version-number-2").innerHTML = getId("version-number").innerHTML;

    if(interfaceInfoContainer.classList.contains("hidden")){
        interfaceInfoContainer.classList.remove("hidden");
        interfaceInfoContainer.scrollIntoView();
    }else{
        interfaceInfoContainer.classList.add("hidden");
        table.scrollIntoView();
    }
});




// DARKMODE

document.getElementById("tileBarDarkmode").addEventListener("click", ()=>{
    toggleColorMode();
});







// Chrome detection and Warning the user as BLE probably isn't available

if(!isChrome){
    table.classList.add("hidden");
    nothingConnectedOverlay.classList.add("hidden");
    settingsSwipeContainer.classList.add("hidden");
    tilebar.classList.add("disabled");
    alert("This site is tailored around Progressive Wep App services that are only supported in full by Chrome.\nPlease open this site in Chrome only as we can't ensure functionality otherwise ;)");
}