import { Bullet } from "../bullet";
import { Unit } from "../units/unit";
import { getAsset } from "../assets";
import {
    calculateAngle,
    circleCircleCollision,
    getRandomInt,
    toDegrees,
} from "@drk4/utilities";
import { CanvasPosition, GridPosition } from "../types";
import TowersData from "../../data/towers.json";

let CONTAINER: createjs.Container; // createjs.Container() which will hold all the tower elements

interface TowerStats {
    damage: number;
    range: number;
    attack_speed: number;
    sell_time: number;
    upgrade_cost?: number;
    upgrade_time?: number;
    initial_cost?: number;
    attack_radius?: number;
}

export interface TowerArgs<Stats extends TowerStats> {
    name?: string;
    image?: string;
    stats?: Stats[];
    can_target_ground?: boolean;
    can_target_air?: boolean;
    canvasPosition: CanvasPosition;
    gridPosition: GridPosition;
    squareSize: number;
    onRemove: (tower: Tower) => void;
    onSell: (cost: number) => void;
    getUnitsInRange: (
        x: number,
        y: number,
        radius: number,
        tower: Tower,
        limit?: number
    ) => Unit[];
    onUpgrade: (tower: Tower) => void;
}

export class Tower<Stats extends TowerStats = TowerStats> {
    static ALL: Tower[] = []; // has all the 'Tower' objects

    /**
     * Create the container which will hold all the tower elements.
     */
    static init(parent: createjs.Container) {
        CONTAINER = new createjs.Container();

        parent.addChild(CONTAINER);
    }

    static removeAll() {
        for (let a = 0; a < Tower.ALL.length; a++) {
            Tower.ALL[a].remove();

            a--;
        }
    }

    tick: (delta: number) => void;
    name: string;
    image: string;
    stats: Stats[]; // each array position corresponds to the upgrade level of the tower
    can_target_ground: boolean;
    can_target_air: boolean;
    width: number;
    height: number;
    upgrade_level: number;
    is_upgrading: boolean;
    upgrade_count: number;
    is_selling: boolean;
    sell_count: number;
    damage: number;
    range: number;
    cost: number;
    attack_speed: number;
    attack_interval: number;
    attack_count: number;
    targetUnit: Unit | null;
    removed: boolean;
    container: createjs.Container;
    rangeElement: createjs.Shape;
    shape: createjs.Bitmap;
    progressElement: createjs.Shape;
    baseElement: createjs.Bitmap;
    progress_length: number;
    position: GridPosition;

    private onRemove: (tower: Tower) => void;
    protected getUnitsInRange: (
        x: number,
        y: number,
        radius: number,
        tower: Tower,
        limit?: number
    ) => Unit[];
    private onSell: (cost: number) => void;
    private onUpgrade: (tower: Tower) => void;

    constructor(args: TowerArgs<Stats>) {
        this.name = args.name ?? "tower";
        this.image = args.image ?? "tower_basic";
        this.stats = args.stats ?? (TowersData.Tower as Stats[]);
        this.can_target_ground = args.can_target_ground ?? true;
        this.can_target_air = args.can_target_air ?? true;

        this.width = args.squareSize * 2;
        this.height = args.squareSize * 2;

        this.upgrade_level = 0;
        this.is_upgrading = false;
        this.upgrade_count = 0;
        this.is_selling = false;
        this.sell_count = 0;

        const currentLevel = this.stats[this.upgrade_level];

        this.damage = currentLevel.damage;
        this.range = currentLevel.range;
        this.cost = currentLevel.initial_cost ?? 0;

        this.attack_speed = currentLevel.attack_speed;
        this.attack_interval = 1 / this.attack_speed;
        this.attack_count = 0;

        this.targetUnit = null;
        this.removed = false;

        this.progress_length = 3;
        this.position = args.gridPosition;

        const { container, range, base, progress, shape } = this.setupShape(
            args.canvasPosition
        );

        this.container = container;
        this.rangeElement = range;
        this.baseElement = base;
        this.progressElement = progress;
        this.shape = shape;

        this.tick = this.tick_normal;
        this.onRemove = args.onRemove;
        this.getUnitsInRange = args.getUnitsInRange;
        this.onSell = args.onSell;
        this.onUpgrade = args.onUpgrade;

        Tower.ALL.push(this);
    }

    setupShape(position: CanvasPosition) {
        const width = this.width;
        const height = this.height;
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        // the tower base
        const base = new createjs.Bitmap(getAsset("tower_base0"));

        base.regX = halfWidth;
        base.regY = halfHeight;

        // the tower
        const shape = new createjs.Bitmap(getAsset(this.image));

        shape.regX = halfWidth;
        shape.regY = halfHeight;
        shape.rotation = getRandomInt(0, 360);

        // the range circle
        const range = new createjs.Shape();

        const g = range.graphics;

        g.beginStroke("gray");
        g.drawCircle(0, 0, this.range);
        g.endStroke();

        range.visible = false;

        // progress bar (shown when upgrading or selling the tower)
        const progress = new createjs.Shape();

        progress.x = -halfWidth;
        progress.y = -this.progress_length / 2;

        progress.visible = false;

        // the container
        const container = new createjs.Container();

        container.addChild(base);
        container.addChild(shape);
        container.addChild(range);
        container.addChild(progress);
        container.x = position.x + halfWidth;
        container.y = position.y + halfHeight;

        CONTAINER.addChild(container);

        return {
            container,
            range,
            base,
            progress,
            shape,
        };
    }

    selected() {
        // show the range
        this.rangeElement.visible = true;
    }

    unselected() {
        this.rangeElement.visible = false;
    }

