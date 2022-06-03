import { G } from "./main";
import { PathFinding } from "./path_finding";
import { Unit } from "./unit";

export function Map() {}

var CONTAINER; // createjs.Container() which will hold all the map elements
var HIGHLIGHT_CONTAINER;
var CREEP_LANES;

var MAP_WIDTH = 0;
var MAP_HEIGHT = 0;
var NUMBER_OF_COLUMNS = 0;
var NUMBER_OF_LINES = 0;

var STARTING_X = 0;
var STARTING_Y = 0;

var SQUARE_SIZE = 10; // in pixels

var GRID_HIGHLIGHT = {
    shape: null, // this will point to either 'available' or 'not_available'
    available: null, // will have a reference to a Bitmap
    not_available: null, // also a reference to a Bitmap
    column: 0,
    line: 0,
};
var WALL_LENGTH = 2;

// result from the path finding algorithm, with the valid paths to the destination
var PATHS = [];
var MAP;
var POSITION_TYPE = {
    passable: 1,
    blocked: 0,
};

/**
 * Create the container for all the shape elements that are part of the map.
 */
Map.init = function (parent) {
    CONTAINER = new createjs.Container();

    parent.addChild(CONTAINER);
};

/**
 * The highlight element has a separate container, so that it can be drawn last (so it appears on top of the rest of the elements)
 */
Map.initHighlight = function (parent) {
    HIGHLIGHT_CONTAINER = new createjs.Container();

    parent.addChild(HIGHLIGHT_CONTAINER);
};

Map.build = function (mapInfo) {
    var columns = mapInfo.numberOfColumns;
    var lines = mapInfo.numberOfLines;

    var width = columns * SQUARE_SIZE;
    var height = lines * SQUARE_SIZE;

    // 2 dimensional array, with all the positions of the map
    // 0 -> wall (impassable square)
    // 1 -> passable square
    // main array represents the columns (map[ 0 ], first column, map[ 0 ][ 1 ], first column and second line)
    MAP = [];

    for (var line = 0; line < lines; line++) {
        MAP[line] = [];

        for (var column = 0; column < columns; column++) {
            MAP[line][column] = 1;
        }
    }

    // set the canvas width/height
    var windowWidth = $(window).outerWidth();
    var windowHeight = $(window).outerHeight();
    var canvasWidth, canvasHeight;
    var padding = 10;
    var mapWidth = width + padding;
    var mapHeight = height + padding;

    // we try to occupy the whole window's dimension, if the map's width/height fits there, otherwise just set the canvas width/height to the same as the map
    if (mapWidth < windowWidth) {
        canvasWidth = windowWidth;
    } else {
        canvasWidth = mapWidth;
    }

    if (mapHeight < windowHeight - G.GAME_MENU_HEIGHT) {
        canvasHeight = windowHeight - G.GAME_MENU_HEIGHT;
    } else {
        canvasHeight = mapHeight;
    }

    G.CANVAS.width = canvasWidth;
    G.CANVAS.height = canvasHeight;

    STARTING_X = canvasWidth / 2 - (columns * SQUARE_SIZE) / 2;
    STARTING_Y = canvasHeight / 2 - (lines * SQUARE_SIZE) / 2;

    // add walls around the map
    Map.addObstacle({
        startColumn: 0,
        startLine: 0,
        columnLength: WALL_LENGTH,
        lineLength: lines,
    }); // left
    Map.addObstacle({
        startColumn: columns - WALL_LENGTH,
        startLine: 0,
        columnLength: WALL_LENGTH,
        lineLength: lines,
    }); // right
    Map.addObstacle({
        startColumn: WALL_LENGTH,
        startLine: 0,
        columnLength: columns - 2 * WALL_LENGTH,
        lineLength: WALL_LENGTH,
    }); // top
    Map.addObstacle({
        startColumn: WALL_LENGTH,
        startLine: lines - WALL_LENGTH,
        columnLength: columns - 2 * WALL_LENGTH,
        lineLength: WALL_LENGTH,
    }); // bottom

    // add the part of the wall where the creeps start/end (new wall with different color)
    var creepLanes = mapInfo.creepLanes;

    for (var a = 0; a < creepLanes.length; a++) {
        var lane = creepLanes[a];
        var halfLength = parseInt(lane.length / 2, 10);
        var startColumn, startLine;
        var endColumn, endLine;
        var columnLength, lineLength;

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

        Map.addObstacle({
            startColumn: startColumn,
            startLine: startLine,
            columnLength: columnLength,
            lineLength: lineLength,
            passable: true,
        });
        Map.addObstacle({
            startColumn: endColumn,
            startLine: endLine,
            columnLength: columnLength,
            lineLength: lineLength,
            passable: true,
        });
    }

    // other obstacles
    var obstacles = mapInfo.obstacles;

    if (obstacles) {
        for (var a = 0; a < obstacles.length; a++) {
            var obstacle = obstacles[a];

            Map.addObstacle({
                startColumn: obstacle.startColumn,
                startLine: obstacle.startLine,
                columnLength: obstacle.columnLength,
                lineLength: obstacle.lineLength,
                passable: obstacle.passable,
            });
        }
    }

    // the highlight square which shows where the towers will be added
    var highlightAvailable = new createjs.Bitmap(
        G.PRELOAD.getResult("highlight")
    );
    var highlightNotAvailable = new createjs.Bitmap(
        G.PRELOAD.getResult("highlight_not_available")
    );

    // start with the available visible first
    highlightNotAvailable.visible = false;

    HIGHLIGHT_CONTAINER.addChild(highlightAvailable);
    HIGHLIGHT_CONTAINER.addChild(highlightNotAvailable);

    GRID_HIGHLIGHT.shape = highlightAvailable;
    GRID_HIGHLIGHT.available = highlightAvailable;
    GRID_HIGHLIGHT.not_available = highlightNotAvailable;
    MAP_WIDTH = width;
    MAP_HEIGHT = height;
    NUMBER_OF_COLUMNS = columns;
    NUMBER_OF_LINES = lines;
    CREEP_LANES = creepLanes;

    // determine the path
    Map.updatePath();
};

