(function(window)
{
function UnitFly( args )
{
this.name = 'flying unit';
this.image = 'creep_fly';
this.slowImage = 'creep_fly_slow';
this.width = 20;
this.height = 10;
this.is_ground_unit = false;
this.stats = {
        movement_speed: 40,
        gold: 5 + args.waveNumber * 0.1,
        score: 4,
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
