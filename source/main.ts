import * as Map from "./map";
import { Tower } from "./towers/tower";
import { Unit } from "./units/unit";
import { Bullet } from "./bullet";
import { Message } from "./message";
import { Tooltip } from "./tooltip";
import * as Game from "./game";
import * as MainMenu from "./main_menu";
import * as HighScore from "./high_score";
import { preloadAssets } from "./assets";
import * as Canvas from "./canvas";

window.onload = function () {
    const { stage } = Canvas.init();

    // the order of these calls sets the display order (what elements are drawn first, etc)
    Map.init(stage);
    Tower.init(stage);
    Unit.init(stage);
    Bullet.init(stage);
    Message.init(stage);
    Map.initHighlight(stage);

    Tooltip.init();
    Game.init(MainMenu.open);
    MainMenu.init();
    HighScore.load();

    // disable the context menu (when right-clicking)
    window.oncontextmenu = function () {
        return false;
    };

    const loadMessage = document.getElementById("LoadMessage")!;

    preloadAssets({
        onProgress: (progress) => {
            $(loadMessage).text(progress + "%");
        },
        onComplete: () => {
            loadMessage.classList.add("hidden");
            MainMenu.open();
        },
    });
};
