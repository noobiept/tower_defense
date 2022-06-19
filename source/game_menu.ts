import { Tower } from "./towers/tower";
import { Tooltip } from "./tooltip";
import { getTowerInitialCost, TowerKey } from "./towers/tower.util";
import { Wave } from "./types";

type HTMLElementWithTooltip = HTMLElement & {
    tooltip: Tooltip;
};

// in same order as it appears on the menu
const TOWERS_LIST: TowerKey[] = [
    "Tower",
    "TowerFast",
    "TowerRocket",
    "TowerFrost",
    "TowerAntiAir",
    "TowerBash",
];

interface TowerType {
    tower: typeof TOWERS_LIST[number];
    htmlElement: HTMLElement | null;
    position: number;
}

// reference to the game menu's html elements
let START_PAUSED: HTMLElementWithTooltip;
let TIME_UNTIL_NEXT_WAVE: HTMLElement;
let CURRENT_GOLD: HTMLElement;
let CURRENT_LIFE: HTMLElement;
let CURRENT_SCORE: HTMLElement;
let WAVE_LIST: HTMLElementWithTooltip[] = [];

let SELECTED_TOWER: TowerType;
const TOWERS: TowerType[] = TOWERS_LIST.map((tower, index) => ({
    tower,
    htmlElement: null,
    position: index,
}));

let TOWER_INFO: {
    container: HTMLElement;
    name: HTMLElement;
    damage: HTMLElement;
    attack_speed: HTMLElement;
    range: HTMLElement;
    upgrade: HTMLElement;
    sell: HTMLElement;
    upgrade_message: HTMLElement;
    sell_message: HTMLElement;
};
let CALCULATE_TOWER_REFUND: (cost: number) => number;

interface GameMenuInitArgs {
    pause: () => void;
    forceNextWave: () => void;
    quit: () => void;
    upgradeSelection: () => void;
    sellSelection: () => void;
    getSelection: () => Tower | null;
    calculateTowerRefund: (cost: number) => number;
}

export function init(args: GameMenuInitArgs) {
    const menu = document.querySelector("#GameMenu")!;

    CALCULATE_TOWER_REFUND = args.calculateTowerRefund;

    // game controls
    START_PAUSED = menu.querySelector("#startPause")!;
    START_PAUSED.onclick = args.pause;
    START_PAUSED.tooltip = new Tooltip({
        text: "Click to start",
        reference: START_PAUSED,
        enableEvents: false,
    });

    const timeUntilNext = menu.querySelector(
        ".timeUntilNextWave"
    ) as HTMLElement;
    timeUntilNext.onclick = args.forceNextWave;

    TIME_UNTIL_NEXT_WAVE = timeUntilNext.querySelector("span")!;

    const quit = menu.querySelector("#quit") as HTMLElement;
    quit.onclick = args.quit;

    // game info stuff
    CURRENT_GOLD = menu.querySelector(".currentGold span")!;
    CURRENT_LIFE = menu.querySelector(".currentLife span")!;
    CURRENT_SCORE = menu.querySelector(".currentScore span")!;

    // wave list
    WAVE_LIST = menu.querySelectorAll(
        "#GameMenu-waveList > div"
    ) as unknown as HTMLElementWithTooltip[];

    for (let a = 0; a < WAVE_LIST.length; a++) {
        WAVE_LIST[a].tooltip = new Tooltip({
            text: "",
            reference: WAVE_LIST[a],
        });
    }

    // tower selector
    const basicTower = menu.querySelector("#basicTower") as HTMLElement;
    const fastTower = menu.querySelector("#fastTower") as HTMLElement;
    const rocketTower = menu.querySelector("#rocketTower") as HTMLElement;
    const frostTower = menu.querySelector("#frostTower") as HTMLElement;
    const antiAirTower = menu.querySelector("#antiAirTower") as HTMLElement;
    const bashTower = menu.querySelector("#bashTower") as HTMLElement;

    const elements = [
        basicTower,
        fastTower,
        rocketTower,
        frostTower,
        antiAirTower,
        bashTower,
    ]; // same order as in the TOWERS array

    for (let a = 0; a < elements.length; a++) {
        const htmlElement = elements[a];

        TOWERS[a].htmlElement = htmlElement;
        const towerInitialCost = getTowerInitialCost(TOWERS[a].tower);

        $(htmlElement).text($(htmlElement).text() + " - " + towerInitialCost);
        htmlElement.onclick = (function (position) {
            return function () {
                selectTower(position);
            };
        })(a);
    }

    // tower info
    const towerInfo = document.getElementById("GameMenu-TowerInfo")!;

    TOWER_INFO = {
        container: towerInfo,
        name: towerInfo.querySelector(".name span")!,
        damage: towerInfo.querySelector(".damage span")!,
        attack_speed: towerInfo.querySelector(".attack_speed span")!,
        range: towerInfo.querySelector(".range span")!,
        upgrade: towerInfo.querySelector("#GameMenu-Upgrade")!,
        sell: towerInfo.querySelector("#GameMenu-Sell")!,
        upgrade_message: towerInfo.querySelector(".upgradeMessage")!,
        sell_message: towerInfo.querySelector(".sellMessage")!,
    };

    TOWER_INFO.upgrade.onclick = args.upgradeSelection;
    TOWER_INFO.upgrade.onmouseover = () => {
        const tower = args.getSelection();

        if (tower) {
            updateTowerStats(tower, true);
        }
    };
    TOWER_INFO.upgrade.onmouseout = () => {
        const tower = args.getSelection();

        if (tower) {
            updateTowerStats(tower, false);
        }
    };
    TOWER_INFO.sell.onclick = args.sellSelection;

    // start with the basic tower selected
    selectTower(0);
}

