import { Game } from "./game";
import { Map } from "./map";
import { Tower } from "./tower";
import { Unit } from "./unit";
import { Bullet } from "./bullet";
import { Message } from "./message";
import { Tooltip } from "./tooltip";
import { GameMenu } from "./game_menu";
import * as MainMenu from "./main_menu";
import * as HighScore from "./high_score";

export var G = {
    CANVAS: null,
    STAGE: null,
    PRELOAD: null,
    FPS: 60,
    GAME_MENU_HEIGHT: 120,
};

var BASE_URL = "";

window.onload = function () {
    G.CANVAS = document.querySelector("#MainCanvas");
    G.STAGE = new createjs.Stage(G.CANVAS);

    createjs.Ticker.setFPS(G.FPS);

    // the order of these calls sets the display order (what elements are drawn first, etc)
    Map.init(G.STAGE);
    Tower.init(G.STAGE);
    Unit.init(G.STAGE);
    Bullet.init(G.STAGE);
    Message.init(G.STAGE);
    Map.initHighlight(G.STAGE);

    Tooltip.init();
    GameMenu.init();
    MainMenu.init();
    HighScore.load();

    // disable the context menu (when right-clicking)
    window.oncontextmenu = function (event) {
        return false;
    };

    G.PRELOAD = new createjs.LoadQueue();

    var manifest = [
        { id: "easy", src: BASE_URL + "maps/easy.json" },
        { id: "medium", src: BASE_URL + "maps/medium.json" },
        { id: "hard", src: BASE_URL + "maps/hard.json" },
        { id: "creep", src: BASE_URL + "images/creep.png" },
        { id: "creep_slow", src: BASE_URL + "images/creep_slow.png" },
        { id: "creep_group", src: BASE_URL + "images/creep_group.png" },
        { id: "creep_fast", src: BASE_URL + "images/creep_fast.png" },
        { id: "creep_fast_slow", src: BASE_URL + "images/creep_fast_slow.png" },
        { id: "creep_fly", src: BASE_URL + "images/creep_fly.png" },
        { id: "creep_fly_slow", src: BASE_URL + "images/creep_fly_slow.png" },
        { id: "creep_spawn", src: BASE_URL + "images/creep_spawn.png" },
        {
            id: "creep_spawn_slow",
            src: BASE_URL + "images/creep_spawn_slow.png",
        },
        { id: "creep_spawned", src: BASE_URL + "images/creep_spawned.png" },
        {
            id: "creep_spawned_slow",
            src: BASE_URL + "images/creep_spawned_slow.png",
        },
        { id: "creep_immune", src: BASE_URL + "images/creep_immune.png" },
        { id: "tower_base0", src: BASE_URL + "images/tower_base0.png" },
        { id: "tower_base1", src: BASE_URL + "images/tower_base1.png" },
        { id: "tower_base2", src: BASE_URL + "images/tower_base2.png" },
        { id: "tower_basic", src: BASE_URL + "images/tower_basic.png" },
        { id: "tower_fast", src: BASE_URL + "images/tower_fast.png" },
        { id: "tower_rocket", src: BASE_URL + "images/tower_rocket.png" },
        { id: "tower_frost", src: BASE_URL + "images/tower_frost.png" },
        { id: "tower_anti_air", src: BASE_URL + "images/tower_anti_air.png" },
        { id: "tower_bash", src: BASE_URL + "images/tower_bash.png" },
        {
            id: "tower_bash_attack",
            src: BASE_URL + "images/tower_bash_attack.png",
        },
        { id: "bullet", src: BASE_URL + "images/bullet.png" },
        { id: "highlight", src: BASE_URL + "images/highlight.png" },
        {
            id: "highlight_not_available",
            src: BASE_URL + "images/highlight_not_available.png",
        },
    ];

    var loadMessage = document.querySelector("#LoadMessage");

    var left = $(window).width() / 2;
    var top = $(window).height() / 2;

    $(loadMessage).css("top", top + "px");
    $(loadMessage).css("left", left + "px");

    G.PRELOAD.addEventListener("progress", function (event) {
        $(loadMessage).text(((event.progress * 100) | 0) + "%");
    });
    G.PRELOAD.addEventListener("complete", function () {
        $(loadMessage).css("display", "none");

        MainMenu.open();
    });
    G.PRELOAD.loadManifest(manifest, true);
};
