(function(window)
{
function GameMenu()
{

}

    // html elements
var CURRENT_WAVE = null;
var CURRENT_GOLD = null;
var CURRENT_LIFE = null;

var SELECTED_TOWER = 0;
var TOWERS = [ Tower, TowerRocket, TowerFrost, TowerAntiAir ];

GameMenu.init = function()
{
CURRENT_WAVE = document.querySelector( '.currentWave span' );
CURRENT_GOLD = document.querySelector( '.currentGold span' );
CURRENT_LIFE = document.querySelector( '.currentLife span' );


var basicTower = document.querySelector( '#basicTower' );
var rocketTower = document.querySelector( '#rocketTower' );
var frostTower = document.querySelector( '#frostTower' );
var antiAirTower = document.querySelector( '#antiAirTower' );

basicTower.onclick = function()
    {
    SELECTED_TOWER = 0;
    };

rocketTower.onclick = function()
    {
    SELECTED_TOWER = 1;
    };

frostTower.onclick = function()
    {
    SELECTED_TOWER = 2;
    };

antiAirTower.onclick = function()
    {
    SELECTED_TOWER = 3;
    }
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
return TOWERS[ SELECTED_TOWER ];
};


window.GameMenu = GameMenu;

}(window));