(function (window) {
    function GameMenu() {}

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

    GameMenu.init = function () {
        var menu = document.querySelector("#GameMenu");
        var a;

        // game controls
        START_PAUSED = menu.querySelector("#startPause");
        START_PAUSED.onclick = Game.pause;
        START_PAUSED.tooltip = new Tooltip({
            text: "Click to start",
            reference: START_PAUSED,
            enableEvents: false,
        });

        var timeUntilNext = menu.querySelector(".timeUntilNextWave");
        timeUntilNext.onclick = Game.forceNextWave;

        TIME_UNTIL_NEXT_WAVE = timeUntilNext.querySelector("span");

        var quit = menu.querySelector("#quit");
        quit.onclick = function () {
            Game.setEndFlag(false);
        };

        // game info stuff
        CURRENT_GOLD = menu.querySelector(".currentGold span");
        CURRENT_LIFE = menu.querySelector(".currentLife span");
        CURRENT_SCORE = menu.querySelector(".currentScore span");

        // wave list
        WAVE_LIST = menu.querySelectorAll("#GameMenu-waveList > div");

        for (a = 0; a < WAVE_LIST.length; a++) {
            WAVE_LIST[a].tooltip = new Tooltip({
                text: "",
                reference: WAVE_LIST[a],
            });
        }

        // game menu's message
        MESSAGE = document.querySelector("#Message");
        MESSAGE_TIMEOUT = new Utilities.Timeout();

        // tower selector
        var basicTower = menu.querySelector("#basicTower");
        var fastTower = menu.querySelector("#fastTower");
        var rocketTower = menu.querySelector("#rocketTower");
        var frostTower = menu.querySelector("#frostTower");
        var antiAirTower = menu.querySelector("#antiAirTower");
        var bashTower = menu.querySelector("#bashTower");

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

            $(htmlElement).text(
                $(htmlElement).text() + " - " + towerInitialCost
            );
            htmlElement.onclick = (function (position) {
                return function () {
                    GameMenu.selectTower(position);
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

        TOWER_INFO.upgrade.onclick = function () {
            var tower = Game.getSelection();

            if (tower) {
                tower.startUpgrading();
            }
        };
        TOWER_INFO.upgrade.onmouseover = function () {
            var tower = Game.getSelection();

            if (tower) {
                GameMenu.updateTowerStats(tower, true);
            }
        };
        TOWER_INFO.upgrade.onmouseout = function () {
            var tower = Game.getSelection();

            if (tower) {
                GameMenu.updateTowerStats(tower, false);
            }
        };

        TOWER_INFO.sell.onclick = function () {
            var tower = Game.getSelection();

            if (tower) {
                tower.startSelling();
            }
        };

        // start with the basic tower selected
        GameMenu.selectTower(0);
    };

    GameMenu.show = function () {
        $("#GameMenu").css("display", "flex");
    };

    GameMenu.hide = function () {
        $("#GameMenu").css("display", "none");
    };

    GameMenu.pause = function (isPaused) {
        if (isPaused) {
            START_PAUSED.tooltip.show();

            $(START_PAUSED).text("Resume");
        } else {
            START_PAUSED.tooltip.hide();

            $(START_PAUSED).text("Pause");
        }
    };

    GameMenu.selectTower = function (position) {
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
    };

    GameMenu.showMessage = function (message) {
        $(MESSAGE).css("visibility", "visible");
        $(MESSAGE).text(message);

        MESSAGE_TIMEOUT.start(function () {
            $(MESSAGE).css("visibility", "hidden");
        }, 1000);
    };

    GameMenu.updateGold = function (gold) {
        $(CURRENT_GOLD).text(gold);
    };

    GameMenu.updateLife = function (life) {
        $(CURRENT_LIFE).text(life);
    };

    GameMenu.updateScore = function (score) {
        $(CURRENT_SCORE).text(score);
    };

    GameMenu.updateTimeUntilNextWave = function (time) {
        $(TIME_UNTIL_NEXT_WAVE).text(time);
    };

    GameMenu.updateWave = function (currentWave, allWaves) {
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
    };

    GameMenu.getSelectedTower = function () {
        return SELECTED_TOWER.tower;
    };

    GameMenu.showTowerStats = function (tower) {
        $(TOWER_INFO.container).css("display", "flex");

        GameMenu.updateTowerStats(tower, false);

        // update the info that won't change during the selection
        $(TOWER_INFO.name).text(tower.name);
    };

    /**
     * Hide the tower stats html element.
     */
    GameMenu.hideTowerStats = function () {
        $(TOWER_INFO.container).css("display", "none");
    };

    /**
     * Update the selected tower stats. It can show the stats after the next upgrade is completed (next to the current stats).
     */
    GameMenu.updateTowerStats = function (tower, showNextUpgrade) {
        GameMenu.updateMenuControls(tower);

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
    };

    GameMenu.updateMenuControls = function (tower) {
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
    };

    window.GameMenu = GameMenu;
})(window);
