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

function closeAllDoors(){

    closeDoor($('tDoor1'));
    closeDoor($('tDoor2'));
    closeDoor($('tDoor3'));

}