import { getRandomInt, isBoolean, round } from "@drk4/utilities";
import * as Map from "./map";
import * as GameMenu from "./game_menu";
import { Tower } from "./tower";
import { Bullet } from "./bullet";
import { Unit } from "./units/unit";
import { Tooltip } from "./tooltip";
import { Message } from "./message";
import * as MainMenu from "./main_menu";
import * as HighScore from "./high_score";
import { createUnit } from "./units/units.util";
import { getAsset } from "./assets";
import {
    addCanvasEventListener,
    addStageEventListener,
    getCanvasBoundingClientRect,
    removeCanvasEventListener,
    removeStageEventListener,
    updateStage,
} from "./canvas";

var MAP_NAME;
var UNITS_STATS = {};
var CREEP_LANES = []; // contains the start/end point of each lane
var ALL_WAVES = [];
var ACTIVE_WAVES = []; // you may have more than 1 wave active (adding units)
var NEXT_WAVE = 0;
var NO_MORE_WAVES = false;
var WAVE_INTERVAL = 0;
var WAVE_COUNT = 0;

var ELEMENT_SELECTED = null;

var GOLD = 0;
var LIFE = 0;
var SCORE = 0;
var IS_PAUSED = false;
var BEFORE_FIRST_WAVE = false; // before the first wave, the game is paused but we can add towers. once the game starts, pausing the game won't allow you to add/remove towers

// this will have the return when setting the events (need to save this so that later we can turn the event off (with createjs, doesn't work passing the function, like it does when setting a normal event)
var EVENTS = {
    tick: null,
    mouseMove: null,
};

var GAME_END = {
    is_over: false,
    victory: false,
};

