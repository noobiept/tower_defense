(function(window)
{
function GameMenu()
{

}

    // html elements
var CURRENT_WAVE = null;
var CURRENT_GOLD = null;
var CURRENT_LIFE = null;
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
CURRENT_WAVE = document.querySelector( '.currentWave span' );
CURRENT_GOLD = document.querySelector( '.currentGold span' );
CURRENT_LIFE = document.querySelector( '.currentLife span' );
MESSAGE = document.querySelector( '#Message' );
MESSAGE_TIMEOUT = new Timeout();

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


GameMenu.updateWave = function( wave )
{
$( CURRENT_WAVE ).text( wave );
};


GameMenu.getSelectedTower = function()
{
return SELECTED_TOWER.tower;
};


window.GameMenu = GameMenu;

}(window));