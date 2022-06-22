import { Unit } from "../units/unit";
import { Tower, TowerArgs } from "./tower";
import TowersData from "../../data/towers.json";
import { TowerRadiusStatsData } from "../types";

export class TowerRocket extends Tower<TowerRadiusStatsData> {
    constructor(args: TowerArgs<TowerRadiusStatsData>) {
        super({
            ...args,
            name: "rocket tower",
            image: "tower_rocket",
            can_target_ground: true,
            can_target_air: false,
            stats: TowersData.TowerRocket,
        });
    }

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
