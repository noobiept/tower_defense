import { getRandomInt, isBoolean, round } from "@drk4/utilities";
import * as Map from "./map";
import * as GameMenu from "./game_menu";
import { Tower } from "./towers/tower";
import { Bullet } from "./bullet";
import { Unit } from "./units/unit";
import { Tooltip } from "./tooltip";
import { Message } from "./message";
import * as HighScore from "./high_score";
import * as Canvas from "./canvas";
import { createUnit, UnitKey } from "./units/unit.util";
import { getAsset } from "./assets";
import { MapData, Wave, MapUnitData, Lane } from "./types";
import { getTowerInitialCost } from "./towers/tower.util";

let MAP_NAME: string;
let UNITS_STATS: {
    [unitName in UnitKey]?: MapUnitData;
} = {};
const CREEP_LANES: Lane[] = []; // contains the start/end point of each lane
const ALL_WAVES: Wave[] = [];
const ACTIVE_WAVES: Wave[] = []; // you may have more than 1 wave active (adding units)
let NEXT_WAVE = 0;
let NO_MORE_WAVES = false;
let WAVE_INTERVAL = 0;
let WAVE_COUNT = 0;

let ELEMENT_SELECTED: Tower | null = null;

let GOLD = 0;
let LIFE = 0;
let SCORE = 0;
let IS_PAUSED = false;
let BEFORE_FIRST_WAVE = false; // before the first wave, the game is paused but we can add towers. once the game starts, pausing the game won't allow you to add/remove towers

// this will have the return when setting the events (need to save this so that later we can turn the event off (with createjs, doesn't work passing the function, like it does when setting a normal event)
const EVENTS: {
    tick: (() => void) | null;
    mouseMove: (() => void) | null;
} = {
    tick: null,
    mouseMove: null,
};

const GAME_END = {
    is_over: false,
    victory: false,
};
let ON_QUIT: () => void;

export function init(onQuit: () => void) {
    GameMenu.init({
        forceNextWave,
        quit,
        upgradeSelection,
        sellSelection,
        getSelection,
        pause,
        calculateTowerRefund,
    });

    ON_QUIT = onQuit;
}

export function start(map: string) {
    MAP_NAME = map;

    const mapInfo = getAsset(map) as MapData;

    UNITS_STATS = {
        Unit: mapInfo.Unit,
        UnitFast: mapInfo.UnitFast,
        UnitFly: mapInfo.UnitFly,
        UnitGroup: mapInfo.UnitGroup,
        UnitImmune: mapInfo.UnitImmune,
        UnitSpawn: mapInfo.UnitSpawn,
    };

    // read from the map info and update the appropriate variables
    for (let a = 0; a < mapInfo.waves.length; a++) {
        const waveType = mapInfo.waves[a];
        const stats = UNITS_STATS[waveType]!;
        const howMany = Math.floor(
            stats.wave_count_initial * (1 + a * stats.wave_count_increase_rate)
        );
        const health = Math.floor(
            stats.health_initial * (1 + a * stats.health_increase_rate)
        );
        const health_regeneration = Math.floor(
            stats.health_regeneration_initial *
                (1 + a * stats.health_regeneration_increase_rate)
        );
        const gold = Math.floor(
            stats.gold_initial * (1 + a * stats.gold_increase_rate)
        );
        const score = Math.floor(
            stats.score_initial * (1 + a * stats.score_increase_rate)
        );

        ALL_WAVES.push({
            type: waveType,
            howMany: howMany,
            health: health,
            health_regeneration: health_regeneration,
            gold: gold,
            score: score,
            count: 0,
            spawnInterval: stats.spawnInterval,
        });
    }

    for (let a = 0; a < mapInfo.creepLanes.length; a++) {
        const lane = mapInfo.creepLanes[a];

        CREEP_LANES.push({
            start: lane.start,
            end: lane.end,
            length: lane.length,
            orientation: lane.orientation,
        });
    }

    // reset the variables
    WAVE_INTERVAL = mapInfo.waveInterval;

    GAME_END.is_over = false;
    ELEMENT_SELECTED = null;
    GOLD = 0;
    LIFE = 0;
    SCORE = 0;
    IS_PAUSED = false;
    NO_MORE_WAVES = false;
    BEFORE_FIRST_WAVE = true;
    WAVE_COUNT = WAVE_INTERVAL; // start the first wave immediately
    NEXT_WAVE = 0;

    // init the game
    Map.build(mapInfo);
    showElements();

    updateGold(200);
    updateLife(20);
    updateScore(0);
    tick({ delta: 1 } as createjs.TickerEvent); // run the tick once to initialize the timer and the wave list (passing dummy 'event' argument) //TODO improve
    pause(true);

    // set the events
    EVENTS.tick = createjs.Ticker.on("tick", tick as () => void) as () => void;
    EVENTS.mouseMove = Canvas.addStageEventListener(
        "stagemousemove",
        Map.mouseMoveEvents as () => void
    ) as () => void;

    window.addEventListener("keyup", keyUpEvents);
    Canvas.addCanvasEventListener("mouseup", mouseEvents as (e: Event) => void);
}

