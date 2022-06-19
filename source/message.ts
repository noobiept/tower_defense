import { getCanvasCenterPosition, getCanvasHeight } from "./canvas";
import { CanvasPosition } from "./types";

let CONTAINER: createjs.Container; // createjs.Container() which will hold all the text elements

type MessagePosition = "center" | "bottom" | { x: number; y: number };

interface MessageArgs {
    text: string;
    fontSize?: number; // size in pixels
    fillColor?: string; // any css valid color
    strokeColor?: string; // any css valid color
    timeout?: number; // time until the message is removed
    position?: MessagePosition; // if not given then its centered in the middle of the canvas
    onEnd?: () => void;
}

/**
 * In-game message.
 */
export class Message {
    static ALL: Message[] = [];

    /**
     * Create the container which will hold all the text elements.
     */
    static init(parent: createjs.Container) {
        CONTAINER = new createjs.Container();

        parent.addChild(CONTAINER);
    }

    static removeAll() {
        for (let a = Message.ALL.length - 1; a >= 0; a--) {
            Message.ALL[a].remove();
        }
    }

    private stroke: createjs.Text;
    private fill: createjs.Text;
    private timeout: number;

    constructor(args: MessageArgs) {
        let fontSize, fillColor, strokeColor;

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

        if (typeof args.position == "undefined") {
            args.position = "center";
        }

        const { x, y } = this.getCanvasPosition(args.position, fontSize);
        const stroke = new createjs.Text(
            args.text,
            fontSize + "px monospace",
            strokeColor
        );

        stroke.textAlign = "center";
        stroke.x = x;
        stroke.y = y;
        stroke.outline = Math.floor(fontSize / 5);

        const fill = stroke.clone();

        fill.outline = 0;
        fill.color = fillColor;
        fill.textAlign = "center";
        fill.x = x;
        fill.y = y;

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

    getCanvasPosition(
        position: MessagePosition,
        fontSize: number
    ): CanvasPosition {
        if (position === "center") {
            return getCanvasCenterPosition();
        }

        if (position === "bottom") {
            const center = getCanvasCenterPosition();
            const height = getCanvasHeight();

            return {
                x: center.x,
                y: height - fontSize,
            };
        }

        return position;
    }

    remove() {
        window.clearTimeout(this.timeout);

        CONTAINER.removeChild(this.stroke);
        CONTAINER.removeChild(this.fill);

        const index = Message.ALL.indexOf(this);

        Message.ALL.splice(index, 1);
    }
}
