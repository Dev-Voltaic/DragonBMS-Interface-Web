/*
User interaction
 */

document.getElementById("inline-config-read").addEventListener("click", () => {
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

document.getElementById("inline-config-write").addEventListener("click", () => {
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



function getTempSensorType(){
    let val = document.getElementById("ntc-type-select").value;
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
        document.getElementById("ntc-type-select").value = "kty83";
    }
    if(value === 2){
        document.getElementById("ntc-type-select").value = "kty84";
    }
    if(value === 0){
        document.getElementById("ntc-type-select").value = "ntc_custom";
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
        document.getElementById("r-value").value = "29400";
        document.getElementById("b-value").value = "3460";
        return;
    }
    if(val === "ntc100k"){
        document.getElementById("r-value").value = "350000";
        document.getElementById("b-value").value = "4334";
        return;
    }

    document.getElementById("r-value").value = "";
    document.getElementById("b-value").value = "";
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



function setInlineConfigValues(config) {
    console.log("Got config: ");
    console.log(config);
    setTempSensorType(config.tempSensorType);
    document.getElementById("r-value").value = config.ntc_r * 10;
    document.getElementById("r-value-divider").value = config.divider_r * 10;
    document.getElementById("b-value").value = config.ntc_b;
    document.getElementById("reversed").checked = config.reversed;
    document.getElementById("back-neg").checked = config.backwards_negative;
    document.getElementById("distperpulse").value = config.impulses;
    document.getElementById("motor-poles").value = config.motor_poles;

    inlineConfigContainer.style.color = "#64ff79";
    setTimeout(() => {
        inlineConfigContainer.style.color = "";
    }, 1000);
}






/*
    Distance per Pulse calibration and calculation
 */

let initialPulseValue = 0;
let currentPulseValue = 0;

function inlineConfigPulseData(data){
    currentPulseValue = data;
    document.getElementById("pulses").innerHTML = String(parseFloat(data) - initialPulseValue);
}

document.getElementById("resetPulses").addEventListener("click", (e) => {
    initialPulseValue = currentPulseValue;
});
document.getElementById("calculatedistperpulse").addEventListener("click", () => {
    let pulses = parseFloat(document.getElementById("pulses").innerHTML);
    let dist = parseFloat(document.getElementById("distance").value);
    if(pulses === 0){
        document.getElementById("pulses").style.color = "red";
        setTimeout(()=>{
            document.getElementById("pulses").style.color = "";
        }, 500);
        return;
    }
    document.getElementById("distperpulse").value = Math.abs(Math.round(10 * dist / pulses));
});