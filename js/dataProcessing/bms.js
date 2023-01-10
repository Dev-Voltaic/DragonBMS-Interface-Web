let configBuffer;

let bmsAveragingBuffer = [];

let averagingBuffer = [];
let averagingBufferV = [];
let averagingBufferA = [];
let averagingBufferT = [];
let dataLoggingBufferBMS = [];

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

    // FILTERING ALL INVALID DATA

    if(value.byteLength === 0){
        console.log("Something wrong with incoming BLE data!");
        return;
    }

    if(typeof configBuffer === 'undefined'){
        console.log("waiting for config to be read...");
        return;
    }

    let loggingDataInterval = Date.now() - lastLoggingDataTimeStamp;
    lastLoggingDataTimeStamp = Date.now();

    let packetSequenceNumber = (value.getUint8(2) << 8) | value.getUint8(1);

    if(loggingDataInterval < configBuffer.dataloggingUpdateInterval * 0.5){
        console.log("dropped");
        return;
    }



    // CALCULATING DATA PACKET RATE

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

    document.getElementById("bms-hz").innerHTML = "BMS: " +  hertzSampleBuffer.length + "Hz";



    // CONVERTING THE RAW DATA TO USABLE VALUES

    let U_Strand1_raw = (((value.getUint8(10) << 8) | value.getUint8(9)) / 100);
    let U_Strand2_raw = (((value.getUint8(12) << 8) | value.getUint8(11)) / 100);
    let U_Strand3_raw = (((value.getUint8(14) << 8) | value.getUint8(13)) / 100);
    let U_Out_raw = (((value.getUint8(16) << 8) | value.getUint8(15)) / 100);

    let I_Strand1_raw = (handleSignedBullshit((value.getUint8(4) << 8) | value.getUint8(3)) / 100);
    let I_Strand2_raw = (handleSignedBullshit((value.getUint8(6) << 8) | value.getUint8(5)) / 100);
    let I_Strand3_raw = (handleSignedBullshit((value.getUint8(8) << 8) | value.getUint8(7)) / 100);

    let shuntTemp_raw = ((value.getUint8(18) << 8) | value.getUint8(17)) / 10;
    let prechargeTemp_raw = ((value.getUint8(20) << 8) | value.getUint8(19)) / 10;

    let stateMachineState = value.getUint8(21);

    let energyUsed1_raw = handleSignedBullshit32((((value.getUint8(25) << 24) | (value.getUint8(24) << 16)) | (value.getUint8(23) << 8)) | (value.getUint8(22)));
    let energyUsed2_raw = handleSignedBullshit32((((value.getUint8(29) << 24) | (value.getUint8(28) << 16)) | (value.getUint8(27) << 8)) | (value.getUint8(26)));
    let energyUsed3_raw = handleSignedBullshit32((((value.getUint8(33) << 24) | (value.getUint8(32) << 16)) | (value.getUint8(31) << 8)) | (value.getUint8(30)));


    let bmsLoggingPacket = {
        time: lastLoggingDataTimeStamp,
        packageSequenceNumber: packetSequenceNumber,
        u1: U_Strand1_raw,
        u2: U_Strand2_raw,
        u3: U_Strand3_raw,
        uOut: U_Out_raw,
        i1: I_Strand1_raw,
        i2: I_Strand2_raw,
        i3: I_Strand3_raw,
        tShunt: shuntTemp_raw,
        tPch: prechargeTemp_raw,
        eU1: energyUsed1_raw,
        eU2: energyUsed2_raw,
        eU3: energyUsed3_raw
    };

    // always have the newest packet at the first index of the buffer
    // age ascending up until 500 samples ago
    if (bmsAveragingBuffer.unshift(bmsLoggingPacket) > 500) {
        bmsAveragingBuffer.pop();
    }


    // processing the data
    shuntTemp_raw = cap(shuntTemp_raw, -50, 200);
    prechargeTemp_raw = cap(prechargeTemp_raw, -50, 200);


    // calculating further values

    let P_Strand1 = (U_Strand1_raw * I_Strand1_raw);
    let P_Strand2 = (U_Strand2_raw * I_Strand2_raw);
    let P_Strand3 = (U_Strand3_raw * I_Strand3_raw);

    let P_total = (U_Out_raw / 1000 * (I_Strand1_raw + I_Strand2_raw + I_Strand3_raw));

    let P_loss = (
        P_Strand1 + P_Strand2 + P_Strand3 - (U_Out_raw * (I_Strand1_raw + I_Strand2_raw + I_Strand3_raw))
    ).toFixed(1);




    setBMSState(stateMachineState);
    handleTurnOnTd(stateMachineState);
    handleConfigWarningButtons(stateMachineState);


    let totalAmps = (parseFloat(averagedArray(averagingBufferA, 2)[0]) +
        parseFloat(averagedArray(averagingBufferA, 2)[1]) +
        parseFloat(averagedArray(averagingBufferA, 2)[2]));
    if(isNaN(totalAmps)){
        totalAmps = 0;
    }






    // BATTERY SOC CALCULATION
    // _______________________________________

    let CellCount = configBuffer.battCellCount;
    let Capacity = configBuffer.battNomCapacity;

    let soc;
    if (remainingEnergy1 === 0 && (CellCount * 2.5 <= U_Strand1_raw <= CellCount * 4.2)) {
        let cell_voltage = U_Strand1_raw / CellCount;
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


    if (remainingEnergy2 === 0 && (CellCount * 2.5 <= U_Strand2_raw <= CellCount * 4.2)) {
        let cell_voltage = U_Strand2_raw/CellCount;
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


    if (remainingEnergy3 === 0 && (CellCount * 2.5 <= U_Strand3_raw <= CellCount * 4.2)) {
        let cell_voltage = U_Strand3_raw/CellCount;
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

    if (U_Strand1_raw < CellCount * 2.5) {
        SOC_1 = 0
    }
    if (U_Strand2_raw < CellCount * 2.5) {
        SOC_2 = 0
    }
    if (U_Strand3_raw < CellCount * 2.5) {
        SOC_3 = 0
    }

    let minSOC = 100;
    if(((configBuffer.boardEnabledChannels & 1) === 1) && SOC_1 < minSOC){minSOC = SOC_1}
    if(((configBuffer.boardEnabledChannels & 2) === 2) && SOC_2 < minSOC){minSOC = SOC_2}
    if(((configBuffer.boardEnabledChannels & 4) === 4) && SOC_3 < minSOC){minSOC = SOC_3}


    usedEnergy1 += P_Strand1 * (loggingDataInterval / 1000);
    usedEnergy2 += P_Strand2 * (loggingDataInterval / 1000);
    usedEnergy3 += P_Strand3 * (loggingDataInterval / 1000);


    let usedEnergyTotal = usedEnergy1 + usedEnergy2 + usedEnergy3;


    //_________________________________________________


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
        U_Strand1_raw.toFixed(1),
        U_Strand2_raw.toFixed(1),
        U_Strand3_raw.toFixed(1),
        I_Strand1_raw.toFixed(2),
        I_Strand2_raw.toFixed(2),
        I_Strand3_raw.toFixed(2),
        U_Out_raw.toFixed(1)
    ];
    let channelInfoV = [
        U_Strand1_raw,
        U_Strand2_raw,
        U_Strand3_raw,
        U_Out_raw
    ];
    let channelInfoA = [
        I_Strand1_raw,
        I_Strand2_raw,
        I_Strand3_raw,
        P_total
    ];
    let channelInfoT = [
        shuntTemp_raw.toFixed(1),
        prechargeTemp_raw.toFixed(1),
        P_loss
    ];
    let maxValueInfo = [
        totalAmps,
        U_Out_raw,
        P_total,
        shuntTemp_raw,
        prechargeTemp_raw
    ];


    // is null when moving the dev tile
    if (document.getElementById("autoprecharge") !== null) {
        // pfusch for franz
        if (prechargeEnabled) {
            if (prechargeTemp_raw > 75 && currentPrechargeValue !== 0) {
                prechargeControlCharacteristic.writeValueWithoutResponse(Uint8Array.from([0]).buffer);
                currentPrechargeValue = 0;
            }
            if (prechargeTemp_raw <= 75 && currentPrechargeValue !== parseInt(document.getElementById("prechargePWMInput").value)) {
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
                U_Strand1_raw,
                U_Strand2_raw,
                U_Strand3_raw,
                U_Out_raw,
                I_Strand1_raw,
                I_Strand2_raw,
                I_Strand3_raw,
                shuntTemp_raw,
                prechargeTemp_raw
            ];

            datastringBoard = boardData.join(";") + ";;;;;";


            if (dataLoggingBufferBMS.push(datastringBoard) > 20) {
                dataLoggingBufferBMS.push("");


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

                dataLoggingBufferInline = [""];
            }
        }
    }
}