    getUpgradeCost() {
        const currentLevel = this.stats[this.upgrade_level];
        return currentLevel.upgrade_cost ?? 0;
    }

    startUpgrading(immediately: boolean) {
        if (this.is_upgrading || this.is_selling) {
            return {
                ok: false,
            };
        }

        // no more upgrades
        if (this.upgrade_level + 1 >= this.stats.length) {
            return {
                ok: false,
                message: "No more upgrades.",
            };
        }

        if (immediately) {
            this.upgrade();
            return { ok: true };
        }

        this.is_upgrading = true;
        this.upgrade_count = 0;

        this.progressElement.graphics.clear();
        this.progressElement.visible = true;
        this.shape.visible = false;

        this.tick = this.tick_upgrade;

        return { ok: true };
    }

    upgrade() {
        // no more upgrades
        if (this.upgrade_level + 1 >= this.stats.length) {
            return;
        }

        // update the overall cost of the tower
        this.cost += this.stats[this.upgrade_level].upgrade_cost ?? 0;

        // upgrade a level
        this.upgrade_level++;

        const currentLevel = this.stats[this.upgrade_level];

        this.damage = currentLevel.damage;
        this.range = currentLevel.range;
        this.attack_speed = currentLevel.attack_speed;
        this.attack_interval = 1 / this.attack_speed;
        this.attack_count = 0;

        // re-draw the range element (since we may have increased the range in the upgrade)
        const g = this.rangeElement.graphics;

        g.clear();
        g.beginStroke("gray");
        g.drawCircle(0, 0, this.range);
        g.endStroke();

        // add some visual clue, to differentiate the towers per their upgrade level
        this.baseElement.image = getAsset(
            "tower_base" + this.upgrade_level
        ) as HTMLImageElement;

        this.onUpgrade(this);
    }

    maxUpgrade() {
        if (this.upgrade_level + 1 >= this.stats.length) {
            return true;
        }

        return false;
    }

    getX() {
        return this.container.x;
    }

    getY() {
        return this.container.y;
    }

    startSelling(immediately: boolean) {
        if (this.is_selling || this.is_upgrading) {
            return;
        }

        if (immediately) {
            this.sell();
            return;
        }

        this.is_selling = true;

        this.sell_count = 0;

        this.progressElement.graphics.clear();
        this.progressElement.visible = true;
        this.shape.visible = false;

        this.tick = this.tick_sell;
    }

    sell() {
        this.onSell(this.cost);
        this.remove();
    }

    remove() {
        if (this.removed) {
            return;
        }

        this.removed = true;

        // remove the shape
        CONTAINER.removeChild(this.container);

        // from from the ALL array
        const index = Tower.ALL.indexOf(this);

        Tower.ALL.splice(index, 1);

        this.onRemove(this);
    }

    /**
     * Rotate the tower (the center part, not the whole element) to point in the direction of a unit
     */
    rotateTower(unit: Unit) {
        const angleRads = calculateAngle(
            this.getX(),
            this.getY() * -1,
            unit.getX(),
            unit.getY() * -1
        );

        const angleDegrees = toDegrees(angleRads);

        this.shape.rotation = angleDegrees;
    }

    onBulletHit(target: Unit) {
        // deal damage, and see if the unit died from this attack or not
        if (target.tookDamage(this)) {
            this.targetUnit = null;
        }
    }

    tick_attack(deltaTime: number) {
        this.attack_count -= deltaTime;

        // see if we can attack right now
        if (this.attack_count <= 0) {
            const target = this.targetUnit;

            // check if its currently attacking a unit
            if (target && !target.removed) {
                this.rotateTower(target);

                // check if the unit is within the tower's range
                if (
                    circleCircleCollision(
                        this.getX(),
                        this.getY(),
                        this.range,
                        target.getX(),
                        target.getY(),
                        target.width / 2
                    )
                ) {
                    this.attack_count = this.attack_interval;
                    new Bullet({
                        shooter: this,
                        target: target,
                    });
                }

                // can't attack anymore, find other target
                else {
                    this.targetUnit = null;
                }
            }

            // find a target
            else {
                const units = this.getUnitsInRange(
                    this.getX(),
                    this.getY(),
                    this.range,
                    this,
                    1
                );
                this.targetUnit = units.length > 0 ? units[0] : null;
            }
        }
    }

    tick_normal(deltaTime: number) {
        this.tick_attack(deltaTime);
    }

    tick_upgrade(deltaTime: number) {
        this.upgrade_count += deltaTime;

        const currentLevel = this.stats[this.upgrade_level];
        const upgradeTime = currentLevel.upgrade_time ?? 0;

        const ratio = this.upgrade_count / upgradeTime;

        const g = this.progressElement.graphics;

        g.beginFill("gray");
        g.drawRect(0, 0, this.width * ratio, this.progress_length);
        g.endFill();

        // upgrade finish, improve the stats and return to normal tick
        if (this.upgrade_count >= upgradeTime) {
            this.progressElement.visible = false;
            this.shape.visible = true;

            this.tick = this.tick_normal;
            this.is_upgrading = false;
            this.upgrade();
        }
    }

    tick_sell(deltaTime: number) {
        if (!this.is_selling) {
            return;
        }

        this.sell_count += deltaTime;

        const currentLevel = this.stats[this.upgrade_level];
        const sellTime = currentLevel.sell_time;

        const ratio = this.sell_count / sellTime;

        const g = this.progressElement.graphics;

        g.beginFill("rgb(200,0,0)");
        g.drawRect(0, 0, this.width * ratio, this.progress_length);
        g.endFill();

        if (this.sell_count >= sellTime) {
            this.sell();
            this.is_selling = false;
        }
    }
}
