// MAIN TABLE
let table = getId("main-table");

// Zoom content
let zoomContent = document.getElementById("zoom-content");


// INTERFACE INFO
let interfaceInfoContainer = getId("interface-info-container");

    // Settings elements

// BOARD INFO
let boardInfoContainer = getId("board-info-container");
let enableSwipeDownUpdate = getId("enable-swipe-down-update");



// Board Config
let boardConfigContainer = getId("board-configuration-div");
let boardConfigTable = getId("board-config-table");
let boardConfigBatterySelector = getId("battery-type-select");
let boardConfigSpikeSensitivitySelector = getId("spike-sensitivity-select");

let boardConfigTurnOnButton = getId("board-turnonoff-config");
let configWriteWarning = getId("config-write-warning");

// Board Calib
let boardCalibContainer = document.getElementById("board-configuration-div");
let boardCalibTable = getId("board-calibration-table");
let boardCalibTurnOnButton = getId("board-turnonoff-calib");

let calibWriteWarning = getId("calib-write-warning");

let inVolt1Correction = getId("in-volt1-correction");
let inVolt1Target = getId("in-volt1-target");
let inVolt1Actual = getId("in-volt1-actual");
let inVolt2Correction = getId("in-volt2-correction");
let inVolt2Target = getId("in-volt2-target");
let inVolt2Actual = getId("in-volt2-actual");
let inVolt3Correction = getId("in-volt3-correction");
let inVolt3Target = getId("in-volt3-target");
let inVolt3Actual = getId("in-volt3-actual");

let outVoltCorrection = getId("out-volt-correction");
let outVoltTarget = getId("out-volt-target");
let outVoltActual = getId("out-volt-actual");

let shunt1 = getId("shunt-resistance-1");
let shunt1Target = getId("shunt-resistance-1-target");
let shunt1Actual = getId("shunt-resistance-1-actual");
let shunt2 = getId("shunt-resistance-2");
let shunt2Target = getId("shunt-resistance-2-target");
let shunt2Actual = getId("shunt-resistance-2-actual");
let shunt3 = getId("shunt-resistance-3");
let shunt3Target = getId("shunt-resistance-3-target");
let shunt3Actual = getId("shunt-resistance-3-actual");

// Inline Config
let inlineConfigContainer = getId("inline-configuration-div");
let tempSensorSelector = getId("ntc-type-select");
let inlineConfigDataLoggingFrequency = getId("inline-dl-frequency");


let elementsDiv = getId("elementsDiv");








    // Swipe for Settings Element
let settingsSwipeContainer = document.getElementById("swipe-for-settings-container");
let settingsSwipeText = document.getElementsByClassName("swipe-for-settings-text")[0];
let settingsSwipeAction = document.getElementsByClassName("swipe-for-settings-action")[0];


let settingsContainer = document.getElementById("settings-container");



let settingsHide = document.getElementById("settings-hide");








    // NO DEVICES CONNECTED OVERLAY

let connectLastDeviceButton = getId('autoconnectBMS');
let connectLastInlineButton = getId('autoconnectInline');

let connectLastInlineOverlay = getId("connectLastInlineButton");

let autoconnectingBMSText = getId("autoconnectingBMSText");
let autoconnectBMSText = getId("autoconnectBMSText");

let autoconnectingTachoText = getId("autoconnectingTachoText");
let autoconnectTachoText = getId("autoconnectTachoText");

let nothingConnectedOverlay = getId("nothingConnectedOverlay");





    // Info elements (class based)
let bmsDataLoggingFrequencyValues = document.getElementsByClassName("bms-hz");
let tachoDataLoggingFrequencyValues = document.getElementsByClassName("tacho-hz");


