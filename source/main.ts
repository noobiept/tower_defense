import * as Map from "./map";
import { Tower } from "./tower";
import { Unit } from "./units/unit";
import { Bullet } from "./bullet";
import { Message } from "./message";
import { Tooltip } from "./tooltip";
import * as GameMenu from "./game_menu";
import * as MainMenu from "./main_menu";
import * as HighScore from "./high_score";
import { preloadAssets } from "./assets";

export var G = {
    CANVAS: null,
    STAGE: null,
    FPS: 60,
    GAME_MENU_HEIGHT: 120,
};

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

    var loadMessage = document.querySelector("#LoadMessage");

    var left = $(window).width() / 2;
    var top = $(window).height() / 2;

    $(loadMessage).css("top", top + "px");
    $(loadMessage).css("left", left + "px");

    preloadAssets({
        onProgress: (progress) => {
            $(loadMessage).text(progress + "%");
        },
        onComplete: () => {
            $(loadMessage).css("display", "none");
            MainMenu.open();
        },
    });
};
