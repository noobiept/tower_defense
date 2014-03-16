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