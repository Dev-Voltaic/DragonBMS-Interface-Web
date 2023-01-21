// noinspection JSBitwiseOperatorUsage




// set the cursor to the right on all input fields (a bit whack but there is no nicer solution)
document.querySelectorAll("input[type='number']").forEach(item => {
    item.addEventListener('focus', event => {
        console.log("focussed on input");
        const value = event.target.value;
        event.target.value = '';
        setTimeout(()=>{
            event.target.value = value;
        }, 1);
    })
});



/*
    BMS related
 */



clearAlertsButton.addEventListener("click", () => {
    clearAlerts(0, "")
});

function clearAlerts(counter, _){
    if (counter === 10){
        //alert("Failed to clear alerts: " + error);
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
    let value = !gpo1 * 1 | gpo2 * 2;
    userGPOCharacteristic.writeValue(Uint8Array.from([value]).buffer).then(() => {
        gpo1 = !gpo1;
        gpo1Button.innerHTML = gpo1 ? '1 ON' : '1 OFF';
    }).catch(() => {
        console.log("failed to set gpo state");
    });
});

gpo2Button.addEventListener("click", () => {
    let value = gpo1 * 1 | !gpo2 * 2;
    userGPOCharacteristic.writeValue(Uint8Array.from([value]).buffer).then(() => {
        gpo2 = !gpo2;
        gpo2Button.innerHTML = gpo2 ? '2 ON' : '2 OFF';
    }).catch(() => {
        console.log("failed to set gpo state")
    });
});


let warningBuffer = 0;
let alertBuffer = 0;

function updateConfigRelatedGauges(config) {
    // config info  tile
    setValueTexts(bmsConfigStartupValues, (config.boardAutoStart ? 'Autostart' : 'manual Start'));

    setValueTexts(bmsConfigOverVoltageValues, String(config.battCellCount * config.protMaxCellVoltage / 1000) + "V");
    setValueTexts(bmsConfigUnderVoltageValues, String(config.battCellCount * config.protMinCellVoltage / 1000) + "V");

    setValueTexts(bmsConfigOverTempValues, String(Math.min(config.protMaxLogicTemp, config.protMaxPowerTemp)) + "°C");


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

    setValueTexts(bmsConfigUnderCurrentValues, String(config.protMaxReverseCurrent * 0.01 * numChannels) + "A");
    setValueTexts(bmsConfigOverCurrentValues, String(config.protMaxCurrent * 0.01 * numChannels) + "A");

    // should some day be editable on a per-channel basis
    setValueTexts(bmsCh1TypeValues, config.battCellCount + "S");
    setValueTexts(bmsCh2TypeValues, config.battCellCount + "S");
    setValueTexts(bmsCh3TypeValues, config.battCellCount + "S");
}


