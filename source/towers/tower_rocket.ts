import { Unit } from "../units/unit";
import { Tower, TowerArgs } from "./tower";

type RocketStats = typeof TowerRocket.stats[number];

export class TowerRocket extends Tower<RocketStats> {
    constructor(args: TowerArgs<RocketStats>) {
        super({
            ...args,
            name: "rocket tower",
            image: "tower_rocket",
            can_target_ground: true,
            can_target_air: false,
            stats: TowerRocket.stats,
        });
    }

    static stats = [
        {
            damage: 20,
            range: 60,
            attack_speed: 1,
            attack_radius: 20,
            upgrade_cost: 35,
            upgrade_time: 1,
            sell_time: 1,
            initial_cost: 40,
        },
        {
            damage: 40,
            range: 70,
            attack_speed: 1.5,
            attack_radius: 22,
            upgrade_cost: 35,
            upgrade_time: 2,
            sell_time: 1.5,
        },
        {
            damage: 60,
            range: 80,
            attack_speed: 2,
            attack_radius: 25,
            sell_time: 2,
        },
    ];

    onBulletHit(target: Unit) {
        const x = target.getX();
        const y = target.getY();

        const attack_radius = this.stats[this.upgrade_level].attack_radius;
        const units = this.getUnitsInRange(x, y, attack_radius, this);

        for (let a = 0; a < units.length; a++) {
            units[a].tookDamage(this);
        }

        if (target.removed) {
            this.targetUnit = null;
        }
    }
}
