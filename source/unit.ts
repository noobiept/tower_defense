import { G } from "./main";
import { Map } from "./map";
import { Message } from "./message";
import { Game } from "./game";

var CONTAINER; // createjs.Container() which will hold all the unit elements

export interface UnitArgs {
    name?: string;
    image?: string;
    slowImage?: string;
    width?: number;
    height?: number;
    is_ground_unit?: boolean;
    is_immune?: boolean;
    movement_speed?: number;

    column: number;
    line: number;
    lane_id: number;
    score: number;
    gold: number;
    health: number;
    health_regeneration: number;
}

export class Unit {
    static ALL = [];
    static ALL_GROUND = [];
    static ALL_AIR = [];

    /**
     * Create the container which will hold all the unit elements.
     */
    static init(parent) {
        CONTAINER = new createjs.Container();
        parent.addChild(CONTAINER);
    }

    static removeAll() {
        for (var a = 0; a < Unit.ALL.length; a++) {
            Unit.ALL[a].remove();

            a--;
        }
    }

    name: string;
    image: string;
    slowImage: string;
    width: number;
    height: number;
    is_ground_unit: boolean;
    is_immune: boolean;
    movement_speed: number;
    column: number;
    line: number;
    destination_column: number;
    destination_line: number;
    lane_id: number;
    score: number;
    gold: number;
    is_slow_down: boolean;
    slow_duration: number;
    slow_count: number;
    is_stunned: boolean;
    stun_count: number;
    stun_time: number;
    current_movement_speed: number;
    max_health: number;
    health: number;
    health_regeneration: number;
    regeneration_count: number;
    regeneration_interval: number;
    removed: boolean;
    move_x: number;
    move_y: number;
    movement_angle: number;
    next_x: number;
    next_y: number;
    next_length: number;
    container: createjs.Container;
    slowElement: createjs.Bitmap;
    healthBar: createjs.Shape;
    shape: createjs.Bitmap;

    constructor(args: UnitArgs) {
        var squareSize = Map.getSquareSize();

        this.name = args.name ?? "unit";
        this.image = args.image ?? "creep";
        this.slowImage = args.slowImage ?? "creep_slow";
        this.width = args.width ?? squareSize;
        this.height = args.height ?? squareSize;
        this.is_ground_unit = args.is_ground_unit ?? true;
        this.is_immune = args.is_immune ?? false;
        this.movement_speed = args.movement_speed ?? 60; // pixels per second
        this.column = args.column;
        this.line = args.line;
        this.lane_id = args.lane_id;
        this.score = args.score;
        this.gold = args.gold;
        this.is_slow_down = false;
        this.slow_duration = 2;
        this.slow_count = 0;
        this.is_stunned = false;
        this.stun_count = 0;
        this.stun_time = 0;
        this.current_movement_speed = this.movement_speed;

        this.max_health = args.health;
        this.health = this.max_health;
        this.health_regeneration = args.health_regeneration;
        this.regeneration_count = 0;
        this.regeneration_interval = 1 / this.health_regeneration;

        this.removed = false; // so that we don't try to remove the unit multiple times (this may happen if several towers have the .targetUnit pointing at the same unit)

        this.move_x = 0;
        this.move_y = 0;
        this.movement_angle = 0;
        this.next_x = 0;
        this.next_y = 0;
        this.next_length = 0;

        this.container = null;
        this.slowElement = null;
        this.healthBar = null;
        this.shape = null;

        this.setupShape();
        this.tick = this.tick_normal;

        Unit.ALL.push(this);

        if (this.is_ground_unit) {
            Unit.ALL_GROUND.push(this);
        } else {
            Unit.ALL_AIR.push(this);
        }

        this.checkNextDestination();
    }

