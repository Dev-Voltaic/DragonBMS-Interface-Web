// noinspection JSBitwiseOperatorUsage

clearAlertsButton.addEventListener("click", () => {
    clearAlerts(0, "")
});

function clearAlerts(counter, error){
    if (counter === 10){
        alert("Failed to clear alerts: " + error);
        return;
    }

    // NOT SURE WHICH ERROR COMES BACK IF IT FAILS!
    alertCharacteristic.writeValue(Uint8Array.from([0]).buffer)
        .then(() => {
            // clear everything (might not be needed as they will automagically clear on the next poll)
            alertBuffer = 0;
            warningBuffer = 0;
            updateWarningFields();
        })
        .catch(error => {
            setTimeout( ()=>{
                clearAlerts(counter + 1, error);
            }, 100);
        });
}


let gpo1 = false;
let gpo2 = false;

gpo1Button.addEventListener("click", () => {
    gpo1 = !gpo1;
    let value = gpo1 * 1 | gpo2 * 2;
    userGPOCharacteristic.writeValueWithoutResponse(Uint8Array.from([value]).buffer).then(() => {
        gpo1Button.innerHTML = gpo1 ? '1 ON' : '1 OFF';
    });
});

gpo2Button.addEventListener("click", () => {
    gpo2 = !gpo2;
    let value = gpo1 * 1 | gpo2 * 2;
    userGPOCharacteristic.writeValueWithoutResponse(Uint8Array.from([value]).buffer).then(() => {
        gpo2Button.innerHTML = gpo2 ? '2 ON' : '2 OFF';
    });
});


let warningBuffer = 0;
let alertBuffer = 0;


function updateConfigRelatedGauges(config) {
    // config info  tile
    configInfoStart.innerHTML = (config.boardAutoStart ? 'Autostart' : 'manual Start');

    configInfoOvp.innerHTML = String(config.battCellCount * config.protMaxCellVoltage / 1000) + "V";
    configInfoUvp.innerHTML = String(config.battCellCount * config.protMinCellVoltage / 1000) + "V";

    configInfoOtp.innerHTML = String(Math.min(config.protMaxLogicTemp, config.protMaxPowerTemp)) + "°C";


    // disable non enabled channels and count number of enabled channels - to adjust protection values
    let numChannels = 0;
    if (!(config.boardEnabledChannels & 0b00000001)) {
        document.getElementById("channel-info-1").classList.add("disabled");
    } else {
        document.getElementById("channel-info-1").classList.remove("disabled");
        numChannels ++;
    }
    if (!(config.boardEnabledChannels & 0b00000010)) {
        document.getElementById("channel-info-2").classList.add("disabled");
    } else {
        document.getElementById("channel-info-2").classList.remove("disabled");
        numChannels ++;
    }
    if (!(config.boardEnabledChannels & 0b00000100)) {
        document.getElementById("channel-info-3").classList.add("disabled");
    } else {
        document.getElementById("channel-info-3").classList.remove("disabled");
        numChannels ++;
    }


    configInfoRevOcp.innerHTML = String(config.protMaxReverseCurrent * 0.01 * numChannels) + "A";
    configInfoOcp.innerHTML = String(config.protMaxCurrent * 0.01 * numChannels) + "A";



    ch1InfoBatteryType.innerHTML = config.battCellCount + "S";
    ch2InfoBatteryType.innerHTML = config.battCellCount + "S";
    ch3InfoBatteryType.innerHTML = config.battCellCount + "S";
}


function setBMSState(stateMachineState) {
    let stateMachineStateString;
    if (stateMachineState === 0) stateMachineStateString = "Startup"
    else if (stateMachineState === 1) stateMachineStateString = "Precharging..."
    else if (stateMachineState === 2) stateMachineStateString = "Ready"
    else if (stateMachineState === 3) stateMachineStateString = "Operation"
    else if (stateMachineState === 4) stateMachineStateString = "Fault"
    else stateMachineStateString = "UNDEFINED STATE!"
    bmsStateValue.innerHTML = stateMachineStateString;
}


