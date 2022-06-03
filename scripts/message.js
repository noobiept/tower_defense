(function (window) {
    /*
    In-game message

    args = {
            fontSize: Number,    // size in pixels
            fillColor: String,   // any css valid color
            strokeColor: String, // any css valid color
            timeout: Number,     // time until the message is removed
            x: Number,           // x position (if not given, then its centered)
            y: Number            // y position (like x, centered in middle of canvas if not given)
        }
 */

    function Message(args) {
        var fontSize, fillColor, strokeColor;

        if (typeof args.fontSize == "undefined") {
            fontSize = 16;
        } else {
            fontSize = args.fontSize;
        }

        if (typeof args.fillColor == "undefined") {
            fillColor = "white";
        } else {
            fillColor = args.fillColor;
        }

        if (typeof args.strokeColor == "undefined") {
            strokeColor = "black";
        } else {
            strokeColor = args.strokeColor;
        }

        if (typeof args.timeout == "undefined") {
            args.timeout = 1000;
        }

        // center in the middle of the canvas
        if (typeof args.x == "undefined") {
            args.x = G.CANVAS.width / 2;
        }

        if (typeof args.y == "undefined") {
            args.y = G.CANVAS.height / 2;
        }

        var stroke = new createjs.Text(
            args.text,
            fontSize + "px monospace",
            strokeColor
        );

        stroke.textAlign = "center";
        stroke.x = args.x;
        stroke.y = args.y;
        stroke.outline = parseInt(fontSize / 5, 10);

        var fill = stroke.clone();

        fill.outline = false;
        fill.color = fillColor;
        fill.textAlign = "center";
        fill.x = args.x;
        fill.y = args.y;

        CONTAINER.addChild(stroke);
        CONTAINER.addChild(fill);

        this.stroke = stroke;
        this.fill = fill;
        this.timeout = window.setTimeout(function () {
            CONTAINER.removeChild(stroke);
            CONTAINER.removeChild(fill);

            if (typeof args.onEnd !== "undefined") {
                args.onEnd();
            }
        }, args.timeout);

        Message.ALL.push(this);
    }

    Message.ALL = [];

    var CONTAINER; // createjs.Container() which will hold all the text elements

    /**
     * Create the container which will hold all the text elements.
     */
    Message.init = function (parent) {
        CONTAINER = new createjs.Container();

        parent.addChild(CONTAINER);
    };

    Message.prototype.remove = function () {
        window.clearTimeout(this.timeout);

        CONTAINER.removeChild(this.stroke);
        CONTAINER.removeChild(this.fill);

        var index = Message.ALL.indexOf(this);

        Message.ALL.splice(index, 1);
    };

    Message.removeAll = function () {
        for (var a = Message.ALL.length - 1; a >= 0; a--) {
            Message.ALL[a].remove();
        }
    };

    window.Message = Message;
})(window);
