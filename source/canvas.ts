const GAME_MENU_HEIGHT = 120;

let CANVAS: HTMLCanvasElement;
let STAGE: createjs.Stage;

export function init() {
    CANVAS = document.getElementById("MainCanvas") as HTMLCanvasElement;
    STAGE = new createjs.Stage(CANVAS);

    createjs.Ticker.setFPS(60);

    return {
        canvas: CANVAS,
        stage: STAGE,
    };
}

export function adjustCanvasDimensions(width: number, height: number) {
    // set the canvas width/height
    const windowWidth = $(window).outerWidth()!;
    const windowHeight = $(window).outerHeight()!;
    let canvasWidth, canvasHeight;
    const padding = 10;
    const mapWidth = width + padding;
    const mapHeight = height + padding;

    // we try to occupy the whole window's dimension, if the map's width/height fits there, otherwise just set the canvas width/height to the same as the map
    if (mapWidth < windowWidth) {
        canvasWidth = windowWidth;
    } else {
        canvasWidth = mapWidth;
    }

    if (mapHeight < windowHeight - GAME_MENU_HEIGHT) {
        canvasHeight = windowHeight - GAME_MENU_HEIGHT;
    } else {
        canvasHeight = mapHeight;
    }

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
