

// adjust the interface according to config values
function updateConfig(){
    const lastDarkMode = localStorage.getItem("lastDarkmode") || "";

    if(lastDarkMode === "light"){
        adjustDarkmode(false); // for light mode
        darkMode = false;
    }

    // actually unnecessary since it's dark by default
    if(lastDarkMode === "dark"){
        adjustDarkmode(true); // for light mode
        darkMode = true;
    }
}
updateConfig();