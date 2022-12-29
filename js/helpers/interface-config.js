

// adjust the interface according to config values
function updateConfig(){
    let lastDarkmode = localStorage.getItem("lastDarkmode") || "";

    if(lastDarkmode === "light"){
        adjustDarkmode(false); // for light mode
        darkMode = false;
    }

    // actually unnecessary since it's dark by default
    if(lastDarkmode === "dark"){
        adjustDarkmode(true); // for light mode
        darkMode = true;
    }
}
updateConfig();