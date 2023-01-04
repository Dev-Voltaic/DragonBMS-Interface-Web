/*
User interaction
 */

getId("board-config-read").addEventListener("click", () => {
    readBMSConfig();
});

function readBMSConfig(){
    bmsConfigCharacteristic.readValue().then(configValues => {
        console.log(configValues);
        setBMSConfigValues(getBMSConfigFromBuffer(configValues));
        configBuffer = getBMSConfigFromBuffer(configValues);
        updateConfigRelatedGauges(configBuffer);
    })
        /*.catch(error => {
        console.log("read config error: ");
        console.log(error);
        indicateBMSConfigFailure();
    });*/
}

getId("board-config-write").addEventListener("click", () => {
    // writing config characteristic
    console.log(Uint8Array.from(getBMSBufferFromConfig(getBMSConfigValues())).buffer);
    bmsConfigCharacteristic.writeValue(Uint8Array.from(getBMSBufferFromConfig(getBMSConfigValues())).buffer).then(_ => {
        indicateBMSConfigSuccess();
        console.log("successfully wrote config");
    }).catch(_ => {
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
    getId("enabled-channels-1").checked = byte & 0b00000001;
    getId("enabled-channels-2").checked = byte & 0b00000010;
    getId("enabled-channels-3").checked = byte & 0b00000100;
}


function setCurrentSpikeSensitivity(value){
    if(value === 0){
        getId("spike-sensitivity-select").value = "0";
    }
    if(value === 1){
        getId("spike-sensitivity-select").value = "1";
    }
    if(value === 2){
        getId("spike-sensitivity-select").value = "2";
    }
}

function getCurrentSpikeSensitivity(){
    let val = getId("spike-sensitivity-select").value;
    if(val === "0"){ // low
        return 0;
    }
    if(val === "1"){ // normal
        return 1;
    }
    if(val === "2"){ // high
        return 2;
    }
    // default is normal
    return 1;
}


function checkBMSConfigPlausibility() {
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

    setValueBacktoBoundaries("datalogging-update-frequency", 1, 120);
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

    config.protSpikeSensitivity = getCurrentSpikeSensitivity();

    config.protMaxPowerTemp = getIdValue("power-max-temp");
    config.protMaxLogicTemp = getIdValue("logic-max-temp");

    config.prechargeCurrentLimit = 0;//getIdValue("precharge-current-limit");
    config.prechargeNomCapacity = 0;//getIdValue("load-capacitance");

    config.dataloggingUpdateInterval = 1000/getIdValue("datalogging-update-frequency");

    config.boardAutoStart = getIdChecked("autostart");
    config.boardPoweroffTime = getIdValue("auto-poweroff");
    config.boardEnabledChannels = getEnabledChannelsByte();
    config.boardUpdateCount = getId("updatecount").innerHTML;

    return config;
}


function setBMSConfigValues(config) {
    getId("battery-cells").value = config.battCellCount;
    getId("battery-capacity").value = config.battNomCapacity;

    getId("max-cell-voltage").value = config.protMaxCellVoltage;
    getId("min-cell-voltage").value = config.protMinCellVoltage;
    getId("strand-max-current").value = config.protMaxCurrent / 100;
    getId("strand-max-reverse-current").value = config.protMaxReverseCurrent / 100;
    getId("strand-max-imbalance-current").value = config.protMaxImbalanceCurrent / 100;

    setCurrentSpikeSensitivity(config.protSpikeSensitivity);

    getId("datalogging-update-frequency").value = 1000/config.dataloggingUpdateInterval;

    getId("logic-max-temp").value = config.protMaxLogicTemp;
    getId("power-max-temp").value = config.protMaxPowerTemp;

    //getId("precharge-current-limit").value = config.prechargeCurrentLimit;

    //getId("load-capacitance").value = config.prechargeNomCapacity;
    getId("autostart").checked = config.boardAutoStart;
    getId("auto-poweroff").value = config.boardPoweroffTime;
    setEnabledChannelsByte(config.boardEnabledChannels);
    getId("updatecount").innerHTML = config.boardUpdateCount;
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
    const val = boardConfigBatterySelector.options[boardConfigBatterySelector.selectedIndex].value;

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
        getId("max-cell-voltage").value = "4200";
        getId("min-cell-voltage").value = "3000";

        calculatePackVoltages();
        return;
    }
    if(val === "li-po"){
        getId("max-cell-voltage").value = "4200";
        getId("min-cell-voltage").value = "2800";

        calculatePackVoltages();
        return;
    }
    if(val === "li-fe-po"){
        getId("max-cell-voltage").value = "3500";
        getId("min-cell-voltage").value = "2500";

        calculatePackVoltages();
    }
}

function calculatePackVoltages(){
    getId("pack-overvoltage").value = parseFloat(getId("battery-cells").value) *
        parseFloat(getId("max-cell-voltage").value) / 1000;
    getId("pack-undervoltage").value = parseFloat(getId("battery-cells").value) *
        parseFloat(getId("min-cell-voltage").value) / 1000;
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
getId("battery-cells").addEventListener("input", ()=>{
    calculatePackVoltages();
});