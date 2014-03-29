(function(window)
{
function Game()
{

}

var CREEP_LANES = [];   // contains the start/end point of each lane
var ALL_WAVES = [];
var ACTIVE_WAVES = [];  // you may have more than 1 wave active (adding units)
var CURRENT_WAVE = 0;
var NO_MORE_WAVES = false;
var WAVE_LIMIT = 400;
var WAVE_COUNT = WAVE_LIMIT;    // start the first wave immediately

var ELEMENT_SELECTED = null;

var ELEMENTS = {
            // game menu
        currentWave: null,
        currentGold: null,
        currentLife: null
    };

var GOLD = 0;
var LIFE = 0;


Game.start = function()
{
var mapInfo = G.PRELOAD.getResult( 'map1' );

var columns = mapInfo.numberOfColumns;
var lines = mapInfo.numberOfLines;
var a;

    // read from the map info and update the appropriate variables
var intervalSeconds = createjs.Ticker.getInterval() / 1000;

for (a = 0 ; a < mapInfo.waves.length ; a++)
    {
    var wave = mapInfo.waves[ a ];

    ALL_WAVES.push({
            type: wave.type,
            howMany: wave.howMany,
            spawnInterval: wave.spawnInterval,
            count: 0,
            countLimit: wave.spawnInterval / intervalSeconds
        });
    }


for (a = 0 ; a < mapInfo.creepLanes.length ; a++)
    {
    var lane = mapInfo.creepLanes[ a ];

    CREEP_LANES.push({
            start: lane.start,
            end: lane.end,
            length: lane.length,
            orientation: lane.orientation
        });
    }


    // game menu html elements
ELEMENTS.currentWave = document.querySelector( '.currentWave span' );
ELEMENTS.currentGold = document.querySelector( '.currentGold span' );
ELEMENTS.currentLife = document.querySelector( '.currentLife span' );


    // init the game
Map.init( columns, lines, CREEP_LANES );

Game.updateGold( 100 );
Game.updateLife( 20 );

createjs.Ticker.on( 'tick', Game.tick );

    // disable the context menu (when right-clicking)
window.oncontextmenu = function( event ) { return false; };
G.CANVAS.addEventListener( 'mouseup', Game.mouseEvents );
G.STAGE.on( 'stagemousemove', Map.mouseMoveEvents );
};


Game.updateGold = function( gold )
{
GOLD += gold;

$( ELEMENTS.currentGold ).text( GOLD );
};


Game.haveEnoughGold = function( price )
{
if ( GOLD < price )
    {
    return false;
    }

return true;
};


Game.updateLife = function( life )
{
LIFE += life;

if ( LIFE <= 0 )
    {
    Game.end();
    }

$( ELEMENTS.currentLife ).text( LIFE );
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
        var point = tower.baseElement.globalToLocal( x, y );

        if ( tower.baseElement.hitTest( point.x, point.y ) )
            {
            tower.selected();

            ELEMENT_SELECTED = tower;
            return;
            }
        }


        // see if we can afford a tower
    if ( !Game.haveEnoughGold( Tower.cost ) )
        {
        console.log('not enough gold');
        return;
        }


    var highlight = Map.getHighlightSquare();

    var column = highlight.column;
    var line = highlight.line;

    if ( Map.isAvailable( column, line ) )
        {
            // check if by filling this position, we're not blocking the units (they need to be always be able to reach the destination)
        Map.addDummy( column, line );

            // check if there is a possible path (if its not going to block a lane)
        for (var b = 0 ; b < CREEP_LANES.length ; b++)
            {
            var lane = CREEP_LANES[ b ];

            var path = Map.getPath( lane.start.column, lane.start.line, lane.end.column, lane.end.line );

            if ( path.length <= 0 )
                {
                console.log( "Can't block the unit's path." );

                    // reset the position
                Map.clearPosition( column, line );
                return;
                }
            }

            // reset the position
        Map.clearPosition( column, line );

        new Tower({
                column: column,
                line: line
            });
        }
    }

    // right click
else if ( button == 2 )
    {
        // see if we're selecting a tower
    for (var a = 0 ; a < Tower.ALL.length ; a++)
        {
        var tower = Tower.ALL[ a ];
        var point = tower.baseElement.globalToLocal( x, y );

        if ( tower.baseElement.hitTest( point.x, point.y ) )
            {
            tower.startSelling();
            }
        }
    }
};


Game.clearSelection = function()
{
ELEMENT_SELECTED.unselected();
ELEMENT_SELECTED = null;
};

Game.getSelection = function()
{
return ELEMENT_SELECTED;
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
//createjs.Ticker.setPaused( true );
//console.log('game end');
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

    $( ELEMENTS.currentWave ).text( CURRENT_WAVE + 1 );

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

        for (var b = 0 ; b < CREEP_LANES.length ; b++)
            {
            var lane = CREEP_LANES[ b ];
            var startLine, startColumn;
            var halfLength = parseInt( lane.length / 2, 10 );

                // add units randomly in the start zone
            if ( lane.orientation == 'vertical' )
                {
                startColumn = lane.start.column;
                startLine = getRandomInt( lane.start.line - halfLength, lane.start.line + halfLength - 1 );
                }

            else
                {
                startColumn = getRandomInt( lane.start.column - halfLength, lane.start.column + halfLength - 1 );
                startLine = lane.start.line;
                }

            new className({
                    column: startColumn,
                    line: startLine,
                    destination_column: lane.end.column,
                    destination_line: lane.end.line,
                    lane: lane
                });
            }


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

for (a = Bullet.ALL.length - 1 ; a >= 0 ; a--)
    {
    Bullet.ALL[ a ].tick();
    }

if ( ELEMENT_SELECTED )
    {
    ELEMENT_SELECTED.updateSelection();
    }

G.STAGE.update();
};


window.Game = Game;

}(window));