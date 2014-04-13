(function(window)
{
function UnitImmune( args )
{
this.name = 'immune unit';
this.image = 'creep_immune';
this.is_immune = true;
this.stats = {
        movement_speed: 50,
        gold: 4 + args.waveNumber,
        score: 3,
        health_regeneration: 2
    };

Unit.call( this, args );
}

INHERIT_PROTOTYPE( UnitImmune, Unit );


window.UnitImmune = UnitImmune;

}(window));
