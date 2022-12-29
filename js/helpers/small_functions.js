
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





// function for capping a value between two numbers
const mod = (n, m) => (m + n % m) % m;
const cap = (value, low, high) => low + mod(value - low, high - low + 1);




// tells if the device has a touchscreen
function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0));
}