let tachoSpeedValues = document.getElementsByClassName("tacho-speed-value");
let tachoRPMValues = document.getElementsByClassName("tacho-rpm-value");
let tachoTripOdoValues = document.getElementsByClassName("tacho-trip-odometer-value");
let tachoVehicleOdoValues = document.getElementsByClassName("tacho-vehicle-odometer-value");
let sessionEconomyValues = document.getElementsByClassName("session-economy-value");
let sessionRangeValues = document.getElementsByClassName("session-economy-value");
let bmsPrechargeTempValues = document.getElementsByClassName("bms-precharge-temp-value");
let bmsShuntTempValues = document.getElementsByClassName("bms-shunt-temp-value");
let tachoMotorTempValues = document.getElementsByClassName("tacho-motor-temp-value");
let tachoExternTempValues = document.getElementsByClassName("tacho-extern-temp-value");
let bmsCombinedPowerValues = document.getElementsByClassName("bms-combined-power-value");
let bmsCombinedCurrentValues = document.getElementsByClassName("bms-combined-current-value");
let bmsOutputVoltageValues = document.getElementsByClassName("bms-output-voltage-value");

let bmsMinSOCValues = document.getElementsByClassName("bms-min-soc-value");
let bmsPowerLossValues = document.getElementsByClassName("bms-power-loss-value");
let bmsCombinedEnergyUsedValues = document.getElementsByClassName("bms-combined-energy-used-value");
let bmsOnTimeValues = document.getElementsByClassName("bms-on-time-value");

let bmsCh1VoltageValues = document.getElementsByClassName("bms-ch1-voltage-value");
let bmsCh1CurrentValues = document.getElementsByClassName("bms-ch1-current-value");
let bmsCh1PowerValues = document.getElementsByClassName("bms-ch1-power-value");
let bmsCh1SOCValues = document.getElementsByClassName("bms-ch1-soc-value");
let bmsCh1TypeValues = document.getElementsByClassName("bms-ch1-type-value");
let bmsCh1EnergyUsedValues = document.getElementsByClassName("bms-ch1-energy-used-value");

let bmsCh2VoltageValues = document.getElementsByClassName("bms-ch2-voltage-value");
let bmsCh2CurrentValues = document.getElementsByClassName("bms-ch2-current-value");
let bmsCh2PowerValues = document.getElementsByClassName("bms-ch2-power-value");
let bmsCh2SOCValues = document.getElementsByClassName("bms-ch2-soc-value");
let bmsCh2TypeValues = document.getElementsByClassName("bms-ch2-type-value");
let bmsCh2EnergyUsedValues = document.getElementsByClassName("bms-ch2-energy-used-value");

let bmsCh3VoltageValues = document.getElementsByClassName("bms-ch3-voltage-value");
let bmsCh3CurrentValues = document.getElementsByClassName("bms-ch3-current-value");
let bmsCh3PowerValues = document.getElementsByClassName("bms-ch3-power-value");
let bmsCh3SOCValues = document.getElementsByClassName("bms-ch3-soc-value");
let bmsCh3TypeValues = document.getElementsByClassName("bms-ch3-type-value");
let bmsCh3EnergyUsedValues = document.getElementsByClassName("bms-ch3-energy-used-value");


let bmsMaxPrechargeTempValues = document.getElementsByClassName("bms-max-pch-temp-value");
let bmsMaxShuntTempValues = document.getElementsByClassName("bms-max-shunt-temp-value");
let tachoMaxMotorTempValues = document.getElementsByClassName("tacho-max-motor-temp-value");
let tachoMaxExternTempValues = document.getElementsByClassName("tacho-extern-temp-value");
let bmsMaxPowerValues = document.getElementsByClassName("bms-max-power-value");
let tachoMaxSpeedValues = document.getElementsByClassName("tacho-max-speed-value");

let bmsMaxCurrentValues = document.getElementsByClassName("bms-max-current-value");
let bmsMinVoltageValues = document.getElementsByClassName("bms-min-voltage-value");

let bmsStateMachineStateValues = document.getElementsByClassName("bms-state-value");
let bmsFaultStateValues = document.getElementsByClassName("bms-fault-state-value");

