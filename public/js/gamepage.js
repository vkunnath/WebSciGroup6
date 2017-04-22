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
