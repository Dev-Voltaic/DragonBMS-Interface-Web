
// helper function for waiting until a condition is met
function until(conditionFunction) {
    const poll = resolve => {
        if (conditionFunction()) resolve();
        else setTimeout(_ => poll(resolve), 100);
    }

    return new Promise(poll);
}







/*
    Stuff for the Config/Calib and Datalogging Data that is split into bytes
 */



function to16bit(number){
    if(number >= 65536){
        return;
    }
    let lsb = number % 256;
    let msb = Math.floor(number / 256);

    return [lsb, msb];
}


// the notorious handleSignedBullshit
function handleSignedBullshit(input) {
    if (input > Math.pow(2, 15)) {
        return Math.pow(2, 16) - input;
    }
    return -input;
}

function handleSignedBullshit32(input) {
    if (input > Math.pow(2, 31)) {
        return Math.pow(2, 32) - input;
    }
    return -input;
}

function handleSignedBullshit64(input) {
    if (input > Math.pow(2, 63)) {
        return Math.pow(2, 64) - input;
    }
    return -input;
}


function getId(id){
    return document.getElementById(id);
}
function getIdValue(id) {
    return document.getElementById(id).value;
}

function getIdChecked(id) {
    return document.getElementById(id).checked;
}

function setValueBacktoBoundaries(id, min, max) {
    let element = document.getElementById(id);
    let v = parseFloat(element.value);
    if (v < min) {
        element.value = min;
        element.style.color = "red";
        return;
    }
    if (v > max) {
        element.value = max;
        element.style.color = "red";
        return;
    }
    element.style.color = "";
}



function mobileDevice(){
    return /Android|iPhone/i.test(navigator.userAgent);
}

let isChrome = false;
if(typeof(window) !== "undefined"){
    isChrome = !!window.chrome;
}


// function for capping a value between two numbers
const mod = (n, m) => (m + n % m) % m;
const cap = (value, low, high) => low + mod(value - low, high - low + 1);




// tells if the device has a touchscreen
function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0));
}












function averagedArray(array, averaging) {
    let summedArray = [];
    let averageArray = [];
    array.forEach(sub => {
        sub.map(Number).forEach((num, index) => {
            if(summedArray[index]){
                summedArray[index] += num;
            }else{
                summedArray[index] = num;
            }
        });
    });
    summedArray.forEach(sum => {
        averageArray.push((sum / array.length).toFixed(averaging));
    });
    return averageArray;
}


function averagedData(array, rounding) {
    // safety, kids!
    if(array.length === 0){
        return;
    }

    // copy array keys and values
    // {... original} = copy (copy by value - not by reference)
    let summedDataPacket = {... array[0]};
    // set all values to 0
    for (const [key, _] of Object.entries(summedDataPacket)) {
        summedDataPacket[key] = 0;
    }

    // loop through all data packets and add their values up in the summed data packet
    array.forEach(dataPacket => {
        console.log(dataPacket);
        for (const [key, value] of Object.entries(dataPacket)) {
            summedDataPacket[key] = summedDataPacket[key] + value;
        }
    });

    console.log(summedDataPacket);

    // copy array keys and values
    let averagedArray = {... array[0]};
    // set values for keys to averaged values rounded via.toFixed
    for (const [key, _] of Object.entries(averagedArray)) {
        averagedArray[key] = ((summedDataPacket[key] / array.length).toFixed(rounding));
    }
    return averagedArray[0];
}

function averagedDataNumbers(array) {
    // safety, kids!
    if(array.length === 0){
        return;
    }

    // copy array keys and values
    // {... original} = copy (copy by value - not by reference)
    let summedDataPacket = {... array[0]};
    // set all values to 0
    for (const [key, _] of Object.entries(summedDataPacket)) {
        summedDataPacket[key] = 0;
    }

    // loop through all data packets and add their values up in the summed data packet
    array.forEach(dataPacket => {
        console.log(dataPacket);
        for (const [key, value] of Object.entries(dataPacket)) {
            summedDataPacket[key] = summedDataPacket[key] + value;
        }
    });

    console.log(summedDataPacket);

    // copy array keys and values
    let averagedArray = {... array[0]};
    // set values for keys to averaged values rounded via.toFixed
    for (const [key, _] of Object.entries(averagedArray)) {
        averagedArray[key] = (summedDataPacket[key] / array.length);
    }
    return averagedArray[0];
}



function getLastXSeconds(array, seconds){
    let now = Date.now();
    return array.filter((element) => {
        return element.time > (now - 1000 * seconds);
    });
}



function deleteOlderDataPackets(buffer, time){
    if(buffer[-1].time < (time * 1000)){
        buffer.pop();
        deleteOlderDataPackets(buffer, time);
    }
}