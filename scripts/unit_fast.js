(function(window)
{
function UnitFast( args )
{
this.name = 'fast unit';
this.image = 'creep_fast';
this.width = 20;
this.height = 10;
this.stats = {
        damage: 2,
        range: 50,
        movement_speed: 80,
        gold: 5,
        attack_speed: 1,
        max_health: 25,
        health_regeneration: 4
    };

Unit.call( this, args );
}

INHERIT_PROTOTYPE( UnitFast, Unit );


window.UnitFast = UnitFast;

}(window));