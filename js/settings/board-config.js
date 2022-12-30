/*
User interaction
 */

document.getElementById("board-config-read").addEventListener("click", () => {
    readBMSConfig();
});

function readBMSConfig(){
    bmsConfigCharacteristic.readValue().then(configValues => {
        console.log(configValues);
        setBMSConfigValues(getBMSConfigFromBuffer(configValues));
        configBuffer = getBMSConfigFromBuffer(configValues);
        updateConfigRelatedGauges(configBuffer);
    }).catch(_ => {
        indicateBMSConfigFailure();
    });
}

document.getElementById("board-config-write").addEventListener("click", () => {
    // writing config characteristic
    console.log(Uint8Array.from(getBMSBufferFromConfig(getBMSConfigValues())).buffer);
    bmsConfigCharacteristic.writeValue(Uint8Array.from(getBMSBufferFromConfig(getBMSConfigValues())).buffer).then(_ => {
        indicateBMSConfigSuccess();
        console.log("successfully wrote config");
    }).catch(error => {
        indicateBMSConfigFailure();
    });
    setTimeout(() => {
        readBMSConfig();
    }, 200);
});


/*
Background processing
 */



function getEnabledChannelsByte() {
    let byte = 0;
    byte += getIdChecked("enabled-channels-1") * 1;
    byte += getIdChecked("enabled-channels-2") * 2;
    byte += getIdChecked("enabled-channels-3") * 4;
    return byte;
}

function setEnabledChannelsByte(byte) {
    document.getElementById("enabled-channels-1").checked = byte & 0b00000001;
    document.getElementById("enabled-channels-2").checked = byte & 0b00000010;
    document.getElementById("enabled-channels-3").checked = byte & 0b00000100;
}


function checkBMSConfigPlausability() {
    setValueBacktoBoundaries("battery-cells", 4, 30);
    setValueBacktoBoundaries("battery-capacity", 0, 10000000);

    setValueBacktoBoundaries("max-cell-voltage", 100, 6000);
    setValueBacktoBoundaries("min-cell-voltage", 100, 6000);
    setValueBacktoBoundaries("strand-max-imbalance-current", 0, 100);
    setValueBacktoBoundaries("strand-max-current", 1, 199);
    setValueBacktoBoundaries("strand-max-reverse-current", 1, 199);

    setValueBacktoBoundaries("power-max-temp", 0, 90);
    setValueBacktoBoundaries("logic-max-temp", 0, 90);

    //setValueBacktoBoundaries("precharge-current-limit", 1, 50);
    //setValueBacktoBoundaries("load-capacitance", 1, 100000);

    setValueBacktoBoundaries("datalogging-update-interval", 15, 10000);
    setValueBacktoBoundaries("auto-poweroff", 1, 900);

}

function getBMSConfigValues() {
    let config = {};

    config.battCellCount = getIdValue("battery-cells");
    config.battNomCapacity = getIdValue("battery-capacity");

    config.protMaxCellVoltage = getIdValue("max-cell-voltage");
    config.protMinCellVoltage = getIdValue("min-cell-voltage");
    config.protMaxImbalanceCurrent = getIdValue("strand-max-imbalance-current") * 100;
    config.protMaxCurrent = getIdValue("strand-max-current") * 100;
    config.protMaxReverseCurrent = getIdValue("strand-max-reverse-current") * 100;

    config.protMaxPowerTemp = getIdValue("power-max-temp");
    config.protMaxLogicTemp = getIdValue("logic-max-temp");

    config.prechargeCurrentLimit = 0;//getIdValue("precharge-current-limit");
    config.prechargeNomCapacity = 0;//getIdValue("load-capacitance");

    config.dataloggingUpdateInterval = getIdValue("datalogging-update-interval");

    config.boardAutoStart = getIdChecked("autostart");
    config.boardPoweroffTime = getIdValue("auto-poweroff");
    config.boardEnabledChannels = getEnabledChannelsByte();
    config.boardUpdateCount = document.getElementById("updatecount").innerHTML;

    return config;
}


function setBMSConfigValues(config) {
    document.getElementById("battery-cells").value = config.battCellCount;
    document.getElementById("battery-capacity").value = config.battNomCapacity;

    document.getElementById("max-cell-voltage").value = config.protMaxCellVoltage;
    document.getElementById("min-cell-voltage").value = config.protMinCellVoltage;
    document.getElementById("strand-max-current").value = config.protMaxCurrent / 100;
    document.getElementById("strand-max-reverse-current").value = config.protMaxReverseCurrent / 100;
    document.getElementById("strand-max-imbalance-current").value = config.protMaxImbalanceCurrent / 100;

    document.getElementById("datalogging-update-interval").value = config.dataloggingUpdateInterval;

    document.getElementById("logic-max-temp").value = config.protMaxLogicTemp;
    document.getElementById("power-max-temp").value = config.protMaxPowerTemp;

    //document.getElementById("precharge-current-limit").value = config.prechargeCurrentLimit;

    //document.getElementById("load-capacitance").value = config.prechargeNomCapacity;
    document.getElementById("autostart").checked = config.boardAutoStart;
    document.getElementById("auto-poweroff").value = config.boardPoweroffTime;
    setEnabledChannelsByte(config.boardEnabledChannels);
    document.getElementById("updatecount").innerHTML = config.boardUpdateCount;
}


