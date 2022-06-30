import { Message } from "./message";

let MESSAGE: Message | null = null;

/**
 * Show a message on the bottom of the canvas. Only allow one message to be active at any time.
 */
export function showStatusMessage(text: string) {
    if (MESSAGE) {
        MESSAGE.remove();
    }

    MESSAGE = new Message({
        text,
        position: "bottom",
        onEnd: () => {
            MESSAGE = null;
        },
    });
}
