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


Map.init = function( width, height )
{
var numberOfColumns = Math.floor( width / SQUARE_SIZE );
var numberOfLines = Math.floor( height / SQUARE_SIZE );


for (var column = 0 ; column < numberOfColumns ; column++)
    {
    MAP[ column ] = [];

    for (var line = 0 ; line < numberOfLines ; line++)
        {
        MAP[ column ][ line ] = 0;
        }
    }


    // add walls around the map
Map.addWall( 0, 0, WALL_THICKNESS, height );        // left
Map.addWall( width, 0, WALL_THICKNESS, height );    // right
Map.addWall( 0, 0, width, WALL_THICKNESS );         // top
Map.addWall( 0, height, width, WALL_THICKNESS );    // bottom

MAP_WIDTH = width;
MAP_HEIGHT = height;
};


/*
    Makes a rectangle passable/impassable terrain for the units

    rectangle = {
            left: Number,
            right: Number,
            top: Number,
            bottom: Number
        }

    impassable:
        0 for passable
        1 for impassable
 */

Map.setImpassableRectangle = function( rectangle, impassable )
{
for (var column = rectangle.left ; column < rectangle.right ; column++)
    {
    for (var line = rectangle.top ; line < rectangle.bottom ; line++)
        {
        MAP[ column ][ line ] = impassable;
        }
    }
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


window.Map = Map;

}(window));