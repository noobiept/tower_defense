import * as Game from "./game";
import * as HighScore from "./high_score";

let MAIN_MENU: HTMLElement;
let HIGH_SCORE: HTMLElement;
let TBODY: HTMLElement;

export function init() {
    MAIN_MENU = document.getElementById("MainMenu")!;
    HIGH_SCORE = document.getElementById("HighScore")!;
    TBODY = HIGH_SCORE.querySelector("tbody")!;

    const easy = document.getElementById("MainMenu-easy")!;
    const medium = document.getElementById("MainMenu-medium")!;
    const hard = document.getElementById("MainMenu-hard")!;
    const highScore = document.getElementById("MainMenu-highScores")!;

    easy.onclick = function () {
        close();
        Game.start("easy");
    };

    medium.onclick = function () {
        close();
        Game.start("medium");
    };

    hard.onclick = function () {
        close();
        Game.start("hard");
    };

    highScore.onclick = openHighScore;

    // high-score
    const back = document.getElementById("HighScore-back")!;

    back.onclick = function () {
        HIGH_SCORE.classList.add("hidden");
        $(TBODY).empty();

        open();
    };
}

export function open() {
    MAIN_MENU.classList.remove("hidden");
}

function close() {
    MAIN_MENU.classList.add("hidden");
}

function openHighScore() {
    close();

    const easy = HighScore.get("easy");
    const medium = HighScore.get("medium");
    const hard = HighScore.get("hard");
    const maxScoresSaved = HighScore.getMaxScoresSaved();

    const maps = [easy, medium, hard];

    let tableRow, tableData;

    let a, b;

    for (a = 0; a < maxScoresSaved; a++) {
        tableRow = document.createElement("tr");

        for (b = 0; b < maps.length; b++) {
            tableData = document.createElement("td");
            const map = maps[b];

            if (map && map[a]) {
                $(tableData).text(map[a]);
            } else {
                $(tableData).text("-");
            }

            tableRow.appendChild(tableData);
        }

        TBODY.appendChild(tableRow);
    }

    HIGH_SCORE.classList.remove("hidden");
}