function handleTurnOnTd(stateMachineState) {
    // turn on field is now tied to the state machine state - smart choice!
    if (stateMachineState === 2) { // ready

        // if turnOnTd is in the elements div (clear alerts must be on the screen then), swap
        elementsDiv.childNodes.forEach((child) => {
            if (child === turnOnTd) {
                swap(clearAlertsTd, turnOnTd);
            }
        });
        if (!turnOnButton.innerHTML.includes("ON")) {
            turnOnButton.innerHTML = "<h2>Switch ON</h2>";
        }
    }
    if (stateMachineState === 3) { // operation
        elementsDiv.childNodes.forEach((child) => {
            if (child === turnOnTd) {
                swap(clearAlertsTd, turnOnTd);
            }
        });
        if (!turnOnButton.innerHTML.includes("OFF")) {
            turnOnButton.innerHTML = "<h2>Switch OFF</h2>";
        }
    }
    if (stateMachineState === 1) { // Precharging
        elementsDiv.childNodes.forEach((child) => {
            if (child === turnOnTd) {
                swap(clearAlertsTd, turnOnTd);
            }
        });
        turnOnButton.innerHTML = "<h2>Precharging...</h2>";
    }
    if (stateMachineState === 4) { // fault
        elementsDiv.childNodes.forEach((child) => {
            if (child === clearAlertsTd) {
                swap(clearAlertsTd, turnOnTd);
            }
        });
    }
}


function handleConfigWarningButtons(stateMachineState){
    if (stateMachineState === 3) { // operation
        // change the turn on/off buttons
        if (!boardConfigTurnOnButton.innerHTML.includes("OFF")) {
            boardConfigTurnOnButton.innerHTML = "Turn OFF";
        }
        if (!boardCalibTurnOnButton.innerHTML.includes("OFF")) {
            boardCalibTurnOnButton.innerHTML = "Turn OFF";
        }

        // update the warning
        configWriteWarning.classList.remove("hidden");
        calibWriteWarning.classList.remove("hidden");
    }else{
        // change the turn on/off buttons
        if (!boardConfigTurnOnButton.innerHTML.includes("ON")) {
            boardConfigTurnOnButton.innerHTML = "Turn ON";
        }
        if (!boardCalibTurnOnButton.innerHTML.includes("ON")) {
            boardCalibTurnOnButton.innerHTML = "Turn ON";
        }

        // update the warning
        configWriteWarning.classList.add("hidden");
        calibWriteWarning.classList.add("hidden");

    }
}

boardConfigTurnOnButton.addEventListener("click", () => {
    if (boardConfigTurnOnButton.innerHTML.includes("ON")) { // if the button says "Switch on", switch on when pressed
        boardConfigTurnOnButton.classList.add("button-orange");
        turnOnCharacteristic.writeValue(Uint8Array.from([1]).buffer).then(_ => {
            boardConfigTurnOnButton.classList.remove("button-orange");
            //console.log("turned on");
        }).catch(_ => {
            console.log("failed to turn on");
        });
    }
    if (boardConfigTurnOnButton.innerHTML.includes("OFF")) {
        boardConfigTurnOnButton.classList.add("button-orange");
        turnOnCharacteristic.writeValue(Uint8Array.from([0]).buffer).then(_ => {
            boardConfigTurnOnButton.classList.remove("button-orange");
            //console.log("turned off");
        }).catch(_ => {
            console.log("failed to turn off");
        });
    }
});

boardCalibTurnOnButton.addEventListener("click", () => {
    if (boardCalibTurnOnButton.innerHTML.includes("ON")) { // if the button says "Switch on", switch on when pressed
        boardCalibTurnOnButton.classList.add("button-orange");
        turnOnCharacteristic.writeValue(Uint8Array.from([1]).buffer).then(_ => {
            boardCalibTurnOnButton.classList.remove("button-orange");
            //console.log("turned on");
        }).catch(_ => {
            console.log("failed to turn on");
        });
    }
    if (boardCalibTurnOnButton.innerHTML.includes("OFF")) {
        boardCalibTurnOnButton.classList.add("button-orange");
        turnOnCharacteristic.writeValue(Uint8Array.from([0]).buffer).then(_ => {
            boardCalibTurnOnButton.classList.remove("button-orange");
            //console.log("turned on");
        }).catch(_ => {
            console.log("failed to turn off");
        });
    }
});

