// MAIN TABLE
let table = getId("main-table");

// Board Config
let boardConfigTable = getId("board-config-table");
let boardConfigBatterySelector = getId("battery-type-select");

// Board Calib
let boardCalibTable = getId("board-calibration-table")
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


let elementsDiv = getId("elementsDiv");



// BUTTONS AND SUCH

let precharge_button_div = getId("precharge-checkbox-template");
let precharge_button = getId("precharge-button");


let channel1_button = getId("ch1control-on");
let channel2_button = getId("ch2control-on");
let channel3_button = getId("ch3control-on");


// CLEAR ALERTS AND TURN ON/OFF
let clearAlertsButton = getId("clearAlertsButton");
let clearAlertsTd = getId("clearAlertsTd");
let turnOnTd = getId("switchOnTd");
let clearAlertsFaultName = getId("clearAlerts-fault-name");
let clearAlertsFaultExplanation = getId("clearAlerts-fault-explanation");




// NO DEVICES CONNECTED OVERLAY

let connectLastDeviceButton = getId('autoconnectBMS');
let connectLastInlineButton = getId('autoconnectInline');

let connectLastInlineOverlay = getId("connectLastInlineButton");

let autoconnectingBMSText = getId("autoconnectingBMSText");
let autoconnectBMSText = getId("autoconnectBMSText");

let autoconnectingTachoText = getId("autoconnectingTachoText");
let autoconnectTachoText = getId("autoconnectTachoText");

let nothingConnectedOverlay = getId("nothingConnectedOverlay");





let inlineGauge = getId("inline-gauge");
let inlineGaugeTd = getId("inline-gauge-td");

// INFO ELEMENTS (TEXTS)


// Combined / mobile
let outputVoltageValue = getId("output-voltage");
let shuntTempValue = getId("shunt-temperature");
let prechargeTempValue = getId("precharge-temperature");
let motorTempValue = getId("motor-temperature");
let externTempValue = getId("extern-temperature");
let combinedCurrentValue = getId("combined-current");
let boardPowerlossValue = getId("board-powerloss");
let combinedPowerValue = getId("combined-power");
let combinedEnergyUsedValue = getId("combined-energy-used");
let combinedEnergyUsedValue2 = getId("combined-energy-used2");

let onTimeValue = getId("ontime");

let rangeValue = getId("sessionRangeValue");
let sessionEconomyValue = getId("sessionEconomyValue");
let resetEconomyButton = getId("resetEconomyButton");


// 3 Strands Info
let ch1InfoVoltage = getId("ch1info-v");
let ch1InfoSOC = getId("ch1info-soc");
let ch1InfoBatteryType = getId("ch1info-t");
let ch1infoet = getId("ch1info-et");
let ch1InfoEnergyUsed = getId("ch1info-eu");

let ch2InfoVoltage = getId("ch2info-v");
let ch2InfoSOC = getId("ch2info-soc");
let ch2InfoBatteryType = getId("ch2info-t");
let ch2infoet = getId("ch2info-et");
let ch2InfoEnergyUsed = getId("ch2info-eu");

let ch3InfoVoltage = getId("ch3info-v");
let ch3InfoSOC = getId("ch3info-soc");
let ch3InfoBatteryType = getId("ch3info-t");
let ch3infoet = getId("ch3info-et");
let ch3InfoEnergyUsed = getId("ch3info-eu");


let minSOCValue = getId("min-soc");



let boardElements = document.getElementsByClassName("board-element");



// bms & fault states
let bmsStateValue = getId("state-machine-state");
let faultStateValue = getId("fault-state");


let turnOnButton = getId("turnOnButton");



// Max values
let maxSpeedValue = getId("max-speed");
let maxPowerValue = getId("max-power");
let maxCurrentValue = getId("max-amp-big-val");
let minVoltValue = getId("min-volt-big-val");

let maxPrechargeTemp = getId("maxPrechargeTemp");
let maxShuntTemp = getId("maxShuntTemp");
let maxMotorTemp = getId("maxMotorTemp");
let maxExternTemp = getId("maxExternTemp");


// Channel Control Gauge
let ch1ControlCurrent = getId("ch1control-a");
let ch1ControlPower = getId("ch1control-p");
let ch2ControlCurrent = getId("ch2control-a");
let ch2ControlPower = getId("ch2control-p");
let ch3ControlCurrent = getId("ch3control-a");
let ch3ControlPower = getId("ch3control-p");

// Config Info Gauge
let configInfoStart = getId("config-info-startup");
let configInfoShort = getId("config-info-short");
let configInfoOcp = getId("config-info-ocp");
let configInfoUvp = getId("config-info-uvp");
let configInfoOvp = getId("config-info-ovp");
let configInfoRevOcp = getId("config-info-revocp");
let configInfoOtp = getId("config-info-otp");


let gpo1Button = getId("GPO1");
let gpo2Button = getId("GPO2");




