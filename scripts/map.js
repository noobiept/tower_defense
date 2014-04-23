(function(window)
{
function Map()
{

}

var OBSTACLES = [];

var MAP_WIDTH = 0;
var MAP_HEIGHT = 0;
var NUMBER_OF_COLUMNS = 0;
var NUMBER_OF_LINES = 0;

var STARTING_X = 0;
var STARTING_Y = 0;

var GRAPH = null;       // for the AStar path finding
var SQUARE_SIZE = 10;   // in pixels

var GRID_HIGHLIGHT = {
        shape: null,
        column: 0,
        line: 0
    };


Map.init = function( numberOfColumns, numberOfLines, creepLanes, obstacles )
{
var squareSize = Map.getSquareSize();
var width = numberOfColumns * squareSize;
var height = numberOfLines * squareSize;

    // 2 dimensional array, with all the positions of the map
    // 0 -> wall (impassable square)
    // 1 -> passable square
    // main array represents the columns (map[ 0 ], first column, map[ 0 ][ 1 ], first column and second line)
var map = [];

for (var column = 0 ; column < numberOfColumns ; column++)
    {
    map[ column ] = [];

    for (var line = 0 ; line < numberOfLines ; line++)
        {
        map[ column ][ line ] = 1;
        }
    }

GRAPH = new Graph( map );


    // set the canvas width/height
var windowWidth = $( window ).outerWidth();
var windowHeight = $( window ).outerHeight();
var canvasWidth, canvasHeight;
var padding = 10;
var mapWidth = width + padding;
var mapHeight = height + padding;

    // we try to occupy the whole window's dimension, if the map's width/height fits there, otherwise just set the canvas width/height to the same as the map
if ( mapWidth < windowWidth )
    {
    canvasWidth = windowWidth;
    }

else
    {
    canvasWidth = mapWidth;
    }

if ( mapHeight < windowHeight - G.GAME_MENU_HEIGHT )
    {
    canvasHeight = windowHeight - G.GAME_MENU_HEIGHT;
    }

else
    {
    canvasHeight = mapHeight;
    }

G.CANVAS.width = canvasWidth;
G.CANVAS.height = canvasHeight;


STARTING_X = canvasWidth / 2 - numberOfColumns * SQUARE_SIZE / 2;
STARTING_Y = canvasHeight / 2 - numberOfLines * SQUARE_SIZE / 2;

    // add walls around the map
Map.addObstacle({
        startColumn: 0,
        startLine: 0,
        columnLength: 1,
        lineLength: numberOfLines
    });     // left
Map.addObstacle({
        startColumn: numberOfColumns - 1,
        startLine: 0,
        columnLength: 1,
        lineLength: numberOfLines
    });     // right
Map.addObstacle({
        startColumn: 0,
        startLine: 0,
        columnLength: numberOfColumns,
        lineLength: 1
    });     // top
Map.addObstacle({
        startColumn: 0,
        startLine: numberOfLines - 1,
        columnLength: numberOfColumns,
        lineLength: 1
    });     // bottom

    // add the part of the wall where the creeps start/end (new wall with different color)
for (var a = 0 ; a < creepLanes.length ; a++)
    {
    var lane = creepLanes[ a ];
    var halfLength = parseInt( lane.length / 2, 10 );
    var startColumn, startLine;
    var endColumn, endLine;
    var columnLength, lineLength;

    if ( lane.orientation == 'horizontal' )
        {
        startColumn = lane.start.column;
        startLine = lane.start.line - halfLength;

        endColumn = lane.end.column;
        endLine = startLine;

        columnLength = 1;
        lineLength = lane.length;
        }

    else
        {
        startColumn = lane.start.column - halfLength;
        startLine = lane.start.line;

        endColumn = startColumn;
        endLine = lane.end.line;

        columnLength = lane.length;
        lineLength = 1;
        }


    Map.addObstacle({
            startColumn: startColumn,
            startLine: startLine,
            columnLength: columnLength,
            lineLength: lineLength,
            passable: true
        });
    Map.addObstacle({
            startColumn: endColumn,
            startLine: endLine,
            columnLength: columnLength,
            lineLength: lineLength,
            passable: true
        });
    }


    // other obstacles
if ( obstacles )
    {
    for (var a = 0 ; a < obstacles.length ; a++)
        {
        var obstacle = obstacles[ a ]

        Map.addObstacle({
                startColumn: obstacle.startColumn,
                startLine: obstacle.startLine,
                columnLength: obstacle.columnLength,
                lineLength: obstacle.lineLength,
                passable: obstacle.passable
            });
        }
    }



    // the highlight square which shows where the towers will be added
var highlight = new createjs.Shape();

var g = highlight.graphics;

g.beginFill( 'rgba(0,255,0,0.3)' );
g.drawRect( 0, 0, SQUARE_SIZE * 2, SQUARE_SIZE * 2 );
g.endFill();

G.STAGE.addChild( highlight );

GRID_HIGHLIGHT.shape = highlight;
MAP_WIDTH = width;
MAP_HEIGHT = height;
NUMBER_OF_COLUMNS = numberOfColumns;
NUMBER_OF_LINES = numberOfLines;
};



Map.setImpassableBox = function( startColumn, startLine, length )
{
for (var column = startColumn ; column < startColumn + length ; column++)
    {
    for (var line = startLine ; line < startLine + length ; line++)
        {
        GRAPH.nodes[ column ][ line ].type = 0;
        }
    }
};

Map.setPassableBox = function( startColumn, startLine, length )
{
for (var column = startColumn ; column < startColumn + length ; column++)
    {
    for (var line = startLine ; line < startLine + length ; line++)
        {
        GRAPH.nodes[ column ][ line ].type = 1;
        }
    }
};


/*
    Sets a single square
 */

Map.setImpassable = function( column, line )
{
GRAPH.nodes[ column ][ line ].type = 0;
};

Map.setPassable = function( column, line )
{
GRAPH.nodes[ column ][ line ].type = 1;
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

Map.addObstacle = function( args )
{
if ( typeof args.passable === 'undefined' )
    {
    args.passable = false;
    }

if ( typeof args.fillColor === 'undefined' )
    {
    if ( args.passable === true )
        {
        args.fillColor = 'rgb(0,200,0)';
        }

    else
        {
        args.fillColor = 'black';
        }
    }


var endColumn = args.startColumn + args.columnLength;
var endLine = args.startLine + args.lineLength;
var width = args.columnLength * SQUARE_SIZE;
var height = args.lineLength * SQUARE_SIZE;


for (var column = args.startColumn ; column < endColumn ; column++)
    {
    for (var line = args.startLine ; line < endLine ; line++)
        {
        if ( args.passable === true )
            {
            Map.setPassable( column, line );
            }

        else
            {
            Map.setImpassable( column, line );
            }
        }
    }



var obstacle = new createjs.Shape();

var g = obstacle.graphics;

g.beginFill( args.fillColor );
g.drawRect( 0, 0, width, height );
g.endFill();

obstacle.x = STARTING_X + args.startColumn * SQUARE_SIZE;
obstacle.y = STARTING_Y + args.startLine * SQUARE_SIZE;

G.STAGE.addChild( obstacle );

OBSTACLES.push( obstacle );
};



Map.clear = function()
{
for (var a = 0 ; a < OBSTACLES.length ; a++)
    {
    G.STAGE.removeChild( OBSTACLES[ a ] );
    }

OBSTACLES.length = 0;

G.STAGE.removeChild( GRID_HIGHLIGHT.shape );

GRAPH = null;
};

Map.getSquareSize = function()
{
return SQUARE_SIZE;
};


Map.calculatePosition = function( targetX, targetY )
{
var line = 0;
var column = 0;

targetX -= STARTING_X;
targetY -= STARTING_Y;

for (var x = SQUARE_SIZE ; x < MAP_WIDTH ; x += SQUARE_SIZE)
    {
    if ( x >= targetX )
        {
        break;
        }

    column++;
    }

for (var y = SQUARE_SIZE ; y < MAP_HEIGHT ; y += SQUARE_SIZE)
    {
    if ( y >= targetY )
        {
        break;
        }

    line++;
    }

return [ column, line ];
};


Map.mouseMoveEvents = function( event )
{
var position = Map.calculatePosition( event.stageX, event.stageY );

var column = position[ 0 ];
var line = position[ 1 ];

    // highlight is same size as a tower (2x2), so can't let it go to last position
    // also don't let it go to the walls or the creep start/end
if ( column < 1 )
    {
    column = 1;
    }

else if ( column + 2 >= NUMBER_OF_COLUMNS )
    {
    column = NUMBER_OF_COLUMNS - 3;
    }

if ( line < 1 )
    {
    line = 1;
    }

else if ( line + 2 >= NUMBER_OF_LINES )
    {
    line = NUMBER_OF_LINES - 3;
    }

GRID_HIGHLIGHT.column = column;
GRID_HIGHLIGHT.line = line;

GRID_HIGHLIGHT.shape.x = STARTING_X + column * SQUARE_SIZE;
GRID_HIGHLIGHT.shape.y = STARTING_Y + line * SQUARE_SIZE;
};

Map.getHighlightSquare = function()
{
return GRID_HIGHLIGHT;
};


/*
    Checks if its possible to add a tower in this position (tower occupies 2x2 squares)
 */

Map.isAvailable = function( column, line )
{
    // check for the limits of the map
if ( column < 0 || column + 1 >= NUMBER_OF_COLUMNS ||
     line < 0 || line + 1 >= NUMBER_OF_LINES )
    {
    return false;
    }

    // check if there's already a tower in this position
if ( !GRAPH.nodes[ column ][ line ].type ||
     !GRAPH.nodes[ column + 1 ][ line ].type ||
     !GRAPH.nodes[ column ][ line + 1 ].type ||
     !GRAPH.nodes[ column + 1 ][ line + 1 ].type )
    {
    return false;
    }

return true;
};


Map.getAvailablePositions = function( centerColumn, centerLine, length )
{
var halfLength = parseInt( length / 2, 10 );
var leftColumn = centerColumn - halfLength;

if ( leftColumn < 0 )
    {
    leftColumn = 0;
    }

var rightColumn = centerColumn + halfLength;

if ( rightColumn >= NUMBER_OF_COLUMNS )
    {
    rightColumn = NUMBER_OF_COLUMNS - 1;
    }

var topLine = centerLine - halfLength;

if ( topLine < 0 )
    {
    topLine = 0;
    }

var bottomLine = centerLine + halfLength;

if ( bottomLine >= NUMBER_OF_LINES )
    {
    bottomLine = NUMBER_OF_LINES - 1;
    }


var availablePositions = [];

for (var column = leftColumn ; column < rightColumn ; column++)
    {
    for (var line = topLine ; line < bottomLine ; line++)
        {
        var position = GRAPH.nodes[ column ][ line ];

        if ( position.type === 1 )
            {
            availablePositions.push( [ column, line ] );
            }
        }
    }

return availablePositions;
};



Map.getPosition = function( column, line )
{
var x = STARTING_X + column * SQUARE_SIZE;
var y = STARTING_Y + line * SQUARE_SIZE;

return {
        x: x,
        y: y
    };
};



Map.getPath = function( startColumn, startLine, endColumn, endLine )
{
var start = GRAPH.nodes[ startColumn ][ startLine ];
var end = GRAPH.nodes[ endColumn ][ endLine ];

return astar.search( GRAPH.nodes, start, end );
};

/*
    Gets all units in an area (only ground / only air / both, depending on the tower)
 */

Map.getUnits = function( x, y, radius, tower )
{
var unitsInRange = [];
var array;

if ( tower.can_target_ground )
    {
    if ( tower.can_target_air )
        {
        array = Unit.ALL;
        }

    else
        {
        array = Unit.ALL_GROUND;
        }
    }

    // assumes .can_target_air == true
else
    {
    array = Unit.ALL_AIR;
    }


for (var a = 0 ; a < array.length ; a++)
    {
    var unit = array[ a ];

    if ( circlePointCollision( x, y, radius, unit.getX(), unit.getY() ) )
        {
        unitsInRange.push( unit );
        }
    }

return unitsInRange;
};


Map.getUnitInRange = function( tower )
{
var x = tower.getX();
var y = tower.getY();
var rangeRadius = tower.range;
var array;

if ( tower.can_target_ground )
    {
    if ( tower.can_target_air )
        {
        array = Unit.ALL;
        }

    else
        {
        array = Unit.ALL_GROUND;
        }
    }

    // assumes .can_target_air == true
else
    {
    array = Unit.ALL_AIR;
    }

for (var a = 0 ; a < array.length ; a++)
    {
    var unit = array[ a ];

    if ( circlePointCollision( x, y, rangeRadius, unit.getX(), unit.getY() ) )
        {
        return unit;
        }
    }

return null;
};


Map.getTowerInRange = function( unit )
{
var x = unit.getX();
var y = unit.getY();
var rangeRadius = unit.range;

for (var a = 0 ; a < Tower.ALL.length ; a++)
    {
    var tower = Tower.ALL[ a ];

    if ( circlePointCollision( x, y, rangeRadius, tower.getX(), tower.getY() ) )
        {
        return tower;
        }
    }

return null;
};


window.Map = Map;

}(window));
