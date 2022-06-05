import { Tower, TowerStats } from "./tower";
import { getAsset } from "../assets";
import { circleCircleCollision, getRandomInt } from "@drk4/utilities";
import { CanvasPosition } from "../types";

export type TowerBashStats = TowerStats & {
    slow: number;
};

export class TowerBash extends Tower<TowerBashStats> {
    static stats = [
        {
            damage: 30,
            range: 20,
            attack_speed: 1.5,
            attack_radius: 20,
            slow: 20,
            upgrade_cost: 65,
            upgrade_time: 1,
            sell_time: 1,
            initial_cost: 70,
        },
        {
            damage: 35,
            range: 22,
            attack_speed: 2,
            attack_radius: 22,
            slow: 30,
            upgrade_cost: 65,
            upgrade_time: 2,
            sell_time: 1.5,
        },
        {
            damage: 40,
            range: 25,
            attack_speed: 2.5,
            attack_radius: 25,
            slow: 40,
            sell_time: 2,
        },
    ];

    private attack_animation_length: number;
    private stun_chance: number;
    private slow_chance: number;
    private stun: number;
    private attack_animation: createjs.Bitmap;
    private attack_animation_interval: number;
    private attack_animation_alpha_step: number;
    private attack_limit: number;

    constructor(args) {
        super({
            ...args,
            name: "bash tower",
            image: "tower_bash",
            can_target_ground: true,
            can_target_air: false,
            stats: TowerBash.stats,
        });

        this.attack_animation_length = 40; // the image is 40x40 px

        this.stun_chance = 30;
        this.slow_chance = 30;
        this.stun = 1;

        // have the attack animation depend on the attack speed
        this.attack_animation_interval = this.attack_interval / 4;
        this.attack_animation_alpha_step = 1 / this.attack_animation_interval;
    }

    setupShape(position: CanvasPosition) {
        super.setupShape(position);

        // add the attack animation
        const halfLength = 20; // the attack image is 40x40 px

        const attackAnimation = new createjs.Bitmap(
            getAsset("tower_bash_attack")
        );

        const scale = (this.width + this.range) / this.attack_animation_length; // scale the image according to the tower's range

        attackAnimation.regX = halfLength;
        attackAnimation.regY = halfLength;
        attackAnimation.scaleX = scale;
        attackAnimation.scaleY = scale;

        attackAnimation.visible = false;

        this.container.addChild(attackAnimation);

        this.attack_animation = attackAnimation;
    }

    startUpgrading(immediately: boolean) {
        const upgraded = super.startUpgrading(immediately);
        this.attack_animation.visible = false;

        return upgraded;
    }

    upgrade() {
        super.upgrade();

        // the attack speed may have changed in the upgrade, so need to update this as well
        this.attack_animation_interval = this.attack_limit / 4;

        const scale = (this.width + this.range) / this.attack_animation_length; // scale the image according to the tower's range

        this.attack_animation.scaleX = scale;
        this.attack_animation.scaleY = scale;
    }

    tick_attack(deltaTime) {
        this.attack_count -= deltaTime;

        if (this.attack_count <= this.attack_animation_interval) {
            this.attack_animation.visible = false;
        } else {
            this.attack_animation.alpha -= this.attack_animation_alpha_step;
        }

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
                    this.attack_animation.visible = true;
                    this.attack_animation.alpha = 1;

                    this.attack();
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

    /*
    Deals damage in an area around the tower, and has a chance to slow/stun
 */

    attack() {
        const currentLevel = this.stats[this.upgrade_level];
        const radius = currentLevel.attack_radius;
        const slow = currentLevel.slow;

        const units = this.getUnitsInRange(
            this.getX(),
            this.getY(),
            radius,
            this
        );

        for (let a = 0; a < units.length; a++) {
            const unit = units[a];

            unit.tookDamage(this);

            const slowChance = getRandomInt(0, 100);

            if (slowChance <= this.slow_chance) {
                unit.slowDown(slow);
            }

            const stunChance = getRandomInt(0, 100);

            if (stunChance <= this.stun_chance) {
                unit.stun(this.stun);
            }
        }

        if (this.targetUnit.removed) {
            this.targetUnit = null;
        }
    }
}
