import { TowerStatsData } from "../types";
import { Tower, TowerArgs } from "./tower";
import TowersData from "../../data/towers.json";

export class TowerFast extends Tower {
    constructor(args: TowerArgs<TowerStatsData>) {
        super({
            ...args,
            name: "fast tower",
            image: "tower_fast",
            can_target_ground: true,
            can_target_air: true,
            stats: TowersData.TowerFast,
        });
    }
}