function indicateBMSConfigSuccess() {
    boardConfigTable.style.color = "#64ff79";
    setTimeout(() => {
        boardConfigTable.style.color = "";
    }, 3000);
}

function indicateBMSConfigFailure() {
    boardConfigTable.style.color = "#ff6464";
    setTimeout(() => {
        boardConfigTable.style.color = "";
    }, 2000);
}


boardConfigTable.addEventListener("mousemove", () => {
    checkBMSConfigPlausability();
});
boardConfigTable.addEventListener("change", () => {
    checkBMSConfigPlausability();
});


function blurAppropriateVoltageFields(){
    var val = boardConfigBatterySelector.options[boardConfigBatterySelector.selectedIndex].value;

    if(val === "li-ion" || val === "li-po" || val === "li-fe-po"){
        let toBeBlurred = document.getElementsByClassName("pack-field");
        for (let i = 0; i < toBeBlurred.length; i++) {
            toBeBlurred[i].style.opacity = "0.5";
            toBeBlurred[i].style.pointerEvents = "none";
        }
        toBeBlurred = document.getElementsByClassName("cell-field");
        for (let i = 0; i < toBeBlurred.length; i++) {
            toBeBlurred[i].style.opacity = "0.5";
            toBeBlurred[i].style.pointerEvents = "none";
        }
        return;
    }else{
        let toBeBlurred = document.getElementsByClassName("pack-field");
        for (let i = 0; i < toBeBlurred.length; i++) {
            toBeBlurred[i].style.opacity = "1";
            toBeBlurred[i].style.pointerEvents = "";
        }
        toBeBlurred = document.getElementsByClassName("cell-field");
        for (let i = 0; i < toBeBlurred.length; i++) {
            toBeBlurred[i].style.opacity = "1";
            toBeBlurred[i].style.pointerEvents = "";
        }
    }

    if(val === "custom-li"){
        let toBeBlurred = document.getElementsByClassName("pack-field");
        for (let i = 0; i < toBeBlurred.length; i++) {
            toBeBlurred[i].style.opacity = "0.5";
            toBeBlurred[i].style.pointerEvents = "none";
        }
        return;
    }else{
        let toBeBlurred = document.getElementsByClassName("pack-field");
        for (let i = 0; i < toBeBlurred.length; i++) {
            toBeBlurred[i].style.opacity = "1";
            toBeBlurred[i].style.pointerEvents = "";
        }
    }


    if(val === "custom"){
        let toBeBlurred = document.getElementsByClassName("battery-field");
        for (let i = 0; i < toBeBlurred.length; i++) {
            toBeBlurred[i].style.opacity = "0.5";
            toBeBlurred[i].style.pointerEvents = "none";
        }
        return;
    }else{
        let toBeBlurred = document.getElementsByClassName("battery-field");
        for (let i = 0; i < toBeBlurred.length; i++) {
            toBeBlurred[i].style.opacity = "1";
            toBeBlurred[i].style.pointerEvents = "";
        }
    }
}
function setStandardBatteryValues(){
    let val = boardConfigBatterySelector.options[boardConfigBatterySelector.selectedIndex].value;

    if(val === "li-ion"){
        document.getElementById("max-cell-voltage").value = "4200";
        document.getElementById("min-cell-voltage").value = "3000";

        calculatePackVoltages();
        return;
    }
    if(val === "li-po"){
        document.getElementById("max-cell-voltage").value = "4200";
        document.getElementById("min-cell-voltage").value = "2800";

        calculatePackVoltages();
        return;
    }
    if(val === "li-fe-po"){
        document.getElementById("max-cell-voltage").value = "3500";
        document.getElementById("min-cell-voltage").value = "2500";

        calculatePackVoltages();
        return;
    }
}

function calculatePackVoltages(){
    document.getElementById("pack-overvoltage").value = parseFloat(document.getElementById("battery-cells").value) *
        parseFloat(document.getElementById("max-cell-voltage").value) / 1000;
    document.getElementById("pack-undervoltage").value = parseFloat(document.getElementById("battery-cells").value) *
        parseFloat(document.getElementById("min-cell-voltage").value) / 1000;
}

blurAppropriateVoltageFields();
setStandardBatteryValues();
boardConfigBatterySelector.addEventListener("change", ()=>{
    blurAppropriateVoltageFields();
    setStandardBatteryValues();
});

[].forEach.call(document.getElementsByClassName("cell-field"), (element) => {
    element.addEventListener("input", ()=>{
        calculatePackVoltages();
    });
});
document.getElementById("battery-cells").addEventListener("input", ()=>{
    calculatePackVoltages();
});