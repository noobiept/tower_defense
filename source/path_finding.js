export var PathFinding = {};
/**
 * Calculate the path that an element needs to take to reach the destination, from any valid position.
 *
 * The algorithm used is the `breadth First Search - unweighted edges`. All sources, one destination.
 * We start at the end position, and spread from there.
 *
 * Basic Usage:
 *
 *     var map = [
 *         [ 1, 1, 0, 0 ],
 *         [ 0, 1, 0, 0 ],
 *         [ 0, 1, 1, 1 ],
 *         [ 0, 0, 0, 1 ]
 *     ];
 *     var destination = {
 *         column: 0,
 *         line: 0
 *     };
 *     var positionType = {
 *         passable: 1,
 *         blocked: 0
 *     };
 *
 *     var path = Game.PathFinding.breadthFirstSearch( map, destination, positionType );
 *
 *         // `path` is a 2d array, where each column/line position tells you where to go next. If it tells to go to the current position, then it means you reached the destination.
 *         // so for example, the position before the destination
 *     var line = 0;
 *     var column = 1;
 *     var goTo = path[ line ][ column ];   // { column: 0, line: 0 }
 *
 * Examples -- `tower_defense`
 *
 *
 * @param map A 2d array, where each value tells if that position is passable/blocked. Its assumed each line will have the same number of columns.
 * @param destination The destination position.
 * @param positionType What value in the `map` represents a passable position and what value represents a blocked position.
 */
PathFinding.breadthFirstSearch = function (map, destination, positionType) {
    var frontier = [destination];
    var cameFrom = [];

    // figure out the number of columns/lines of the map array
    // have all the useful information in one object
    var info = {
        columns: map[0].length,
        lines: map.length,
        map: map,
        passableValue: positionType.passable,
    };

    // construct a 2 dimension array, where the value is a column/line position, which tells the creeps where to go next.
    for (var line = 0; line < info.lines; line++) {
        cameFrom[line] = [];

        for (var column = 0; column < info.columns; column++) {
            cameFrom[line][column] = null;
        }
    }

    cameFrom[destination.line][destination.column] = destination;

    // go through all the passable positions
    while (frontier.length > 0) {
        var current = frontier.shift();
        var neighbors = getNeighbors(current, info);

        for (var a = 0; a < neighbors.length; a++) {
            var next = neighbors[a];

            // check if we've being through this position
            if (cameFrom[next.line][next.column] === null) {
                frontier.push(next);

                cameFrom[next.line][next.column] = current;
            }
        }
    }

    return cameFrom;
};

/**
 * Get the neighbor positions (top/bottom/left/right).
 */
function getNeighbors(position, info) {
    var neighbors = [];
    var column = position.column;
    var line = position.line;
    var map = info.map;

    var leftColumn = column - 1;
    var rightColumn = column + 1;
    var topLine = line - 1;
    var bottomLine = line + 1;

    // check the position to the left
    if (column > 0 && map[line][leftColumn] === info.passableValue) {
        neighbors.push({
            column: leftColumn,
            line: line,
        });
    }

    // check the position to the right
    if (
        column + 1 < info.columns &&
        map[line][rightColumn] === info.passableValue
    ) {
        neighbors.push({
            column: rightColumn,
            line: line,
        });
    }

    // check the position to the top
    if (line > 0 && map[topLine][column] === info.passableValue) {
        neighbors.push({
            column: column,
            line: topLine,
        });
    }

    // check the position in the bottom
    if (
        line + 1 < info.lines &&
        map[bottomLine][column] === info.passableValue
    ) {
        neighbors.push({
            column: column,
            line: bottomLine,
        });
    }

    return neighbors;
}
