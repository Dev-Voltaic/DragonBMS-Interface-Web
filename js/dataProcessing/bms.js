let configBuffer;

let averagingBuffer = [];
let averagingBufferV = [];
let averagingBufferA = [];
let averagingBufferT = [];
let dataLoggingBufferBMS = [];
let dataLoggingFileName = "";

let maxValueBuffer = [];

let bleBMSConnected = false;


let lastLoggingDataTimeStamp = Date.now();
let usedEnergy1 = 0; // Watt hours
let usedEnergy2 = 0; // Watt hours
let usedEnergy3 = 0; // Watt hours

let usedEnergyBuffer = [];

let remainingEnergy1 = 0; // Watt hours
let remainingEnergy2 = 0; // Watt hours
let remainingEnergy3 = 0; // Watt hours


let stateMachineStateBuffer;

let hertzSampleBuffer = [];








function processData(event) {
    let value = event.target.value;

    if(value.byteLength === 0){
        console.console.log("Something wrong with incoming BLE Data!");
        return;
    }

    let loggingDataInterval = Date.now() - lastLoggingDataTimeStamp;
    lastLoggingDataTimeStamp = Date.now();

    let packetSequenceNumber = (value.getUint8(2) << 8) | value.getUint8(1);

    if(loggingDataInterval < configBuffer.dataloggingUpdateInterval * 0.5){
        console.log("dropped");
        return;
    }


    hertzSampleBuffer.push([
        packetSequenceNumber,
        lastLoggingDataTimeStamp
    ]);
    hertzSampleBuffer.forEach((element) => {
        if(element[1] + 1000 < Date.now()){
            const index = hertzSampleBuffer.indexOf(element);
            if (index > -1) { // only splice array when item is found
                hertzSampleBuffer.splice(index, 1); // 2nd parameter means remove one item only
            }
        }
    });

    document.getElementById("bms-hz").innerHTML = "BMS-Hz: " +  hertzSampleBuffer.length + " /" + (1000/configBuffer.dataloggingUpdateInterval).toFixed(1);


    let V_Strang1 = (((value.getUint8(10) << 8) | value.getUint8(9)) / 100);
    let V_Strang2 = (((value.getUint8(12) << 8) | value.getUint8(11)) / 100);
    let V_Strang3 = (((value.getUint8(14) << 8) | value.getUint8(13)) / 100);
    let V_Out = (((value.getUint8(16) << 8) | value.getUint8(15)) / 100);

    let A_Strang1 = (handleSignedBullshit((value.getUint8(4) << 8) | value.getUint8(3)) / 100);
    let A_Strang2 = (handleSignedBullshit((value.getUint8(6) << 8) | value.getUint8(5)) / 100);
    let A_Strang3 = (handleSignedBullshit((value.getUint8(8) << 8) | value.getUint8(7)) / 100);

    let shuntTemp = ((value.getUint8(18) << 8) | value.getUint8(17)) / 10;
    let prechargeTemp = ((value.getUint8(20) << 8) | value.getUint8(19)) / 10;

    shuntTemp = cap(shuntTemp, -50, 200);
    prechargeTemp = cap(prechargeTemp, -50, 200);

    let stateMachineState = value.getUint8(21);
    stateMachineStateBuffer = stateMachineState;
    if (stateMachineState === 0) stateMachineState = "Startup"
    else if (stateMachineState === 1) stateMachineState = "Precharging..."
    else if (stateMachineState === 2) stateMachineState = "Ready"
    else if (stateMachineState === 3) stateMachineState = "Operation"
    else if (stateMachineState === 4) stateMachineState = "Fault"
    else stateMachineState = "UNDEFINED STATE!"

    handleTurnOnTd(stateMachineStateBuffer);


    let energyUsed1 = handleSignedBullshit32((((value.getUint8(25) << 24) | (value.getUint8(24) << 16)) | (value.getUint8(23) << 8)) | (value.getUint8(22)));
    let energyUsed2 = handleSignedBullshit32((((value.getUint8(29) << 24) | (value.getUint8(28) << 16)) | (value.getUint8(27) << 8)) | (value.getUint8(26)));
    let energyUsed3 = handleSignedBullshit32((((value.getUint8(33) << 24) | (value.getUint8(32) << 16)) | (value.getUint8(31) << 8)) | (value.getUint8(30)));



    let W_Strang1 = (V_Strang1 * A_Strang1);
    let W_Strang2 = (V_Strang2 * A_Strang2);
    let W_Strang3 = (V_Strang3 * A_Strang3);

    let totalPower = (V_Out / 1000 * (A_Strang1 + A_Strang2 + A_Strang3));

    let totalAmps = (parseFloat(averagedArray(averagingBufferA, 2)[0]) +
        parseFloat(averagedArray(averagingBufferA, 2)[1]) +
        parseFloat(averagedArray(averagingBufferA, 2)[2]));
    if(isNaN(totalAmps)){
        totalAmps = 0;
    }

    let P_loss = (
        ((V_Strang1 * A_Strang1) +
            (V_Strang2 * A_Strang2) +
            (V_Strang3 * A_Strang3)) -
        (V_Out * (A_Strang1 + A_Strang2 + A_Strang3))
    ).toFixed(1);


    let CellCount = configBuffer.battCellCount;
    let Capacity = configBuffer.battNomCapacity;



    // _______________________________________


    if (remainingEnergy1 === 0 && (CellCount * 2.5 <= V_Strang1 <= CellCount * 4.2)) {
        let cell_voltage = V_Strang1/CellCount;
        /*
        let soc;
        if(cell_voltage > 3.5){
            soc = -25.54 * cell_voltage ** 5 + 488.74 * cell_voltage ** 4 - 3736 * cell_voltage ** 3 + 14258 * cell_voltage ** 2 - 27164 * cell_voltage + 20664;

            //soc = -8.09 * 0.001 * x ** 9 + 5.44 * 0.01 * x ** 8 + 7.77 * 0.01 ** 7 + 1.82 * x ** 6 - 3.2 * x ** 5 + 84.1 * x ** 4 + 393 * x ** 3 - 2400 * x ** 2 + 3770 * x - 1380
        }else{
            soc =  11.171*cell_voltage**4 - 168.65*cell_voltage**3 + 952.15*cell_voltage**2 - 2381.2*cell_voltage + 2225.1;
        }
         */
        // temporary
        soc = (cell_voltage - 3) / 1.2;
        remainingEnergy1 = soc * (Capacity / 1000) * (CellCount * 3.7);
    }


    if (remainingEnergy2 === 0 && (CellCount * 2.5 <= V_Strang2 <= CellCount * 4.2)) {
        let cell_voltage = V_Strang2/CellCount;
        /*
        let soc;
        if(cell_voltage > 3.5){
            soc = -25.54*cell_voltage**5 + 488.74*cell_voltage**4 - 3736*cell_voltage**3 + 14258*cell_voltage**2 - 27164*cell_voltage + 20664;
        }else{
            soc =  11.171*cell_voltage**4 - 168.65*cell_voltage**3 + 952.15*cell_voltage**2 - 2381.2*cell_voltage + 2225.1;
        }
         */
        // temporary
        soc = (cell_voltage - 3) / 1.2;
        remainingEnergy2 = soc * (Capacity / 1000) * (CellCount * 3.7);
    }


    if (remainingEnergy3 === 0 && (CellCount * 2.5 <= V_Strang3 <= CellCount * 4.2)) {
        let cell_voltage = V_Strang3/CellCount;
        /*
        let soc;
        if(cell_voltage > 3.5){
            soc = -25.54*cell_voltage**5 + 488.74*cell_voltage**4 - 3736*cell_voltage**3 + 14258*cell_voltage**2 - 27164*cell_voltage + 20664;
        }else{
            soc =  11.171*cell_voltage**4 - 168.65*cell_voltage**3 + 952.15*cell_voltage**2 - 2381.2*cell_voltage + 2225.1;
        }
        */
        // temporary
        soc = (cell_voltage - 3) / 1.2;
        remainingEnergy3 = soc * (Capacity / 1000) * (CellCount * 3.7);
    }

    let SOC_1 = 100 * ((remainingEnergy1 - (usedEnergy1 / 3600)) / ((Capacity / 1000) * CellCount * 3.7));
    let SOC_2 = 100 * ((remainingEnergy2 - (usedEnergy2 / 3600)) / ((Capacity / 1000) * CellCount * 3.7));
    let SOC_3 = 100 * ((remainingEnergy3 - (usedEnergy3 / 3600)) / ((Capacity / 1000) * CellCount * 3.7));

    if (V_Strang1 < CellCount * 2.5) {
        SOC_1 = 0
    }
    if (V_Strang2 < CellCount * 2.5) {
        SOC_2 = 0
    }
    if (V_Strang3 < CellCount * 2.5) {
        SOC_3 = 0
    }

    let minSOC = 100;
    if(((configBuffer.boardEnabledChannels & 1) === 1) && SOC_1 < minSOC){minSOC = SOC_1}
    if(((configBuffer.boardEnabledChannels & 2) === 2) && SOC_2 < minSOC){minSOC = SOC_2}
    if(((configBuffer.boardEnabledChannels & 4) === 4) && SOC_3 < minSOC){minSOC = SOC_3}


    usedEnergy1 += W_Strang1 * (loggingDataInterval / 1000);
    usedEnergy2 += W_Strang2 * (loggingDataInterval / 1000);
    usedEnergy3 += W_Strang3 * (loggingDataInterval / 1000);


    let usedEnergyTotal = usedEnergy1 + usedEnergy2 + usedEnergy3;


    //_________________________________________________


    setBMSState(stateMachineState);


    setBatteryType(CellCount);

    setBMSTempValues({
        shunt: averagedArray(averagingBufferT, 1)[0],
        precharge: averagedArray(averagingBufferT, 1)[1]
    });

    setWattPlossTextVal(averagedArray(averagingBufferT, 1)[2]);

    setAmpTextVal(totalAmps.toFixed(1));


    setEnergyUsedVals({
        combined: usedEnergyTotal,
        ch1: usedEnergy1,
        ch2: usedEnergy2,
        ch3: usedEnergy3
    });
    setSOCVals({
        ch1: SOC_1,
        ch2: SOC_2,
        ch3: SOC_3,
        min: minSOC
    });


    let channelInfo = [
        V_Strang1.toFixed(1),
        V_Strang2.toFixed(1),
        V_Strang3.toFixed(1),
        A_Strang1.toFixed(2),
        A_Strang2.toFixed(2),
        A_Strang3.toFixed(2),
        V_Out.toFixed(1)
    ];
    let channelInfoV = [
        V_Strang1,
        V_Strang2,
        V_Strang3,
        V_Out
    ];
    let channelInfoA = [
        A_Strang1,
        A_Strang2,
        A_Strang3,
        totalPower
    ];
    let channelInfoT = [
        shuntTemp.toFixed(1),
        prechargeTemp.toFixed(1),
        P_loss
    ];
    let maxValueInfo = [
        totalAmps,
        V_Out,
        totalPower,
        shuntTemp,
        prechargeTemp
    ];


    // is null when moving the dev tile
    if (document.getElementById("autoprecharge") !== null) {
        // pfusch for franz
        if (prechargeEnabled) {
            if (prechargeTemp > 75 && currentPrechargeValue !== 0) {
                prechargeControlCharacteristic.writeValueWithoutResponse(Uint8Array.from([0]).buffer);
                currentPrechargeValue = 0;
            }
            if (prechargeTemp <= 75 && currentPrechargeValue !== parseInt(document.getElementById("prechargePWMInput").value)) {
                prechargeControlCharacteristic.writeValueWithoutResponse(Uint8Array.from([
                    parseInt(document.getElementById("prechargePWMInput").value)
                ]).buffer);
                currentPrechargeValue = parseInt(document.getElementById("prechargePWMInput").value);
            }
            if (currentPrechargeValue === 0) {
                document.getElementById("autoprecharge").style.color = "red";
            } else {
                document.getElementById("autoprecharge").style.color = "green";
            }
        } else {
            document.getElementById("autoprecharge").style.color = "yellow";
        }

        document.getElementById("autoprecharge").innerHTML = "current precharge value: " + currentPrechargeValue;


    }


    if (averagingBuffer.unshift(channelInfo) > 4) {
        averagingBuffer.pop();
    }
    if (averagingBufferV.unshift(channelInfoV) > 8) {
        averagingBufferV.pop();
    }
    if (averagingBufferA.unshift(channelInfoA) > 4) {
        averagingBufferA.pop();
    }
    if (averagingBufferT.unshift(channelInfoT) > 10) {
        averagingBufferT.pop();
    }
    if (maxValueBuffer.unshift(maxValueInfo) > 300) {
        maxValueBuffer.pop();
    }


    if (usedEnergyBuffer[-1]) {
        maxValueBuffer.pop();
    }

    let powersArray = [];
    let currentsArray = [];
    let voltagesArray = [];
    let prechargeTempArray = [];
    let shuntTempArray = [];

    maxValueBuffer.forEach((sample) => {
        currentsArray.unshift(parseFloat(sample[0]).toFixed(1));
        voltagesArray.unshift(sample[1]);
        powersArray.unshift(sample[2]);
        shuntTempArray.unshift(sample[3]);
        prechargeTempArray.unshift(sample[4]);
    });

    setBMSMaxValues({
        power: Math.max(...powersArray).toFixed(2),
        current: Math.max(...currentsArray),
        voltage: Math.min(...voltagesArray).toFixed(2),
        shuntTemp: Math.max(...shuntTempArray).toFixed(1),
        prechargeTemp: Math.max(...prechargeTempArray).toFixed(1)
    });

    setBMSTempValues({
        shunt: averagedArray(averagingBufferT, 1)[0],
        precharge: averagedArray(averagingBufferT, 1)[1]
    });

    setChannelInfo(averagedArray(averagingBufferV, 1).concat(averagedArray(averagingBufferA, 2)));

    setCalibActualValues(averagedArray(averagingBuffer, 3));

    if (dataLoggingEnabled) {

        let datastringBoard = "";
        let datastringInline = "";

        if(bleBMSConnected){
            let d = new Date();
            let stamp = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
            let ms_today = (d.getHours() - 2) * 60 * 60 * 1000 + d.getMinutes() * 60 * 1000 + d.getSeconds() * 1000 + d.getMilliseconds();

            let boardData = [
                packetSequenceNumber,
                ms_today,
                stamp,
                V_Strang1,
                V_Strang2,
                V_Strang3,
                V_Out,
                A_Strang1,
                A_Strang2,
                A_Strang3,
                shuntTemp,
                prechargeTemp
            ];

            datastringBoard = boardData.join(";") + ";;;;;";


            if (dataLoggingBufferBMS.push(datastringBoard) > 20) {
                dataLoggingBufferBMS.push("");

                contextBridge.send("save-logging-data", [dataLoggingFileName, dataLoggingBufferBMS.join("\r\n")]);
                dataLoggingBufferBMS = [""];
            }
        }


        if(bleInlineConnected && bleInlineDataPacket !== []){
            datastringInline = [
                "", // to be packet sequence number
                bleInlineDataPacket[0], // ms_today
                bleInlineDataPacket[1], // stamp
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                bleInlineDataPacket[2], // speed
                bleInlineDataPacket[3], // rpm
                bleInlineDataPacket[4], // motorTemp
                bleInlineDataPacket[5], // integratedTemp
                bleInlineDataPacket[6], // tripOdo
            ].join(";");


            if (dataLoggingBufferInline.push(datastringInline) > 20) {

                dataLoggingBufferBMS.push("");

                contextBridge.send("save-logging-data", [dataLoggingFileName, dataLoggingBufferInline.join("\r\n")]);
                dataLoggingBufferInline = [""];
            }
        }
    }
}

