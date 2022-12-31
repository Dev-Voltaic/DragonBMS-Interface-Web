/*
User interaction
 */

getId("inline-config-read").addEventListener("click", () => {
    readInlineConfig();
});

function readInlineConfig(){
    inlineConfigCharacteristic.readValue().then(configValues => {
        console.log(configValues);
        setInlineConfigValues(getInlineConfigFromBuffer(configValues));
    }).catch(_ => {
        indicateInlineConfigFailure();
    });
}

getId("inline-config-write").addEventListener("click", () => {
    // writing config characteristic
    console.log((getInlineConfigValues()));
    inlineConfigCharacteristic.writeValue(Uint8Array.from(getInlineBufferFromConfig(getInlineConfigValues())).buffer).then(_ => {
        indicateInlineConfigSuccess();
        console.log("successfully wrote config");
    }).catch(error => {
        indicateInlineConfigFailure();
    });
    setTimeout(() => {
        readInlineConfig();
    }, 200);
});

function indicateInlineConfigSuccess() {
    inlineConfigContainer.style.color = "#64ff79";
    setTimeout(() => {
        inlineConfigContainer.style.color = "";
    }, 3000);
}

function indicateInlineConfigFailure() {
    inlineConfigContainer.style.color = "#ff6464";
    setTimeout(() => {
        inlineConfigContainer.style.color = "";
    }, 2000);
}




/*
Actual Data processing
 */

function getTempSensorType(){
    let val = getId("ntc-type-select").value;
    if(val === "kty83"){
        return 1;
    }
    if(val === "kty84"){
        return 2;
    }

    // fuck ptcs, all standard ntcs get their values set into appropriate fields
    // -> they can be treated as manually input custom ntcs
    return 0;
}

function setTempSensorType(value){
    if(value === 1){
        getId("ntc-type-select").value = "kty83";
    }
    if(value === 2){
        getId("ntc-type-select").value = "kty84";
    }
    if(value === 0){
        getId("ntc-type-select").value = "ntc_custom";
    }

    blurAppropriateTempFields();
    setStandardNTCValues();

}


function blurAppropriateTempFields(){
    var val = tempSensorSelector.options[tempSensorSelector.selectedIndex].value;

    if(val !== "ntc_custom" && val !== "ptc_custom"){
        let customTempInputFields = document.getElementsByClassName("customTempInput");
        for (let i = 0; i < customTempInputFields.length; i++) {
            customTempInputFields[i].style.opacity = "0.5";
            customTempInputFields[i].style.pointerEvents = "none";
        }
    }else{
        let customTempInputFields = document.getElementsByClassName("customTempInput");
        for (let i = 0; i < customTempInputFields.length; i++) {
            customTempInputFields[i].style.opacity = "1";
            customTempInputFields[i].style.pointerEvents = "";
        }
    }
}
function setStandardNTCValues(){
    var val = tempSensorSelector.options[tempSensorSelector.selectedIndex].value;

    if(val === "ntc10k"){
        getId("r-value").value = "29400";
        getId("b-value").value = "3460";
        return;
    }
    if(val === "ntc100k"){
        getId("r-value").value = "350000";
        getId("b-value").value = "4334";
        return;
    }

    getId("r-value").value = "";
    getId("b-value").value = "";
}
blurAppropriateTempFields();
setStandardNTCValues();
tempSensorSelector.addEventListener("change", ()=>{
    blurAppropriateTempFields();
    setStandardNTCValues();
});
function checkInlineConfigPlausability() {
    setValueBacktoBoundaries("battery-cells", 4, 30);
    setValueBacktoBoundaries("battery-capacity", 0, 10000000);

    setValueBacktoBoundaries("max-cell-voltage", 2000, 5000);
    setValueBacktoBoundaries("min-cell-voltage", 2000, 5000);
    setValueBacktoBoundaries("strand-max-imbalance-current", 0, 100);
    setValueBacktoBoundaries("strand-max-current", 1, 300);

    setValueBacktoBoundaries("power-max-temp", 30, 90);
    setValueBacktoBoundaries("logic-max-temp", 30, 90);

    setValueBacktoBoundaries("precharge-current-limit", 1, 50);
    setValueBacktoBoundaries("load-capacitance", 1, 100000);

    setValueBacktoBoundaries("datalogging-update-interval", 20, 255);
    setValueBacktoBoundaries("auto-poweroff", 30, 90);

}

function getInlineConfigValues() {
    let config = {};
    config.tempSensorType = getTempSensorType();
    config.ntc_r = getIdValue("r-value") / 10;
    config.divider_r = getIdValue("r-value-divider") / 10;
    config.ntc_b = getIdValue("b-value");
    config.reversed = getIdChecked("reversed");
    config.backwards_negative = getIdChecked("back-neg");
    config.impulses = getIdValue("distperpulse");
    config.motor_poles = getIdValue("motor-poles");
    return config;
}


function setInlineConfigValues(config) {
    console.log("Got config: ");
    console.log(config);
    setTempSensorType(config.tempSensorType);
    getId("r-value").value = config.ntc_r * 10;
    getId("r-value-divider").value = config.divider_r * 10;
    getId("b-value").value = config.ntc_b;
    getId("reversed").checked = config.reversed;
    getId("back-neg").checked = config.backwards_negative;
    getId("distperpulse").value = config.impulses;
    getId("motor-poles").value = config.motor_poles;
}






/*
    Distance per Pulse calibration and calculation
 */

let initialPulseValue = 0;
let currentPulseValue = 0;

function inlineConfigPulseData(data){
    currentPulseValue = data;
    getId("pulses").innerHTML = String(parseFloat(data) - initialPulseValue);
}

getId("resetPulses").addEventListener("click", (e) => {
    initialPulseValue = currentPulseValue;
});
getId("calculatedistperpulse").addEventListener("click", () => {
    let pulses = parseFloat(getId("pulses").innerHTML);
    let dist = parseFloat(getId("distance").value);
    if(pulses === 0){
        getId("pulses").style.color = "red";
        setTimeout(()=>{
            getId("pulses").style.color = "";
        }, 500);
        return;
    }
    getId("distperpulse").value = Math.abs(Math.round(10 * dist / pulses));
});