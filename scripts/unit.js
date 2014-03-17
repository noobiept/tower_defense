(function(window)
{
function Unit( args )
{
var squareSize = Map.getSquareSize();

if ( !this.name )
    {
    this.name = 'unit';
    }

this.health = 100;
this.movement_speed = 2;
this.damage = 0;
this.attack_speed = 50;
this.attack_count = 0;
this.range = 50;
this.width = squareSize;
this.height = squareSize;

this.path = [];
this.can_attack = false;
this.destination_column = args.destination_column;
this.destination_line = args.destination_line;
this.move_x = 0;
this.move_y = 0;
this.next_x = 0;
this.next_y = 0;

this.column = args.column;
this.line = args.line;

this.shape = null;

this.setupShape();

Unit.ALL.push( this );

this.setMoveDestination( this.destination_column, this.destination_line );
}

Unit.ALL = [];


Unit.prototype.setupShape = function()
{
var width = this.width;
var height = this.height;
var squareSize = Map.getSquareSize();

var shape = new createjs.Shape();

var g = shape.graphics;

g.beginFill( 'red' );
g.drawRect( 0, 0, width, height );
g.endFill();


shape.regX = width / 2;
shape.regY = height / 2;
shape.x = this.column * squareSize + width / 2;
shape.y = this.line * squareSize + height / 2;

G.STAGE.addChild( shape );

this.shape = shape;
};


Unit.prototype.setMoveDestination = function( column, line )
{
var map = Map.getMap();
var startPosition = Map.calculatePosition( this.getX(), this.getY() );
var endPosition = [ line, column ];

this.path = AStar( map, startPosition, endPosition );

if ( this.path.length <= 1 )
    {
    return; //HERE shouldn't happen, units have to always have a path
    }


    // the first element is the current position of the unit, so we remove it
    // also since if the unit is already moving somewhere, and you give another command, the shape will sometimes move a bit back and then proceeds with the path (this is due to the shape being in a position between the squares)
this.path.shift();

this.move( this.path.shift() );
};


Unit.prototype.move = function( next )
{
var unitX = this.getX();
var unitY = this.getY();
var squareSize = Map.getSquareSize();

var destX = next[ 1 ] * squareSize + this.width / 2;
var destY = next[ 0 ] * squareSize + this.height / 2;

var angleRads = calculateAngle( unitX, unitY * -1, destX, destY * -1 );

this.move_x = Math.cos( angleRads ) * this.movement_speed;
this.move_y = Math.sin( angleRads ) * this.movement_speed;
this.next_x = destX;
this.next_y = destY;
};


Unit.prototype.getX = function()
{
return this.shape.x;
};


Unit.prototype.getY = function()
{
return this.shape.y;
};

Unit.prototype.remove = function()
{
G.STAGE.removeChild( this.shape );

var index = Unit.ALL.indexOf( this );

Unit.ALL.splice( index, 1 );
};



Unit.prototype.tick = function()
{
this.shape.x += this.move_x;
this.shape.y += this.move_y;

if( circlePointCollision( this.shape.x, this.shape.y, this.width / 8, this.next_x, this.next_y ) )
    {
    this.shape.x += this.move_x;
    this.shape.y += this.move_y;


    if ( this.path.length == 0 )
        {
        this.remove();  //HERE
        }

    else
        {
        this.move( this.path.shift() );
        }
    }
};



Unit.removeAll = function()
{
for (var a = 0 ; a < Unit.ALL.length ; a++)
    {
    Unit.ALL[ a ].remove();

    a--;
    }
};

/*
    When we add/remove towers, we need to calculate the movement of the units again (since the map was changed)
 */

Unit.redoMoveDestination = function()
{
for (var a = 0 ; a < Unit.ALL.length ; a++)
    {
    var unit = Unit.ALL[ a ];

    unit.setMoveDestination( unit.destination_column, unit.destination_line );
    }
};



window.Unit = Unit;

}(window));