import { TowerRadiusSlowStatsData } from "../types";
import { Unit } from "../units/unit";
import { Tower, TowerArgs } from "./tower";
import TowersData from "../../data/towers.json";

export class TowerFrost extends Tower<TowerRadiusSlowStatsData> {
    constructor(args: TowerArgs<TowerRadiusSlowStatsData>) {
        super({
            ...args,
            name: "frost tower",
            image: "tower_frost",
            can_target_ground: true,
            can_target_air: true,
            stats: TowersData.TowerFrost,
        });
    }

    onBulletHit(target: Unit) {
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
