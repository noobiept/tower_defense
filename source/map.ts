import { breadthFirstSearch } from "./path_finding";
import { Unit } from "./units/unit";
import * as GameMenu from "./game_menu";
import { getAsset } from "./assets";
import { circlePointCollision, getRandomInt } from "@drk4/utilities";
import * as Canvas from "./canvas";
import {
    CanvasPosition,
    GridPosition,
    Lane,
    MapData,
    MapPosition,
} from "./types";
import { Tower } from "./towers/tower";

interface AddObstacleArgs {
    passable?: boolean;
    fillColor?: string;
    startColumn: number;
    columnLength: number;
    startLine: number;
    lineLength: number;
}

interface GridHighlight {
    shape: createjs.Bitmap | null;
    available: createjs.Bitmap | null;
    not_available: createjs.Bitmap | null;
    column: number;
    line: number;
}

let CONTAINER: createjs.Container; // createjs.Container() which will hold all the map elements
let HIGHLIGHT_CONTAINER: createjs.Container;
let CREEP_LANES: Lane[];

let NUMBER_OF_COLUMNS = 0;
let NUMBER_OF_LINES = 0;

let STARTING_X = 0;
let STARTING_Y = 0;

const SQUARE_SIZE = 10; // in pixels

const GRID_HIGHLIGHT: GridHighlight = {
    shape: null, // this will point to either 'available' or 'not_available'
    available: null, // will have a reference to a Bitmap
    not_available: null, // also a reference to a Bitmap
    column: 0,
    line: 0,
};
const WALL_LENGTH = 2;

// result from the path finding algorithm, with the valid paths to the destination
let PATHS: MapPosition[][][] = [];
let MAP: number[][] = [];
const POSITION_TYPE = {
    passable: 1,
    blocked: 0,
};

/**
 * Create the container for all the shape elements that are part of the map.
 */
export function init(parent: createjs.Container) {
    CONTAINER = new createjs.Container();

    parent.addChild(CONTAINER);
}

/**
 * The highlight element has a separate container, so that it can be drawn last (so it appears on top of the rest of the elements)
 */
export function initHighlight(parent: createjs.Container) {
    HIGHLIGHT_CONTAINER = new createjs.Container();

    parent.addChild(HIGHLIGHT_CONTAINER);
}

