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
var SQUARE_SIZE = 20;   // in pixels

var GRID_HIGHLIGHT = null;


Map.init = function( width, height )
{
var numberOfColumns = Math.floor( width / SQUARE_SIZE );
var numberOfLines = Math.floor( height / SQUARE_SIZE );


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

GRID_HIGHLIGHT = new createjs.Shape();

var g = GRID_HIGHLIGHT.graphics;

g.beginFill( 'rgba(0,255,0,0.3)' );
g.drawRect( 0, 0, SQUARE_SIZE, SQUARE_SIZE );
g.endFill();

G.STAGE.addChild( GRID_HIGHLIGHT );

MAP_WIDTH = width;
MAP_HEIGHT = height;
NUMBER_OF_COLUMNS = numberOfColumns;
NUMBER_OF_LINES = numberOfLines;
};



Map.addTower = function( tower )
{
MAP[ tower.column ][ tower.line ] = tower;
};


Map.removeTower = function( tower )
{
MAP[ tower.column ][ tower.line ] = null;
};


Map.addDummy = function( column, line )
{
MAP[ column ][ line ] = 1;
};

Map.clearPosition = function( column, line )
{
MAP[ column ][ line ] = null;
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
var position = Map.calculatePosition( event.clientX, event.clientY );


GRID_HIGHLIGHT.x = STARTING_X + position[ 1 ] * SQUARE_SIZE;
GRID_HIGHLIGHT.y = STARTING_Y + position[ 0 ] * SQUARE_SIZE;
};



Map.isAvailable = function( column, line )
{
if ( MAP[ column ][ line ] )
    {
    return false;
    }

return true;
};

Map.getPosition = function( column, line )
{
var x = STARTING_X + column * SQUARE_SIZE + SQUARE_SIZE / 2;
var y = STARTING_Y + line * SQUARE_SIZE + SQUARE_SIZE / 2;

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