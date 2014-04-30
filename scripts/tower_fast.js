(function(window)
{
function TowerFast( args )
{
this.name = 'fast tower';
this.image = 'tower_fast';
this.can_target_ground = true;
this.can_target_air = true;
this.stats = TowerFast.stats;


Tower.call( this, args );
}

INHERIT_PROTOTYPE( TowerFast, Tower );


TowerFast.stats = [
        { damage: 15, range: 50, attack_speed: 4, upgrade_cost: 10, upgrade_time: 1, sell_time: 1, initial_cost: 15 },
        { damage: 20, range: 55, attack_speed: 5, upgrade_cost: 10, upgrade_time: 2, sell_time: 1.5 },
        { damage: 25, range: 60, attack_speed: 6, sell_time: 2 }
    ];


window.TowerFast = TowerFast;

}(window));