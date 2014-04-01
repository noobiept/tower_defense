(function(window)
{
function TowerFrost( args )
{
this.name = 'frost tower';
this.image = 'tower_frost';
this.stats_level = [
        { damage: 10, health: 40, range: 50, attack_speed: 2, slow: 20, upgrade_cost: 10, upgrade_time: 1, sell_time: 1 },
        { damage: 15, health: 50, range: 55, attack_speed: 4, slow: 30, upgrade_cost: 10, upgrade_time: 2, sell_time: 1.5, filter: { red: 0, green: 0, blue: 150 } },
        { damage: 20, health: 60, range: 60, attack_speed: 6, slow: 40, sell_time: 2, filter: { red: 150, green: 0, blue: 0 } }
    ];


Tower.call( this, args );
}

INHERIT_PROTOTYPE( TowerFrost, Tower );


TowerFrost.prototype.onBulletHit = function( target )
{
var slow = this.stats_level[ this.upgrade_level ].slow;

target.slowDown( slow );

    // deal damage, and see if the unit died from this attack or not
if ( target.tookDamage( this ) )
    {
    this.targetUnit = null;
    }
};



window.TowerFrost = TowerFrost;

}(window));