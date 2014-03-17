(function(window)
{
function Game()
{

}

var UNIT_COUNT = 0;
var UNIT_LIMIT = 150;

    // where the units start/spawn and to where they move
var UNIT_START = {
        column: 0,
        line: 0
    };
var UNIT_END = {
        column: 0,
        line: 0
    };



Game.start = function()
{
var mapInfo = G.PRELOAD.getResult( 'map1' );

var mapWidth = mapInfo.width * mapInfo.tilewidth;
var mapHeight = mapInfo.height * mapInfo.tileheight;

Map.init( mapWidth, mapHeight );

var objects = mapInfo.layers[ 0 ].objects;
var squareSize = Map.getSquareSize();

for (var a = 0 ; a < objects.length ; a++)
    {
    var element = objects[ a ];

    var args = element.properties;

        // the map editor gives the x/y position based on the bottom left corner, but in the game we use the top left, so need to adjust that (since each element occupies a square, we can just subtract 1)
    args.column = parseInt( element.x / squareSize );
    args.line = parseInt( element.y / squareSize ) - 1;

    var theClass = window[ element.type ];

    new theClass( args );
    }


    // the width/height from the mapInfo is the number of columns/lines
var halfLine = parseInt( mapInfo.height / 2, 10 );

UNIT_START.column = 0;
UNIT_START.line = halfLine;
UNIT_END.column = mapInfo.width - 1;
UNIT_END.line = halfLine;


createjs.Ticker.on( 'tick', Game.tick );

    // disable the context menu (when right-clicking)
window.oncontextmenu = function( event ) { return false; };
G.CANVAS.addEventListener( 'mouseup', Game.mouseEvents );
G.CANVAS.addEventListener( 'mousemove', Map.mouseMoveEvents );
};


Game.mouseEvents = function( event )
{
var button = event.button;
var x = event.clientX;
var y = event.clientY;

    // left click
if ( button == 0 )
    {
        // check if its available that position
    var position = Map.calculatePosition( x, y );

    var column = position[ 1 ];
    var line = position[ 0 ];

    if ( Map.isAvailable( column, line ) )
        {
            // check if by filling this position, we're not blocking the units (they need to be always be able to reach the destination)
        Map.addDummy( column, line );

            // check if there is a possible path
        var path = Map.getPath( [ UNIT_START.line, UNIT_START.column ], [ UNIT_END.line, UNIT_END.column ] );

            // reset the position
        Map.clearPosition( column, line );

        if ( path.length > 0 )
            {
            new Tower({
                    column: column,
                    line: line
                });

            Unit.redoMoveDestination();
            }

        else
            {
            console.log( "Can't block the unit's path." );
            }

        }
    }

    // right click
else if ( button == 2 )
    {
        // check if there's a tower in that position
    var position = Map.calculatePosition( x, y );

    var column = position[ 1 ];
    var line = position[ 0 ];

    var tower = Map.getTower( column, line );

    if ( tower )
        {
        tower.remove();

        Unit.redoMoveDestination();
        }
    }
};




Game.tick = function( event )
{
if ( event.paused )
    {
    return;
    }


UNIT_COUNT++;

if ( UNIT_COUNT >= UNIT_LIMIT )
    {
    UNIT_COUNT = 0;

    new Unit({
            column: UNIT_START.column,
            line: UNIT_START.line,
            destination_column: UNIT_END.column,
            destination_line: UNIT_END.line
        });
    }


var a;

for (a = 0 ; a < Unit.ALL.length ; a++)
    {
    Unit.ALL[ a ].tick();
    }


G.STAGE.update();
};


window.Game = Game;

}(window));