export function build(mapInfo: MapData) {
    const columns = mapInfo.numberOfColumns;
    const lines = mapInfo.numberOfLines;

    const width = columns * SQUARE_SIZE;
    const height = lines * SQUARE_SIZE;

    // 2 dimensional array, with all the positions of the map
    // 0 -> wall (impassable square)
    // 1 -> passable square
    // main array represents the columns (map[ 0 ], first column, map[ 0 ][ 1 ], first column and second line)
    MAP = [];

    for (let line = 0; line < lines; line++) {
        MAP[line] = [];

        for (let column = 0; column < columns; column++) {
            MAP[line][column] = 1;
        }
    }

    const { canvasWidth, canvasHeight } = Canvas.adjustCanvasDimensions(
        width,
        height
    );

    STARTING_X = canvasWidth / 2 - (columns * SQUARE_SIZE) / 2;
    STARTING_Y = canvasHeight / 2 - (lines * SQUARE_SIZE) / 2;

    // add walls around the map
    addObstacle({
        startColumn: 0,
        startLine: 0,
        columnLength: WALL_LENGTH,
        lineLength: lines,
    }); // left
    addObstacle({
        startColumn: columns - WALL_LENGTH,
        startLine: 0,
        columnLength: WALL_LENGTH,
        lineLength: lines,
    }); // right
    addObstacle({
        startColumn: WALL_LENGTH,
        startLine: 0,
        columnLength: columns - 2 * WALL_LENGTH,
        lineLength: WALL_LENGTH,
    }); // top
    addObstacle({
        startColumn: WALL_LENGTH,
        startLine: lines - WALL_LENGTH,
        columnLength: columns - 2 * WALL_LENGTH,
        lineLength: WALL_LENGTH,
    }); // bottom

    // add the part of the wall where the creeps start/end (new wall with different color)
    const creepLanes = mapInfo.creepLanes;

    for (let a = 0; a < creepLanes.length; a++) {
        const lane = creepLanes[a];
        const halfLength = Math.floor(lane.length / 2);
        let startColumn, startLine;
        let endColumn, endLine;
        let columnLength, lineLength;

        if (lane.orientation == "horizontal") {
            startColumn = lane.start.column;
            startLine = lane.start.line - halfLength;

            endColumn = lane.end.column;
            endLine = startLine;

            columnLength = 2;
            lineLength = lane.length;
        } else {
            startColumn = lane.start.column - halfLength;
            startLine = lane.start.line;

            endColumn = startColumn;
            endLine = lane.end.line;

            columnLength = lane.length;
            lineLength = 2;
        }

        addObstacle({
            startColumn: startColumn,
            startLine: startLine,
            columnLength: columnLength,
            lineLength: lineLength,
            passable: true,
        });
        addObstacle({
            startColumn: endColumn,
            startLine: endLine,
            columnLength: columnLength,
            lineLength: lineLength,
            passable: true,
        });
    }

    // other obstacles
    const obstacles = mapInfo.obstacles;

    if (obstacles) {
        for (let a = 0; a < obstacles.length; a++) {
            const obstacle = obstacles[a];

            addObstacle({
                startColumn: obstacle.startColumn,
                startLine: obstacle.startLine,
                columnLength: obstacle.columnLength,
                lineLength: obstacle.lineLength,
                passable: obstacle.passable,
            });
        }
    }

    // the highlight square which shows where the towers will be added
    const highlightAvailable = new createjs.Bitmap(getAsset("highlight"));
    const highlightNotAvailable = new createjs.Bitmap(
        getAsset("highlight_not_available")
    );

    // start with the available visible first
    highlightNotAvailable.visible = false;

    HIGHLIGHT_CONTAINER.addChild(highlightAvailable);
    HIGHLIGHT_CONTAINER.addChild(highlightNotAvailable);

    GRID_HIGHLIGHT.shape = highlightAvailable;
    GRID_HIGHLIGHT.available = highlightAvailable;
    GRID_HIGHLIGHT.not_available = highlightNotAvailable;
    NUMBER_OF_COLUMNS = columns;
    NUMBER_OF_LINES = lines;
    CREEP_LANES = creepLanes;

    // determine the path
    updatePath();
}

/**
 * Update the path the units, for the current map/lanes.
 */
function updatePath() {
    PATHS.length = 0;

    for (let a = 0; a < CREEP_LANES.length; a++) {
        const lane = CREEP_LANES[a];
        const path = breadthFirstSearch(MAP, lane.end, POSITION_TYPE);

        PATHS.push(path);
    }
}

/**
 * Find where to go next, from the current column/line position.
 *
 * Returns { column: number; line: number; }
 */
export function findNextDestination(
    column: number,
    line: number,
    laneId: number
) {
    return PATHS[laneId][line][column];
}

function setImpassableBox(
    startColumn: number,
    startLine: number,
    length: number
) {
    for (let column = startColumn; column < startColumn + length; column++) {
        for (let line = startLine; line < startLine + length; line++) {
            setImpassable(column, line);
        }
    }
}

function setPassableBox(
    startColumn: number,
    startLine: number,
    length: number
) {
    for (let column = startColumn; column < startColumn + length; column++) {
        for (let line = startLine; line < startLine + length; line++) {
            setPassable(column, line);
        }
    }
}

/*
    Sets a single square
 */

export function setImpassable(column: number, line: number) {
    MAP[line][column] = POSITION_TYPE.blocked;
}

function setPassable(column: number, line: number) {
    MAP[line][column] = POSITION_TYPE.passable;
}

/*
    args = {
        startColumn: Number,
        startLine: Number,
        columnLength: Number,
        lineLength: Number,
        passable: Boolean (optional -- default: false),
        fillColor: String (optional -- default: 'black' if passable, else +- 'green'),
    }
 */
function addObstacle(args: AddObstacleArgs) {
    if (typeof args.passable === "undefined") {
        args.passable = false;
    }

    if (typeof args.fillColor === "undefined") {
        if (args.passable === true) {
            args.fillColor = "rgb(250,250,250)"; // same as body's background
        } else {
            args.fillColor = "rgba(0,0,0,0.2)";
        }
    }

    const endColumn = args.startColumn + args.columnLength;
    const endLine = args.startLine + args.lineLength;
    const width = args.columnLength * SQUARE_SIZE;
    const height = args.lineLength * SQUARE_SIZE;

    for (let column = args.startColumn; column < endColumn; column++) {
        for (let line = args.startLine; line < endLine; line++) {
            if (args.passable === true) {
                setPassable(column, line);
            } else {
                setImpassable(column, line);
            }
        }
    }

    const obstacle = new createjs.Shape();

    const g = obstacle.graphics;

    g.beginFill(args.fillColor);
    g.drawRect(0, 0, width, height);
    g.endFill();

    obstacle.x = STARTING_X + args.startColumn * SQUARE_SIZE;
    obstacle.y = STARTING_Y + args.startLine * SQUARE_SIZE;

    CONTAINER.addChild(obstacle);
}

