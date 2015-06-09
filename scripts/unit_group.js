(function(window)
{
function UnitGroup( args )
{
var a;
var lane = args.lane;
var halfLength = parseInt( lane.length / 2, 10 );

    // add units randomly in the start zone
if ( lane.orientation == 'horizontal' )
    {
    for (a = 0 ; a < args.howMany ; a++)
        {
        args.line = Utilities.getRandomInt( lane.start.line - halfLength, lane.start.line + halfLength - 1 );

        new UnitGroup1( args );
        }
    }

else
    {
    for (a = 0 ; a < args.howMany ; a++)
        {
        args.line = Utilities.getRandomInt( lane.start.column - halfLength, lane.start.column + halfLength - 1 );

        new UnitGroup1( args );
        }
    }
}


function UnitGroup1( args)
{
this.name = 'group unit';
this.image = 'creep_group';
this.movement_speed = 50;

Unit.call( this, args );
}

Utilities.inheritPrototype( UnitGroup1, Unit );


window.UnitGroup = UnitGroup;

}(window));