let bmsConfigStartupValues = document.getElementsByClassName("bms-config-startup-value");
let bmsConfigOverCurrentValues = document.getElementsByClassName("bms-config-over-current-value");
let bmsConfigOverVoltageValues = document.getElementsByClassName("bms-config-over-voltage-value");
let bmsConfigUnderVoltageValues = document.getElementsByClassName("bms-config-under-voltage-value");
let bmsConfigUnderCurrentValues = document.getElementsByClassName("bms-config-under-current-value");
let bmsConfigOverTempValues = document.getElementsByClassName("bms-config-over-temp-value");













    // BMS Control elements

// Clear alerts and turn on/off
let clearAlertsButton = getId("clearAlertsButton");
let clearAlertsTd = getId("clearAlertsTd");
let turnOnTd = getId("switchOnTd");
let clearAlertsFaultName = getId("clearAlerts-fault-name");
let clearAlertsFaultExplanation = getId("clearAlerts-fault-explanation");

let resetEconomyButton = getId("resetEconomyButton");
let boardElements = document.getElementsByClassName("board-element");

// bms & fault states
let faultStateValue = getId("fault-state");

let turnOnButton = getId("turnOnButton");

// BMS User GPO
let gpo1Button = getId("GPO1");
let gpo2Button = getId("GPO2");

// Dev tile stuff
let precharge_button_div = getId("precharge-checkbox-template");
let precharge_button = getId("precharge-button");
let channel1_button = getId("ch1control-on");
let channel2_button = getId("ch2control-on");
let channel3_button = getId("ch3control-on");






// INLINE
let inlineGaugeDiv = document.getElementById("inline-gauge");
let resetTripButton = document.getElementById("resetTripOdo");


// classes for gauge id to class conversion:
/*
speed-val -> tacho-speed-value
speed-rpm-val -> tacho-rpm-value
trip-odo-val -> tacho-trip-odometer-value
vehicle-odo-val -> tacho-vehicle-odometer-value
sessionEconomyValue -> session-economy-value
sessionRangeValue -> session-range-value
precharge-temperature -> bms-precharge-temp-value
shunt-temperature -> bms-shunt-temp-value
motor-temperature -> tacho-motor-temp-value
extern-temperature -> tacho-extern-temp-value
combined-power -> bms-combined-power-value
combined-current -> bms-combined-current-value
output-voltage -> bms-output-voltage-value

min-soc -> bms-min-soc-value
board-powerloss -> bms-power-loss-value
combined-energy-used -> bms-combined-energy-used-value

ch1info-v -> bms-ch1-voltage-value
ch1control-a -> bms-ch1-current-value
ch1control-p -> bms-ch1-power-value
ch1info-soc -> bms-ch1-soc-value
ch1info-t -> bms-ch1-type-value
ch1info-eu -> bms-ch1-energy-used-value

ch2info-v -> bms-ch2-voltage-value
ch2control-a -> bms-ch2-current-value
ch2control-p -> bms-ch2-power-value
ch2info-soc -> bms-ch2-soc-value
ch2info-t -> bms-ch2-type-value
ch2info-eu -> bms-ch2-energy-used-value

ch3info-v -> bms-ch3-voltage-value
ch3control-a -> bms-ch3-current-value
ch3control-p -> bms-ch3-power-value
ch3info-soc -> bms-ch3-soc-value
ch3info-t -> bms-ch3-type-value
ch3info-eu -> bms-ch3-energy-used-value


maxPrechargeTemp -> bms-max-pch-temp-value
maxShuntTemp -> bms-max-shunt-temp-value
maxMotorTemp -> tacho-max-motor-temp-value
maxExternTemp -> tacho-max-extern-temp-value
max-power -> bms-max-power-value
max-speed -> tacho-max-speed-value

max-amp-big-val -> bms-max-current-value
min-volt-big-val -> bms-max-current-value
ontime -> bms-on-time-value
combined-energy-used2 -> bms-combined-energy-used-value


state-machine-state -> bms-state-value
fault-state -> bms-fault-state-value
config-info-startup -> bms-config-startup-value
config-info-ocp -> bms-config-over-current-value
config-info-ovp -> bms-config-over-voltage-value
config-info-uvp -> bms-config-under-voltage-value
config-info-revocp -> bms-config-under-current-value
config-info-otp -> bms-config-over-temp-value


*/