const bmsDataLoggingServiceUuid = "e9ea0200-e19b-482d-9293-c7907585fc48";
const bmsDataLoggingCharacteristicUuid = "e9ea0201-e19b-482d-9293-c7907585fc48";
let bmsDataLoggingCharacteristic;

const bmsConfigServiceUuid = "e9ea0100-e19b-482d-9293-c7907585fc48";
const bmsConfigCharacteristicUuid = "e9ea0101-e19b-482d-9293-c7907585fc48";
let bmsConfigCharacteristic;
const calibCharacteristicUuid = "e9ea0102-e19b-482d-9293-c7907585fc48";
let calibCharacteristic;

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

const alertwarningServiceUuid = "e9ea0300-e19b-482d-9293-c7907585fc48";
const warningCharacteristicUuid = "e9ea0301-e19b-482d-9293-c7907585fc48";
let warningCharacteristic;
const alertCharacteristicUuid = "e9ea0302-e19b-482d-9293-c7907585fc48";
let alertCharacteristic;

let dataLoggingEnabled = false;

var bleBMSDevice;
var bleBMSDeviceName;
var bleBMSDeviceId;
var bleBMSDeviceHardwareRevision;
var bleBMSDeviceFirmwareRevision;

var averagedArray = (array, averaging) => {
    let summedArray = [];
    let averageArray = [];
    array.forEach(sub => {
        sub.map(Number).forEach((num, index) => {
            if(summedArray[index]){
                summedArray[index] += num;
            }else{
                summedArray[index] = num;
            }
        });
    });
    summedArray.forEach(sum => {
        averageArray.push((sum / array.length).toFixed(averaging));
    });
    return averageArray;
}

function connectBMS(autoconnect){
    setAutoconnectBMSText("Searching");

    navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
            bmsDataLoggingServiceUuid,
            developmentServiceUuid,
            bmsConfigServiceUuid,
            alertwarningServiceUuid,
            runtimeControlServiceUuid,
            'device_information'
        ]/*,
        filters: [{
            bmsConfigServiceUuid
        }]*/
    }).then(device => {
        setAutoconnectBMSText("Found Device");
        searchingForBMS = false;
        startBMSNotifications(device);
    }).catch(error => {
        console.log('User most likely cancelled! ' + error);

        searchingForBMS = false;

        if (bleBMSTimeout) {
            resetAutoconnectBMS();
        } else {
            autoConnectBMSError();
            setTimeout(() => {
                setAucotonnectBMSTextNoAutoconnect("Bluetooth enabled?");
                setTimeout(() => {
                    resetAutoconnectBMSSilent();
                }, 1000);
            })
        }
    });
}