/**
 * Update the path the units, for the current map/lanes.
 */
Map.updatePath = function () {
    PATHS.length = 0;

    for (var a = 0; a < CREEP_LANES.length; a++) {
        var lane = CREEP_LANES[a];
        var path = PathFinding.breadthFirstSearch(MAP, lane.end, POSITION_TYPE);

        PATHS.push(path);
    }
};

/**
 * Find where to go next, from the current column/line position.
 *
 * Returns { column: number; line: number; }
 */
Map.findNextDestination = function (column, line, laneId) {
    return PATHS[laneId][line][column];
};

Map.setImpassableBox = function (startColumn, startLine, length) {
    for (var column = startColumn; column < startColumn + length; column++) {
        for (var line = startLine; line < startLine + length; line++) {
            Map.setImpassable(column, line);
        }
    }
};

Map.setPassableBox = function (startColumn, startLine, length) {
    for (var column = startColumn; column < startColumn + length; column++) {
        for (var line = startLine; line < startLine + length; line++) {
            Map.setPassable(column, line);
        }
    }
};

/*
    Sets a single square
 */

Map.setImpassable = function (column, line) {
    MAP[line][column] = POSITION_TYPE.blocked;
};

Map.setPassable = function (column, line) {
    MAP[line][column] = POSITION_TYPE.passable;
};

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

Map.addObstacle = function (args) {
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

    var endColumn = args.startColumn + args.columnLength;
    var endLine = args.startLine + args.lineLength;
    var width = args.columnLength * SQUARE_SIZE;
    var height = args.lineLength * SQUARE_SIZE;

    for (var column = args.startColumn; column < endColumn; column++) {
        for (var line = args.startLine; line < endLine; line++) {
            if (args.passable === true) {
                Map.setPassable(column, line);
            } else {
                Map.setImpassable(column, line);
            }
        }
    }

    var obstacle = new createjs.Shape();

    var g = obstacle.graphics;

    g.beginFill(args.fillColor);
    g.drawRect(0, 0, width, height);
    g.endFill();

    obstacle.x = STARTING_X + args.startColumn * SQUARE_SIZE;
    obstacle.y = STARTING_Y + args.startLine * SQUARE_SIZE;

    CONTAINER.addChild(obstacle);
};

Map.clear = function () {
    CONTAINER.removeAllChildren();
    HIGHLIGHT_CONTAINER.removeAllChildren();
};

