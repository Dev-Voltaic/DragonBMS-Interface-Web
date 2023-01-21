let colorMode = "dark";

function toggleColorMode(){
    if(colorMode === "dark"){colorMode = "light";}
    else if(colorMode === "light"){colorMode = "custom";}
    else if(colorMode === "custom"){colorMode = "dark";}

    localStorage.setItem('lastColorMode', colorMode); // for the next session

    adjustColorMode(colorMode);
}

function adjustColorMode(mode){
    // always reset the changed style tag
    document.getElementsByTagName("body")[0].style.color = "";
    document.getElementsByTagName("body")[0].style.backgroundColor = "";

    switch (mode) {
        case "light":
            document.getElementsByTagName("link")[1].href = "css/index-light.css";
            break;

        case "dark":
            document.getElementsByTagName("link")[1].href = "css/index-dark.css";
            break;

        case "custom":
            console.log(interfaceConfig);
            document.getElementsByTagName("body")[0].style.color = interfaceConfig.customColorForeground;
            document.getElementsByTagName("body")[0].style.backgroundColor = interfaceConfig.customColorBackground;
            break;

        default:
            document.getElementsByTagName("link")[1].href = "css/index-dark.css";
    }

    document.getElementById("interface-foreground-color").parentNode.style.color = interfaceConfig.customColorForeground;
    document.getElementById("interface-background-color").parentNode.style.color = interfaceConfig.customColorBackground;
}

function getCustomForegroundColor(){
    return document.getElementById("interface-foreground-color").parentNode.style.color;
}
function getCustomBackgroundColor(){
    return document.getElementById("interface-background-color").parentNode.style.color;
}

document.addEventListener('coloris:pick', _ => {
    localStorage.setItem('customColorForeground', getCustomForegroundColor());
    localStorage.setItem('customColorBackground', getCustomBackgroundColor());
    updateConfig();
    adjustColorMode(interfaceConfig.colorMode);
});