async function startBMSNotifications(device) {
    bleBMSDevice = device;
    bleBMSDeviceName = device.name;
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
    });

    setAutoconnectBMSText("Connecting Device");
    device.gatt.connect()
        .then(server => {
            server.connect().then(() => {
                console.log("server connected");
            });
            //setConnectionStatus('Getting Services...');
            setAutoconnectBMSText("Getting Services");

            // Device information service
            server.getPrimaryService('device_information').then((service) => {
                let decoder = new TextDecoder('utf-8');
                // hardware revision string
                service.getCharacteristic(BluetoothUUID.getCharacteristic('hardware_revision_string')).then((characteristic) => {
                    characteristic.readValue().then(value => {
                        bleBMSDeviceHardwareRevision = decoder.decode(value);
                    });
                });
                // firmware revision string
                service.getCharacteristic(BluetoothUUID.getCharacteristic('firmware_revision_string')).then((characteristic) => {
                    characteristic.readValue().then(value => {
                        bleBMSDeviceFirmwareRevision = decoder.decode(value);
                    });
                });
            });

            server.getPrimaryService(developmentServiceUuid).then((service) => {
                service.getCharacteristic(prechargeControlCharacteristicUuid).then((characteristic) => {
                    prechargeControlCharacteristic = characteristic;
                });
                service.getCharacteristic(channelControlCharacteristicUuid).then((characteristic) => {
                    channelControlCharacteristic = characteristic;
                });
                service.getCharacteristic(uptimeCharacteristicUuid).then((characteristic) => {
                    uptimeCharacteristic = characteristic;
                });
            });

            server.getPrimaryService(runtimeControlServiceUuid).then((service)=> {
                service.getCharacteristic(shutdownControlCharacteristicUuid).then((characteristic) => {
                    shutdownControlCharacteristic = characteristic;
                });
                service.getCharacteristic(turnOnCharacteristicUuid).then((characteristic) => {
                    turnOnCharacteristic = characteristic;
                });
                service.getCharacteristic(userGPOCharacteristicUuid).then((characteristic) => {
                    userGPOCharacteristic = characteristic;
                });
            });

            server.getPrimaryService(bmsConfigServiceUuid).then((service)=>{
                service.getCharacteristic(bmsConfigCharacteristicUuid).then((characteristic) => {
                    bmsConfigCharacteristic = characteristic;
                    // automatically read config characteristic to update the gauges
                    bmsConfigCharacteristic.readValue().then(configValues => {
                        configBuffer = getBMSConfigFromBuffer(configValues);
                        updateConfigRelatedGauges(configBuffer);
                    }).catch(error => {
                        console.log('Argh! ' + error);
                    });
                });
                service.getCharacteristic(calibCharacteristicUuid).then((characteristic) => {
                    calibCharacteristic = characteristic;
                });
            });

            server.getPrimaryService(alertwarningServiceUuid).then((service)=>{
                service.getCharacteristic(warningCharacteristicUuid).then((characteristic) => {
                    warningCharacteristic = characteristic;
                    characteristic.startNotifications();
                    characteristic.addEventListener('characteristicvaluechanged', handleWarningIndication);
                });
                service.getCharacteristic(alertCharacteristicUuid).then((characteristic) => {
                    alertCharacteristic = characteristic;
                    characteristic.startNotifications();
                    characteristic.addEventListener('characteristicvaluechanged', handleAlertIndication);
                });
            });

            return server.getPrimaryService(bmsDataLoggingServiceUuid);
        })
        .then((dataLog) => {
            return dataLog.getCharacteristic(bmsDataLoggingCharacteristicUuid);
        })
        .then(characteristics => {
            bmsDataLoggingCharacteristic = characteristics;
            setAutoconnectBMSText("Enabling Dataloggging");
            return bmsDataLoggingCharacteristic.startNotifications();
        })
        .then(_ => {
            setAutoconnectBMSText("Successfully connected!");

            bleBMSConnected = true;


            setTimeout(() => {
                enableBoardGauges();
                disableNothingConnectedOverlay();
            }, 1000);

            if (bleInlineConnected) {
                zoom.to({element: inlineGaugeTd, padding: 0, pan: false});
            }

            bmsDataLoggingCharacteristic.addEventListener('characteristicvaluechanged', processData);
        })
        .catch(error => {
            console.log('Argh! ' + error);

            resetAutoconnectBMS();
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
    let byte = (((warningValue.getUint8(3) << 24) | (warningValue.getUint8(2) << 16)) | (warningValue.getUint8(1) << 8)) | (warningValue.getUint8(0));
    setWarningStatus(byte);
}

// the error popup windows are too annoying
// - franz
// also basically useless now since alert always gets pulled when in fault mode
function handleAlertIndication(event) {
    let alertValue = event.target.value;
    let byte = (((alertValue.getUint8(3) << 24) | (alertValue.getUint8(2) << 16)) | (alertValue.getUint8(1) << 8)) | (alertValue.getUint8(0));
}


// hack to make gauges render with display normal first and then make them disappear
document.getElementsByClassName("elementsdiv")[0].style.display = "none";

