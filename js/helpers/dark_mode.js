let dark_mode = true;

function toggleDarkmode(){
    dark_mode = !dark_mode;

    localStorage.setItem('lastDarkmode', dark_mode ? "dark" : "light"); // for the next session

    adjustDarkmode(dark_mode);
}

function adjustDarkmode(mode){
    if(!mode){
        document.getElementsByTagName("link")[1].href = "css/index-light.css";
    }else{
        document.getElementsByTagName("link")[1].href = "css/index-dark.css";
    }
}