    setupShape() {
        var width = this.width;
        var height = this.height;
        var halfWidth = width / 2;
        var halfHeight = height / 2;
        var g;

        // the unit
        var shape = new createjs.Bitmap(G.PRELOAD.getResult(this.image));

        shape.regX = halfWidth;
        shape.regY = halfHeight;

        // health bar

        var healthBar = new createjs.Shape();

        healthBar.x = 0;
        healthBar.y = -2;
        healthBar.regX = halfWidth;
        healthBar.regY = halfHeight;

        g = healthBar.graphics;

        g.beginFill("green");
        g.drawRoundRect(0, 0, width, 2, 1);
        g.endFill();

        // the slow circle (is added when the unit is being slowed down)
        var slow = new createjs.Bitmap(G.PRELOAD.getResult(this.slowImage));

        slow.regX = halfWidth;
        slow.regY = halfHeight;

        slow.visible = false;

        // container of all the elements
        var container = new createjs.Container();

        var position = Map.getPosition(this.column, this.line);

        container.addChild(shape);
        container.addChild(healthBar);
        container.addChild(slow);
        container.x = position.x + halfWidth;
        container.y = position.y + halfHeight;

        CONTAINER.addChild(container);

        this.container = container;
        this.healthBar = healthBar;
        this.slowElement = slow;
        this.shape = shape;
    }

    /**
     * See where to go next.
     */
    checkNextDestination() {
        var nextDest = Map.findNextDestination(
            this.column,
            this.line,
            this.lane_id
        );

        // can happen if we place a tower on top of a unit
        // just move the unit to a close valid position
        if (nextDest === null) {
            var positions = Map.getAvailablePositions(
                this.column,
                this.line,
                2
            );

            // move to a random available position nearby
            if (positions.length > 0) {
                var index = Utilities.getRandomInt(0, positions.length - 1);

                nextDest = positions[index];

                this.column = nextDest.column;
                this.line = nextDest.line;
                this.move(nextDest);
            }

            // if there isn't a place to go to, just remove the unit
            else {
                this.remove();
            }

            return;
        }

        // we reached the destination
        if (nextDest.column === this.column && nextDest.line === this.line) {
            this.remove();
            Game.updateLife(-1);
        } else {
            this.move(nextDest);
        }
    }

    move(next) {
        var unitX = this.getX();
        var unitY = this.getY();
        var squareSize = Map.getSquareSize();

        var position = Map.getPosition(next.column, next.line);

        this.destination_column = next.column;
        this.destination_line = next.line;

        var destX = position.x + squareSize / 2;
        var destY = position.y + squareSize / 2;

        var angleRads = Utilities.calculateAngle(
            unitX,
            unitY * -1,
            destX,
            destY * -1
        );

        // the next position represents a box which is used for the collision detection
        // its position after the destination position
        var boxLength = 40; // width/height
        var boxHalfLength = boxLength / 2;
        var centerX = destX + Math.cos(angleRads) * boxHalfLength;
        var centerY = destY + Math.sin(angleRads) * boxHalfLength;

        this.next_x = centerX - boxHalfLength;
        this.next_y = centerY - boxHalfLength;
        this.next_length = boxLength;
        this.movement_angle = angleRads;

        this.move_x = Math.cos(angleRads) * this.current_movement_speed;
        this.move_y = Math.sin(angleRads) * this.current_movement_speed;

        var rotation = Utilities.toDegrees(angleRads);

        this.shape.rotation = rotation;
        this.slowElement.rotation = rotation;
    }

    getX() {
        return this.container.x;
    }

    getY() {
        return this.container.y;
    }

    remove() {
        if (this.removed) {
            return;
        }

        this.removed = true;

        CONTAINER.removeChild(this.container);

        // remove from 'all' array and 'ground' or 'air' array
        var index = Unit.ALL.indexOf(this);

        Unit.ALL.splice(index, 1);

        if (this.is_ground_unit) {
            index = Unit.ALL_GROUND.indexOf(this);

            Unit.ALL_GROUND.splice(index, 1);
        } else {
            index = Unit.ALL_AIR.indexOf(this);

            Unit.ALL_AIR.splice(index, 1);
        }

        if (Game.checkIfSelected(this)) {
            Game.clearSelection();
        }
    }

