// this file is only for testing purposes, don't mind it



let fs = require('fs');

// big secure, I know
eval(fs.readFileSync('small_functions.js')+'');

let bmsLoggingPacket1 = {
    time: Date.now(),
    packageSequenceNumber: 1,
    u1: 1,
    u2: 1,
    u3: 1,
    uOut: 2,
    i1: 3,
    i2: 3,
    i3: 3,
    tShunt: 45,
    tPch: 54,
    eU1: 0,
    eU2: 0,
    eU3: 0
};
let bmsLoggingPacket2 = {
    time: Date.now(),
    packageSequenceNumber: 2,
    u1: 0,
    u2: 0,
    u3: 0,
    uOut: 0,
    i1: 1,
    i2: 1,
    i3: 1,
    tShunt: 0,
    tPch: 0,
    eU1: 0,
    eU2: 0,
    eU3: 0
};

let bmsAveragingBuffer = [];
// always have the newest packet at the first index of the buffer
// age ascending up until 500 samples ago
if (bmsAveragingBuffer.unshift(bmsLoggingPacket1) > 500) {
    bmsAveragingBuffer.pop();
}
if (bmsAveragingBuffer.unshift(bmsLoggingPacket2) > 500) {
    bmsAveragingBuffer.pop();
}


// get both packets
let vals = getLastXSeconds(bmsAveragingBuffer, 10);

let result = averagedData(vals, 2);
console.log(result);