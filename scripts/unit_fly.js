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
this.movement_speed = 40;

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