/**
 * Show the game related html elements.
 */
function showElements() {
    GameMenu.show();

    const container = document.getElementById("Game")!;
    container.classList.remove("hidden");
}

/**
 * Hide the game related html elements.
 */
function hideElements() {
    const container = document.getElementById("Game")!;
    container.classList.add("hidden");
}

function quit() {
    setEndFlag(false);
}

/*
    When we determine the game has ended, we have to call this function instead of Game.end(), which will set a flag that is going to be dealt with in the end of the Game.tick()
    Only then we'll call Game.end
    The reason is to fix a problem when the game end is triggered during the Unit.tick() loop (the units are cleared in Game.end(), but then the loop will try to continue..)
 */
function setEndFlag(victory: boolean) {
    // if the game is paused, we can safely end the game right away (it will most likely be a defeat)
    if (IS_PAUSED) {
        end(victory);
    }

    GAME_END.is_over = true;
    GAME_END.victory = victory;
}

function updateGold(gold: number) {
    GOLD += gold;

    GameMenu.updateGold(GOLD);
}

function haveEnoughGold(price: number) {
    if (GOLD < price) {
        return false;
    }

    return true;
}

function updateLife(life: number) {
    LIFE += life;

    if (LIFE <= 0) {
        setEndFlag(false);
    }

    if (life < 0) {
        updateScore(-50);
    }

    GameMenu.updateLife(LIFE);
}

function updateScore(score: number) {
    SCORE += score;

    GameMenu.updateScore(SCORE);
}

function keyUpEvents(event: KeyboardEvent) {
    if (IS_PAUSED && !BEFORE_FIRST_WAVE) {
        return;
    }

    switch (event.key) {
        case "1":
            GameMenu.selectTower(0);
            break;

        case "2":
            GameMenu.selectTower(1);
            break;

        case "3":
            GameMenu.selectTower(2);
            break;

        case "4":
            GameMenu.selectTower(3);
            break;

        case "5":
            GameMenu.selectTower(4);
            break;

        case "6":
            GameMenu.selectTower(5);
            break;

        case "n":
            forceNextWave();
            break;

        case "u":
            upgradeSelection();
            break;

        case "s":
            sellSelection();
            break;
    }
}

function upgradeSelection() {
    const selection = getSelection();

    if (selection) {
        const upgradeCost = selection.getUpgradeCost();

        if (!haveEnoughGold(upgradeCost)) {
            new Message({
                text: "Not enough gold.",
                position: "bottom",
            });
            return;
        }

        const upgraded = selection.startUpgrading(BEFORE_FIRST_WAVE);
        if (upgraded.ok) {
            updateGold(-upgradeCost);
            GameMenu.updateMenuControls(selection);
        } else if (upgraded.message) {
            new Message({
                text: upgraded.message,
                position: "bottom",
            });
        }
    }
}

function sellSelection() {
    const selection = getSelection();

    if (selection) {
        selection.startSelling(BEFORE_FIRST_WAVE);
        GameMenu.updateMenuControls(selection);
    }
}