export function clear() {
    CONTAINER.removeAllChildren();
    HIGHLIGHT_CONTAINER.removeAllChildren();
}

export function getSquareSize() {
    return SQUARE_SIZE;
}

export function calculatePosition({ x, y }: CanvasPosition) {
    const column = Math.floor((x - STARTING_X) / SQUARE_SIZE);
    const line = Math.floor((y - STARTING_Y) / SQUARE_SIZE);

    return {
        column: column,
        line: line,
    };
}

export function mouseMoveEvents(event: createjs.MouseEvent) {
    const towerLength = 2;
    const position = calculatePosition({ x: event.stageX, y: event.stageY });

    let column = position.column;
    let line = position.line;

    // highlight is same size as a tower (2x2), so can't let it go to last position
    // also don't let it go to the walls or the creep start/end
    if (column < WALL_LENGTH) {
        column = WALL_LENGTH;
    } else if (column + WALL_LENGTH + towerLength > NUMBER_OF_COLUMNS) {
        column = NUMBER_OF_COLUMNS - WALL_LENGTH - towerLength;
    }

    if (line < WALL_LENGTH) {
        line = WALL_LENGTH;
    } else if (line + WALL_LENGTH + towerLength > NUMBER_OF_LINES) {
        line = NUMBER_OF_LINES - WALL_LENGTH - towerLength;
    }

    GRID_HIGHLIGHT.column = column;
    GRID_HIGHLIGHT.line = line;

    if (isAvailable(column, line)) {
        if (GRID_HIGHLIGHT.shape !== GRID_HIGHLIGHT.available) {
            GRID_HIGHLIGHT.not_available.visible = false;
            GRID_HIGHLIGHT.available.visible = true;
            GRID_HIGHLIGHT.shape = GRID_HIGHLIGHT.available;
        }
    } else {
        if (GRID_HIGHLIGHT.shape !== GRID_HIGHLIGHT.not_available) {
            GRID_HIGHLIGHT.not_available.visible = true;
            GRID_HIGHLIGHT.available.visible = false;
            GRID_HIGHLIGHT.shape = GRID_HIGHLIGHT.not_available;
        }
    }

    GRID_HIGHLIGHT.shape.x = STARTING_X + column * SQUARE_SIZE;
    GRID_HIGHLIGHT.shape.y = STARTING_Y + line * SQUARE_SIZE;
}

export function getHighlightSquare() {
    return GRID_HIGHLIGHT;
}

/*
    Checks if its possible to add a tower in this position (tower occupies 2x2 squares)
 */

function isAvailable(column, line) {
    // check for the limits of the map
    if (
        column < 0 ||
        column + 1 >= NUMBER_OF_COLUMNS ||
        line < 0 ||
        line + 1 >= NUMBER_OF_LINES
    ) {
        return false;
    }

    // check if there's already a tower in this position
    if (
        MAP[line][column] === POSITION_TYPE.blocked ||
        MAP[line + 1][column] === POSITION_TYPE.blocked ||
        MAP[line][column + 1] === POSITION_TYPE.blocked ||
        MAP[line + 1][column + 1] === POSITION_TYPE.blocked
    ) {
        return false;
    }

    return true;
}

/**
 * Get a list of passable/available positions, around a given position.
 */
export function getAvailablePositions(centerColumn, centerLine, range) {
    let startColumn = centerColumn - range;
    let startLine = centerLine - range;

    let endColumn = centerColumn + range;
    let endLine = centerLine + range;

    if (startColumn < 0) {
        startColumn = 0;
    }
    if (startLine < 0) {
        startLine = 0;
    }

    if (endColumn >= NUMBER_OF_COLUMNS) {
        endColumn = NUMBER_OF_COLUMNS - 1;
    }
    if (endLine >= NUMBER_OF_LINES) {
        endLine = NUMBER_OF_LINES - 1;
    }

    const availablePositions = [];

    for (let column = startColumn; column < endColumn; column++) {
        for (let line = startLine; line < endLine; line++) {
            if (MAP[line][column] === POSITION_TYPE.passable) {
                availablePositions.push({
                    column: column,
                    line: line,
                });
            }
        }
    }

    return availablePositions;
}