function setBMSState(stateMachineState) {
    let stateMachineStateString;

    // in honor of clemens, I won't change this ugly syntax
    if (stateMachineState === 0) stateMachineStateString = "Startup"
    else if (stateMachineState === 1) stateMachineStateString = "Precharging..."
    else if (stateMachineState === 2) stateMachineStateString = "Ready"
    else if (stateMachineState === 3) stateMachineStateString = "Operation"
    else if (stateMachineState === 4) stateMachineStateString = "Fault"
    else stateMachineStateString = "UNDEFINED STATE!"

    setValueTexts(bmsStateMachineStateValues, stateMachineStateString);
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


let turnOnTdMoveStart = {x: 0, y: 0};

function turnOnTdPressed(event){
    // save the touch event start to be compared to move event - cancel turn on/off on scroll
    try{
        turnOnTdMoveStart.x = event.changedTouches[0].screenX;
        turnOnTdMoveStart.y = event.changedTouches[0].screenY;
    }catch(e) {
        // sometimes, there is no changed Touch in the event (don't ask why)
        if(!(e instanceof TypeError)){
            console.log(e);
        }
    }

    if (turnOnButton.innerHTML.includes("ON")) { // if the button says "Switch on", switch on when pressed
        // turn on the animation of filling the button
        turnOnButton.classList.add("animateTurnOnButton");
        // listen for the animation to end (mouse has been down for 0.5s if this event fires)
        turnOnButton.addEventListener('animationend', function(_) {
            turnOnButton.classList.add("orange");

            turnOnCharacteristic.writeValue(Uint8Array.from([1]).buffer).then(_ => {
                turnOnButton.classList.remove("orange");
                //console.log("turned on");
            }).catch(e => {
                console.log("failed to turn on" + e);
            });
            turnOnButton.classList.remove("animateTurnOnButton");
        });
    }
    if (turnOnButton.innerHTML.includes("OFF")) {
        turnOnButton.classList.add("animateTurnOffButton");
        // listen for the animation to end (mouse has been down for 0.5s if this event fires)
        turnOnButton.addEventListener('animationend', function(_) {
            turnOnButton.classList.add("orange");

            turnOnCharacteristic.writeValue(Uint8Array.from([0]).buffer).then(_ => {
                turnOnButton.classList.remove("orange");
                //console.log("turned on");
            }).catch(e => {
                console.log("failed to turn off" + e);
            });
            turnOnButton.classList.remove("animateTurnOffButton");
        });
    }
}

// cancel animation if touch user only wants to scroll
function turnOnTdMoved(event){
    const moveX = turnOnTdMoveStart.x - event.changedTouches[0].screenX;
    const moveY = turnOnTdMoveStart.y - event.changedTouches[0].screenY;
    const swipeDistance = Math.sqrt(Math.pow(moveX, 2) + Math.pow(moveY, 2));
    if(swipeDistance > window.outerHeight * 0.01){
        turnOnButton.classList.remove("animateTurnOnButton");
        turnOnButton.classList.remove("animateTurnOffButton");
    }
}

function turnOnTdReleased(){
    // stop the animations if the mouse button/touch action is released
    if (turnOnButton.innerHTML.includes("ON")) {
        turnOnButton.classList.remove("animateTurnOnButton");
    }
    if (turnOnButton.innerHTML.includes("OFF")) {
        turnOnButton.classList.remove("animateTurnOffButton");
    }
}
turnOnTd.addEventListener("mousedown", turnOnTdPressed);
turnOnTd.addEventListener("touchstart", turnOnTdPressed);
turnOnTd.addEventListener("touchmove", turnOnTdMoved);

turnOnTd.addEventListener("mouseup", turnOnTdReleased);
turnOnTd.addEventListener("touchend", turnOnTdReleased);





function updateBMSNameFields(name){
    if(typeof name === "undefined"){
        setValueValues(bmsNameFields, "too old firmware");
    }else{
        setValueValues(bmsNameFields, name);
    }
}


function setBMSCalculatedValues(data){
    // total current
    let iTotalString = data.iTotal.toFixed(1);
    if(iTotalString === "-0.0"){iTotalString = "0.0"}
    setValueTexts(bmsCombinedCurrentValues, iTotalString + "A");

    // total power
    let pTotalString = data.pTotal.toFixed(1);
    if(pTotalString === "-0.0"){pTotalString = "0.0"}
    setValueTexts(bmsCombinedPowerValues, pTotalString + "kW");

    // power loss
    let pLossString = data.pLoss.toFixed(1);
    if(pLossString === "-0.0"){pLossString = "0.0"}
    setValueTexts(bmsPowerLossValues, pLossString + "W");

    // used energy
    setValueTexts(bmsCombinedEnergyUsedValues,  (data.energyUsed.combined / 3600).toFixed(1) + "Wh");
    setValueTexts(bmsCh1EnergyUsedValues, (data.energyUsed.ch1 / 3600).toFixed(3) + "Wh");
    setValueTexts(bmsCh2EnergyUsedValues, (data.energyUsed.ch1 / 3600).toFixed(3) + "Wh");
    setValueTexts(bmsCh3EnergyUsedValues, (data.energyUsed.ch1 / 3600).toFixed(3) + "Wh");

    // state of charge (soc)
    setValueTexts(bmsCh1SOCValues, (data.soc.ch1).toFixed(1) + "%");
    setValueTexts(bmsCh2SOCValues, (data.soc.ch2).toFixed(1) + "%");
    setValueTexts(bmsCh3SOCValues, (data.soc.ch3).toFixed(1) + "%");
    setValueTexts(bmsMinSOCValues, (data.soc.min).toFixed(1) + "%");

}

function setBMSTempValues(data){
    setValueTexts(bmsShuntTempValues, data.tShunt + "°C");
    setValueTexts(bmsPrechargeTempValues, data.tPch + "°C");
}


function setOnTime(values) {
    let seconds = (values % 60).toString();
    while (seconds.length < 2) seconds = "0" + seconds;

    let minutes = Math.floor((values / 60) % 60).toString();
    while (minutes.length < 2) minutes = "0" + minutes;

    let hours = Math.floor(values / 3600).toString();
    while (hours.length < 2) hours = "0" + hours;

    setValueTexts(bmsOnTimeValues, hours + ":" + minutes + ":" + seconds);
}

function setBMSMaxValues(data) {
    setValueTexts(bmsMaxPowerValues, data.power + "kW");
    setValueTexts(bmsMaxCurrentValues, data.current + "A");
    setValueTexts(bmsMinVoltageValues, data.voltage + "V");
    setValueTexts(bmsMaxShuntTempValues, data.shuntTemp + "°C");
    setValueTexts(bmsMaxPrechargeTempValues, data.prechargeTemp + "°C");
}

function setChannelVoltageInfo(data){
    setValueTexts(bmsCh1VoltageValues, data.u1 + "V");
    setValueTexts(bmsCh2VoltageValues, data.u2 + "V");
    setValueTexts(bmsCh3VoltageValues, data.u3 + "V");

    setValueTexts(bmsOutputVoltageValues, data.uOut + "V");
}
function setChannelCurrentInfo(data){
    if(data.i1 === "-0.00"){data.i1 = "0.00"}
    if(data.i2 === "-0.00"){data.i2 = "0.00"}
    if(data.i3 === "-0.00"){data.i3 = "0.00"}


    setValueTexts(bmsCh1CurrentValues, data.i1 + "A");
    setValueTexts(bmsCh1PowerValues, (parseFloat(data.u1) * parseFloat(data.i1)).toFixed(1) + "W");

    setValueTexts(bmsCh2CurrentValues, data.i2 + "A");
    setValueTexts(bmsCh2PowerValues, (parseFloat(data.u2) * parseFloat(data.i2)).toFixed(1) + "W");

    setValueTexts(bmsCh3CurrentValues, data.i3 + "A");
    setValueTexts(bmsCh3PowerValues, (parseFloat(data.u3) * parseFloat(data.i3)).toFixed(1) + "W");
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
        setValueTexts(bmsFaultStateValues, faultFieldText);
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
    INLINE related
 */

function setInlineMaxValues(data){
    setValueTexts(tachoMaxSpeedValues, data.speed.toFixed(1) + "km/h");
    setValueTexts(tachoMaxMotorTempValues, data.motorTemp + "°C");
    setValueTexts(tachoMaxExternTempValues, data.externTemp + "°C");
}


function setSpeedGaugeValues(values){
    if(!values.direction){ // forwards
        setValueTexts(tachoSpeedValues, values[2] + "km/h");
    }else{ // backwards
        setValueTexts(tachoSpeedValues, "-" + values[2].toFixed(1) + "km/h");
    }

    setValueTexts(tachoRPMValues, values[3] + "RPM");
}

function setTachoGauges(values){
    setValueTexts(tachoTripOdoValues, (values.tripOdo / 100000).toFixed(2) + "km");

    setValueTexts(tachoVehicleOdoValues, (Math.floor((values.vehicleOdo / 10)) / 10).toFixed(1) + "km");
}



function setInlineTempValues(data){
    setValueTexts(tachoMotorTempValues, data.motor + "°C");
    setValueTexts(tachoExternTempValues, data.extern + "°C");
}

function setEconomyGauges(values){
    setValueTexts(sessionRangeValues, values.range.toFixed(1) + "km");
    setValueTexts(sessionEconomyValues, values.whkmSession.toFixed(1) + "Wh/km");
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