turnOnTd.addEventListener("click", () => {
    if (turnOnButton.innerHTML.includes("ON")) { // if the button says "Switch on", switch on when pressed
        turnOnButton.classList.add("orange");
        turnOnCharacteristic.writeValue(Uint8Array.from([1]).buffer).then(_ => {
            turnOnButton.classList.remove("orange");
            //console.log("turned on");
        }).catch(_ => {
            console.log("failed to turn on");
        });
    }
    if (turnOnButton.innerHTML.includes("OFF")) {
        turnOnButton.classList.add("orange");
        turnOnCharacteristic.writeValue(Uint8Array.from([0]).buffer).then(_ => {
            turnOnButton.classList.remove("orange");
            //console.log("turned off");
        }).catch(_ => {
            console.log("failed to turn off");
        });
    }
});

function setWattPlossTextVal(val) {
    if(val === "-0.0"){val = "0.0"}
    boardPowerlossValue.innerHTML = val + "W";
}


function setBMSTempValues(vals){
    shuntTempValue.innerHTML = vals.shunt + "°C";
    prechargeTempValue.innerHTML = vals.precharge + "°C";
}

function setInlineTempValues(vals){
    motorTempValue.innerHTML = vals.motor + "°C";
    externTempValue.innerHTML = vals.extern + "°C";
}



function setAmpTextVal(val) {
    if(val === "-0.0"){val = "0.0"}
    combinedCurrentValue.innerHTML = val + "A";
}



function setEnergyUsedVals(vals){
    combinedEnergyUsedValue.innerHTML = (vals.combined / 3600).toFixed(1) + "Wh";
    combinedEnergyUsedValue2.innerHTML = (vals.combined / 3600).toFixed(1) + "Wh";
    ch1InfoEnergyUsed.innerHTML = (vals.ch1 / 3600).toFixed(3) + "Wh";
    ch2InfoEnergyUsed.innerHTML = (vals.ch2 / 3600).toFixed(3) + "Wh";
    ch3InfoEnergyUsed.innerHTML = (vals.ch3 / 3600).toFixed(3) + "Wh";
}

function setSOCVals(vals){
    ch1InfoSOC.innerHTML = (vals.ch1).toFixed(1) + "%";
    ch2InfoSOC.innerHTML = (vals.ch2).toFixed(1) + "%";
    ch3InfoSOC.innerHTML = (vals.ch3).toFixed(1) + "%";
    minSOCValue.innerHTML = (vals.min).toFixed(1) + "%";
}

function setOnTime(values) {
    let seconds = (values % 60).toString();
    while (seconds.length < 2) seconds = "0" + seconds;

    let minutes = Math.floor((values / 60) % 60).toString();
    while (minutes.length < 2) minutes = "0" + minutes;

    let hours = Math.floor(values / 3600).toString();
    while (hours.length < 2) hours = "0" + hours;

    onTimeValue.innerHTML = hours + ":" + minutes + ":" + seconds;
}

function setBMSMaxValues(vals) {
    maxPowerValue.innerHTML = vals.power + "kW";
    maxCurrentValue.innerHTML = vals.current + "A";
    minVoltValue.innerHTML = vals.voltage + "V";
    maxShuntTemp.innerHTML = vals.shuntTemp + "°C";
    maxPrechargeTemp.innerHTML = vals.prechargeTemp + "°C";
}

function setInlineMaxValues(vals){
    maxSpeedValue.innerHTML = vals.speed.toFixed(1) + "km/h";
    maxMotorTemp.innerHTML = vals.motorTemp + "°C";
    maxExternTemp.innerHTML = vals.externTemp + "°C";
}


function setChannelVoltageInfo(data){
    ch1InfoVoltage.innerHTML = data.u1 + "V";
    ch2InfoVoltage.innerHTML = data.u2 + "V";
    ch3InfoVoltage.innerHTML = data.u3 + "V";

    outputVoltageValue.innerHTML = data.uOut + "V";
}
function setChannelCurrentInfo(data){
    if(data.i1 === "-0.00"){data.i1 = "0.00"}
    if(data.i2 === "-0.00"){data.i2 = "0.00"}
    if(data.i3 === "-0.00"){data.i3 = "0.00"}


    ch1ControlCurrent.innerHTML = data.i1 + "A";
    ch1ControlPower.innerHTML = (parseFloat(data.u1) * parseFloat(data.i1)).toFixed(1) + "W";

    ch2ControlCurrent.innerHTML = data.i2 + "A";
    ch2ControlPower.innerHTML = (parseFloat(data.u2) * parseFloat(data.i2)).toFixed(1) + "W";

    ch3ControlCurrent.innerHTML = data.i3 + "A";
    ch3ControlPower.innerHTML = (parseFloat(data.u3) * parseFloat(data.i3)).toFixed(1) + "W";
}