export function getPosition({ column, line }: GridPosition) {
    const x = STARTING_X + column * SQUARE_SIZE;
    const y = STARTING_Y + line * SQUARE_SIZE;

    return {
        x: x,
        y: y,
    };
}

/**
 * Gets all units in an area (only ground / only air / both, depending on the tower).
 * Can limit the amount of units it looks for.
 */
export function getUnitsInRange(
    x: number,
    y: number,
    radius: number,
    tower: Tower,
    limit?: number
) {
    const unitsInRange = [];
    let array;
    let count = 0;

    if (tower.can_target_ground) {
        if (tower.can_target_air) {
            array = Unit.ALL;
        } else {
            array = Unit.ALL_GROUND;
        }
    }

    // assumes .can_target_air == true
    else {
        array = Unit.ALL_AIR;
    }

    for (let a = 0; a < array.length; a++) {
        const unit = array[a];

        if (circlePointCollision(x, y, radius, unit.getX(), unit.getY())) {
            unitsInRange.push(unit);
            count++;

            if (limit && count >= limit) {
                break;
            }
        }
    }

    return unitsInRange;
}

/**
 * Check if its possible to add a tower in this position (if it doesn't block the units path).
 * If that is the case, then add the tower at the given position.
 */
export function addTower(
    towerClass,
    column,
    line,
    onSell: (cost) => void,
    onRemove: (tower: Tower) => void,
    onUpgrade: (tower: Tower) => void
) {
    if (isAvailable(column, line)) {
        // check if by filling this position, we're not blocking the units (they need to be always be able to reach the destination)
        setImpassableBox(column, line, 2);

        // check if there is a possible path (if its not going to block a lane)
        const paths = [];

        for (let b = 0; b < CREEP_LANES.length; b++) {
            const lane = CREEP_LANES[b];
            const path = breadthFirstSearch(
                MAP,
                CREEP_LANES[b].end,
                POSITION_TYPE
            );

            //HERE need to check each unit as well? or they might get trapped
            const canReach = canReachDestination(
                path,
                lane.start.column,
                lane.start.line
            );

            if (canReach === false) {
                GameMenu.showMessage("Can't block the unit's path.");

                // reset the position
                setPassableBox(column, line, 2);
                return;
            } else {
                paths.push(path);
            }
        }

        // its possible to add the tower
        // update the path and add the tower
        PATHS = paths;

        const gridPosition = { column, line };
        const canvasPosition = getPosition(gridPosition);

        const tower = new towerClass({
            gridPosition,
            canvasPosition,
            squareSize: SQUARE_SIZE,
            onRemove: (tower) => {
                onRemove(tower);
                removeTower(tower);
            },
            getUnitsInRange,
            onSell,
            onUpgrade,
        });

        // tower occupies 2x2 squares
        setImpassableBox(column, line, 2);

        return tower;
    }
}

/**
 * Remove a tower from the map, and update the pathing of the units.
 */
export function removeTower(tower: Tower) {
    setPassableBox(tower.position.column, tower.position.line, 2);
    updatePath();
}

/**
 * Check if its possible to reach the destination from a given column/line position.
 */
function canReachDestination(path, column, line) {
    while (true) {
        const next = path[line][column];

        if (next === null) {
            return false;
        }

        // reached the end
        if (next.column === column && next.line === line) {
            return true;
        } else {
            column = next.column;
            line = next.line;
        }
    }
}

export function getUnitNextDestination(unit: Unit) {
    const nextDest = findNextDestination(unit.column, unit.line, unit.lane_id);

    if (nextDest) {
        return nextDest;
    }

    // can happen if we place a tower on top of a unit
    // just move the unit to a close valid position
    const positions = getAvailablePositions(unit.column, unit.line, 2);

    if (positions.length > 0) {
        const index = getRandomInt(0, positions.length - 1);
        const nextDest = positions[index];

        unit.column = nextDest.column; //TODO
        unit.line = nextDest.line;
        return nextDest;
    }
}
