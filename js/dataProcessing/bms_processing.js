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
let usedEnergyOffset1 = -1; // Watt hours
let usedEnergyOffset2 = -1; // Watt hours
let usedEnergyOffset3 = -1; // Watt hours

let remainingEnergy1 = 0; // Watt hours
let remainingEnergy2 = 0; // Watt hours
let remainingEnergy3 = 0; // Watt hours

let hertzSampleBuffer = [];








function processData(event) {
    let bmsLoggingPacket = gatherBMSData(event);

    // catch invalid / dropped packets
    if(typeof(bmsLoggingPacket) === "undefined"){
        return;
    }

    // always have the newest packet at the first index of the buffer
    bmsAveragingBuffer.unshift(bmsLoggingPacket);
    // delete all packets that are older than needed
    deleteOlderDataPackets(bmsAveragingBuffer, interfaceConfig.maxAveragingInterval)

    const averagedDataU = averagedData(getLastXSeconds(bmsAveragingBuffer, interfaceConfig.averagingIntervalU), 1);
    const averagedDataI = averagedData(getLastXSeconds(bmsAveragingBuffer, interfaceConfig.averagingIntervalI), 2);
    const averagedDataT = averagedData(getLastXSeconds(bmsAveragingBuffer, interfaceConfig.averagingIntervalT), 1);
    const averagedDataCalib = averagedData(getLastXSeconds(bmsAveragingBuffer, interfaceConfig.averagingIntervalT), 4);

    const averagedDataPLoss = averagedDataNumbers(getLastXSeconds(bmsAveragingBuffer, interfaceConfig.averagingIntervalT));


    // calculating further values

    let P_total = (bmsLoggingPacket.uOut / 1000 * (bmsLoggingPacket.i1 + bmsLoggingPacket.i2 + bmsLoggingPacket.i3)); // Power in kW

    let P_loss = (
        (averagedDataPLoss.u1 * averagedDataPLoss.i1) +
        (averagedDataPLoss.u1 * averagedDataPLoss.i1) +
        (averagedDataPLoss.u1 * averagedDataPLoss.i1) -
        (averagedDataPLoss.uOut * (averagedDataPLoss.i1 + averagedDataPLoss.i2 + averagedDataPLoss.i3))
    );



    let totalAmps = parseFloat(averagedDataI.i1) + parseFloat(averagedDataI.i2) + parseFloat(averagedDataI.i3);
    if(isNaN(totalAmps)){
        totalAmps = 0;
    }



    if(usedEnergyOffset1 === -1){
        usedEnergyOffset1 = bmsLoggingPacket.eU1;
    }
    if(usedEnergyOffset2 === -1){
        usedEnergyOffset2 = bmsLoggingPacket.eU2;
    }
    if(usedEnergyOffset2 === -1){
        usedEnergyOffset2 = bmsLoggingPacket.eU2;
    }




    // BATTERY SOC CALCULATION
    // _______________________________________

    let CellCount = configBuffer.battCellCount;
    let Capacity = configBuffer.battNomCapacity;

    let soc;
    if (remainingEnergy1 === 0 && (CellCount * 2.5 <= bmsLoggingPacket.u1 <= CellCount * 4.2)) {
        let cell_voltage = bmsLoggingPacket.u1 / CellCount;
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


    if (remainingEnergy2 === 0 && (CellCount * 2.5 <= bmsLoggingPacket.u2 <= CellCount * 4.2)) {
        let cell_voltage = bmsLoggingPacket.u2/CellCount;
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


    if (remainingEnergy3 === 0 && (CellCount * 2.5 <= bmsLoggingPacket.u3 <= CellCount * 4.2)) {
        let cell_voltage = bmsLoggingPacket.u3/CellCount;
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

    let SOC_1 = 100 * ((remainingEnergy1 - ((bmsLoggingPacket.eU1 - usedEnergyOffset1) / 3600)) / ((Capacity / 1000) * CellCount * 3.7));
    let SOC_2 = 100 * ((remainingEnergy2 - ((bmsLoggingPacket.eU2 - usedEnergyOffset2) / 3600)) / ((Capacity / 1000) * CellCount * 3.7));
    let SOC_3 = 100 * ((remainingEnergy3 - ((bmsLoggingPacket.eU3 - usedEnergyOffset3) / 3600)) / ((Capacity / 1000) * CellCount * 3.7));

    if (bmsLoggingPacket.u1 < CellCount * 2.5) {
        SOC_1 = 0
    }
    if (bmsLoggingPacket.u2 < CellCount * 2.5) {
        SOC_2 = 0
    }
    if (bmsLoggingPacket.u3 < CellCount * 2.5) {
        SOC_3 = 0
    }



    let minSOC = 100;
    if(((configBuffer.boardEnabledChannels & 1) === 1) && SOC_1 < minSOC){minSOC = SOC_1}
    if(((configBuffer.boardEnabledChannels & 2) === 2) && SOC_2 < minSOC){minSOC = SOC_2}
    if(((configBuffer.boardEnabledChannels & 4) === 4) && SOC_3 < minSOC){minSOC = SOC_3}


    let usedEnergyTotal = (bmsLoggingPacket.eU1 - usedEnergyOffset1) + (bmsLoggingPacket.eU2 - usedEnergyOffset2) + (bmsLoggingPacket.eU3 - usedEnergyOffset3);


    //_________________________________________________



    const bmsCalculatedDataPacket = {
        iTotal: totalAmps,
        pTotal: P_total,
        pLoss: P_loss,
        energyUsed: {
            combined: usedEnergyTotal,
            ch1: (bmsLoggingPacket.eU1 - usedEnergyOffset1),
            ch2: (bmsLoggingPacket.eU2 - usedEnergyOffset2),
            ch3: (bmsLoggingPacket.eU3 - usedEnergyOffset3)
        },
        soc: {
            ch1: SOC_1,
            ch2: SOC_2,
            ch3: SOC_3,
            min: minSOC
        }
    };



    let maxValueInfo = [
        totalAmps,
        bmsLoggingPacket.uOut,
        P_total,
        bmsLoggingPacket.tShunt,
        bmsLoggingPacket.tPch
    ];

    if (maxValueBuffer.unshift(maxValueInfo) > 300) {
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







    /*
        setting gui elements
     */

    setBMSState(bmsLoggingPacket.stateMachineState);
    handleTurnOnTd(bmsLoggingPacket.stateMachineState);
    handleConfigWarningButtons(bmsLoggingPacket.stateMachineState);


    setChannelVoltageInfo(averagedDataU);
    setChannelCurrentInfo(averagedDataI);

    setBMSTempValues(averagedDataT);

    setBMSMaxValues({
        power: Math.max(...powersArray).toFixed(2),
        current: Math.max(...currentsArray),
        voltage: Math.min(...voltagesArray).toFixed(2),
        shuntTemp: Math.max(...shuntTempArray).toFixed(1),
        prechargeTemp: Math.max(...prechargeTempArray).toFixed(1)
    });

    setBMSCalculatedValues(bmsCalculatedDataPacket);


    setCalibActualValues(averagedDataCalib);








    if (dataLoggingEnabled) {

        let dataStringBoard = "";
        let dataStringInline = "";

        if(bleBMSConnected){
            let d = new Date();
            let stamp = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
            let ms_today = (d.getHours() - 2) * 60 * 60 * 1000 + d.getMinutes() * 60 * 1000 + d.getSeconds() * 1000 + d.getMilliseconds();

            let boardData = [
                bmsLoggingPacket.packageSequenceNumber,
                ms_today,
                stamp,
                bmsLoggingPacket.u1,
                bmsLoggingPacket.u2,
                bmsLoggingPacket.u3,
                bmsLoggingPacket.uOut,
                bmsLoggingPacket.i1,
                bmsLoggingPacket.i2,
                bmsLoggingPacket.i3,
                bmsLoggingPacket.tShunt,
                bmsLoggingPacket.tPch
            ];

            dataStringBoard = boardData.join(";") + ";;;;;";


            if (dataLoggingBufferBMS.push(dataStringBoard) > 20) {
                dataLoggingBufferBMS.push("");


                dataLoggingBufferBMS = [""];
            }
        }


        if(bleInlineConnected && bleInlineDataPacket !== []){
            dataStringInline = [
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


            if (dataLoggingBufferInline.push(dataStringInline) > 20) {

                dataLoggingBufferBMS.push("");

                dataLoggingBufferInline = [""];
            }
        }
    }
}

