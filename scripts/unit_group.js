(function(window)
{
function UnitGroup( args )
{
var a;
var lane = args.lane;
var halfLength = parseInt( lane.length / 2, 10 );

    // add units randomly in the start zone
if ( lane.orientation == 'vertical' )
    {
    for (a = 0 ; a < 5 ; a++)
        {
        args.line = getRandomInt( lane.start.line - halfLength, lane.start.line + halfLength - 1 );

        new UnitGroup1( args );
        }
    }

else
    {
    for (a = 0 ; a < 5 ; a++)
        {
        args.line = getRandomInt( lane.start.column - halfLength, lane.start.column + halfLength - 1 );

        new UnitGroup1( args );
        }
    }
}


function UnitGroup1( args)
{
this.name = 'group unit';
this.image = 'creep_group';
this.stats = {
        damage: 2,
        range: 50,
        movement_speed: 50,
        gold: 5,
        attack_speed: 1,
        max_health: 30,
        health_regeneration: 2
    };


Unit.call( this, args );
}

INHERIT_PROTOTYPE( UnitGroup1, Unit );



window.UnitGroup = UnitGroup;

}(window));