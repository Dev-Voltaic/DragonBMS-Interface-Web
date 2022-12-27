
// BUTTONS AND SUCH

let precharge_button_div = document.getElementById("precharge-checkbox-template");
let precharge_button = document.getElementById("precharge-button");


let channel1_button = document.getElementById("ch1control-on");
let channel2_button = document.getElementById("ch2control-on");
let channel3_button = document.getElementById("ch3control-on");


// CLEAR ALERTS AND TURN ON/OFF
let clearAlertsButton = document.getElementById("clearAlertsButton");
let clearAlertsTd = document.getElementById("clearAlertsTd");
let turnOnTd = document.getElementById("switchOnTd");
let clearAlertsFaultName = document.getElementById("clearAlerts-fault-name");
let clearAlertsFaultExplanation = document.getElementById("clearAlerts-fault-explanation");


let elementsDiv = document.getElementById("elementsDiv");


// NO DEVICES CONNECTED OVERLAY

let connectLastDeviceButton = document.getElementById('autoconnectBMS');
let connectLastInlineButton = document.getElementById('autoconnectInline');

let connectLastInlineOverlay = document.getElementById("connectLastInlineButton");


let autoconnectingBMSText = document.getElementById("autoconnectingBMSText");
let autoconnectBMSText = document.getElementById("autoconnectBMSText");

let autoconnectingTachoText = document.getElementById("autoconnectingTachoText");
let autoconnectTachoText = document.getElementById("autoconnectTachoText");

let nothingConnectedOverlay = document.getElementById("nothingConnectedOverlay");


let inlineGauge = document.getElementById("inline-gauge");
let inlineGaugeTd = document.getElementById("inline-gauge-td");

// INFO ELEMENTS (TEXTS)


// Combined / mobile
let outputVoltageValue = document.getElementById("output-voltage");
let shuntTempValue = document.getElementById("shunt-temperature");
let prechargeTempValue = document.getElementById("precharge-temperature");
let motorTempValue = document.getElementById("motor-temperature");
let externTempValue = document.getElementById("extern-temperature");
let combinedCurrentValue = document.getElementById("combined-current");
let boardPowerlossValue = document.getElementById("board-powerloss");
let combinedPowerValue = document.getElementById("combined-power");
let combinedEnergyUsedValue = document.getElementById("combined-energy-used");
let combinedEnergyUsedValue2 = document.getElementById("combined-energy-used2");

let onTimeValue = document.getElementById("ontime");

let rangeValue = document.getElementById("sessionRangeValue");
let sessionEconomyValue = document.getElementById("sessionEconomyValue");
let resetEconomyButton = document.getElementById("resetEconomyButton");


// 3 Strands Info
let ch1InfoVoltage = document.getElementById("ch1info-v");
let ch1InfoSOC = document.getElementById("ch1info-soc");
let ch1InfoBatteryType = document.getElementById("ch1info-t");
let ch1infoet = document.getElementById("ch1info-et");
let ch1InfoEnergyUsed = document.getElementById("ch1info-eu");

let ch2InfoVoltage = document.getElementById("ch2info-v");
let ch2InfoSOC = document.getElementById("ch2info-soc");
let ch2InfoBatteryType = document.getElementById("ch2info-t");
let ch2infoet = document.getElementById("ch2info-et");
let ch2InfoEnergyUsed = document.getElementById("ch2info-eu");

let ch3InfoVoltage = document.getElementById("ch3info-v");
let ch3InfoSOC = document.getElementById("ch3info-soc");
let ch3InfoBatteryType = document.getElementById("ch3info-t");
let ch3infoet = document.getElementById("ch3info-et");
let ch3InfoEnergyUsed = document.getElementById("ch3info-eu");


let minSOCValue = document.getElementById("min-soc");



let boardElements = document.getElementsByClassName("board-element");



// bms & fault states
let bmsStateValue = document.getElementById("state-machine-state");
let faultStateValue = document.getElementById("fault-state");


let turnOnButton = document.getElementById("turnOnButton");



// Max values
let maxSpeedValue = document.getElementById("max-speed");
let maxPowerValue = document.getElementById("max-power");
let maxCurrentValue = document.getElementById("max-amp-big-val");
let minVoltValue = document.getElementById("min-volt-big-val");

let maxPrechargeTemp = document.getElementById("maxPrechargeTemp");
let maxShuntTemp = document.getElementById("maxShuntTemp");
let maxMotorTemp = document.getElementById("maxMotorTemp");
let maxExternTemp = document.getElementById("maxExternTemp");


// Channel Control Gauge
let ch1ControlCurrent = document.getElementById("ch1control-a");
let ch1ControlPower = document.getElementById("ch1control-p");
let ch2ControlCurrent = document.getElementById("ch2control-a");
let ch2ControlPower = document.getElementById("ch2control-p");
let ch3ControlCurrent = document.getElementById("ch3control-a");
let ch3ControlPower = document.getElementById("ch3control-p");

// Config Info Gauge
let configInfoStart = document.getElementById("config-info-startup");
let configInfoShort = document.getElementById("config-info-short");
let configInfoOcp = document.getElementById("config-info-ocp");
let configInfoUvp = document.getElementById("config-info-uvp");
let configInfoOvp = document.getElementById("config-info-ovp");
let configInfoRevOcp = document.getElementById("config-info-revocp");
let configInfoOtp = document.getElementById("config-info-otp");


let gpo1Button = document.getElementById("GPO1");
let gpo2Button = document.getElementById("GPO2");