export function start(map) {
    MAP_NAME = map;

    var mapInfo = getAsset(map);

    var a;
    UNITS_STATS["Unit"] = mapInfo["Unit"];
    UNITS_STATS["UnitFast"] = mapInfo["UnitFast"];
    UNITS_STATS["UnitFly"] = mapInfo["UnitFly"];
    UNITS_STATS["UnitGroup"] = mapInfo["UnitGroup"];
    UNITS_STATS["UnitImmune"] = mapInfo["UnitImmune"];
    UNITS_STATS["UnitSpawn"] = mapInfo["UnitSpawn"];

    // read from the map info and update the appropriate variables
    for (a = 0; a < mapInfo.waves.length; a++) {
        var waveType = mapInfo.waves[a];
        var stats = UNITS_STATS[waveType];
        var howMany = Math.floor(
            stats.wave_count_initial * (1 + a * stats.wave_count_increase_rate)
        );
        var health = Math.floor(
            stats.health_initial * (1 + a * stats.health_increase_rate)
        );
        var health_regeneration = Math.floor(
            stats.health_regeneration_initial *
                (1 + a * stats.health_regeneration_increase_rate)
        );
        var gold = Math.floor(
            stats.gold_initial * (1 + a * stats.gold_increase_rate)
        );
        var score = Math.floor(
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

    for (a = 0; a < mapInfo.creepLanes.length; a++) {
        var lane = mapInfo.creepLanes[a];

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

    $("#MainCanvas").css("display", "block");
    GameMenu.show();

    updateGold(200);
    updateLife(20);
    updateScore(0);
    tick({ delta: 1 }); // run the tick once to initialize the timer and the wave list (passing dummy 'event' argument)
    pause(true);

    // set the events
    EVENTS.tick = createjs.Ticker.on("tick", tick);
    EVENTS.mouseMove = addStageEventListener(
        "stagemousemove",
        Map.mouseMoveEvents
    );

    window.addEventListener("keyup", keyUpEvents);
    addCanvasEventListener("mouseup", mouseEvents);
}

/*
    When we determine the game has ended, we have to call this function instead of Game.end(), which will set a flag that is going to be dealt with in the end of the Game.tick()
    Only then we'll call Game.end
    The reason is to fix a problem when the game end is triggered during the Unit.tick() loop (the units are cleared in Game.end(), but then the loop will try to continue..)
 */
export function setEndFlag(victory) {
    // if the game is paused, we can safely end the game right away (it will most likely be a defeat)
    if (IS_PAUSED) {
        end(victory);
    }

    GAME_END.is_over = true;
    GAME_END.victory = victory;
}

export function isPaused() {
    return IS_PAUSED;
}

export function updateGold(gold) {
    GOLD += gold;

    GameMenu.updateGold(GOLD);
}

export function haveEnoughGold(price) {
    if (GOLD < price) {
        return false;
    }

    return true;
}

export function updateLife(life) {
    LIFE += life;

    if (LIFE <= 0) {
        setEndFlag(false);
    }

    if (life < 0) {
        updateScore(-50);
    }

    GameMenu.updateLife(LIFE);
}

export function updateScore(score) {
    SCORE += score;

    GameMenu.updateScore(SCORE);
}

function keyUpEvents(event: KeyboardEvent) {
    if (IS_PAUSED && !BEFORE_FIRST_WAVE) {
        return;
    }

    var selection;

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
            selection = getSelection();

            if (selection) {
                selection.startUpgrading();
            }
            break;

        case "s":
            selection = getSelection();

            if (selection) {
                selection.startSelling();
            }
            break;
    }
}

export function beforeFirstWave() {
    return BEFORE_FIRST_WAVE;
}

function mouseEvents(event) {
    if (IS_PAUSED && !BEFORE_FIRST_WAVE) {
        return;
    }

    var canvasRect = getCanvasBoundingClientRect();
    var button = event.button;
    var x = event.clientX - canvasRect.left;
    var y = event.clientY - canvasRect.top;
    var a;
    var tower;
    var point;

    if (ELEMENT_SELECTED) {
        clearSelection();
    }

    // left click
    if (button == 0) {
        // see if we're selecting a tower
        for (a = 0; a < Tower.ALL.length; a++) {
            tower = Tower.ALL[a];
            point = tower.baseElement.globalToLocal(x, y);

            if (tower.baseElement.hitTest(point.x, point.y)) {
                tower.selected();

                ELEMENT_SELECTED = tower;
                return;
            }
        }

        var towerClass = GameMenu.getSelectedTower();

        // see if we can afford a tower
        if (!haveEnoughGold(towerClass.stats[0].initial_cost)) {
            GameMenu.showMessage("Not enough gold.");
            return;
        }

        var highlight = Map.getHighlightSquare();

        Map.addTower(towerClass, highlight.column, highlight.line);
    }

    // right click
    else if (button == 2) {
        // see if we're selecting a tower
        for (a = 0; a < Tower.ALL.length; a++) {
            tower = Tower.ALL[a];
            point = tower.baseElement.globalToLocal(x, y);

            if (tower.baseElement.hitTest(point.x, point.y)) {
                tower.startSelling();
            }
        }
    }
}

export function clearSelection() {
    ELEMENT_SELECTED.unselected();
    ELEMENT_SELECTED = null;
}

export function getSelection() {
    return ELEMENT_SELECTED;
}

export function checkIfSelected(element) {
    if (element == ELEMENT_SELECTED) {
        return true;
    }

    return false;
}

function clear() {
    createjs.Ticker.off("tick", EVENTS.tick);
    removeStageEventListener("stagemousemove", EVENTS.mouseMove);

    window.removeEventListener("keyup", keyUpEvents);
    removeCanvasEventListener("mouseup", mouseEvents);

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

/*
    Call Game.setEndFlag() instead
    This is only called at the end of Game.tick() or in Game.setEndFlag() (when the game is paused)
 */

function end(victory) {
    clear();

    var message = "";

    if (victory) {
        message += "Victory!\n\nScore: " + SCORE;

        HighScore.add(MAP_NAME, SCORE);
    } else {
        message += "Defeat!";
    }

    new Message({
        text: message,
        fontSize: 30,
        onEnd: function () {
            updateStage();
            MainMenu.open();
        },
        timeout: 2000,
    });

    updateStage();
}

export function forceNextWave() {
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

    var scorePerSecond = 10;
    var waveTimeLeft = WAVE_INTERVAL - WAVE_COUNT;

    var score = Math.floor(waveTimeLeft * scorePerSecond);

    updateScore(score);

    WAVE_COUNT = WAVE_INTERVAL;
}

/*
    If called without arguments, it starts the game if its the time before the first wave, or does the opposite of the current state if the game is already running
 */

export function pause(paused?: boolean) {
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

function onUnitRemoved() {
    if (checkIfSelected(this)) {
        clearSelection();
    }
}

/**
 * Add the gold earn from killing this unit.
 */
function onUnitKilled() {
    updateGold(this.gold);
    updateScore(this.score);
}

function tick(event) {
    if (IS_PAUSED) {
        updateStage();
        return;
    }

    var a;
    var deltaSeconds = event.delta / 1000;

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

        var timeUntilNextWave = WAVE_INTERVAL - WAVE_COUNT;

        GameMenu.updateTimeUntilNextWave(
            round(timeUntilNextWave, 2).toFixed(1)
        );
    }

    for (a = ACTIVE_WAVES.length - 1; a >= 0; a--) {
        var wave = ACTIVE_WAVES[a];

        wave.count += deltaSeconds;

        if (wave.count >= wave.spawnInterval) {
            wave.count = 0;

            var removeWave = false;

            for (var b = 0; b < CREEP_LANES.length; b++) {
                var lane = CREEP_LANES[b];
                var startLine, startColumn;
                var halfLength = Math.floor(lane.length / 2);

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
                var index = ACTIVE_WAVES.indexOf(wave);

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

    updateStage();
}
