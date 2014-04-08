(function(window)
{
function TowerFrost( args )
{
this.name = 'frost tower';
this.image = 'tower_frost';
this.can_target_ground = true;
this.can_target_air = true;
this.stats_level = [
        { damage: 10, range: 50, attack_speed: 2, attack_radius: 20, slow: 20, upgrade_cost: 10, upgrade_time: 1, sell_time: 1 },
        { damage: 15, range: 55, attack_speed: 4, attack_radius: 22, slow: 30, upgrade_cost: 10, upgrade_time: 2, sell_time: 1.5, filter: { red: 0, green: 0, blue: 150 } },
        { damage: 20, range: 60, attack_speed: 6, attack_radius: 25, slow: 40, sell_time: 2, filter: { red: 150, green: 0, blue: 0 } }
    ];


Tower.call( this, args );
}

INHERIT_PROTOTYPE( TowerFrost, Tower );


TowerFrost.prototype.onBulletHit = function( target )
{
var currentLevel = this.stats_level[ this.upgrade_level ];
var slow = currentLevel.slow;
var attackRadius = currentLevel.attack_radius;
var x = target.getX();
var y = target.getY();

var units = Map.getUnits( x, y, attackRadius, this );

for (var a = 0 ; a < units.length ; a++)
    {
    units[ a ].slowDown( slow );
    }


    // deal damage, and see if the unit died from this attack or not
if ( target.tookDamage( this ) )
    {
    this.targetUnit = null;
    }
};



window.TowerFrost = TowerFrost;

}(window));