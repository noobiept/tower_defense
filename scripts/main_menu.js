(function(window)
{
function MainMenu()
{

}

var MAIN_MENU = null;

MainMenu.init = function()
{
MAIN_MENU = document.querySelector( '#MainMenu' );

var easy = MAIN_MENU.querySelector( '#MainMenu-easy' );
var medium = MAIN_MENU.querySelector( '#MainMenu-medium' );
var hard = MAIN_MENU.querySelector( '#MainMenu-hard' );
var highScore = MAIN_MENU.querySelector( '#MainMenu-highScores' );

easy.onclick = function()
    {
    MainMenu.close();

    Game.start( 'easy' );
    };

medium.onclick = function()
    {
    MainMenu.close();

    Game.start( 'medium' );
    };

hard.onclick = function()
    {
    MainMenu.close();

    Game.start( 'hard' );
    };

highScore.onclick = MainMenu.openHighScore;
};

MainMenu.open = function()
{
$( MAIN_MENU ).css( 'display', 'block' );

var menuWidth = $( MAIN_MENU ).outerWidth();
var menuHeight = $( MAIN_MENU ).outerHeight();

var windowWidth = $( window ).outerWidth();
var windowHeight = $( window ).outerHeight();

var top = windowHeight / 2 - menuHeight / 2;
var left = windowWidth / 2 - menuWidth / 2;

$( MAIN_MENU ).css( 'top', top + 'px' );
$( MAIN_MENU ).css( 'left', left + 'px' );
};


MainMenu.close = function()
{
$( MAIN_MENU ).css( 'display', 'none' );
};


MainMenu.openHighScore = function()
{

};



window.MainMenu = MainMenu;

}(window));