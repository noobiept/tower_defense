(function(window)
{
function UnitFast( args )
{
this.name = 'fast unit';
this.image = 'creep_fast';
this.slowImage = 'creep_fast_slow';
this.width = 20;
this.height = 10;
this.movement_speed = 80;

Unit.call( this, args );
}

INHERIT_PROTOTYPE( UnitFast, Unit );


window.UnitFast = UnitFast;

}(window));
