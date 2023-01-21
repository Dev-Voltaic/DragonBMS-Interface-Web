// noinspection ShiftOutOfRangeJS

const bmsDataLoggingServiceUuid = "e9ea0200-e19b-482d-9293-c7907585fc48";
const bmsDataLoggingCharacteristicUuid = "e9ea0201-e19b-482d-9293-c7907585fc48";
let bmsDataLoggingCharacteristic;

const bmsConfigServiceUuid = "e9ea0100-e19b-482d-9293-c7907585fc48";
const bmsConfigCharacteristicUuid = "e9ea0101-e19b-482d-9293-c7907585fc48";
let bmsConfigCharacteristic;
const calibCharacteristicUuid = "e9ea0102-e19b-482d-9293-c7907585fc48";
let calibCharacteristic;
const bleDeviceNameSetCharacteristicUuid = "e9ea0103-e19b-482d-9293-c7907585fc48";
let bmsDeviceNameCharacteristic;

const developmentServiceUuid = "e9ea0400-e19b-482d-9293-c7907585fc48";
const prechargeControlCharacteristicUuid = "e9ea0403-e19b-482d-9293-c7907585fc48"; // bodge
let prechargeControlCharacteristic;
const channelControlCharacteristicUuid = "e9ea0401-e19b-482d-9293-c7907585fc48";
let channelControlCharacteristic;
const uptimeCharacteristicUuid = "e9ea0404-e19b-482d-9293-c7907585fc48";
let uptimeCharacteristic;

const runtimeControlServiceUuid = "e9ea0500-e19b-482d-9293-c7907585fc48";
const turnOnCharacteristicUuid = "e9ea0503-e19b-482d-9293-c7907585fc48";
let turnOnCharacteristic;
const shutdownControlCharacteristicUuid = "e9ea0502-e19b-482d-9293-c7907585fc48";
let shutdownControlCharacteristic;
const userGPOCharacteristicUuid = "e9ea0501-e19b-482d-9293-c7907585fc48";
let userGPOCharacteristic;

const alertWarningServiceUuid = "e9ea0300-e19b-482d-9293-c7907585fc48";
const warningCharacteristicUuid = "e9ea0301-e19b-482d-9293-c7907585fc48";
let warningCharacteristic;
const alertCharacteristicUuid = "e9ea0302-e19b-482d-9293-c7907585fc48";
let alertCharacteristic;

let dataLoggingEnabled = false;

let bleBMSDevice;
let bleBMSDeviceName;
let bleBMSDeviceId;


let automaticReconnectBMS = false;


function connectBMS(){
    setAutoconnectBMSText("Searching");

    let manufacturerData = {
        companyIdentifier: 0x030C
    }

    navigator.bluetooth.requestDevice({
        optionalServices: [
            bmsDataLoggingServiceUuid,
            developmentServiceUuid,
            bmsConfigServiceUuid,
            alertWarningServiceUuid,
            runtimeControlServiceUuid,
            'device_information'
        ],
        filters: [{
            manufacturerData: manufacturerData
        }]
    }).then(device => {
        setAutoconnectBMSText("Found Device");
        searchingForBMS = false;
        startBMSNotifications(device);
    }).catch(error => {
        console.log('User most likely cancelled! ' + error);

        searchingForBMS = false;

        autoConnectBMSError();
        setTimeout(() => {
            setAucotonnectBMSTextNoAutoconnect("Bluetooth enabled?");
            setTimeout(() => {
                resetAutoconnectBMSSilent();
            }, 1000);
        });
    });
}

async function startBMSNotifications(device) {
    bleBMSDevice = device;
    bleBMSDeviceId = device.id;

    device.addEventListener('gattserverdisconnected', ()=> {
        bleBMSConnected = false;
        disableBoardGauges();


        if (!bleInlineConnected) {
            enableNothingConnectedOverlay();

            nothingConnectedOverlayTimeout();

            resetAutoconnectBMSSilentInstant();

            resetBMSValues();


        } else {
            resetAutoconnectBMS();

            resetBMSValues();
        }

        console.log("Disconnected");

        if(automaticReconnectBMS){
            console.log("starting auto reconnect bms");
            device.gatt.connect()
                .then(server => {
                    bmsDeviceConnected(server)
                });
        }
    });

    setAutoconnectBMSText("Connecting Device");
    device.gatt.connect()
        .then(server => {
            bmsDeviceConnected(server)
        });

}


