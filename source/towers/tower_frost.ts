import { Tower, TowerStats } from "./tower";

export type TowerFrostStats = TowerStats & {
    slow: number;
};

export class TowerFrost extends Tower<TowerFrostStats> {
    static stats = [
        {
            damage: 10,
            range: 50,
            attack_speed: 2,
            attack_radius: 20,
            slow: 20,
            upgrade_cost: 45,
            upgrade_time: 1,
            sell_time: 1,
            initial_cost: 50,
        },
        {
            damage: 15,
            range: 55,
            attack_speed: 3,
            attack_radius: 22,
            slow: 25,
            upgrade_cost: 45,
            upgrade_time: 2,
            sell_time: 1.5,
        },
        {
            damage: 20,
            range: 60,
            attack_speed: 4,
            attack_radius: 25,
            slow: 30,
            sell_time: 2,
        },
    ];

    constructor(args) {
        super({
            ...args,
            name: "frost tower",
            image: "tower_frost",
            can_target_ground: true,
            can_target_air: true,
            stats: TowerFrost.stats,
        });
    }

    onBulletHit(target) {
        const currentLevel = this.stats[this.upgrade_level];
        const slow = currentLevel.slow;
        const attackRadius = currentLevel.attack_radius;
        const x = target.getX();
        const y = target.getY();

        const units = this.getUnitsInRange(x, y, attackRadius, this);

        for (let a = 0; a < units.length; a++) {
            units[a].slowDown(slow);
        }

        // deal damage, and see if the unit died from this attack or not
        if (target.tookDamage(this)) {
            this.targetUnit = null;
        }
    }
}
