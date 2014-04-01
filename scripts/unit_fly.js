(function(window)
{
function UnitFly( args )
{
this.name = 'flying unit';
this.image = 'creep_fly';
this.slowImage = 'creep_fly_slow';
this.width = 20;
this.height = 10;
this.stats = {
        damage: 1,
        range: 50,
        movement_speed: 40,
        gold: 5,
        attack_speed: 1,
        max_health: 20,
        health_regeneration: 1
    };

Unit.call( this, args );
}

INHERIT_PROTOTYPE( UnitFly, Unit );


UnitFly.prototype.setMoveDestination = function( column, line )
{
this.move(
    {
        x: column,
        y: line
    });
};


window.UnitFly = UnitFly;

}(window));