export function show() {
    const gameMenu = document.getElementById("GameMenu")!;
    gameMenu.classList.remove("hidden");
}

export function hide() {
    const gameMenu = document.getElementById("GameMenu")!;
    gameMenu.classList.add("hidden");
}

export function pause(isPaused: boolean) {
    if (isPaused) {
        START_PAUSED.tooltip.show();

        $(START_PAUSED).text("Resume");
    } else {
        START_PAUSED.tooltip.hide();

        $(START_PAUSED).text("Pause");
    }
}

export function selectTower(position: number) {
    if (SELECTED_TOWER) {
        // trying to select the same tower
        if (position == SELECTED_TOWER.position) {
            return;
        }

        // remove the css class from the previous selection
        else {
            $(SELECTED_TOWER.htmlElement!).removeClass("selectedTower");
        }
    }

    SELECTED_TOWER = TOWERS[position];
    $(SELECTED_TOWER.htmlElement!).addClass("selectedTower");
}

export function updateGold(gold: number) {
    $(CURRENT_GOLD).text(gold);
}

export function updateLife(life: number) {
    $(CURRENT_LIFE).text(life);
}

export function updateScore(score: number) {
    $(CURRENT_SCORE).text(score);
}

export function updateTimeUntilNextWave(time: string) {
    $(TIME_UNTIL_NEXT_WAVE).text(time);
}

export function updateWave(currentWave: number, allWaves: Wave[]) {
    for (let a = 0; a < WAVE_LIST.length; a++) {
        const waveNumber = currentWave + a;
        const waveElement = WAVE_LIST[a];

        if (waveNumber < allWaves.length) {
            const wave = allWaves[waveNumber];
            const type = wave.type;
            const text = "wave " + (waveNumber + 1) + "<br/>" + type;
            const tooltip =
                wave.howMany +
                "x<br/>health: " +
                wave.health +
                "<br/>regeneration: " +
                wave.health_regeneration +
                "<br/>gold: " +
                wave.gold;

            if (waveElement.hasAttribute("data-cssClass")) {
                $(waveElement).removeClass(
                    waveElement.getAttribute("data-cssClass")!
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
                    waveElement.getAttribute("data-cssClass")!
                );
            }
        }
    }
}

export function getSelectedTower() {
    return SELECTED_TOWER.tower;
}

export function showTowerStats(tower: Tower) {
    TOWER_INFO.container.classList.remove("hidden");

    updateTowerStats(tower, false);

    // update the info that won't change during the selection
    $(TOWER_INFO.name).text(tower.name);
}

/**
 * Hide the tower stats html element.
 */
export function hideTowerStats() {
    TOWER_INFO.container.classList.add("hidden");
}

/**
 * Update the selected tower stats. It can show the stats after the next upgrade is completed (next to the current stats).
 */
export function updateTowerStats(tower: Tower, showNextUpgrade: boolean) {
    updateMenuControls(tower);

    let damage = tower.damage.toString();
    let attack_speed = tower.attack_speed.toString();
    let range = tower.range.toString();
    const current = tower.stats[tower.upgrade_level];

    if (showNextUpgrade && !tower.maxUpgrade()) {
        const next = tower.stats[tower.upgrade_level + 1];

        damage += " (" + next.damage + ")";
        attack_speed += " (" + next.attack_speed + ")";
        range += " (" + next.range + ")";
    }

    const towerRefund = CALCULATE_TOWER_REFUND(tower.cost);

    $(TOWER_INFO.damage).text(damage);
    $(TOWER_INFO.attack_speed).text(attack_speed);
    $(TOWER_INFO.range).text(range);
    $(TOWER_INFO.upgrade).text("Upgrade (" + current.upgrade_cost + ")");
    $(TOWER_INFO.sell).text("Sell (" + towerRefund + ")");
}

export function updateMenuControls(tower: Tower) {
    if (tower.is_upgrading) {
        TOWER_INFO.upgrade.classList.add("hidden");
        TOWER_INFO.sell.classList.add("hidden");
        TOWER_INFO.sell_message.classList.add("hidden");
        TOWER_INFO.upgrade_message.classList.remove("hidden");
    } else if (tower.is_selling) {
        TOWER_INFO.upgrade.classList.add("hidden");
        TOWER_INFO.sell.classList.add("hidden");
        TOWER_INFO.upgrade_message.classList.add("hidden");
        TOWER_INFO.sell_message.classList.remove("hidden");
    } else {
        TOWER_INFO.upgrade_message.classList.add("hidden");
        TOWER_INFO.sell_message.classList.add("hidden");
        TOWER_INFO.sell.classList.remove("hidden");

        if (tower.maxUpgrade()) {
            TOWER_INFO.upgrade.classList.add("hidden");
        } else {
            TOWER_INFO.upgrade.classList.remove("hidden");
        }
    }
}
