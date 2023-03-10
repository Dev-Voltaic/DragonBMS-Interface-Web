function swap(node1, node2) {

    const afterNode2 = node2.nextElementSibling;
    const parent = node2.parentNode;

    // bug fix
    if(afterNode2 === node1){
        swap(node2, node1);
    }else{
        node1.replaceWith(node2);
        parent.insertBefore(node1, afterNode2);
    }
}

let selected_cell = null;

let emptyTd = document.createElement("td");
let deleteGauge = false;
let gaugeToAdd;
let addGauge = false;

let emptyTdClassName = "main-table-td-2row board-element";


function toggleDevField(){
    let devFieldActive = false;
    Array.from(document.getElementsByTagName("td")).forEach((child) => {
        if(child.firstElementChild != null){
            if(child.firstElementChild.id === "dev-field-cloned"){
                devFieldActive = true;
            }
        }
    });
    if(devFieldActive){
        emptyTd.className = emptyTdClassName;
        let target = document.getElementById("dev-field");
        //console.log(emptyTd.cloneNode(true));
        target.replaceWith(emptyTd.cloneNode(true));
        if (target.innerHTML !== emptyTd.innerHTML) {
            document.getElementsByClassName("elementsdiv")[0].appendChild(target);
        }
        deleteGauge = false;
    }else{
        if(!addGauge){
            document.getElementById("tileBarDev").style.color = "green";
            addGauge = true;
            emptyTd.className = emptyTdClassName;
            gaugeToAdd = emptyTd.cloneNode(true);
            let clonedElement = document.getElementById("dev-field");
            gaugeToAdd.appendChild(clonedElement);
        }
    }

}



function tableEventListener(target){

    let is_td = false;
    let tds = document.getElementsByClassName("main-table-td-2row");
    for (let i = 0; i < tds.length; i++) {
        if(tds[i].isEqualNode(target)){
            is_td = true;
        }
    }

    if(is_td) {

        if(!deleteGauge) {
            if(!addGauge) {
                if (selected_cell == null) {

                    selected_cell = target;

                    target.classList.add("disabled");

                    // enable navigation bar option to zoom in on device
                    tileBarZoomIn.classList.remove("hidden");

                } else {

                    // disable navigation bar option to zoom in on device
                    tileBarZoomIn.classList.add("hidden");

                    if (bleBMSConnected) {
                        selected_cell.classList.remove("disabled");
                    } else {
                        selected_cell.classList.add("disabled");
                        selected_cell.childNodes.forEach((child) => {
                            if (child === inlineGaugeDiv) {
                                selected_cell.classList.remove("disabled");
                            }
                        });
                    }

                    swap(selected_cell, target);

                    selected_cell = null;

                }
            }else{
                // since this is only used for the dev field for now.... i can do this
                // (still wonky though)

                // check if the selected td is empty
                if(target.innerHTML === emptyTd.innerHTML){
                    target.replaceWith(gaugeToAdd);
                    addGauge = false;

                    // a little visual feedback :P
                    document.getElementById("tileBarDev").style.color = "";
                }
            }
        }else{
            emptyTd.className = emptyTdClassName;
            target.replaceWith(emptyTd.cloneNode(true));
            if (target.innerHTML !== emptyTd.innerHTML) {
                document.getElementsByClassName("elementsdiv")[0].appendChild(target);
            }
            deleteGauge = false;
        }

    }


}


table.addEventListener("click", (e)=> {
    tableEventListener(e.target);
});


// if franz wants adjustable double tap time, this is where
/*
// double tap routine
let lastClick = 0;
table.addEventListener('touchstart', function(e) {
    //e.preventDefault(); // to disable browser default zoom on double tap
    let date = new Date();
    let time = date.getTime();
    const time_between_taps = 400; // 400ms
    if (time - lastClick < time_between_taps) {
        let objToZoomOn = e.target;
        // loop through all the sub components to only zoom on the target td, not for example the button
        while(typeof objToZoomOn != "undefined" && !objToZoomOn.classList.contains("main-table-td-2row")){
            objToZoomOn = objToZoomOn.parentNode;
        }
        zoom.to({element: objToZoomOn, padding: 0, pan: false});
    }
    lastClick = time;
})

*/
table.addEventListener('dblclick', function(e) {
    let objToZoomOn = e.target;
    // loop through all the sub components to only zoom on the target td, not for example the button
    while(typeof objToZoomOn != "undefined" && !objToZoomOn.classList.contains("main-table-td-2row")){
        objToZoomOn = objToZoomOn.parentNode;
    }
    zoom.to({element: objToZoomOn, padding: 0, pan: false});
})