    /*
    Slows down the unit for a certain time (subtract the argument to the current .movement_speed)
 */

    slowDown(minusMovementSpeed) {
        // immune units aren't affected by slow
        if (this.is_immune) {
            return;
        }

        // reset the slow down counter
        if (this.is_slow_down) {
            this.slow_count = 0;
            return;
        }

        this.is_slow_down = true;
        this.slowElement.visible = true;
        this.slow_count = 0;
        this.current_movement_speed = this.movement_speed - minusMovementSpeed;

        this.move_x =
            Math.cos(this.movement_angle) * this.current_movement_speed;
        this.move_y =
            Math.sin(this.movement_angle) * this.current_movement_speed;
    }

    returnNormalSpeed() {
        this.is_slow_down = false;
        this.slowElement.visible = false;
        this.current_movement_speed = this.movement_speed;

        this.move_x =
            Math.cos(this.movement_angle) * this.current_movement_speed;
        this.move_y =
            Math.sin(this.movement_angle) * this.current_movement_speed;
    }

    stun(time) {
        if (this.is_immune) {
            return;
        }

        this.is_stunned = true;

        this.stun_count = 0;
        this.stun_time = time;

        this.tick = this.tick_stunned;
    }

    tookDamage(attacker) {
        this.health -= attacker.damage;

        if (this.health < 0) {
            this.health = 0;
        }

        this.updateHealthBar();

        if (this.health <= 0) {
            if (!this.removed) {
                new Message({
                    text: "+" + this.gold,
                    strokeColor: "419C1C",
                    fillColor: "white",
                    x: this.getX(),
                    y: this.getY() - this.height,
                });

                // add the gold earn from killing this unit
                Game.updateGold(this.gold);
                Game.updateScore(this.score);

                this.remove();
            }

            return true;
        }

        return false;
    }

    updateHealthBar() {
        var ratio = this.health / this.max_health;
        var currentHealth = ratio * this.width;
        var missingHealth = (1 - ratio) * this.width;

        var g = this.healthBar.graphics;

        g.beginFill("red");
        g.drawRoundRect(0, 0, missingHealth, 2, 1);

        g.beginFill("green");
        g.drawRoundRect(missingHealth, 0, currentHealth, 2, 1);
        g.endFill();
    }

    tick_move(deltaTime) {
        if (this.is_slow_down) {
            this.slow_count += deltaTime;

            if (this.slow_count >= this.slow_duration) {
                this.returnNormalSpeed();
            }
        }

        // deal with the unit's movement
        this.container.x += this.move_x * deltaTime;
        this.container.y += this.move_y * deltaTime;

        if (
            Utilities.pointBoxCollision(
                this.getX(),
                this.getY(),
                this.next_x,
                this.next_y,
                this.next_length,
                this.next_length
            )
        ) {
            this.column = this.destination_column;
            this.line = this.destination_line;
            this.checkNextDestination();
        }
    }

    tick_regeneration(deltaTime) {
        this.regeneration_count += deltaTime;

        // deal with the health regeneration
        if (this.regeneration_count >= this.regeneration_interval) {
            if (this.health < this.max_health) {
                this.regeneration_count = 0;
                this.health++;
                this.updateHealthBar();
            }
        }
    }

    tick_normal(deltaTime) {
        this.tick_move(deltaTime);
        this.tick_regeneration(deltaTime);
    }

    tick_stunned(deltaTime) {
        if (!this.is_stunned) {
            return;
        }

        this.stun_count += deltaTime;

        if (this.stun_count >= this.stun_time) {
            this.is_stunned = false;
            this.tick = this.tick_normal;
        }

        this.tick_regeneration(deltaTime);
    }

    tick(deltaTime) {
        // this will be overridden by tick_normal(), or tick_stunned()
    }
}
