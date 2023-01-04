

// values for calculation of wh/km and therefore also range
let drivenDistanceOffset = -1;
let usedEnergyOffset;




let bleInlineDataPacket = [];
let dataLoggingBufferInline = [];
let maxInlineValueBuffer = [];
let inlineTempBuffer = [];


let inlineDataloggingAveragingBuffer = [];

let lastInlineLoggingDataTimeStamp = Date.now();
let inlineHertzSampleBuffer = [];


function processInlineData(data){
    let d = new Date();
    let stamp = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
    let ms_today = (d.getHours() - 2) * 60 * 60 * 1000 + d.getMinutes() * 60 * 1000 + d.getSeconds() * 1000 + d.getMilliseconds();

    let values = {
        speed: handleSignedBullshit(((data.getUint8(2) << 8) | data.getUint8(1))) * 0.036,
        rpm: ((data.getUint8(4) << 8) | data.getUint8(3)),
        motorTemp: cap((-handleSignedBullshit(((data.getUint8(6) << 8) | data.getUint8(5))) / 10), -50, 200),
        integratedTemp: cap((-handleSignedBullshit(((data.getUint8(8) << 8) | data.getUint8(7))) / 10), -50, 200),
        tripOdo: (((data.getUint8(12) << 24) | (data.getUint8(11) << 16) | (data.getUint8(10) << 8) | data.getUint8(9))),
        vehicleOdo: (((data.getUint8(16) << 24) | (data.getUint8(15) << 16) | (data.getUint8(14) << 8) | data.getUint8(13))),
        calibPulseCount: handleSignedBullshit(((data.getUint8(18) << 8) | data.getUint8(17)))
    };


    inlineConfigPulseData(values.calibPulseCount);

    let inlineLoggingDataInterval = Date.now() - lastInlineLoggingDataTimeStamp;
    lastInlineLoggingDataTimeStamp = Date.now();
    if(inlineLoggingDataInterval < 25){
        console.log("dropped tacho");
        return;
    }


    inlineHertzSampleBuffer.push([
        lastInlineLoggingDataTimeStamp
    ]);
    inlineHertzSampleBuffer.forEach((element) => {
        if(element[0] + 1000 < Date.now()){
            const index = inlineHertzSampleBuffer.indexOf(element);
            if (index > -1) { // only splice array when item is found
                inlineHertzSampleBuffer.splice(index, 1); // 2nd parameter means remove one item only
            }
        }
    });

    document.getElementById("tacho-hz").innerHTML = "T: " +  inlineHertzSampleBuffer.length + "Hz";



    bleInlineDataPacket = [
        ms_today,
        stamp,
        values.speed,
        values.rpm,
        values.motorTemp,
        values.integratedTemp,
        values.tripOdo,
        values.vehicleOdo
    ]

    // pfusch
    if(values.speed > 150){
        values.speed = 0;
        values.rpm = 0;
    }else {
        if (inlineDataloggingAveragingBuffer.unshift(bleInlineDataPacket) > 10) {
            inlineDataloggingAveragingBuffer.pop();
        }
        if (inlineTempBuffer.unshift(bleInlineDataPacket) > 40) {
            inlineTempBuffer.pop();
        }
    }


    setInlineTempValues({
        motor: averagedArray(inlineTempBuffer, 1)[4],
        extern: averagedArray(inlineTempBuffer, 1)[5]
    });

    setTachoGauges({
        tripOdo: values.tripOdo,
        vehicleOdo: values.vehicleOdo
    });

    // kinda pfusch for the wh/km and range calculation
    if(drivenDistanceOffset === -1){
        if(bleBMSConnected){
            drivenDistanceOffset = (values.tripOdo / 1000); // in meters

            usedEnergyOffset = usedEnergy1 + usedEnergy2 + usedEnergy3;
        }
    }

    if(bleBMSConnected){
        // distance driven in the session
        // in meters
        let drivenDistanceSession = (values.tripOdo / 1000) - drivenDistanceOffset;
        // in mWh
        let energyUsedSession = ((usedEnergy1 + usedEnergy2 + usedEnergy3) - usedEnergyOffset) / 3.6;

        // wh/km for the whole session
        let sessionEconomy = energyUsedSession / drivenDistanceSession;

        let range = -(remainingEnergy1 + remainingEnergy2 + remainingEnergy3) / sessionEconomy;

        setEconomyGauges({
            whkmSession: sessionEconomy,
            range: range
        });
    }


    setSpeedGaugeValues(averagedArray(inlineDataloggingAveragingBuffer, 1));


    let maxInlineValueInfo = [
        parseFloat(averagedArray(inlineDataloggingAveragingBuffer, 1)[2]),
        values.motorTemp,
        values.integratedTemp

    ];
    if (maxInlineValueBuffer.unshift(maxInlineValueInfo) > 1000) {
        maxInlineValueBuffer.pop();
    }

    let speedsArray = [];
    let motorTempArray = [];
    let externTempArray = [];

    maxInlineValueBuffer.forEach((sample) => {
        if(!isNaN(parseFloat(sample[0]))){
            speedsArray.unshift(parseFloat(sample[0]));
        }
        if(!isNaN(parseFloat(sample[1]))){
            motorTempArray.unshift(parseFloat(sample[1])).toFixed(1);
        }
        if(!isNaN(parseFloat(sample[2]))){
            externTempArray.unshift(parseFloat(sample[2])).toFixed(1);
        }
    });

    setInlineMaxValues({
        speed: Math.max(...speedsArray),
        motorTemp: Math.max(...motorTempArray).toFixed(1),
        externTemp: Math.max(...externTempArray).toFixed(1),
    });





    if (dataLoggingEnabled && !bleBMSConnected) {

        let datastringInline = "";
        if (bleInlineConnected && bleInlineDataPacket !== []) {
            datastringInline = [
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
                bleInlineDataPacket[2], // speed
                bleInlineDataPacket[3], // rpm
                bleInlineDataPacket[4], // motorTemp
                bleInlineDataPacket[5], // integratedTemp
                bleInlineDataPacket[6], // tripOdo
            ].join(";");


            if (dataLoggingBufferInline.push(datastringInline) > 20) {
                dataLoggingBufferInline.push(""); // to add a newline on the end of a packet


                console.log(dataLoggingBufferInline.join("\r\n"));
                dataLoggingBufferInline = [""];
            }
        }
    }
}