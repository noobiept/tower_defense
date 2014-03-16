(function(window)
{
function Game()
{

}

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

createjs.Ticker.on( 'tick', Game.tick );

    // disable the context menu (when right-clicking)
window.oncontextmenu = function( event ) { return false; };
G.CANVAS.addEventListener( 'mouseup', Game.mouseEvents );
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
        new Tower({
                column: column,
                line: line
            });
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
        }
    }
};



Game.tick = function( event )
{
if ( event.paused )
    {
    return;
    }

G.STAGE.update();
};


window.Game = Game;

}(window));