Map.getSquareSize = function () {
    return SQUARE_SIZE;
};

Map.calculatePosition = function (targetX, targetY) {
    var column = parseInt((targetX - STARTING_X) / SQUARE_SIZE);
    var line = parseInt((targetY - STARTING_Y) / SQUARE_SIZE);

    return {
        column: column,
        line: line,
    };
};

Map.mouseMoveEvents = function (event) {
    var towerLength = 2;
    var position = Map.calculatePosition(event.stageX, event.stageY);

    var column = position.column;
    var line = position.line;

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

    if (Map.isAvailable(column, line)) {
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
};

Map.getHighlightSquare = function () {
    return GRID_HIGHLIGHT;
};

/*
    Checks if its possible to add a tower in this position (tower occupies 2x2 squares)
 */

Map.isAvailable = function (column, line) {
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
};

/**
 * Get a list of passable/available positions, around a given position.
 */
Map.getAvailablePositions = function (centerColumn, centerLine, range) {
    var startColumn = centerColumn - range;
    var startLine = centerLine - range;

    var endColumn = centerColumn + range;
    var endLine = centerLine + range;

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

    var availablePositions = [];

    for (var column = startColumn; column < endColumn; column++) {
        for (var line = startLine; line < endLine; line++) {
            if (MAP[line][column] === POSITION_TYPE.passable) {
                availablePositions.push({
                    column: column,
                    line: line,
                });
            }
        }
    }

    return availablePositions;
};

Map.getPosition = function (column, line) {
    var x = STARTING_X + column * SQUARE_SIZE;
    var y = STARTING_Y + line * SQUARE_SIZE;

    return {
        x: x,
        y: y,
    };
};

/*
    Gets all units in an area (only ground / only air / both, depending on the tower)
 */
Map.getUnits = function (x, y, radius, tower) {
    var unitsInRange = [];
    var array;

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

    for (var a = 0; a < array.length; a++) {
        var unit = array[a];

        if (
            Utilities.circlePointCollision(
                x,
                y,
                radius,
                unit.getX(),
                unit.getY()
            )
        ) {
            unitsInRange.push(unit);
        }
    }

    return unitsInRange;
};

Map.getUnitInRange = function (tower) {
    var x = tower.getX();
    var y = tower.getY();
    var rangeRadius = tower.range;
    var array;

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

    for (var a = 0; a < array.length; a++) {
        var unit = array[a];

        if (
            Utilities.circlePointCollision(
                x,
                y,
                rangeRadius,
                unit.getX(),
                unit.getY()
            )
        ) {
            return unit;
        }
    }

    return null;
};

/**
 * Check if its possible to add a tower in this position (if it doesn't block the units path).
 * If that is the case, then add the tower at the given position.
 */
Map.addTower = function (towerClass, column, line) {
    if (Map.isAvailable(column, line)) {
        // check if by filling this position, we're not blocking the units (they need to be always be able to reach the destination)
        Map.setImpassableBox(column, line, 2);

        // check if there is a possible path (if its not going to block a lane)
        var paths = [];

        for (var b = 0; b < CREEP_LANES.length; b++) {
            var lane = CREEP_LANES[b];
            var path = PathFinding.breadthFirstSearch(
                MAP,
                CREEP_LANES[b].end,
                POSITION_TYPE
            );

            //HERE need to check each unit as well? or they might get trapped
            var canReach = canReachDestination(
                path,
                lane.start.column,
                lane.start.line
            );

            if (canReach === false) {
                GameMenu.showMessage("Can't block the unit's path.");

                // reset the position
                Map.setPassableBox(column, line, 2);
                return;
            } else {
                paths.push(path);
            }
        }

        // its possible to add the tower
        // update the path and add the tower
        PATHS = paths;

        new towerClass({
            column: column,
            line: line,
        });
    }
};

/**
 * Remove a tower from the map, and update the pathing of the units.
 */
Map.removeTower = function (tower) {
    Map.setPassableBox(tower.column, tower.line, 2);
    Map.updatePath();
};

/**
 * Check if its possible to reach the destination from a given column/line position.
 */
function canReachDestination(path, column, line) {
    var next;

    while (true) {
        next = path[line][column];

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
