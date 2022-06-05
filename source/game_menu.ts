import { Tower } from "./tower";
import { TowerFast } from "./tower_fast";
import { TowerRocket } from "./tower_rocket";
import { TowerFrost } from "./tower_frost";
import { TowerAntiAir } from "./tower_anti_air";
import { TowerBash } from "./tower_bash";
import { Tooltip } from "./tooltip";
import { Timeout } from "@drk4/utilities";

// reference to the game menu's html elements
var START_PAUSED = null;
var TIME_UNTIL_NEXT_WAVE = null;
var CURRENT_GOLD = null;
var CURRENT_LIFE = null;
var CURRENT_SCORE = null;
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
    { tower: TowerBash, htmlElement: null, position: 5 },
];
var TOWER_INFO;

export interface GameMenuInitArgs {
    pause: () => void;
    forceNextWave: () => void;
    quit: () => void;
    upgradeSelection: () => void;
    sellSelection: () => void;
    getSelection: () => Tower;
}

export function init(args: GameMenuInitArgs) {
    var menu = document.querySelector("#GameMenu");
    var a;

    // game controls
    START_PAUSED = menu.querySelector("#startPause");
    START_PAUSED.onclick = args.pause;
    START_PAUSED.tooltip = new Tooltip({
        text: "Click to start",
        reference: START_PAUSED,
        enableEvents: false,
    });

    var timeUntilNext = menu.querySelector(".timeUntilNextWave") as HTMLElement;
    timeUntilNext.onclick = args.forceNextWave;

    TIME_UNTIL_NEXT_WAVE = timeUntilNext.querySelector("span");

    var quit = menu.querySelector("#quit") as HTMLElement;
    quit.onclick = args.quit;

    // game info stuff
    CURRENT_GOLD = menu.querySelector(".currentGold span");
    CURRENT_LIFE = menu.querySelector(".currentLife span");
    CURRENT_SCORE = menu.querySelector(".currentScore span");

    // wave list
    WAVE_LIST = menu.querySelectorAll(
        "#GameMenu-waveList > div"
    ) as unknown as HTMLElement[];

    for (a = 0; a < WAVE_LIST.length; a++) {
        WAVE_LIST[a].tooltip = new Tooltip({
            text: "",
            reference: WAVE_LIST[a],
        });
    }

    // game menu's message
    MESSAGE = document.querySelector("#Message");
    MESSAGE_TIMEOUT = new Timeout();

    // tower selector
    var basicTower = menu.querySelector("#basicTower") as HTMLElement;
    var fastTower = menu.querySelector("#fastTower") as HTMLElement;
    var rocketTower = menu.querySelector("#rocketTower") as HTMLElement;
    var frostTower = menu.querySelector("#frostTower") as HTMLElement;
    var antiAirTower = menu.querySelector("#antiAirTower") as HTMLElement;
    var bashTower = menu.querySelector("#bashTower") as HTMLElement;

    var elements = [
        basicTower,
        fastTower,
        rocketTower,
        frostTower,
        antiAirTower,
        bashTower,
    ]; // same order as in the TOWERS array

    for (a = 0; a < elements.length; a++) {
        var htmlElement = elements[a];

        TOWERS[a].htmlElement = htmlElement;
        var towerInitialCost = TOWERS[a].tower.stats[0].initial_cost;

        $(htmlElement).text($(htmlElement).text() + " - " + towerInitialCost);
        htmlElement.onclick = (function (position) {
            return function () {
                selectTower(position);
            };
        })(a);
    }

    // tower info
    var towerInfo = menu.querySelector("#GameMenu-TowerInfo");

    TOWER_INFO = {
        container: towerInfo,
        name: towerInfo.querySelector(".name span"),
        damage: towerInfo.querySelector(".damage span"),
        attack_speed: towerInfo.querySelector(".attack_speed span"),
        range: towerInfo.querySelector(".range span"),
        upgrade: towerInfo.querySelector("#GameMenu-Upgrade"),
        sell: towerInfo.querySelector("#GameMenu-Sell"),
        upgrade_message: towerInfo.querySelector(".upgradeMessage"),
        sell_message: towerInfo.querySelector(".sellMessage"),
    };

    TOWER_INFO.upgrade.onclick = args.upgradeSelection;
    TOWER_INFO.upgrade.onmouseover = () => {
        var tower = args.getSelection();

        if (tower) {
            updateTowerStats(tower, true);
        }
    };
    TOWER_INFO.upgrade.onmouseout = () => {
        var tower = args.getSelection();

        if (tower) {
            updateTowerStats(tower, false);
        }
    };
    TOWER_INFO.sell.onclick = args.sellSelection;

    // start with the basic tower selected
    selectTower(0);
}

export function show() {
    $("#GameMenu").css("display", "flex");
}

export function hide() {
    $("#GameMenu").css("display", "none");
}

