(function(window)
{
function GameMenu()
{

}

    // html elements
var TIME_UNTIL_NEXT_WAVE = null;
var CURRENT_GOLD = null;
var CURRENT_LIFE = null;
var WAVE_LIST = [];
var MESSAGE = null;
var MESSAGE_TIMEOUT = null;


var SELECTED_TOWER = null;
var TOWERS = [
        { tower: Tower, htmlElement: null, position: 0 },
        { tower: TowerFast, htmlElement: null, position: 1 },
        { tower: TowerRocket, htmlElement: null, position: 2 },
        { tower: TowerFrost, htmlElement: null, position: 3 },
        { tower: TowerAntiAir, htmlElement: null, position: 4 },
        { tower: TowerBash, htmlElement: null, position: 5 }
    ];

GameMenu.init = function()
{
    // game info stuff
TIME_UNTIL_NEXT_WAVE = document.querySelector( '.timeUntilNextWave span' );
CURRENT_GOLD = document.querySelector( '.currentGold span' );
CURRENT_LIFE = document.querySelector( '.currentLife span' );
MESSAGE = document.querySelector( '#Message' );
MESSAGE_TIMEOUT = new Timeout();

WAVE_LIST = document.querySelectorAll( '#GameMenu-waveList > div' );

for (var a = 0 ; a < WAVE_LIST.length ; a++)
    {
    $( WAVE_LIST[ a ] ).tooltip();
    }


    // tower selector
var basicTower = document.querySelector( '#basicTower' );
var fastTower = document.querySelector( '#fastTower' );
var rocketTower = document.querySelector( '#rocketTower' );
var frostTower = document.querySelector( '#frostTower' );
var antiAirTower = document.querySelector( '#antiAirTower' );
var bashTower = document.querySelector( '#bashTower' );

var elements = [ basicTower, fastTower, rocketTower, frostTower, antiAirTower, bashTower ]; // same order as in the TOWERS array

for (var a = 0 ; a < elements.length ; a++)
    {
    var htmlElement = elements[ a ];

    TOWERS[ a ].htmlElement = htmlElement;

    htmlElement.onclick = (function( position )
        {
        return function()
            {
            GameMenu.selectTower( position );
            }
        })( a );
    }


GameMenu.selectTower( 0 );
};


GameMenu.selectTower = function( position )
{
if ( SELECTED_TOWER )
    {
        // trying to select the same tower
    if ( position == SELECTED_TOWER.position )
        {
        return;
        }

        // remove the css class from the previous selection
    else
        {
        $( SELECTED_TOWER.htmlElement ).removeClass( 'selectedTower' );
        }
    }

SELECTED_TOWER = TOWERS[ position ];

$( SELECTED_TOWER.htmlElement ).addClass( 'selectedTower' );
};


GameMenu.showMessage = function( message )
{
$( MESSAGE ).css( 'display', 'block' );
$( MESSAGE ).text( message );

MESSAGE_TIMEOUT.start( function()
    {
    $( MESSAGE ).css( 'display', 'none' );
    }, 1000 );
};


GameMenu.updateGold = function( gold )
{
$( CURRENT_GOLD ).text( gold );
};


GameMenu.updateLife = function( life )
{
$( CURRENT_LIFE ).text( life );
};

GameMenu.updateTimeUntilNextWave = function( time )
{
$( TIME_UNTIL_NEXT_WAVE ).text( time );
};


GameMenu.updateWave = function( currentWave, allWaves )
{
for (var a = 0 ; a < WAVE_LIST.length ; a++)
    {
    var waveNumber = currentWave + a;
    var waveElement = WAVE_LIST[ a ];

    if ( waveNumber < allWaves.length )
        {
        var wave = allWaves[ waveNumber ];
        var type = wave.type;
        var text = 'wave ' + (waveNumber + 1) + '<br/>' + type;

        if ( waveElement.hasAttribute( 'data-cssClass' ) )
            {
            $( waveElement ).removeClass( waveElement.getAttribute( 'data-cssClass' ) );
            }

        waveElement.title = wave.howMany + 'x';
        waveElement.setAttribute( 'data-cssClass', type );
        $( waveElement ).addClass( type );
        $( waveElement ).html( text );
        }

    else
        {
        $( waveElement ).text( '' );
        waveElement.title = '';

        if ( waveElement.hasAttribute( 'data-cssClass' ) )
            {
            $( waveElement ).removeClass( waveElement.getAttribute( 'data-cssClass' ) );
            }
        }
    }
};


GameMenu.getSelectedTower = function()
{
return SELECTED_TOWER.tower;
};


window.GameMenu = GameMenu;

}(window));