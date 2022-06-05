import { getObject, saveObject } from "@drk4/utilities";

interface HighScoreData {
    [mapName: string]: number[];
}

// HIGH_SCORE = { mapName: [ score1, score2, ... ] }
var HIGH_SCORE: HighScoreData = {};

// max. number of scores saved per map (the top scores)
var MAX_SCORES_SAVED = 5;

export function getMaxScoresSaved() {
    return MAX_SCORES_SAVED;
}

export function load() {
    var score = getObject("high_score");

    if (score !== null) {
        HIGH_SCORE = score;
    }
}

export function save() {
    saveObject("high_score", HIGH_SCORE);
}

/**
    @param {String} mapName
    @param {Number} score
 */

export function add(mapName, score) {
    if (typeof HIGH_SCORE[mapName] == "undefined") {
        HIGH_SCORE[mapName] = [];
    }

    HIGH_SCORE[mapName].push(score);

    // have the better scores first (better means a lesser value (finished the map faster))
    HIGH_SCORE[mapName].sort(function (a, b) {
        return b - a;
    });

    // if we pass the limit, remove one of the lesser scores
    if (HIGH_SCORE[mapName].length > MAX_SCORES_SAVED) {
        HIGH_SCORE[mapName].pop();
    }

    save();
}

export function getAll() {
    return HIGH_SCORE;
}

export function get(mapName) {
    if (typeof HIGH_SCORE[mapName] == "undefined") {
        return null;
    }

    return HIGH_SCORE[mapName];
}

export function removeAll() {
    HIGH_SCORE = {};
    localStorage.removeItem("high_score");
}
