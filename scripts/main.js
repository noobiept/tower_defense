/*
    Based on http://www.kongregate.com/games/preecep/desktop-tower-defense

    Libraries:

        - jquery : 2.1
        - createjs
            - easeljs : 0.7
            - preloadjs: 0.4
        - AStar ( http://devpro.it/javascript_id_137.html )
        - tiled ( http://www.mapeditor.org/ ) : 0.9.1

    to doo:
        - sometimes the unit's shape stays on the map (isn't removed)

 */

var G = {
    CANVAS: null,
    STAGE: null,
    PRELOAD: null,
    BASE_URL: '',
    FPS: 40,
    GAME_MENU_HEIGHT: 100,
    TO_BE_REMOVED: []
};


window.onload = function()
{
G.CANVAS = document.querySelector( '#MainCanvas' );
var gameMenu = document.querySelector( '#GameMenu' );

var availableWidth = $( window ).width();
var availableHeight = $( window ).height();

G.CANVAS.width = availableWidth;
G.CANVAS.height = availableHeight - G.GAME_MENU_HEIGHT;

$( gameMenu ).css( 'width', availableWidth + 'px' );
$( gameMenu ).css( 'height', G.GAME_MENU_HEIGHT + 'px' );
$( gameMenu ).css( 'top', (availableHeight - G.GAME_MENU_HEIGHT) + 'px' );

G.STAGE = new createjs.Stage( G.CANVAS );

createjs.Ticker.setFPS( G.FPS );

G.PRELOAD = new createjs.LoadQueue();

var manifest = [
        { id: 'map1', src: G.BASE_URL + 'maps/first.json' }
    ];

G.PRELOAD.addEventListener( 'progress', function( event )
    {
        // "Loading " + ( event.progress*100 | 0 ) + "%"
    });
G.PRELOAD.addEventListener( 'complete', Game.start );
G.PRELOAD.loadManifest( manifest, true );
};