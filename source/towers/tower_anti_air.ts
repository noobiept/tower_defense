import { Tower, TowerArgs } from "./tower";
import { Unit } from "../units/unit";
import { Bullet } from "../bullet";
import { circleCircleCollision, circlePointCollision } from "@drk4/utilities";
import TowersData from "../../data/towers.json";
import { TowerStatsData } from "../types";

export class TowerAntiAir extends Tower {
    private targets_per_attack: number;
    private targets: Unit[];

    constructor(args: TowerArgs<TowerStatsData>) {
        super({
            ...args,
            name: "anti-air tower",
            image: "tower_anti_air",
            can_target_ground: false,
            can_target_air: true,
            stats: TowersData.TowerAntiAir,
        });

        this.targets_per_attack = 4;
        this.targets = [];
    }

    tick_attack(deltaTime: number) {
        this.attack_count -= deltaTime;

        // see if we can attack right now
        if (this.attack_count <= 0) {
            this.getTargets();

            const targets = this.targets;

            // check if its currently attacking a unit
            if (this.targets.length > 0) {
                this.rotateTower(targets[0]);
                const x = this.getX();
                const y = this.getY();
                const radius = this.range;

                for (let a = 0; a < this.targets.length; a++) {
                    const target = this.targets[a];

                    if (target.removed) {
                        this.targets.splice(a, 1);
                        a--;
                    } else {
                        // check if the unit is within the tower's range
                        if (
                            circleCircleCollision(
                                x,
                                y,
                                radius,
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
                            this.targets.splice(a, 1);
                            a--;
                        }
                    }
                }
            }
        }
    }

    getTargets() {
        if (this.targets.length >= this.targets_per_attack) {
            return;
        }

        const x = this.getX();
        const y = this.getY();
        const radius = this.range;

        for (let a = 0; a < Unit.ALL_AIR.length; a++) {
            const unit = Unit.ALL_AIR[a];

            // check if its a new target
            if (this.targets.indexOf(unit) < 0) {
                // check if its in range
                if (
                    circlePointCollision(x, y, radius, unit.getX(), unit.getY())
                ) {
                    this.targets.push(unit);

                    if (this.targets.length >= this.targets_per_attack) {
                        return;
                    }
                }
            }
        }
    }
}
