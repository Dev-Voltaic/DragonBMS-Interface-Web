// No other good place to put it

enableSwipeDownUpdate.addEventListener("click", ()=>{
    if(document.getElementsByTagName("body")[0].classList.contains("disableSwipeDown")){
        document.getElementsByTagName("body")[0].classList.remove("disableSwipeDown");
    }
});


if(isTouchDevice()){

    settingsSwipeContainer.classList.remove("non-touch");
    settingsSwipeContainer.classList.add("touch");

    settingsSwipeContainer.addEventListener("touchmove", () => {

        if(!settingsContainer.classList.contains("hidden")){
            visualiseSettingsAvailable();
            return;
        }


        const minDistance = settingsSwipeContainer.clientHeight;
        // get the distance the user swiped
        const swipeDistance = settingsSwipeContainer.scrollTop;

        //console.log(swipeDistance);
        if (swipeDistance >= (minDistance * 0.9)) {
            settingsContainer.classList.remove("hidden");
        }
    });
}else{
    settingsSwipeContainer.classList.remove("touch");
    settingsSwipeContainer.classList.add("non-touch");

    settingsSwipeText.addEventListener("dblclick", () => {
        settingsContainer.classList.remove("hidden");
        visualiseSettingsAvailable();
    });
}


function visualiseSettingsAvailable(){

    // visualisation of the settings activation

    // don't make it snap back and hide the original text
    settingsSwipeText.classList.remove("snap-align");
    settingsSwipeText.classList.add("hidden");

    settingsSwipeAction.classList.add("green");



    // actually activating (un-hiding) the settings
    settingsContainer.classList.remove("hidden");

    // showing the option to disable the settings again
    settingsHide.classList.remove("hidden");

}


// reset everything connected to the settings
settingsHide.addEventListener("click", () => {
    settingsContainer.classList.add("hidden");

    // hide settings-hide again
    settingsHide.classList.add("hidden");

    // reverse the changes to the scroll field
    settingsSwipeText.classList.remove("hidden");
    settingsSwipeAction.classList.remove("green");

    settingsSwipeText.classList.add("snap-align");



    // hide the settings again
    settingsContainer.classList.add("hidden");
});
