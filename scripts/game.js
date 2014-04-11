(function(window)
{
function Game()
{

}

var CREEP_LANES = [];   // contains the start/end point of each lane
var ALL_WAVES = [];
var ACTIVE_WAVES = [];  // you may have more than 1 wave active (adding units)
var NEXT_WAVE = 0;
var NO_MORE_WAVES = false;
var WAVE_LIMIT = 400;
var WAVE_COUNT = WAVE_LIMIT;    // start the first wave immediately

var ELEMENT_SELECTED = null;

var GOLD = 0;
var LIFE = 0;
var SCORE = 0;
var IS_PAUSED = false;
var BEFORE_FIRST_WAVE = false;  // before the first wave, the game is paused but we can add towers. once the game starts, pausing the game won't allow you to add/remove towers

    // this will have the return when setting the events (need to save this so that later we can turn the event off (with createjs, doesn't work passing the function, like it does when setting a normal event)
var EVENTS = {
        tick: null,
        mouseMove: null
    };


Game.start = function( map )
{
var mapInfo = G.PRELOAD.getResult( map );

var columns = mapInfo.numberOfColumns;
var lines = mapInfo.numberOfLines;
var a;

    // read from the map info and update the appropriate variables
for (a = 0 ; a < mapInfo.waves.length ; a++)
    {
    var wave = mapInfo.waves[ a ];

    ALL_WAVES.push({
            type: wave.type,
            howMany: wave.howMany,
            health: wave.health,
            spawnInterval: wave.spawnInterval,
            count: 0,
            countLimit: wave.spawnInterval / G.INTERVAL_SECONDS,
            waveNumber: a
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

    // reset the variables
ELEMENT_SELECTED = null;
GOLD = 0;
LIFE = 0;
SCORE = 0;
IS_PAUSED = false;
NO_MORE_WAVES = false;
BEFORE_FIRST_WAVE = true;
WAVE_COUNT = WAVE_LIMIT;    // start the first wave immediately
NEXT_WAVE = 0;

    // init the game
Map.init( columns, lines, CREEP_LANES );



$( '#MainCanvas' ).css( 'display', 'block' );
GameMenu.show();

Game.updateGold( 200 );
Game.updateLife( 20 );
Game.updateScore( 0 );
Game.tick();    // run the tick once to initialize the timer and the wave list
Game.pause( true );

    // set the events
EVENTS.tick = createjs.Ticker.on( 'tick', Game.tick );
EVENTS.mouseMove = G.STAGE.on( 'stagemousemove', Map.mouseMoveEvents );

window.addEventListener( 'keyup', Game.keyUpEvents );
G.CANVAS.addEventListener( 'mouseup', Game.mouseEvents );
};


Game.sendFirstWave = function()
{
BEFORE_FIRST_WAVE = false;

Game.pause( false );
};


Game.isPaused = function()
{
return IS_PAUSED;
};


Game.updateGold = function( gold )
{
GOLD += gold;

GameMenu.updateGold( GOLD );
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
    Game.end( false );
    }

if ( life < 0 )
    {
    Game.updateScore( -50 );
    }

GameMenu.updateLife( LIFE );
};

Game.updateScore = function( score )
{
SCORE += score;

GameMenu.updateScore( SCORE );
};



Game.keyUpEvents = function( event )
{
if ( IS_PAUSED && !BEFORE_FIRST_WAVE )
    {
    return;
    }

var key = event.keyCode;

if ( key == EVENT_KEY[ '1' ] )
    {
    GameMenu.selectTower( 0 );
    }

else if ( key == EVENT_KEY[ '2' ] )
    {
    GameMenu.selectTower( 1 );
    }

else if ( key == EVENT_KEY[ '3' ] )
    {
    GameMenu.selectTower( 2 );
    }

else if ( key == EVENT_KEY[ '4' ] )
    {
    GameMenu.selectTower( 3 );
    }

else if ( key == EVENT_KEY[ '5' ] )
    {
    GameMenu.selectTower( 4 );
    }

else if ( key == EVENT_KEY[ '6' ] )
    {
    GameMenu.selectTower( 5 );
    }

else if ( key == EVENT_KEY.n )
    {
    Game.forceNextWave();
    }
};


Game.beforeFirstWave = function()
{
return BEFORE_FIRST_WAVE;
};



Game.mouseEvents = function( event )
{
if ( IS_PAUSED && !BEFORE_FIRST_WAVE )
    {
    return;
    }

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

    var towerClass = GameMenu.getSelectedTower();

        // see if we can afford a tower
    if ( !Game.haveEnoughGold( towerClass.stats[ 0 ].initial_cost ) )
        {
        GameMenu.showMessage( 'Not enough gold.' );
        return;
        }


    var highlight = Map.getHighlightSquare();

    var column = highlight.column;
    var line = highlight.line;

    if ( Map.isAvailable( column, line ) )
        {
            // check if by filling this position, we're not blocking the units (they need to be always be able to reach the destination)
        Map.setImpassableBox( column, line, 2 );

            // check if there is a possible path (if its not going to block a lane)
        for (var b = 0 ; b < CREEP_LANES.length ; b++)
            {
            var lane = CREEP_LANES[ b ];

            var path = Map.getPath( lane.start.column, lane.start.line, lane.end.column, lane.end.line );

            if ( path.length <= 0 )
                {
                GameMenu.showMessage( "Can't block the unit's path." );

                    // reset the position
                Map.setPassableBox( column, line, 2 );
                return;
                }
            }

            // reset the position
        Map.setPassableBox( column, line, 2 );


        new towerClass({
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
            if ( BEFORE_FIRST_WAVE )
                {
                tower.sell( true );
                }

            else
                {
                tower.startSelling();
                }
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


Game.clear = function()
{
createjs.Ticker.off( 'tick', EVENTS.tick );
G.STAGE.off( 'stagemousemove', EVENTS.mouseMove );

window.removeEventListener( 'keyup', Game.keyUpEvents );
G.CANVAS.removeEventListener( 'mouseup', Game.mouseEvents );

Unit.removeAll();
Tower.removeAll();
Map.clear();
GameMenu.hide();
Tooltip.hideAll();
Bullet.removeAll();

ALL_WAVES.length = 0;
CREEP_LANES.length = 0;
ACTIVE_WAVES.length = 0;
};


Game.end = function( victory )
{
Game.clear();

var message = '';

if ( victory )
    {
    message += 'Victory!\nScore: ' + SCORE;
    }

else
    {
    message += 'Defeat!';
    }

new Message({
        text: message,
        font: '30px monospace',
        onEnd: function()
            {
            G.STAGE.update();

            MainMenu.open();
            },
        timeout: 2000
    });

G.STAGE.update();
};


Game.forceNextWave = function()
{
if ( IS_PAUSED )
    {
    return;
    }

    // no more waves
if ( NEXT_WAVE >= ALL_WAVES.length )
    {
    return;
    }

var scorePerSecond = 10;
var waveTimeLeft = (WAVE_LIMIT - WAVE_COUNT) * G.INTERVAL_SECONDS;

var score = parseInt( waveTimeLeft * scorePerSecond, 10 );

Game.updateScore( score );

WAVE_COUNT = WAVE_LIMIT;
};

Game.pause = function( paused )
{
    // if its not provided, just change to the opposite of the current one
if ( typeof paused == 'undefined' || !_.isBoolean( paused ) )
    {
    paused = !IS_PAUSED;
    }

IS_PAUSED = paused;
GameMenu.pause( paused );
};



Game.tick = function( event )
{
if ( IS_PAUSED )
    {
    G.STAGE.update();
    return;
    }

var a;

if ( !NO_MORE_WAVES )
    {
    WAVE_COUNT++;

        // time to start a new wave
    if ( WAVE_COUNT >= WAVE_LIMIT )
        {
        WAVE_COUNT = 0;

        ACTIVE_WAVES.push( ALL_WAVES[ NEXT_WAVE ] );

        GameMenu.updateWave( NEXT_WAVE, ALL_WAVES );

        NEXT_WAVE++;


        if ( NEXT_WAVE >= ALL_WAVES.length )
            {
            NO_MORE_WAVES = true;
            }
        }

    var timeUntilNextWave = (WAVE_LIMIT - WAVE_COUNT) * G.INTERVAL_SECONDS;

    GameMenu.updateTimeUntilNextWave( round( timeUntilNextWave, 2 ).toFixed( 2 ) );
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
            if ( lane.orientation == 'horizontal' )
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
                    lane: lane,
                    waveNumber: wave.waveNumber,
                    health: wave.health
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
    Game.end( true );
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

G.STAGE.update();
};


window.Game = Game;

}(window));