(function(window)
{
function TowerAntiAir( args )
{
this.name = 'anti-air tower';
this.image = 'tower_anti_air';
this.can_target_ground = false;
this.can_target_air = true;
this.targets_per_attack = 4;
this.targets = [];
this.stats = TowerAntiAir.stats;

Tower.call( this, args );
}

Utilities.inheritPrototype( TowerAntiAir, Tower );


TowerAntiAir.stats = [
        { damage: 30, range: 50, attack_speed: 2, upgrade_cost: 55, upgrade_time: 1, sell_time: 1, initial_cost: 60 },
        { damage: 50, range: 55, attack_speed: 3, upgrade_cost: 55, upgrade_time: 2, sell_time: 1.5 },
        { damage: 70, range: 60, attack_speed: 4, sell_time: 2 }
    ];



TowerAntiAir.prototype.tick_attack = function( deltaTime )
{
this.attack_count -= deltaTime;

    // see if we can attack right now
if ( this.attack_count <= 0 )
    {
    this.getTargets();

    var targets = this.targets;

        // check if its currently attacking a unit
    if ( this.targets.length > 0 )
        {
        this.rotateTower( targets[ 0 ] );
        var x = this.getX();
        var y = this.getY();
        var radius = this.range;

        for (var a = 0 ; a < this.targets.length ; a++)
            {
            var target = this.targets[ a ];

            if ( target.removed )
                {
                this.targets.splice( a, 1 );
                a--;
                }

            else
                {
                    // check if the unit is within the tower's range
                if ( Utilities.circleCircleCollision( x, y, radius, target.getX(), target.getY(), target.width / 2 ) )
                    {
                    this.attack_count = this.attack_interval;
                    new Bullet({
                            shooter: this,
                            target: target
                        });
                    }

                    // can't attack anymore, find other target
                else
                    {
                    this.targets.splice( a, 1 );
                    a--;
                    }
                }
            }
        }
    }
};


TowerAntiAir.prototype.getTargets = function()
{
if ( this.targets.length >= this.targets_per_attack )
    {
    return;
    }

var x = this.getX();
var y = this.getY();
var radius = this.range;

for (var a = 0 ; a < Unit.ALL_AIR.length ; a++)
    {
    var unit = Unit.ALL_AIR[ a ];

        // check if its a new target
    if ( this.targets.indexOf( unit ) < 0 )
        {
            // check if its in range
        if ( Utilities.circlePointCollision( x, y, radius, unit.getX(), unit.getY() ) )
            {
            this.targets.push( unit );

            if ( this.targets.length >= this.targets_per_attack )
                {
                return;
                }
            }
        }
    }
};


window.TowerAntiAir = TowerAntiAir;

}(window));