export function pause(isPaused) {
    if (isPaused) {
        START_PAUSED.tooltip.show();

        $(START_PAUSED).text("Resume");
    } else {
        START_PAUSED.tooltip.hide();

        $(START_PAUSED).text("Pause");
    }
}

export function selectTower(position) {
    if (SELECTED_TOWER) {
        // trying to select the same tower
        if (position == SELECTED_TOWER.position) {
            return;
        }

        // remove the css class from the previous selection
        else {
            $(SELECTED_TOWER.htmlElement).removeClass("selectedTower");
        }
    }

    SELECTED_TOWER = TOWERS[position];

    $(SELECTED_TOWER.htmlElement).addClass("selectedTower");
}

export function showMessage(message) {
    $(MESSAGE).css("visibility", "visible");
    $(MESSAGE).text(message);

    MESSAGE_TIMEOUT.start(function () {
        $(MESSAGE).css("visibility", "hidden");
    }, 1000);
}

export function updateGold(gold) {
    $(CURRENT_GOLD).text(gold);
}

export function updateLife(life) {
    $(CURRENT_LIFE).text(life);
}

export function updateScore(score) {
    $(CURRENT_SCORE).text(score);
}

export function updateTimeUntilNextWave(time) {
    $(TIME_UNTIL_NEXT_WAVE).text(time);
}

export function updateWave(currentWave, allWaves) {
    for (var a = 0; a < WAVE_LIST.length; a++) {
        var waveNumber = currentWave + a;
        var waveElement = WAVE_LIST[a];

        if (waveNumber < allWaves.length) {
            var wave = allWaves[waveNumber];
            var type = wave.type;
            var text = "wave " + (waveNumber + 1) + "<br/>" + type;
            var tooltip =
                wave.howMany +
                "x<br/>health: " +
                wave.health +
                "<br/>regeneration: " +
                wave.health_regeneration +
                "<br/>gold: " +
                wave.gold;

            if (waveElement.hasAttribute("data-cssClass")) {
                $(waveElement).removeClass(
                    waveElement.getAttribute("data-cssClass")
                );
            }

            waveElement.tooltip.updateText(tooltip);
            waveElement.setAttribute("data-cssClass", type);
            $(waveElement).addClass(type);
            $(waveElement).html(text);
        } else {
            $(waveElement).text("");
            waveElement.tooltip.updateText("");

            if (waveElement.hasAttribute("data-cssClass")) {
                $(waveElement).removeClass(
                    waveElement.getAttribute("data-cssClass")
                );
            }
        }
    }
}

export function getSelectedTower() {
    return SELECTED_TOWER.tower;
}

export function showTowerStats(tower) {
    $(TOWER_INFO.container).css("display", "flex");

    updateTowerStats(tower, false);

    // update the info that won't change during the selection
    $(TOWER_INFO.name).text(tower.name);
}

/**
 * Hide the tower stats html element.
 */
export function hideTowerStats() {
    $(TOWER_INFO.container).css("display", "none");
}

/**
 * Update the selected tower stats. It can show the stats after the next upgrade is completed (next to the current stats).
 */
export function updateTowerStats(tower, showNextUpgrade) {
    updateMenuControls(tower);

    var damage = tower.damage;
    var attack_speed = tower.attack_speed;
    var range = tower.range;
    var current = tower.stats[tower.upgrade_level];

    if (showNextUpgrade && !tower.maxUpgrade()) {
        var next = tower.stats[tower.upgrade_level + 1];

        damage += " (" + next.damage + ")";
        attack_speed += " (" + next.attack_speed + ")";
        range += " (" + next.range + ")";
    }

    $(TOWER_INFO.damage).text(damage);
    $(TOWER_INFO.attack_speed).text(attack_speed);
    $(TOWER_INFO.range).text(range);
    $(TOWER_INFO.upgrade).text("Upgrade (" + current.upgrade_cost + ")");
    $(TOWER_INFO.sell).text("Sell (" + tower.getSellRefund() + ")");
}

export function updateMenuControls(tower) {
    if (tower.is_upgrading) {
        $(TOWER_INFO.upgrade).css("display", "none");
        $(TOWER_INFO.sell).css("display", "none");
        $(TOWER_INFO.sell_message).css("display", "none");
        $(TOWER_INFO.upgrade_message).css("display", "block");
    } else if (tower.is_selling) {
        $(TOWER_INFO.upgrade).css("display", "none");
        $(TOWER_INFO.sell).css("display", "none");
        $(TOWER_INFO.upgrade_message).css("display", "none");
        $(TOWER_INFO.sell_message).css("display", "block");
    } else {
        $(TOWER_INFO.upgrade_message).css("display", "none");
        $(TOWER_INFO.sell_message).css("display", "none");
        $(TOWER_INFO.sell).css("display", "block");

        if (tower.maxUpgrade()) {
            $(TOWER_INFO.upgrade).css("display", "none");
        } else {
            $(TOWER_INFO.upgrade).css("display", "block");
        }
    }
}
