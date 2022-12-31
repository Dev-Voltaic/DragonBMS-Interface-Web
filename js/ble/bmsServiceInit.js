function getDeviceInfoSeq(server, cb){
    // Device information service
    server.getPrimaryService('device_information').then((service) => {
        getHardwareRevisionString(service, _=>{
            getFirmwareRevisionString(service, cb);
        })
    });
}
function getDeviceInfoPar(server, cb){
    // Device information service
    server.getPrimaryService('device_information').then((service) => {
        getHardwareRevisionString(service, ()=>{});
        getFirmwareRevisionString(service, cb);
    });
}

function getHardwareRevisionString(service, cb){
    let decoder = new TextDecoder('utf-8');
    // hardware revision string
    service.getCharacteristic(BluetoothUUID.getCharacteristic('hardware_revision_string')).then((characteristic) => {
        characteristic.readValue().then(value => {
            bleBMSDeviceHardwareRevision = decoder.decode(value);
        });
    });
}
function getFirmwareRevisionString(service, cb){
    let decoder = new TextDecoder('utf-8');
    // firmware revision string
    service.getCharacteristic(BluetoothUUID.getCharacteristic('firmware_revision_string')).then((characteristic) => {
        characteristic.readValue().then(value => {
            bleBMSDeviceFirmwareRevision = decoder.decode(value);

            cb();
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
function getDevelopmentServicePar(server, cb){
    server.getPrimaryService(developmentServiceUuid).then((service) => {
        getPrechargeControlCharacteristic(service, ()=>{});
        getChannelControlCharacteristic(service, ()=>{});
        getBMSUptimeCharacteristic(service, ()=>{});

        cb();
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
function getRuntimeControlServicePar(server, cb){
    server.getPrimaryService(runtimeControlServiceUuid).then((service) => {
        getShutdownCharacteristic(service, ()=>{});
        getTurnOnCharacteristic(service, ()=>{});
        getUserGPOCharacteristic(service, ()=>{});

        cb();
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
                cb();
            });
        });
    });
}
function getBMSConfigServicePar(server, cb){
    server.getPrimaryService(bmsConfigServiceUuid).then((service) => {
        getBMSConfigCharacteristic(service, ()=>{});
        getBMSCalibCharacteristic(service, ()=>{});

        cb();
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














function getBMSAlertServiceSeq(server, cb){
    server.getPrimaryService(alertwarningServiceUuid).then((service) => {
        getBMSWarningCharacteristic(service, ()=>{
            getBMSAlertCharacteristic(service, ()=>{
                cb();
            });
        });
    });
}
function getBMSAlertServicePar(server, cb){
    server.getPrimaryService(alertwarningServiceUuid).then((service) => {
        getBMSWarningCharacteristic(service, ()=>{});
        getBMSAlertCharacteristic(service, ()=>{});

        cb();
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