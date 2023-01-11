function gatherBMSData(event){
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
        eU3: energyUsed3_raw,
        stateMachineState: stateMachineState
    };

    return bmsLoggingPacket;
}