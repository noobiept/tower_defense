import { Tower, TowerArgs } from "./tower";

type TowerFastStats = typeof TowerFast.stats[number];

export class TowerFast extends Tower {
    static stats = [
        {
            damage: 15,
            range: 50,
            attack_speed: 3,
            upgrade_cost: 25,
            upgrade_time: 1,
            sell_time: 1,
            initial_cost: 30,
        },
        {
            damage: 20,
            range: 55,
            attack_speed: 4,
            upgrade_cost: 25,
            upgrade_time: 2,
            sell_time: 1.5,
        },
        { damage: 25, range: 60, attack_speed: 5, sell_time: 2 },
    ];

    constructor(args: TowerArgs<TowerFastStats>) {
        super({
            ...args,
            name: "fast tower",
            image: "tower_fast",
            can_target_ground: true,
            can_target_air: true,
            stats: TowerFast.stats,
        });
    }
}
