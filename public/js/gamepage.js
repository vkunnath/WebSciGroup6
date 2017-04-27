//Jquery functions to handle door animations for Every Man for himself game. Created by RPI Webscience group 6 Spring 2017.
//adapted from: https://codepen.io/MariamMassadeh/pen/HDLwu  
    
//funtion that toggles door animations
function openDoor(field) {
            var y = $(field).find(".thumb");
            var x = y.attr("class");
            if (y.hasClass("thumbOpened")) {
                y.removeClass("thumbOpened");
            }
            else {
                $(".thumb").removeClass("thumbOpened");
                y.addClass("thumbOpened");
            }
        }

//makes sure is closed
function closeDoor(field){

    var y = $(field).find(".thumb");
    var x = y.attr("class");
    if (y.hasClass("thumbOpened")) {
        //y.removeClass("thumbOpened");
    }
    else {
        $(".thumb").removeClass("thumbOpened");
        y.addClass("thumbOpened");
    }

}

//closes all doors
function closeAllDoors(){

    closeDoor($('tDoor1'));
    closeDoor($('tDoor2'));
    closeDoor($('tDoor3'));

}