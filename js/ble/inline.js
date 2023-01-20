const inlineDataLoggingServiceUuid = "ffd70200-fe1b-4b6d-aba1-36cc0bab3e3d";
    const inlineDataLoggingCharacteristicUuid= "ffd70201-fe1b-4b6d-aba1-36cc0bab3e3d";
let inlineDataLoggingCharacteristic;

const inlineConfigServiceUuid = "ffd70100-fe1b-4b6d-aba1-36cc0bab3e3d";
const inlineConfigCharacteristicUuid = "ffd70101-fe1b-4b6d-aba1-36cc0bab3e3d";
let inlineConfigCharacteristic;
const inlineOdometerCharacteristicUuid = "ffd70102-fe1b-4b6d-aba1-36cc0bab3e3d";
let inlineOdometerCharacteristic;

let bleInlineConnected = false;
let bleInlineDevice;

let bleInlineTimeout = false;

let automaticReconnectTacho = false;


function connectTacho() {
    setAutoconnectTachoText("Searching");

    navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
            inlineDataLoggingServiceUuid,
            inlineConfigServiceUuid,
        ]
        // disabled filters due to reliability problems
        /*,
        filters: [{
            inlineConfigServiceUuid
        }]*/
    }).then((device) => {
        searchingForTacho = false;
        setAutoconnectTachoText("Found Device");
        startInlineNotifications(device);

        connectLastInlineOverlay.innerHTML = "<h2>Connect Tacho</h2>";
    }).catch(error => {
        console.log('User most likely cancelled! ' + error);

        connectLastInlineOverlay.innerHTML = "<h2>Connect Tacho</h2>";

        searchingForTacho = false;

        if (bleInlineTimeout) {
            resetAutoconnectTacho();
        } else {
            autoconnectTachoError();
            setTimeout(() => {
                setAucotonnectTachoTextNoAutoconnect("Bluetooth enabled?");
                setTimeout(() => {
                    resetAutoconnectTachoSilent();
                }, 1000);
            })
        }
    });
}


async function startInlineNotifications(device) {
    bleInlineDevice = device;

    device.addEventListener('gattserverdisconnected', ()=> {
        bleInlineConnected = false;


        if (!bleBMSConnected) {
            zoom.out({element: selected_cell, padding: 0, pan: false});
            enableNothingConnectedOverlay();

            //nothingConnectedOverlayTimeout();

            inlineDisconnected();
            resetAutoconnectTachoSilentInstant();

            resetInlineValues();
        } else {
            inlineDisconnected();
            resetAutoconnectTacho();

            resetInlineValues();
        }

        if(automaticReconnectTacho){
            console.log("starting auto reconnect tacho");
            device.gatt.connect().then(server => {
                inlineDeviceConnected(server);
            });
        }
    });

    setAutoconnectTachoText("Connecting Device");
    device.gatt.connect().then(server => {
        inlineDeviceConnected(server);
    });
}

async function inlineDeviceConnected(server){
    server.connect();

    setAutoconnectTachoText("Getting Services");


    server.getPrimaryService(inlineConfigServiceUuid).then((service)=>{
        service.getCharacteristic(inlineConfigCharacteristicUuid).then((characteristic) => {
            inlineConfigCharacteristic = characteristic;

            readInlineConfig();
        });
        service.getCharacteristic(inlineOdometerCharacteristicUuid).then((characteristic) => {
            inlineOdometerCharacteristic = characteristic;
        });
    });

    server.getPrimaryService(inlineDataLoggingServiceUuid)
        .then((dataLog) => {
            dataLog.getCharacteristic(inlineDataLoggingCharacteristicUuid)
                .then(characteristics => {
                    inlineDataLoggingCharacteristic = characteristics;

                    setAutoconnectTachoText("Enabling Datalogging");
                    inlineDataLoggingCharacteristic.startNotifications()
                        .then(_ => {

                            setAutoconnectTachoText("Successfully connected!");

                            automaticReconnectTacho = true;

                            bleInlineConnected = true;


                            if (!bleBMSConnected) {
                                setTimeout(() => {
                                    inlineConnected();
                                    disableNothingConnectedOverlay();
                                }, 1000);
                            } else {
                                setTimeout(() => {
                                    inlineConnected();
                                    disableNothingConnectedOverlay();
                                }, 500);
                            }

                            inlineDataLoggingCharacteristic.addEventListener('characteristicvaluechanged', handleInlineLoggingNotifications);
                        })
                        .catch(error => {
                            console.log('Argh! ' + error);

                            inlineDisconnected();
                            resetAutoconnectTacho();

                            connectLastInlineOverlay.innerHTML = "<h2>Connect Tacho</h2>";
                        });
                });
        });
}

function disconnectInline() {
    if(bleInlineConnected){
        bleInlineDevice.gatt.disconnect();
    }
}

function handleInlineLoggingNotifications(event) {
    let value = event.target.value;

    if(value.byteLength > 1) {
        processInlineData(value);
    }else{
        console.log("Something wrong with incoming BLE Data!");
    }
}