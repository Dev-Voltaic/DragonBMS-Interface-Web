// noinspection JSUnresolvedVariable

function getDeviceInfoSeq(server, cb){
    // Device information service
    server.getPrimaryService('device_information').then((service) => {
        getHardwareRevisionString(service, (hardwareRevStr)=>{
            getFirmwareRevisionString(service, (firmwareRevStr)=>{
                cb({
                    hardwareRevisionString: hardwareRevStr,
                    firmwareRevisionString: firmwareRevStr
                });
            });
        });
    });
}

function getHardwareRevisionString(service, cb){
    let decoder = new TextDecoder('utf-8');
    // hardware revision string
    service.getCharacteristic(BluetoothUUID.getCharacteristic('hardware_revision_string')).then((characteristic) => {
        characteristic.readValue().then(value => {
            cb(decoder.decode(value));
        });
    });
}
function getFirmwareRevisionString(service, cb){
    let decoder = new TextDecoder('utf-8');
    // firmware revision string
    service.getCharacteristic(BluetoothUUID.getCharacteristic('firmware_revision_string')).then((characteristic) => {
        characteristic.readValue().then(value => {
            cb(decoder.decode(value));
        });
    });
}






















function getDevelopmentServiceSeq(server, cb){
    server.getPrimaryService(developmentServiceUuid).then((service) => {
        getPrechargeControlCharacteristic(service, ()=>{
            getChannelControlCharacteristic(service, ()=>{
                getBMSUptimeCharacteristic(service, ()=>{
                    cb();
                });
            });
        });
    });
}

function getPrechargeControlCharacteristic(service, cb){
    service.getCharacteristic(prechargeControlCharacteristicUuid).then((characteristic) => {
        prechargeControlCharacteristic = characteristic;

        cb();
    });
}
function getChannelControlCharacteristic(service, cb){
    service.getCharacteristic(channelControlCharacteristicUuid).then((characteristic) => {
        channelControlCharacteristic = characteristic;

        cb();
    });
}
function getBMSUptimeCharacteristic(service, cb){
    service.getCharacteristic(uptimeCharacteristicUuid).then((characteristic) => {
        uptimeCharacteristic = characteristic;

        cb();
    });
}






















function getRuntimeControlServiceSeq(server, cb){
    server.getPrimaryService(runtimeControlServiceUuid).then((service) => {

        getShutdownCharacteristic(service, ()=>{
            getTurnOnCharacteristic(service, ()=>{
                getUserGPOCharacteristic(service, ()=>{
                    cb();
                });
            });
        });

    });
}

function getShutdownCharacteristic(service, cb){
    service.getCharacteristic(shutdownControlCharacteristicUuid).then((characteristic) => {
        shutdownControlCharacteristic = characteristic;

        cb();
    });
}
function getTurnOnCharacteristic(service, cb){
    service.getCharacteristic(turnOnCharacteristicUuid).then((characteristic) => {
        turnOnCharacteristic = characteristic;

        cb();
    });
}

function getUserGPOCharacteristic(service, cb){
    service.getCharacteristic(userGPOCharacteristicUuid).then((characteristic) => {
        userGPOCharacteristic = characteristic;

        cb();
    });
}


















function getBMSConfigServiceSeq(server, cb){
    server.getPrimaryService(bmsConfigServiceUuid).then((service) => {
        getBMSConfigCharacteristic(service, ()=>{
            getBMSCalibCharacteristic(service, ()=>{
                getBMSNameCharacteristic(service, ()=>{
                    cb();
                });
            });
        });
    });
}

function getBMSConfigCharacteristic(service, cb){
    service.getCharacteristic(bmsConfigCharacteristicUuid).then((characteristic) => {
        bmsConfigCharacteristic = characteristic;

        cb();
    });
}
function getBMSCalibCharacteristic(service, cb){
    service.getCharacteristic(calibCharacteristicUuid).then((characteristic) => {
        calibCharacteristic = characteristic;

        cb();
    });
}
function getBMSNameCharacteristic(service, cb){
    try{
        service.getCharacteristic(bleDeviceNameSetCharacteristicUuid).then((characteristic) => {
            bmsDeviceNameCharacteristic = characteristic;

            cb();
        }).catch(()=>{
            console.log("older firmware - no device name write support");
            cb();
        });
    }catch(e) {
        console.log("wtf");
    }
}

function getDeviceName(cb){
    // only read device name if characteristic is supported
    if(typeof bmsDeviceNameCharacteristic === "undefined"){
        cb();
    }else{
        let decoder = new TextDecoder('utf-8');
        bmsDeviceNameCharacteristic.readValue().then(value => {
            cb(decoder.decode(value));
        });
    }
}













function getBMSAlertServiceSeq(server, cb){
    server.getPrimaryService(alertWarningServiceUuid).then((service) => {
        getBMSWarningCharacteristic(service, ()=>{
            getBMSAlertCharacteristic(service, ()=>{
                cb();
            });
        });
    });
}

function getBMSWarningCharacteristic(service, cb){
    service.getCharacteristic(warningCharacteristicUuid).then((characteristic) => {
        warningCharacteristic = characteristic;
        characteristic.startNotifications().then(()=>{
            characteristic.addEventListener('characteristicvaluechanged', handleWarningIndication);

            cb();
        });
    });
}
function getBMSAlertCharacteristic(service, cb){
    service.getCharacteristic(alertCharacteristicUuid).then((characteristic) => {
        alertCharacteristic = characteristic;
        characteristic.startNotifications().then(()=>{
            characteristic.addEventListener('characteristicvaluechanged', handleAlertIndication);

            cb();
        });
    });
}
















function getBMSDataloggingServiceSeq(server, cb){
    server.getPrimaryService(bmsDataLoggingServiceUuid).then((dataLog) => {
        dataLog.getCharacteristic(bmsDataLoggingCharacteristicUuid).then(characteristics => {
            bmsDataLoggingCharacteristic = characteristics;
            setAutoconnectBMSText("Enabling Datalogging");
            bmsDataLoggingCharacteristic.startNotifications().then(_ => {
                setAutoconnectBMSText("Successfully connected!");
                bmsDataLoggingCharacteristic.addEventListener('characteristicvaluechanged', processData);

                cb();
            });
        });
    });
}

function stopBMSDataLogging(){
    bmsDataLoggingCharacteristic.removeEventListener('characteristicvaluechanged', processData);
}
function startBMSDataLogging(){
    bmsDataLoggingCharacteristic.addEventListener('characteristicvaluechanged', processData);
}