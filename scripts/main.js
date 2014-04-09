/*
    Based on http://www.kongregate.com/games/preecep/desktop-tower-defense

    Libraries:

        - jquery : 2.1
        - jqueryui : 1.10
            - tooltip
            - ui lightness theme
        - createjs
            - easeljs : 0.7
            - preloadjs: 0.4
        - AStar: 0.2.0 ( https://github.com/bgrins/javascript-astar )

    to doo:

        - add obstacles (some squares where you can't add a tower), that can be passable or not by units
        - try not to add towers on top of a unit
        - make units stronger with each wave

        types of units:

            - normal
            - group
            - fast
            - flying
            - spawn
            - boss (a bigger version of the other types)
            - immune

        types of towers:

            - basic tower
                - single target
                - ground/air
                - low cost
                - low damage
                - low fire rate
                - mid range

            - fast tower
                - single target
                - ground/air
                - mid cost
                - low damage
                - high fire rate
                - mid range

            - rocket tower
                - area of damage
                - ground
                - mid cost
                - low fire rate
                - low damage
                - mid range

            - anti-air
                - fires 4 shots at the time
                - air
                - high cost
                - mid fire rate
                - mid damage
                - mid range

            - frost tower
                - slows down the units in an area
                - ground/air
                - low fire rate
                - high cost
                - low damage
                - mid range

            - bash tower
                - area of damage. chance to stun/slow
                - ground
                - high cost
                - mid fire rate
                - high damage
                - small range
 */

var G = {
    CANVAS: null,
    STAGE: null,
    PRELOAD: null,
    BASE_URL: '',
    FPS: 40,
    GAME_MENU_HEIGHT: 100,
    INTERVAL_SECONDS: 0     // the tick interval in seconds (time between ticks)
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

G.INTERVAL_SECONDS = createjs.Ticker.getInterval() / 1000;

Tower.init();
Unit.init();


G.PRELOAD = new createjs.LoadQueue();

var manifest = [
        { id: 'map1', src: G.BASE_URL + 'maps/first.json' },
        { id: 'creep', src: G.BASE_URL + 'images/creep.png' },
        { id: 'creep_slow', src: G.BASE_URL + 'images/creep_slow.png' },
        { id: 'creep_group', src: G.BASE_URL + 'images/creep_group.png' },
        { id: 'creep_fast', src: G.BASE_URL + 'images/creep_fast.png' },
        { id: 'creep_fast_slow', src: G.BASE_URL + 'images/creep_fast_slow.png' },
        { id: 'creep_fly', src: G.BASE_URL + 'images/creep_fly.png' },
        { id: 'creep_fly_slow', src: G.BASE_URL + 'images/creep_fly_slow.png' },
        { id: 'creep_spawn', src: G.BASE_URL + 'images/creep_spawn.png' },
        { id: 'creep_spawn_slow', src: G.BASE_URL + 'images/creep_spawn_slow.png' },
        { id: 'creep_spawned', src: G.BASE_URL + 'images/creep_spawned.png' },
        { id: 'creep_spawned_slow', src: G.BASE_URL + 'images/creep_spawned_slow.png' },
        { id: 'creep_immune', src: G.BASE_URL + 'images/creep_immune.png' },
        { id: 'tower_base', src: G.BASE_URL + 'images/tower_base.png' },
        { id: 'tower_basic', src: G.BASE_URL + 'images/tower_basic.png' },
        { id: 'tower_fast', src: G.BASE_URL + 'images/tower_fast.png' },
        { id: 'tower_rocket', src: G.BASE_URL + 'images/tower_rocket.png' },
        { id: 'tower_frost', src: G.BASE_URL + 'images/tower_frost.png' },
        { id: 'tower_anti_air', src: G.BASE_URL + 'images/tower_anti_air.png' },
        { id: 'tower_bash', src: G.BASE_URL + 'images/tower_bash.png' },
        { id: 'tower_bash_attack', src: G.BASE_URL + 'images/tower_bash_attack.png' }
    ];

G.PRELOAD.addEventListener( 'progress', function( event )
    {
        // "Loading " + ( event.progress*100 | 0 ) + "%"
    });
G.PRELOAD.addEventListener( 'complete', Game.start );
G.PRELOAD.loadManifest( manifest, true );
};