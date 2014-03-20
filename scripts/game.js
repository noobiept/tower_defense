(function(window)
{
function Game()
{

}
    // where the units start/spawn and to where they move
var UNIT_START = {
        column: 0,
        line: 0
    };
var UNIT_END = {
        column: 0,
        line: 0
    };
var ALL_WAVES = [
        {
            type: 'Unit',
            howMany: 10,
            count: 0,       // count until limit, and then add a new unit
            countLimit: 50
        },
        {
            type: 'Unit',
            howMany: 10,
            count: 0,
            countLimit: 10
        }
    ];
var ACTIVE_WAVES = [];  // you may have more than 1 wave active (adding units)
var CURRENT_WAVE = 0;
var NO_MORE_WAVES = false;
var WAVE_LIMIT = 400;
var WAVE_COUNT = WAVE_LIMIT;    // start the first wave immediately
var WAVE_ELEMENT = null;

var ELEMENT_SELECTED = null;


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

WAVE_ELEMENT = document.querySelector( '.currentWave span' );

createjs.Ticker.on( 'tick', Game.tick );

    // disable the context menu (when right-clicking)
window.oncontextmenu = function( event ) { return false; };
G.CANVAS.addEventListener( 'mouseup', Game.mouseEvents );
G.STAGE.on( 'stagemousemove', Map.mouseMoveEvents );
};


Game.mouseEvents = function( event )
{
var button = event.button;
var x = event.clientX;
var y = event.clientY;

if ( ELEMENT_SELECTED )
    {
    Game.clearSelection();
    }


    // left click
if ( button == 0 )
    {
        // see if we're selecting an unit
    for (var a = 0 ; a < Unit.ALL.length ; a++)
        {
        var unit = Unit.ALL[ a ];
        var point = unit.shape.globalToLocal( x, y );

        if ( unit.shape.hitTest( point.x, point.y ) )
            {
            unit.selected();

            ELEMENT_SELECTED = unit;
            return;
            }
        }

        // see if we're selecting a tower
    for (var a = 0 ; a < Tower.ALL.length ; a++)
        {
        var tower = Tower.ALL[ a ];
        var point = tower.shape.globalToLocal( x, y );

        if ( tower.shape.hitTest( point.x, point.y ) )
            {
            tower.selected();

            ELEMENT_SELECTED = tower;
            return;
            }
        }



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


Game.clearSelection = function()
{
ELEMENT_SELECTED.unselected();
ELEMENT_SELECTED = null;
};


Game.checkIfSelected = function( element )
{
if ( element == ELEMENT_SELECTED )
    {
    return true;
    }

return false;
};


Game.end = function()
{
createjs.Ticker.setPaused( true );
console.log('game end');
};


Game.tick = function( event )
{
if ( event.paused )
    {
    return;
    }

var a;

WAVE_COUNT++;

if ( !NO_MORE_WAVES && WAVE_COUNT >= WAVE_LIMIT )
    {
    WAVE_COUNT = 0;

    ACTIVE_WAVES.push( ALL_WAVES[ CURRENT_WAVE ] );

    $( WAVE_ELEMENT ).text( CURRENT_WAVE + 1 );

    CURRENT_WAVE++;
    

    if ( CURRENT_WAVE >= ALL_WAVES.length )
        {
        NO_MORE_WAVES = true;
        }
    }


for (a = ACTIVE_WAVES.length - 1 ; a >= 0 ; a--)
    {
    var wave = ACTIVE_WAVES[ a ];

    wave.count++;

    if ( wave.count >= wave.countLimit )
        {
        wave.count = 0;

        var className = window[ wave.type ];
        new className({
                column: UNIT_START.column,
                line: UNIT_START.line,
                destination_column: UNIT_END.column,
                destination_line: UNIT_END.line
            });

        wave.howMany--;

        if ( wave.howMany <= 0 )
            {
            var index = ACTIVE_WAVES.indexOf( wave );

            ACTIVE_WAVES.splice( index, 1 );
            }
        }
    }



if ( NO_MORE_WAVES && ACTIVE_WAVES.length == 0 && Unit.ALL.length == 0 )
    {
    Game.end();
    }



for (a = Unit.ALL.length - 1 ; a >= 0 ; a--)
    {
    Unit.ALL[ a ].tick();
    }

for (a = Tower.ALL.length - 1 ; a >= 0 ; a--)
    {
    Tower.ALL[ a ].tick();
    }


if ( ELEMENT_SELECTED )
    {
    ELEMENT_SELECTED.updateSelection();
    }

G.STAGE.update();
};


window.Game = Game;

}(window));