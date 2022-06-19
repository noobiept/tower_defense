let CANVAS: HTMLCanvasElement;
let STAGE: createjs.Stage;

export function init() {
    CANVAS = document.getElementById("MainCanvas") as HTMLCanvasElement;
    STAGE = new createjs.Stage(CANVAS);

    createjs.Ticker.timingMode = createjs.Ticker.RAF;

    return {
        canvas: CANVAS,
        stage: STAGE,
    };
}

export function adjustCanvasDimensions(width: number, height: number) {
    // set the canvas width/height
    const padding = 70;
    const canvasWidth = width + padding;
    const canvasHeight = height + padding;

    CANVAS.width = canvasWidth;
    CANVAS.height = canvasHeight;

    return {
        canvasWidth,
        canvasHeight,
    };
}

export function getCanvasCenterPosition() {
    return {
        x: CANVAS.width / 2,
        y: CANVAS.height / 2,
    };
}

export function getCanvasHeight() {
    return CANVAS.height;
}

export function updateStage() {
    STAGE.update();
}

export function addStageEventListener(eventName: string, listener: () => void) {
    return STAGE.on(eventName, listener);
}

export function removeStageEventListener(
    eventName: string,
    listener: () => void
) {
    STAGE.off(eventName, listener);
}

export function addCanvasEventListener(
    eventName: string,
    listener: (event: Event) => void
) {
    CANVAS.addEventListener(eventName, listener);
}

export function removeCanvasEventListener(
    eventName: string,
    listener: (event: Event) => void
) {
    CANVAS.removeEventListener(eventName, listener);
}

export function getCanvasBoundingClientRect() {
    return CANVAS.getBoundingClientRect();
}
