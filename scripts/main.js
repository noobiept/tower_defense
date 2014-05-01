/*
    Based on http://www.kongregate.com/games/preecep/desktop-tower-defense

    Libraries:

        - jquery : 2.1
        - createjs
            - easeljs : 0.7
            - preloadjs: 0.4
        - AStar: 0.2.0 ( https://github.com/bgrins/javascript-astar )

    to doo:

        - try not to add towers on top of a unit

        - optimizations:

            - use Bitmap instead of Shape (faster?..)
            - use .cache() to cache static stuff (that doesn't move, so just the obstacles?..)
            - improve the search units in range algorithm
                - maybe have an array with all the units positions, and then just get the units from there?...

        maps:
            - easy:
                - 20 waves
                - 1 lane

            - medium:
                - 50 waves
                - 2 lanes

            - hard:
                - 60 waves
                - 2 lanes
                - with some obstacles


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
    FPS: 20,
    GAME_MENU_HEIGHT: 100
};


window.onload = function()
{
G.CANVAS = document.querySelector( '#MainCanvas' );
G.STAGE = new createjs.Stage( G.CANVAS );

createjs.Ticker.setFPS( G.FPS );

Tower.init();
Tooltip.init();
GameMenu.init();
MainMenu.init();
HighScore.load();

    // disable the context menu (when right-clicking)
window.oncontextmenu = function( event ) { return false; };

G.PRELOAD = new createjs.LoadQueue();

var manifest = [
        { id: 'easy', src: G.BASE_URL + 'maps/easy.json' },
        { id: 'medium', src: G.BASE_URL + 'maps/medium.json' },
        { id: 'hard', src: G.BASE_URL + 'maps/hard.json' },
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
        { id: 'tower_base0', src: G.BASE_URL + 'images/tower_base0.png' },
        { id: 'tower_base1', src: G.BASE_URL + 'images/tower_base1.png' },
        { id: 'tower_base2', src: G.BASE_URL + 'images/tower_base2.png' },
        { id: 'tower_basic', src: G.BASE_URL + 'images/tower_basic.png' },
        { id: 'tower_fast', src: G.BASE_URL + 'images/tower_fast.png' },
        { id: 'tower_rocket', src: G.BASE_URL + 'images/tower_rocket.png' },
        { id: 'tower_frost', src: G.BASE_URL + 'images/tower_frost.png' },
        { id: 'tower_anti_air', src: G.BASE_URL + 'images/tower_anti_air.png' },
        { id: 'tower_bash', src: G.BASE_URL + 'images/tower_bash.png' },
        { id: 'tower_bash_attack', src: G.BASE_URL + 'images/tower_bash_attack.png' },
        { id: 'bullet', src: G.BASE_URL + 'images/bullet.png' },
        { id: 'highlight', src: G.BASE_URL + 'images/highlight.png' },
        { id: 'highlight_not_available', src: G.BASE_URL + 'images/highlight_not_available.png' }
    ];

G.PRELOAD.addEventListener( 'progress', function( event )
    {
        // "Loading " + ( event.progress*100 | 0 ) + "%"
    });
G.PRELOAD.addEventListener( 'complete', MainMenu.open );
G.PRELOAD.loadManifest( manifest, true );
};
