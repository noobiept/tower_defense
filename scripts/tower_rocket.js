(function(window)
{
function TowerRocket( args )
{
this.name = 'rocket tower';
this.image = 'tower_rocket';
this.can_target_ground = true;
this.can_target_air = false;
this.stats = TowerRocket.stats;

Tower.call( this, args );
}

INHERIT_PROTOTYPE( TowerRocket, Tower );


TowerRocket.stats = [
        { damage: 20, range: 60, attack_speed: 1, attack_radius: 20, upgrade_cost: 25, upgrade_time: 1, sell_time: 1, initial_cost: 30 },
        { damage: 40, range: 70, attack_speed: 1.5, attack_radius: 22, upgrade_cost: 25, upgrade_time: 2, sell_time: 1.5 },
        { damage: 60, range: 80, attack_speed: 2, attack_radius: 25, sell_time: 2 }
    ];


TowerRocket.prototype.onBulletHit = function( target )
{
var x = target.getX();
var y = target.getY();

var attack_radius = this.stats[ this.upgrade_level ].attack_radius;

var units = Map.getUnits( x, y, attack_radius, this );

for (var a = 0 ; a < units.length ; a++)
    {
    units[ a ].tookDamage( this );
    }

if ( target.removed )
    {
    this.targetUnit = null;
    }
};


window.TowerRocket = TowerRocket;

}(window));