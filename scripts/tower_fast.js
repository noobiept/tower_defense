(function(window)
{
function TowerFast( args )
{
this.name = 'fast tower';
this.image = 'tower_fast';
this.can_target_ground = true;
this.can_target_air = true;
this.stats_level = [
        { damage: 10, health: 40, range: 50, attack_speed: 4, upgrade_cost: 10, upgrade_time: 1, sell_time: 1 },
        { damage: 15, health: 50, range: 55, attack_speed: 6, upgrade_cost: 10, upgrade_time: 2, sell_time: 1.5, filter: { red: 0, green: 0, blue: 150 } },
        { damage: 20, health: 60, range: 60, attack_speed: 8, sell_time: 2, filter: { red: 150, green: 0, blue: 0 } }
    ];


Tower.call( this, args );
}

INHERIT_PROTOTYPE( TowerFast, Tower );


window.TowerFast = TowerFast;

}(window));