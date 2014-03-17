(function(window)
{
function Map()
{

}

var WALLS = [];
var WALL_THICKNESS = 3;

var MAP_WIDTH = 0;
var MAP_HEIGHT = 0;

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


    // add walls around the map
Map.addWall( 0, 0, WALL_THICKNESS, height );        // left
Map.addWall( width, 0, WALL_THICKNESS, height );    // right
Map.addWall( 0, 0, width, WALL_THICKNESS );         // top
Map.addWall( 0, height, width, WALL_THICKNESS );    // bottom

GRID_HIGHLIGHT = new createjs.Shape();

var g = GRID_HIGHLIGHT.graphics;

g.beginFill( 'rgba(0,255,0,0.3)' );
g.drawRect( 0, 0, SQUARE_SIZE, SQUARE_SIZE );
g.endFill();

G.STAGE.addChild( GRID_HIGHLIGHT );

MAP_WIDTH = width;
MAP_HEIGHT = height;
};



Map.addTower = function( tower )
{
MAP[ tower.column ][ tower.line ] = tower;
};


Map.removeTower = function( tower )
{
MAP[ tower.column ][ tower.line ] = null;
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

GRID_HIGHLIGHT.x = position[ 1 ] * SQUARE_SIZE;
GRID_HIGHLIGHT.y = position[ 0 ] * SQUARE_SIZE;
};



Map.isAvailable = function( column, line )
{
if ( MAP[ column ][ line ] )
    {
    return false;
    }

return true;
};


Map.getMap = function()
{
return MAP;
};


window.Map = Map;

}(window));