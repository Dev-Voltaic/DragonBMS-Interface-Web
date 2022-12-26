function to16bit(number){
    if(number >= 65536){
        return;
    }
    var lsb = number % 256;
    var msb = Math.floor(number / 256);

    return [lsb, msb];
}












/* BMS Config functions */


function getBMSConfigFromBuffer(buffer){
    return {
        // Battery stuff
        battCellCount: buffer.getUint8(0),
        battNomCapacity: (buffer.getUint8(2) << 8) | buffer.getUint8(1),
        //Protection stuff
        protMaxCellVoltage: (buffer.getUint8(4) << 8) | buffer.getUint8(3),
        protMinCellVoltage: (buffer.getUint8(6) << 8) | buffer.getUint8(5),
        protMaxCurrent: (buffer.getUint8(8) << 8) | buffer.getUint8(7),
        protMaxImbalanceCurrent: (buffer.getUint8(10) << 8) | buffer.getUint8(9),
        // Temperatures
        protMaxLogicTemp: buffer.getUint8(11),
        protMaxPowerTemp: buffer.getUint8(12),
        // Precharge stuff
        prechargeCurrentLimit: (buffer.getUint8(14) << 8) | buffer.getUint8(13),
        prechargeNomCapacity: (buffer.getUint8(16) << 8) | buffer.getUint8(15),
        // Datalogging stuff
        dataloggingUpdateInterval: (buffer.getUint8(18) << 8) | buffer.getUint8(17),
        // Board stuff
        boardAutoStart: buffer.getUint8(19),
        boardPoweroffTime: (buffer.getUint8(21) << 8) | buffer.getUint8(20),
        boardEnabledChannels: buffer.getUint8(22),
        boardUpdateCount: (buffer.getUint8(24) << 8) | buffer.getUint8(23),
        protMaxReverseCurrent: (buffer.getUint8(26) << 8) | buffer.getUint8(25),
    };
}

function getBMSBufferFromConfig(config){
    let configValues = [];

    //Battery stuff
    configValues[0] = parseInt(config.battCellCount);

    configValues[1] = to16bit(config.battNomCapacity)[0];
    configValues[2] = to16bit(config.battNomCapacity)[1];

    //Protection
    configValues[3] = to16bit(config.protMaxCellVoltage)[0];
    configValues[4] = to16bit(config.protMaxCellVoltage)[1];

    configValues[5] = to16bit(config.protMinCellVoltage)[0];
    configValues[6] = to16bit(config.protMinCellVoltage)[1];

    configValues[7] = to16bit(config.protMaxCurrent)[0];
    configValues[8] = to16bit(config.protMaxCurrent)[1];

    configValues[9] = to16bit(config.protMaxImbalanceCurrent)[0];
    configValues[10] = to16bit(config.protMaxImbalanceCurrent)[1];

    configValues[11] = parseInt(config.protMaxLogicTemp);

    configValues[12] = parseInt(config.protMaxPowerTemp);

    //Precharge
    configValues[13] = to16bit(config.prechargeCurrentLimit)[0];
    configValues[14] = to16bit(config.prechargeCurrentLimit)[1];

    configValues[15] = to16bit(config.prechargeNomCapacity)[0];
    configValues[16] = to16bit(config.prechargeNomCapacity)[1];

    //Datalogging
    configValues[17] = to16bit(config.dataloggingUpdateInterval)[0];
    configValues[18] = to16bit(config.dataloggingUpdateInterval)[1];

    //Board
    configValues[19] = (config.boardAutoStart);

    configValues[20] = to16bit(config.boardPoweroffTime)[0];
    configValues[21] = to16bit(config.boardPoweroffTime)[1];

    configValues[22] = parseInt(config.boardEnabledChannels);

    configValues[23] = to16bit(config.boardUpdateCount)[0];
    configValues[24] = to16bit(config.boardUpdateCount)[1];

    configValues[25] = to16bit(config.protMaxReverseCurrent)[0];
    configValues[26] = to16bit(config.protMaxReverseCurrent)[1];

    return configValues;
}


































/* Inline Board Config funcitons */




function getInlineConfigFromBuffer(buffer){
    return {
        // Temperature sensor stuff
        tempSensorType: buffer.getUint8(0),
        divider_r: (buffer.getUint8(2) << 8) | buffer.getUint8(1),
        ntc_r: (buffer.getUint8(4) << 8) | buffer.getUint8(3),
        ntc_b: (buffer.getUint8(6) << 8) | buffer.getUint8(5),
        impulses: (buffer.getUint8(8) << 8) | buffer.getUint8(7),
        reversed: buffer.getUint8(9),
        backwards_negative: buffer.getUint8(10),
        motor_poles: buffer.getUint8(11)
    };
}

function getInlineBufferFromConfig(config){
    let configValues = [];

    configValues[0] = parseInt(config.tempSensorType);

    configValues[1] = to16bit(config.divider_r)[0];
    configValues[2] = to16bit(config.divider_r)[1];

    configValues[3] = to16bit(config.ntc_r)[0];
    configValues[4] = to16bit(config.ntc_r)[1];

    configValues[5] = to16bit(config.ntc_b)[0];
    configValues[6] = to16bit(config.ntc_b)[1];

    configValues[7] = to16bit(config.impulses)[0];
    configValues[8] = to16bit(config.impulses)[1];

    configValues[9] = config.reversed;

    configValues[10] = config.backwards_negative;
    configValues[11] = config.motor_poles;

    return configValues;
}