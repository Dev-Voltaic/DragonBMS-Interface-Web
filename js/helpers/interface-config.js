

// adjust the interface according to config values
function updateConfig(){
    const lastDarkMode = localStorage.getItem("lastDarkmode") || "";

    if(lastDarkMode === "light"){
        adjustDarkmode(false); // for light mode
        dark_mode = false;
    }

    // actually unnecessary since it's dark by default
    if(lastDarkMode === "dark"){
        adjustDarkmode(true); // for light mode
        dark_mode = true;
    }
}
updateConfig();