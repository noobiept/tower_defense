(function(window)
{
function TowerRocket( args )
{
this.name = 'rocket tower';
this.image = 'tower_rocket';
this.can_target_ground = true;
this.can_target_air = false;
this.stats_level = [
        { damage: 10, health: 40, range: 50, attack_speed: 2, attack_radius: 20, upgrade_cost: 10, upgrade_time: 1, sell_time: 1 },
        { damage: 15, health: 50, range: 55, attack_speed: 4, attack_radius: 22, upgrade_cost: 10, upgrade_time: 2, sell_time: 1.5, filter: { red: 0, green: 0, blue: 150 } },
        { damage: 20, health: 60, range: 60, attack_speed: 6, attack_radius: 25, sell_time: 2, filter: { red: 150, green: 0, blue: 0 } }
    ];

Tower.call( this, args );
}

INHERIT_PROTOTYPE( TowerRocket, Tower );


TowerRocket.prototype.onBulletHit = function( target )
{
var x = target.getX();
var y = target.getY();

var attack_radius = this.stats_level[ this.upgrade_level ].attack_radius;

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