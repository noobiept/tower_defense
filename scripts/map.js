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

    // 2 dimensional array, with all the positions of the map
    // 0 -> passable square
    // 1 -> impassable square
    // main array represents the columns (MAP[ 0 ], first column, MAP[ 0 ][ 1 ], first column and second line)
var MAP = [];
var SQUARE_SIZE = 10;   // in pixels

var GRID_HIGHLIGHT = {
        shape: null,
        column: 0,
        line: 0
    };



Map.init = function( numberOfColumns, numberOfLines )
{
var squareSize = Map.getSquareSize();
var width = numberOfColumns * squareSize;
var height = numberOfLines * squareSize;

for (var column = 0 ; column < numberOfColumns ; column++)
    {
    MAP[ column ] = [];

    for (var line = 0 ; line < numberOfLines ; line++)
        {
        MAP[ column ][ line ] = null;
        }
    }


STARTING_X = $( window ).width() / 2 - numberOfColumns * SQUARE_SIZE / 2;
STARTING_Y = $( window ).height() / 2 - numberOfLines * SQUARE_SIZE / 2;

    // add walls around the map
Map.addWall( STARTING_X - WALL_THICKNESS, STARTING_Y, WALL_THICKNESS, height + WALL_THICKNESS );        // left
Map.addWall( STARTING_X + width, STARTING_Y, WALL_THICKNESS, height + WALL_THICKNESS );    // right
Map.addWall( STARTING_X, STARTING_Y, width, WALL_THICKNESS );         // top
Map.addWall( STARTING_X, STARTING_Y + height, width, WALL_THICKNESS );    // bottom


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
MAP[ tower.column ][ tower.line ] = tower;
MAP[ tower.column + 1 ][ tower.line ] = tower;
MAP[ tower.column ][ tower.line + 1 ] = tower;
MAP[ tower.column + 1 ][ tower.line + 1 ] = tower;
};


Map.removeTower = function( tower )
{
MAP[ tower.column ][ tower.line ] = null;
MAP[ tower.column + 1 ][ tower.line ] = null;
MAP[ tower.column ][ tower.line + 1 ] = null;
MAP[ tower.column + 1 ][ tower.line + 1 ] = null;
};


Map.addDummy = function( column, line )
{
MAP[ column ][ line ] = 1;
MAP[ column + 1 ][ line ] = 1;
MAP[ column ][ line + 1 ] = 1;
MAP[ column + 1 ][ line + 1 ] = 1;
};

Map.clearPosition = function( column, line )
{
MAP[ column ][ line ] = null;
MAP[ column + 1 ][ line ] = null;
MAP[ column ][ line + 1 ] = null;
MAP[ column + 1 ][ line + 1 ] = null;
};


Map.getTower = function( column, line )
{
return MAP[ column ][ line ];
};



Map.addWall = function( x, y, width, height )
{
var wall = new createjs.Shape();

var g = wall.graphics;

g.beginFill( 'black' );
g.drawRect( 0, 0, width, height );
g.endFill();

wall.x = x;
wall.y = y;

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

MAP.length = 0;
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

return [ line, column ];
};


Map.mouseMoveEvents = function( event )
{
var position = Map.calculatePosition( event.stageX, event.stageY );

var column = position[ 1 ];
var line = position[ 0 ];

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
if ( MAP[ column ][ line ] || MAP[ column + 1 ][ line ] ||
     MAP[ column ][ line + 1 ] || MAP[ column + 1 ][ line + 1 ] )
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





/*
    startPosition/endPosition is an array with the line/column

    startPosition = [ line, column ]
 */

Map.getPath = function( startPosition, endPosition )
{
return AStar( MAP, startPosition, endPosition );
};


Map.getUnitInRange = function( tower )
{
var x = tower.getX();
var y = tower.getY();
var rangeRadius = tower.range;

for (var a = 0 ; a < Unit.ALL.length ; a++)
    {
    var unit = Unit.ALL[ a ];

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


Map.getNumberOfLines = function()
{
return NUMBER_OF_LINES;
};


Map.getNumberOfColumns = function()
{
return NUMBER_OF_COLUMNS;
};


window.Map = Map;

}(window));