// variable for storing the calibration last read
let readCalibration;


/*
User interaction
 */

getId("board-calib-read").addEventListener("click", () => {
    readBMSCalib();
});

function readBMSCalib(){
    calibCharacteristic.readValue().then(calibValues => {
        console.log(calibValues);
        setCalibValues(calibValues);
    });
    /*.catch(_ => {
        indicateBMSCalibFailure();
    });

     */
}

getId("board-calib-write").addEventListener("click", () => {
    // writing config characteristic
    console.log(getCalibValues());
    calibCharacteristic.writeValue(Uint8Array.from(getCalibValues()).buffer).then(_ => {
        indicateBMSCalibSuccess();
        console.log("successfully wrote config");
    }).catch(error => {
        indicateBMSCalibFailure();
    });
    setTimeout(() => {
        readBMSCalib();
    }, 200);
});


function indicateBMSCalibSuccess() {
    boardCalibTable.style.color = "#64ff79";
    setTimeout(() => {
        boardCalibTable.style.color = "";
    }, 3000);
}

function indicateBMSCalibFailure() {
    boardCalibTable.style.color = "#ff6464";
    setTimeout(() => {
        boardCalibTable.style.color = "";
    }, 2000);
}



/*
Calib data processing
 */

function getCalibValues(){
    let calibValues = [];
    calibValues[0] = to16bit(parseInt(inVolt1Correction.value))[0];
    calibValues[1] = to16bit(parseInt(inVolt1Correction.value))[1];

    calibValues[2] = to16bit(parseInt(inVolt2Correction.value))[0];
    calibValues[3] = to16bit(parseInt(inVolt2Correction.value))[1];

    calibValues[4] = to16bit(parseInt(inVolt3Correction.value))[0];
    calibValues[5] = to16bit(parseInt(inVolt3Correction.value))[1];

    calibValues[6] = to16bit(parseInt(outVoltCorrection.value))[0];
    calibValues[7] = to16bit(parseInt(outVoltCorrection.value))[1];


    calibValues[8] = to16bit(parseInt(shunt1.value))[0];
    calibValues[9] = to16bit(parseInt(shunt1.value))[1];

    calibValues[10] = to16bit(parseInt(shunt2.value))[0];
    calibValues[11] = to16bit(parseInt(shunt2.value))[1];

    calibValues[12] = to16bit(parseInt(shunt3.value))[0];
    calibValues[13] = to16bit(parseInt(shunt3.value))[1];

    return calibValues;
}


function setCalibValues(data){

    let calib = [
        // Voltage Dividers
        (data.getUint8(1) << 8) | data.getUint8(0),
        (data.getUint8(3) << 8) | data.getUint8(2),
        (data.getUint8(5) << 8) | data.getUint8(4),
        (data.getUint8(7) << 8) | data.getUint8(6),

        // Shunts
        (data.getUint8(9) << 8) | data.getUint8(8),
        (data.getUint8(11) << 8) | data.getUint8(10),
        (data.getUint8(13) << 8) | data.getUint8(12),
        (data.getUint8(15) << 8) | data.getUint8(14),

        // precharge - for further use
        (data.getUint8(17) << 8) | data.getUint8(16),

        // thermistor b value
        (data.getUint8(17) << 8) | data.getUint8(16),

        // update count
        (data.getUint8(17) << 8) | data.getUint8(16),
    ];
    readCalibration = calib;

    inVolt1Correction.value = calib[0];
    inVolt2Correction.value = calib[1];
    inVolt3Correction.value = calib[2];
    outVoltCorrection.value = calib[3];

    shunt1.value = calib[4];
    shunt2.value = calib[5];
    shunt3.value = calib[6];
}

function setCalibActualValues(data){
    inVolt1Actual.innerHTML = data[0];
    inVolt2Actual.innerHTML = data[1];
    inVolt3Actual.innerHTML = data[2];
    shunt1Actual.innerHTML = data[3];
    shunt2Actual.innerHTML = data[4];
    shunt3Actual.innerHTML = data[5];
    outVoltActual.innerHTML = data[6];
}










/*
    Calculate Button Event listeners
 */

getId("calculateInV1").addEventListener("click", () => {
    inVolt1Correction.value = (readCalibration[0] * (parseFloat(inVolt1Actual.innerText) / parseFloat(inVolt1Target.value))).toFixed(0);
});
getId("calculateInV2").addEventListener("click", () => {
    inVolt2Correction.value = (readCalibration[1] * (parseFloat(inVolt2Actual.innerText) / parseFloat(inVolt2Target.value))).toFixed(0);
});
getId("calculateInV3").addEventListener("click", () => {
    inVolt3Correction.value = (readCalibration[2] * (parseFloat(inVolt3Actual.innerText) / parseFloat(inVolt3Target.value))).toFixed(0);
});
getId("calculateOut").addEventListener("click", () => {
    outVoltCorrection.value = (readCalibration[3] * (parseFloat(outVoltActual.innerText) / parseFloat(outVoltTarget.value))).toFixed(0);
});
getId("calculateShunt1").addEventListener("click", () => {
    shunt1.value = (readCalibration[4] * (parseFloat(shunt1Actual.innerText) / parseFloat(shunt1Target.value))).toFixed(0);
});
getId("calculateShunt2").addEventListener("click", () => {
    shunt2.value = (readCalibration[5] * (parseFloat(shunt2Actual.innerText) / parseFloat(shunt2Target.value))).toFixed(0);
});
getId("calculateShunt3").addEventListener("click", () => {
    shunt3.value = (readCalibration[6] * (parseFloat(shunt3Actual.innerText) / parseFloat(shunt3Target.value))).toFixed(0);
});
