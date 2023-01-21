function getInlineConfigServiceSeq(server, cb){
    server.getPrimaryService(inlineConfigServiceUuid).then((service)=>{
        getInlineConfigCharacteristic(service, () => {
            getInlineOdometerCharacteristic(service, () => {
                cb();
            });
        });
    });
}

function getInlineConfigCharacteristic(service, cb){
    service.getCharacteristic(inlineConfigCharacteristicUuid).then((characteristic) => {
        inlineConfigCharacteristic = characteristic;

        cb();
    });
}

function getInlineOdometerCharacteristic(service, cb){
    service.getCharacteristic(inlineOdometerCharacteristicUuid).then((characteristic) => {
        inlineOdometerCharacteristic = characteristic;

        cb();
    });
}











function getInlineDataLoggingService(server, cb) {
    server.getPrimaryService(inlineDataLoggingServiceUuid).then((dataLog) => {
        dataLog.getCharacteristic(inlineDataLoggingCharacteristicUuid).then(characteristic => {
            inlineDataLoggingCharacteristic = characteristic;

            cb();
        });
    });
}