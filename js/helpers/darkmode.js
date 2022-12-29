let darkMode = true;

function toggleDarkmode(){
    darkMode = !darkMode;

    localStorage.setItem('lastDarkmode', darkMode ? "dark" : "light"); // for the next session

    adjustDarkmode(darkMode);
}

function adjustDarkmode(mode){
    if(!mode){
        document.getElementsByTagName("link")[1].href = "css/index-light.css";
    }else{
        document.getElementsByTagName("link")[1].href = "css/index-dark.css";
    }
}