function mouseEvents(event: MouseEvent) {
    if (IS_PAUSED && !BEFORE_FIRST_WAVE) {
        return;
    }

    const canvasRect = Canvas.getCanvasBoundingClientRect();
    const button = event.button;
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;

    if (ELEMENT_SELECTED) {
        clearSelection();
    }

    // left click
    if (button == 0) {
        // see if we're selecting a tower
        for (let a = 0; a < Tower.ALL.length; a++) {
            const tower = Tower.ALL[a];
            const point = tower.baseElement.globalToLocal(x, y);

            if (tower.baseElement.hitTest(point.x, point.y)) {
                tower.selected();

                // show the stats in the game menu
                GameMenu.showTowerStats(tower);

                ELEMENT_SELECTED = tower;
                return;
            }
        }

        const towerKey = GameMenu.getSelectedTower();
        const initialCost = getTowerInitialCost(towerKey);

        // see if we can afford a tower
        if (!haveEnoughGold(initialCost)) {
            new Message({
                text: "Not enough gold.",
                position: "bottom",
            });
            return;
        }

        const highlight = Map.getHighlightSquare();

        const tower = Map.addTower(
            towerKey,
            highlight.column,
            highlight.line,
            (cost: number) => {
                updateGold(calculateTowerRefund(cost));
            },
            (tower: Tower) => {
                // remove the selection of this tower
                if (checkIfSelected(tower)) {
                    clearSelection();
                }
            },
            (tower: Tower) => {
                if (checkIfSelected(tower)) {
                    GameMenu.updateTowerStats(tower, false);
                }
            }
        );

        if (tower) {
            updateGold(-tower.cost);
        }
    }

    // right click
    else if (button == 2) {
        // see if we're selecting a tower
        for (let a = 0; a < Tower.ALL.length; a++) {
            const tower = Tower.ALL[a];
            const point = tower.baseElement.globalToLocal(x, y);

            if (tower.baseElement.hitTest(point.x, point.y)) {
                tower.startSelling(BEFORE_FIRST_WAVE);
            }
        }
    }
}

function calculateTowerRefund(cost: number) {
    return BEFORE_FIRST_WAVE ? cost : cost / 2;
}

function clearSelection() {
    ELEMENT_SELECTED?.unselected();
    ELEMENT_SELECTED = null;

    GameMenu.hideTowerStats();
}

function getSelection() {
    return ELEMENT_SELECTED;
}

function checkIfSelected(element: Tower | Unit) {
    if (element == ELEMENT_SELECTED) {
        return true;
    }

    return false;
}

function clear() {
    if (EVENTS.tick) {
        createjs.Ticker.off("tick", EVENTS.tick);
    }
    if (EVENTS.mouseMove) {
        Canvas.removeStageEventListener("stagemousemove", EVENTS.mouseMove);
    }

    window.removeEventListener("keyup", keyUpEvents);
    Canvas.removeCanvasEventListener(
        "mouseup",
        mouseEvents as (e: Event) => void
    );

    Unit.removeAll();
    Tower.removeAll();
    Map.clear();
    GameMenu.hide();
    Tooltip.hideAll();
    Message.removeAll();
    Bullet.removeAll();

    UNITS_STATS = {};
    ALL_WAVES.length = 0;
    CREEP_LANES.length = 0;
    ACTIVE_WAVES.length = 0;
}

/**
 * Call Game.setEndFlag() instead
 * This is only called at the end of Game.tick() or in Game.setEndFlag() (when the game is paused)
 */
function end(victory: boolean) {
    clear();

    let message = "";

    if (victory) {
        message += "Victory!\n\nScore: " + SCORE;

        HighScore.add(MAP_NAME, SCORE);
    } else {
        message += "Defeat!";
    }

    // since the game menu elements are hidden, we need to re-center the canvas, so it can show the end message
    const gameElement = document.getElementById("Game")!;
    gameElement.classList.add("centered");

    new Message({
        text: message,
        fontSize: 30,
        onEnd: function () {
            Canvas.updateStage();

            hideElements();
            gameElement.classList.remove("centered");

            ON_QUIT();
        },
        timeout: 2000,
    });

    Canvas.updateStage();
}

function forceNextWave() {
    if (BEFORE_FIRST_WAVE) {
        pause();
        return;
    }

    if (IS_PAUSED) {
        return;
    }

    // no more waves
    if (NEXT_WAVE >= ALL_WAVES.length) {
        return;
    }

    const scorePerSecond = 10;
    const waveTimeLeft = WAVE_INTERVAL - WAVE_COUNT;

    const score = Math.floor(waveTimeLeft * scorePerSecond);

    updateScore(score);

    WAVE_COUNT = WAVE_INTERVAL;
}

