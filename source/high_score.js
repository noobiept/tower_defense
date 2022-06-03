export function HighScore() {}

// HIGH_SCORE = { mapName: [ score1, score2, ... ] }
var HIGH_SCORE = {};

// max. number of scores saved per map (the top scores)
var MAX_SCORES_SAVED = 5;

HighScore.getMaxScoresSaved = function () {
    return MAX_SCORES_SAVED;
};

HighScore.load = function () {
    var score = Utilities.getObject("high_score");

    if (score !== null) {
        HIGH_SCORE = score;
    }
};

HighScore.save = function () {
    Utilities.saveObject("high_score", HIGH_SCORE);
};

/**
    @param {String} mapName
    @param {Number} score
 */

HighScore.add = function (mapName, score) {
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

    HighScore.save();
};

HighScore.getAll = function () {
    return HIGH_SCORE;
};

HighScore.get = function (mapName) {
    if (typeof HIGH_SCORE[mapName] == "undefined") {
        return null;
    }

    return HIGH_SCORE[mapName];
};

HighScore.removeAll = function () {
    HIGH_SCORE.length = 0;

    localStorage.removeItem("high_score");
};
