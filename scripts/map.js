(function(window)
{
function Map()
{

}

var WALLS = [];
var WALL_THICKNESS = 3;

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


Map.init = function( numberOfColumns, numberOfLines, creepLanes )
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


STARTING_X = $( window ).width() / 2 - numberOfColumns * SQUARE_SIZE / 2;
STARTING_Y = $( window ).height() / 2 - numberOfLines * SQUARE_SIZE / 2;

    // add walls around the map
Map.addWall( -WALL_THICKNESS, 0, WALL_THICKNESS, height + WALL_THICKNESS );        // left
Map.addWall( width, 0, WALL_THICKNESS, height + WALL_THICKNESS );    // right
Map.addWall( 0, 0, width, WALL_THICKNESS );         // top
Map.addWall( 0, height, width, WALL_THICKNESS );    // bottom

    // add the part of the wall where the creeps start/end (new wall with different color)
for (var a = 0 ; a < creepLanes.length ; a++)
    {
    var lane = creepLanes[ a ];
    var startX, startY, startWidth, startHeight;
    var endX, endY, endWidth, endHeight;
    var halfLength = lane.length / 2;

    if ( lane.orientation == 'vertical' )
        {
        startX = lane.start.column * squareSize - WALL_THICKNESS;
        startY = (lane.start.line - halfLength) * squareSize;

        endX = (lane.end.column + 1) * squareSize;
        endY = (lane.end.line - halfLength) * squareSize;

        startWidth = endWidth = WALL_THICKNESS;
        startHeight = endHeight = lane.length * squareSize;
        }

    else
        {
        startX = (lane.start.column - halfLength) * squareSize;
        startY = lane.start.line * squareSize;

        endX = (lane.end.column - halfLength) * squareSize;
        endY = (lane.end.line + 1) * squareSize;

        startWidth = endWidth = lane.length * squareSize;
        startHeight = endHeight = WALL_THICKNESS;
        }


    Map.addWall( startX, startY, startWidth, startHeight, 'rgb(0,200,0)' );
    Map.addWall( endX, endY, endWidth, endHeight, 'rgb(0,200,0)' );
    }



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



Map.addTower = function( tower )
{
GRAPH.nodes[ tower.column ][ tower.line ].type = 0;
GRAPH.nodes[ tower.column + 1 ][ tower.line ].type = 0;
GRAPH.nodes[ tower.column ][ tower.line + 1 ].type = 0;
GRAPH.nodes[ tower.column + 1 ][ tower.line + 1 ].type = 0;
};


Map.removeTower = function( tower )
{
GRAPH.nodes[ tower.column ][ tower.line ].type = 1;
GRAPH.nodes[ tower.column + 1 ][ tower.line ].type = 1;
GRAPH.nodes[ tower.column ][ tower.line + 1 ].type = 1;
GRAPH.nodes[ tower.column + 1 ][ tower.line + 1 ].type = 1;
};


Map.addDummy = function( column, line )
{
GRAPH.nodes[ column ][ line ].type = 0;
GRAPH.nodes[ column + 1 ][ line ].type = 0;
GRAPH.nodes[ column ][ line + 1 ].type = 0;
GRAPH.nodes[ column + 1 ][ line + 1 ].type = 0;
};

Map.clearPosition = function( column, line )
{
GRAPH.nodes[ column ][ line ].type = 1;
GRAPH.nodes[ column + 1 ][ line ].type = 1;
GRAPH.nodes[ column ][ line + 1 ].type = 1;
GRAPH.nodes[ column + 1 ][ line + 1 ].type = 1;
};




Map.addWall = function( x, y, width, height, fillColor )
{
if ( typeof fillColor == 'undefined' )
    {
    fillColor = 'black';
    }

var wall = new createjs.Shape();

var g = wall.graphics;

g.beginFill( fillColor );
g.drawRect( 0, 0, width, height );
g.endFill();

wall.x = STARTING_X + x;
wall.y = STARTING_Y + y;

G.STAGE.addChild( wall );

WALLS.push( wall );
};



Map.clear = function()
{
for (var a = 0 ; a < WALLS.length ; a++)
    {
    G.STAGE.removeChild( WALLS[ a ] );
    }

WALLS.length = 0;

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
if ( column + 1 >= NUMBER_OF_COLUMNS )
    {
    column--;
    }

if ( line + 1 >= NUMBER_OF_LINES )
    {
    line--;
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