/*
    If called without arguments, it starts the game if its the time before the first wave, or does the opposite of the current state if the game is already running
 */

function pause(paused?: boolean) {
    // if its not provided, just change to the opposite of the current one
    if (typeof paused == "undefined" || !isBoolean(paused)) {
        if (BEFORE_FIRST_WAVE) {
            BEFORE_FIRST_WAVE = false;
            paused = false;
        } else {
            paused = !IS_PAUSED;
        }
    }

    IS_PAUSED = paused;
    GameMenu.pause(paused);
}

function onReachDestination() {
    updateLife(-1);
}

function onUnitRemoved(unit: Unit) {
    if (checkIfSelected(unit)) {
        clearSelection();
    }
}

/**
 * Add the gold earn from killing this unit.
 */
function onUnitKilled(unit: Unit) {
    updateGold(unit.gold);
    updateScore(unit.score);
}

function tick(event: createjs.TickerEvent) {
    if (IS_PAUSED) {
        Canvas.updateStage();
        return;
    }

    let a;
    const deltaSeconds = event.delta / 1000;

    if (!NO_MORE_WAVES) {
        WAVE_COUNT += deltaSeconds;

        // time to start a new wave
        if (WAVE_COUNT >= WAVE_INTERVAL) {
            WAVE_COUNT = 0;

            ACTIVE_WAVES.push(ALL_WAVES[NEXT_WAVE]);

            GameMenu.updateWave(NEXT_WAVE, ALL_WAVES);

            NEXT_WAVE++;

            if (NEXT_WAVE >= ALL_WAVES.length) {
                NO_MORE_WAVES = true;
            }
        }

        const timeUntilNextWave = WAVE_INTERVAL - WAVE_COUNT;

        GameMenu.updateTimeUntilNextWave(
            round(timeUntilNextWave, 2).toFixed(1)
        );
    }

    for (a = ACTIVE_WAVES.length - 1; a >= 0; a--) {
        const wave = ACTIVE_WAVES[a];

        wave.count += deltaSeconds;

        if (wave.count >= wave.spawnInterval) {
            wave.count = 0;

            let removeWave = false;

            for (let b = 0; b < CREEP_LANES.length; b++) {
                const lane = CREEP_LANES[b];
                let startLine, startColumn;
                const halfLength = Math.floor(lane.length / 2);

                // add units randomly in the start zone
                if (lane.orientation == "horizontal") {
                    startColumn = lane.start.column;
                    startLine = getRandomInt(
                        lane.start.line - halfLength,
                        lane.start.line + halfLength - 1
                    );
                } else {
                    startColumn = getRandomInt(
                        lane.start.column - halfLength,
                        lane.start.column + halfLength - 1
                    );
                    startLine = lane.start.line;
                }

                removeWave = createUnit({
                    column: startColumn,
                    line: startLine,
                    wave,
                    lane,
                    lane_id: b,
                    size: Map.getSquareSize(),
                    onReachDestination,
                    onUnitRemoved,
                    onUnitKilled,
                    getNextDestination: Map.getUnitNextDestination,
                    toCanvasPosition: Map.getPosition,
                    canvasToGrid: Map.calculatePosition,
                    getAvailablePositions: Map.getAvailablePositions,
                });
            }

            wave.howMany--;

            if (wave.howMany <= 0 || removeWave === true) {
                const index = ACTIVE_WAVES.indexOf(wave);

                ACTIVE_WAVES.splice(index, 1);
            }
        }
    }

    for (a = Unit.ALL.length - 1; a >= 0; a--) {
        Unit.ALL[a].tick(deltaSeconds);
    }

    for (a = Tower.ALL.length - 1; a >= 0; a--) {
        Tower.ALL[a].tick(deltaSeconds);
    }

    for (a = Bullet.ALL.length - 1; a >= 0; a--) {
        Bullet.ALL[a].tick(deltaSeconds);
    }

    // no more waves or units alive, victory!
    if (NO_MORE_WAVES && ACTIVE_WAVES.length == 0 && Unit.ALL.length == 0) {
        setEndFlag(true);
    }

    if (GAME_END.is_over) {
        end(GAME_END.victory);
    }

    Canvas.updateStage();
}