function setPTotalValue(value){
    if(value === "-0.0"){value = "0.0"}
    combinedPowerValue.innerHTML = value + "kW";
}



function enableBoardGauges(){
    for(let i = 0; i < boardElements.length; i++){
        boardElements[i].classList.remove("board-gauge-disabled");
    }
}
function disableBoardGauges(){
    for(let i = 0; i < boardElements.length; i++){
        boardElements[i].classList.add("board-gauge-disabled");
    }
}
disableBoardGauges();


let inlineGaugeDiv = document.getElementById("inline-gauge");
let vehicleOdometerValue = document.getElementById("vehicle-odo-val");
let tripOdometerValue = document.getElementById("trip-odo-val");
let vehicleSpeedValue = document.getElementById("speed-val");
let resetTripButton = document.getElementById("resetTripOdo");
let vehicleRPMValue = document.getElementById("speed-rpm-val");


function setSpeedGaugeValues(values){
    if(!values.direction){ // forwards
        vehicleSpeedValue.innerHTML = values[2] + "km/h";
    }else{ // backwards
        vehicleSpeedValue.innerHTML = "-" + values[2].toFixed(1) + "km/h";
    }

    vehicleRPMValue.innerHTML = values[3] + "RPM";
}

function setTachoGauges(values){
    tripOdometerValue.innerHTML = (values.tripOdo / 100000).toFixed(2) + "km";

    vehicleOdometerValue.innerHTML = (Math.floor((values.vehicleOdo / 10)) / 10).toFixed(1) + "km";

}


function setEconomyGauges(values){
    rangeValue.innerHTML = values.range.toFixed(1) + "km";
    sessionEconomyValue.innerHTML = values.whkmSession.toFixed(1) + "Wh/km";
}

resetEconomyButton.addEventListener("click", () => {
    // triggers a reset of all the offsets needed to calculate the sesison economy
    // basically starts a new session for the measurement
    console.log("new session values for economy!");
    drivenDistanceOffset = -1;
});


resetTripButton.addEventListener("click", () => {
    inlineOdometerCharacteristic.writeValueWithoutResponse(Uint8Array.from([0x01]).buffer).catch(_ =>{
        console.log("failed to reset trip odometer");
    });
});




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


