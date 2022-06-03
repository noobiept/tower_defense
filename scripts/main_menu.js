(function (window) {
    function MainMenu() {}

    var MAIN_MENU = null;
    var HIGH_SCORE = null;
    var TBODY = null;

    MainMenu.init = function () {
        MAIN_MENU = document.querySelector("#MainMenu");
        HIGH_SCORE = document.querySelector("#HighScore");
        TBODY = HIGH_SCORE.querySelector("tbody");

        var easy = MAIN_MENU.querySelector("#MainMenu-easy");
        var medium = MAIN_MENU.querySelector("#MainMenu-medium");
        var hard = MAIN_MENU.querySelector("#MainMenu-hard");
        var highScore = MAIN_MENU.querySelector("#MainMenu-highScores");

        easy.onclick = function () {
            MainMenu.close();

            Game.start("easy");
        };

        medium.onclick = function () {
            MainMenu.close();

            Game.start("medium");
        };

        hard.onclick = function () {
            MainMenu.close();

            Game.start("hard");
        };

        highScore.onclick = MainMenu.openHighScore;

        // high-score
        var back = HIGH_SCORE.querySelector("#HighScore-back");

        back.onclick = function () {
            $(HIGH_SCORE).css("display", "none");

            $(TBODY).empty();

            MainMenu.open();
        };
    };

    MainMenu.open = function () {
        $("#MainCanvas").css("display", "none");
        $(MAIN_MENU).css("display", "block");

        var menuWidth = $(MAIN_MENU).outerWidth();
        var menuHeight = $(MAIN_MENU).outerHeight();

        var windowWidth = $(window).outerWidth();
        var windowHeight = $(window).outerHeight();

        var top = windowHeight / 2 - menuHeight / 2;
        var left = windowWidth / 2 - menuWidth / 2;

        $(MAIN_MENU).css("top", top + "px");
        $(MAIN_MENU).css("left", left + "px");
    };

    MainMenu.close = function () {
        $(MAIN_MENU).css("display", "none");
    };

    MainMenu.openHighScore = function () {
        MainMenu.close();

        var easy = HighScore.get("easy");
        var medium = HighScore.get("medium");
        var hard = HighScore.get("hard");
        var maxScoresSaved = HighScore.getMaxScoresSaved();

        var maps = [easy, medium, hard];

        var tableRow, tableData;

        var a, b;

        for (a = 0; a < maxScoresSaved; a++) {
            tableRow = document.createElement("tr");

            for (b = 0; b < maps.length; b++) {
                tableData = document.createElement("td");
                var map = maps[b];

                if (map && map[a]) {
                    $(tableData).text(map[a]);
                } else {
                    $(tableData).text("-");
                }

                tableRow.appendChild(tableData);
            }

            TBODY.appendChild(tableRow);
        }

        $(HIGH_SCORE).css("display", "block");

        var menuWidth = $(HIGH_SCORE).outerWidth();
        var menuHeight = $(HIGH_SCORE).outerHeight();

        var windowWidth = $(window).outerWidth();
        var windowHeight = $(window).outerHeight();

        var top = windowHeight / 2 - menuHeight / 2;
        var left = windowWidth / 2 - menuWidth / 2;

        $(HIGH_SCORE).css("top", top + "px");
        $(HIGH_SCORE).css("left", left + "px");
    };

    window.MainMenu = MainMenu;
})(window);
