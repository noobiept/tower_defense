import { Tower } from "./tower";

export function TowerFrost(args) {
    this.name = "frost tower";
    this.image = "tower_frost";
    this.can_target_ground = true;
    this.can_target_air = true;
    this.stats = TowerFrost.stats;

    Tower.call(this, args);
}

Utilities.inheritPrototype(TowerFrost, Tower);

TowerFrost.stats = [
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

TowerFrost.prototype.onBulletHit = function (target) {
    var currentLevel = this.stats[this.upgrade_level];
    var slow = currentLevel.slow;
    var attackRadius = currentLevel.attack_radius;
    var x = target.getX();
    var y = target.getY();

    var units = Map.getUnits(x, y, attackRadius, this);

    for (var a = 0; a < units.length; a++) {
        units[a].slowDown(slow);
    }

    // deal damage, and see if the unit died from this attack or not
    if (target.tookDamage(this)) {
        this.targetUnit = null;
    }
};