function updateWarningFields() {
    let faultFieldText = "";
    let faultNameText = "";
    let faultExplanationText = "";

    if(alertBuffer === 0 && warningBuffer === 0){
        faultStateValue.innerHTML = "None";
    }


    if(warningBuffer !== 0){
        faultFieldText += "<warning>";
    }
    if (warningBuffer & 0b00000000000000000000000000000001) {
        faultFieldText += "GPO OC  ";
    }
    if (warningBuffer & 0b00000000000000000000000000001000) {
        faultFieldText += "Power Temp  ";
    }
    if (warningBuffer & 0b00000000000000000000000000010000) {
        faultFieldText += "Logic Temp  ";
    }
    if (warningBuffer & 0b00000000000000000000000000100000) {
        faultFieldText += "C Imb  ";
    }
    if (warningBuffer & 0b00000000000000000000000001000000) {
        faultFieldText += "Ch1 OC  ";
    }
    if (warningBuffer & 0b00000000000000000000000010000000) {
        faultFieldText += "Ch1 UC  ";
    }
    if (warningBuffer & 0b00000000000000000000000100000000) {
        faultFieldText += "Ch2 OC  ";
    }
    if (warningBuffer & 0b00000000000000000000001000000000) {
        faultFieldText += "Ch2 UC  ";
    }
    if (warningBuffer & 0b00000000000000000000010000000000) {
        faultFieldText += "Ch3 OC  ";
    }
    if (warningBuffer & 0b00000000000000000000100000000000) {
        faultFieldText += "Ch3 UC  ";
    }
    if (warningBuffer & 0b00000000000000000001000000000000) {
        faultFieldText += "Ch1 OV  ";
    }
    if (warningBuffer & 0b00000000000000000010000000000000) {
        faultFieldText += "Ch1 UV  ";
    }
    if (warningBuffer & 0b00000000000000000100000000000000) {
        faultFieldText += "Ch2 OV  ";
    }
    if (warningBuffer & 0b00000000000000001000000000000000) {
        faultFieldText += "Ch2 UV  ";
    }
    if (warningBuffer & 0b00000000000000010000000000000000) {
        faultFieldText += "Ch3 OV  ";
    }
    if (warningBuffer & 0b00000000000000100000000000000000) {
        faultFieldText += "Ch3 UV  ";
    }
    if (warningBuffer & 0b00000000000001000000000000000000) {
        faultFieldText += "LIMP  ";
    }

    if(warningBuffer !== 0){
        faultFieldText += "</warning>";
    }

    if(alertBuffer !== 0){
        faultFieldText += "<fault>";
    }

    if (alertBuffer & 0b00000000000000000000000000000010) {
        faultFieldText += "Unable to Precharge  ";

        faultNameText = "Precharge Failure";
        faultExplanationText = "Disconnect load";
    }
    if (alertBuffer & 0b00000000000000000000000000000100) {
        faultFieldText += "Nothing Connected  ";

        faultNameText = "Precharge Failure";
        faultExplanationText = "Connect load";
    }

    if (alertBuffer & 0b00000000000000000000000000001000) {
        faultFieldText += "Power Temp  ";

        faultNameText = "Power stage Temperature";
        faultExplanationText = "slow down buddy";
    }
    if (alertBuffer & 0b00000000000000000000000000010000) {
        faultFieldText += "Logic Temp  ";

        faultNameText = "Precharge temperature";
        faultExplanationText = "Disconnect load";
    }
    if (alertBuffer & 0b00000000000000000000000000100000) {
        faultFieldText += "C Imb  ";

        faultNameText = "Current Imbalance";
        faultExplanationText = "bro wtf";
    }
    if (alertBuffer & 0b00000000000000000000000001000000) {
        faultFieldText += "Ch1 OC  ";

        faultNameText = "Ch1 Over-current Discharge";
        faultExplanationText = "why so fast?";
    }
    if (alertBuffer & 0b00000000000000000000000010000000) {
        faultFieldText += "Ch1 UC  ";

        faultNameText = "Ch1 Over-current Charge";
        faultExplanationText = "why so fast breaking?";
    }
    if (alertBuffer & 0b00000000000000000000000100000000) {
        faultFieldText += "Ch2 OC  ";

        faultNameText = "Ch2 Over-current Discharge";
        faultExplanationText = "why so fast?";
    }
    if (alertBuffer & 0b00000000000000000000001000000000) {
        faultFieldText += "Ch2 UC  ";

        faultNameText = "Ch2 Over-current Charge";
        faultExplanationText = "why so fast breaking?";
    }
    if (alertBuffer & 0b00000000000000000000010000000000) {
        faultFieldText += "Ch3 OC  ";

        faultNameText = "Ch3 Over-current Discharge";
        faultExplanationText = "why so fast?";
    }
    if (alertBuffer & 0b00000000000000000000100000000000) {
        faultFieldText += "Ch3 UC  ";

        faultNameText = "Ch3 Over-current Charge";
        faultExplanationText = "why so fast breaking?";
    }
    if (alertBuffer & 0b00000000000000000001000000000000) {
        faultFieldText += "Ch1 OV  ";

        faultNameText = "Ch1 Over-voltage";
        faultExplanationText = "oh no senpai, my mosfets huuuurt >:((";
    }
    if (alertBuffer & 0b00000000000000000010000000000000) {
        faultFieldText += "Ch1 UV  ";

        faultNameText = "Ch1 Under-voltage";
        faultExplanationText = "ayo big man, where the voltage at??";
    }
    if (alertBuffer & 0b00000000000000000100000000000000) {
        faultFieldText += "Ch2 OV  ";

        faultNameText = "Ch2 Over-voltage";
        faultExplanationText = "oh no senpai, my mosfets huuuurt >:((";
    }
    if (alertBuffer & 0b00000000000000001000000000000000) {
        faultFieldText += "Ch2 UV  ";

        faultNameText = "Ch2 Under-voltage";
        faultExplanationText = "ayo big man, where the voltage at??";
    }
    if (alertBuffer & 0b00000000000000010000000000000000) {
        faultFieldText += "Ch3 OV  ";

        faultNameText = "Ch3 Over-voltage";
        faultExplanationText = "oh no senpai, my mosfets huuuurt >:((";
    }
    if (alertBuffer & 0b00000000000000100000000000000000) {
        faultFieldText += "Ch3 UV  ";

        faultNameText = "Ch3 Under-voltage";
        faultExplanationText = "ayo big man, where the voltage at??";
    }

    if (alertBuffer & 0b00010000000000000000000000000000) {
        faultFieldText += "Invalid Input  ";

        faultNameText = "Invalid config/calib input";
        faultExplanationText = "Please reconsider your life choices and think the given config values through again ;)";
    }

    if (alertBuffer & 0b00100000000000000000000000000000) {
        faultFieldText += "FW Hiccup  ";

        faultNameText = "Firmware Hiccup";
        faultExplanationText = "Firmware internal hiccup. This might be caused by corrupted config/calib data. Please restart your device.";
    }

    if (alertBuffer & 0b10000000000000000000000000000000) {
        faultFieldText += "Hardware Failure  ";

        faultNameText = "Hardware Failure";
        faultExplanationText = "big faki waki";
    }

    // append a closing fault tag if needed
    if(alertBuffer !== 0){
        faultFieldText += "</fault>";
    }

    // only update field if needed - ensures animation is working correctly
    if(faultStateValue.innerHTML !== faultFieldText){
        faultStateValue.innerHTML = faultFieldText;
    }

    // only update fields if needed - max fps!!!!
    if(clearAlertsFaultName.innerHTML !== faultNameText){
        clearAlertsFaultName.innerHTML = faultNameText;
    }
    if(clearAlertsFaultExplanation.innerHTML !== faultExplanationText){
        clearAlertsFaultExplanation.innerHTML = faultExplanationText;
    }
}