let bleServer;
async function bmsDeviceConnected(server) {
    server.connect().then(() => {
        console.log("server connected");

        bleServer = server;

        //setConnectionStatus('Getting Services...');
        setAutoconnectBMSText("Getting Runtime Services");

        console.log("sequentially getting characteristics");

        // sequentially is just the better way!
        getDevelopmentServiceSeq(server, () => {
            setAutoconnectBMSText("Getting Services");
            getRuntimeControlServiceSeq(server, () => {
                setAutoconnectBMSText("Getting Config Service");
                getBMSConfigServiceSeq(server, () => {
                    setAutoconnectBMSText("Getting Alert Service");
                    getBMSAlertServiceSeq(server, () => {
                        console.log(interfaceConfig);
                        if(interfaceConfig.autoReadBMSConfigCalib){
                            setAutoconnectBMSText("Reading Config&Calib");
                            console.log("auto-reading bms config/calib")
                            readBMSCalib(() => {
                                readBMSConfig(() => {
                                    getDeviceInfoSeq(server, (deviceInfoData) => {
                                        getDeviceName((deviceName) => {
                                            console.log("got all config options")
                                            bleBMSDeviceName = deviceName;
                                            updateBMSNameFields(deviceName);

                                            getBMSDataloggingServiceSeq(server, () => {
                                                console.log("got data logging");

                                                automaticReconnectBMS = true;
                                                bleBMSConnected = true;

                                                setTimeout(() => {
                                                    enableBoardGauges();
                                                    disableNothingConnectedOverlay();

                                                    if (bleInlineConnected) {
                                                        zoom.to({element: table, padding: 0, pan: false});
                                                    }
                                                }, 1000);
                                            });
                                        });
                                    });
                                });
                            });
                        }else{
                            getDeviceInfoSeq(server, (deviceInfoData) => {
                                getDeviceName((deviceName) => {
                                    console.log("got all config options")
                                    bleBMSDeviceName = deviceName;
                                    updateBMSNameFields(deviceName);

                                    getBMSDataloggingServiceSeq(server, () => {
                                        console.log("got data logging");

                                        automaticReconnectBMS = true;
                                        bleBMSConnected = true;

                                        setTimeout(() => {
                                            enableBoardGauges();
                                            disableNothingConnectedOverlay();

                                            if (bleInlineConnected) {
                                                zoom.to({element: table, padding: 0, pan: false});
                                            }
                                        }, 1000);
                                    });
                                });
                            });
                        }

                    });
                });
            });
        });
    });

}

function disconnect() {
    if(bleBMSConnected){
        bleBMSDevice.gatt.disconnect();
    }
}


function sendChannelControlData(alert, ch1, ch2, ch3) {
    let byte = 128;
    byte = (ch1 ? (byte | 2) : (byte & 253));
    byte = (ch2 ? (byte | 4) : (byte & 251));
    byte = (ch3 ? (byte | 8) : (byte & 247));
    channelControlCharacteristic.writeValueWithoutResponse(Uint8Array.from([byte]).buffer);
}


// mostly redundant but nice to have
function handleWarningIndication(event) {
    let warningValue = event.target.value;
    warningBuffer = (((warningValue.getUint8(3) << 24) | (warningValue.getUint8(2) << 16)) | (warningValue.getUint8(1) << 8)) | (warningValue.getUint8(0));
}

// the error popup windows are too annoying
// - franz
// also basically useless now since alert always gets polled when in fault mode
function handleAlertIndication(event) {
    let alertValue = event.target.value;
    alertBuffer = (((alertValue.getUint8(3) << 24) | (alertValue.getUint8(2) << 16)) | (alertValue.getUint8(1) << 8)) | (alertValue.getUint8(0));
}




// poll faults from characteristic when data logging gives state 4 (fault)
function pollFaults(){
    if(stateMachineStateBuffer === 4 && bleBMSConnected){
        // try catch for "gatt operation already in progress"
        try {
            alertCharacteristic.readValue().then(alertValue => {
                alertBuffer = (((alertValue.getUint8(3) << 24) | (alertValue.getUint8(2) << 16)) | (alertValue.getUint8(1) << 8)) | (alertValue.getUint8(0));
            });
        } catch (error) { //"gatt operation already in progress"
        }

        // try catch for "gatt operation already in progress"
        try {
            warningCharacteristic.readValue().then(warningValue => {
                warningBuffer = (((warningValue.getUint8(3) << 24) | (warningValue.getUint8(2) << 16)) | (warningValue.getUint8(1) << 8)) | (warningValue.getUint8(0))
            });
            updateWarningFields();
        } catch (error) { //"gatt operation already in progress"
        }
    }
    setTimeout(pollFaults, 500);
}

pollFaults();




// get uptime from development service
function pollUptime() {
    // not really able to filter this, has to be done all the time while connected
    if (bleBMSConnected) {
        try {
            uptimeCharacteristic.readValue().then(alertValue => {
                let uptimeValue =
                    handleSignedBullshit64(
                        (alertValue.getUint8(7) << 56) | (alertValue.getUint8(6) << 48) |
                        (alertValue.getUint8(5) << 40) | (alertValue.getUint8(4) << 32) |
                        (alertValue.getUint8(3) << 24) | (alertValue.getUint8(2) << 16) |
                        (alertValue.getUint8(1) << 8) | (alertValue.getUint8(0)));
                setOnTime(Math.floor(-uptimeValue / 1000));
            });
        } catch (error) { //"gatt operation already in progress"
        }

    }
    setTimeout(pollUptime, 400);
}

//pollUptime();