/*
    Only needed for dev field (almost obsolete)
 */


let prechargeEnabled = false;

let currentPrechargeValue = 0;

precharge_button_div.addEventListener("click", function (){
    prechargeEnabled = !prechargeEnabled;
    if(prechargeEnabled){
        console.log(parseInt(document.getElementById("prechargePWMInput").value));
        prechargeControlCharacteristic.writeValue(Uint8Array.from([
            parseInt(document.getElementById("prechargePWMInput").value)
        ]).buffer).catch(_ => {
            console.log("failed to enable precharge");
        });
        currentPrechargeValue = parseInt(document.getElementById("prechargePWMInput").value);
        precharge_button_div.style.background = "green";
        precharge_button.style.color = "white";
        precharge_button.innerHTML = "stop Precharge";
    }else {
        currentPrechargeValue = 0;
        prechargeControlCharacteristic.writeValue(Uint8Array.from([0]).buffer).catch(_ => {
            console.log("failed to turn off precharge");
        });
        precharge_button_div.style.background = "";
        precharge_button.style.color = "green";
        precharge_button.innerHTML = "start Precharge";
    }
});



let channel1enabled = false, channel2enabled = false, channel3enabled = false;
channel1_button.addEventListener("click", function (){
    channel1enabled = !channel1enabled;
    sendChannelControlData(0, channel1enabled, channel2enabled, channel3enabled);
    if(channel1enabled){
        channel1_button.src = "img/on-button.png";
    }else {
        channel1_button.src = "img/off.jpg";
    }
});
channel2_button.addEventListener("click", function (){
    channel2enabled = !channel2enabled;
    sendChannelControlData(0, channel1enabled, channel2enabled, channel3enabled);
    if(channel2enabled){
        channel2_button.src = "img/on-button.png";
    }else {
        channel2_button.src = "img/off.jpg";
    }
});

channel3_button.addEventListener("click", function (){
    channel3enabled = !channel3enabled;
    sendChannelControlData(0, channel1enabled, channel2enabled, channel3enabled);
    if(channel3enabled){
        channel3_button.src = "img/on-button.png";
    }else {
        channel3_button.src = "img/off.jpg";
    }
});
