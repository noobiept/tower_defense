(function(window)
{
function Unit( args )
{
var squareSize = Map.getSquareSize();
var interval = createjs.Ticker.getInterval();
var intervalSeconds = interval / 1000;

if ( !this.name )
    {
    this.name = 'unit';
    }

this.column = args.column;
this.line = args.line;

this.width = squareSize;
this.height = squareSize;

this.damage = 2;
this.max_health = 20;
this.health = this.max_health;
this.range = 50;
this.movement_speed = 60;    // pixels per second
this.movement_per_tick = intervalSeconds * this.movement_speed; // pixels per tick
this.gold = 10;

this.attack_limit = 50;
this.attack_count = this.attack_limit;
this.attack_speed = 1 / (intervalSeconds * this.attack_limit);
this.targetUnit = null;
this.removed = false;   // so that we don't try to remove the unit multiple times (this may happen if several towers have the .targetUnit pointing at the same unit)

this.path = [];
this.destination_column = args.destination_column;
this.destination_line = args.destination_line;
this.move_x = 0;
this.move_y = 0;
this.next_x = 0;
this.next_y = 0;


this.container = null;
this.rangeElement = null;
this.shape = null;

this.setupShape();

Unit.ALL.push( this );

this.setMoveDestination( this.destination_column, this.destination_line );
}

Unit.ALL = [];

var SELECTION_MENU;


Unit.init = function()
{
var container = document.querySelector( '#GameMenu-unit' );

var name = container.querySelector( '.name span' );
var health = container.querySelector( '.health span' );
var damage = container.querySelector( '.damage span' );
var attack_speed = container.querySelector( '.attack_speed span' );
var range = container.querySelector( '.range span' );
var mov_speed = container.querySelector( '.mov_speed span' );

SELECTION_MENU = {
        container: container,
        name: name,
        health: health,
        damage: damage,
        attack_speed: attack_speed,
        range: range,
        mov_speed: mov_speed
    };
};



Unit.prototype.setupShape = function()
{
var width = this.width;
var height = this.height;
var halfWidth = width / 2;
var halfHeight = height / 2;

    // the unit
var shape = new createjs.Bitmap( G.PRELOAD.getResult( 'creep' ) );

shape.regX = halfWidth;
shape.regY = halfHeight;

    // health bar

var healthBar = new createjs.Shape();

healthBar.x = 0;
healthBar.y = -2;
healthBar.regX = halfWidth;
healthBar.regY = halfHeight;

var g = healthBar.graphics;

g.beginFill( 'green' );
g.drawRoundRect( 0, 0, width, 2, 1 );
g.endFill();

    // the range circle
var range = new createjs.Shape();


var g = range.graphics;

g.beginStroke( 'gray' );
g.drawCircle( 0, 0, this.range );
g.endStroke();

range.visible = false;

var container = new createjs.Container();

container.addChild( shape );
container.addChild( healthBar );
container.addChild( range );


var position = Map.getPosition( this.column, this.line );

container.regX = halfWidth;
container.regY = halfHeight;
container.x = position.x + width;
container.y = position.y + height;

G.STAGE.addChild( container );

this.container = container;
this.healthBar = healthBar;
this.rangeElement = range;
this.shape = shape;
};

Unit.prototype.selected = function()
{
this.rangeElement.visible = true;

    // show the game menu
$( SELECTION_MENU.container ).css( 'display', 'flex' );

    // update the info that won't change during the selection
$( SELECTION_MENU.name ).text( this.name );
$( SELECTION_MENU.damage ).text( this.damage );
$( SELECTION_MENU.attack_speed ).text( this.attack_speed );
$( SELECTION_MENU.range ).text( this.range );
$( SELECTION_MENU.mov_speed ).text( this.movement_speed );
};


Unit.prototype.unselected = function()
{
this.rangeElement.visible = false;

    // hide the game menu
$( SELECTION_MENU.container ).css( 'display', 'none' );
};

Unit.prototype.updateSelection = function()
{
$( SELECTION_MENU.health ).text( this.health );
};




Unit.prototype.setMoveDestination = function( column, line )
{
var startPosition = Map.calculatePosition( this.getX(), this.getY() );
var endPosition = [ line, column ];

this.path = Map.getPath( startPosition, endPosition );

if ( this.path.length <= 1 )
    {
    return; //HERE shouldn't happen, units have to always have a path
    }


    // the first element is the current position of the unit, so we remove it
    // also since if the unit is already moving somewhere, and you give another command, the shape will sometimes move a bit back and then proceeds with the path (this is due to the shape being in a position between the squares)
if ( this.path.length > 3 )
    {
    this.path.shift();
    this.path.shift();
    }

this.move( this.path.shift() );
};


Unit.prototype.move = function( next )
{
var unitX = this.getX();
var unitY = this.getY();

var position = Map.getPosition( next[ 1 ], next[ 0 ] );

var destX = position.x + this.width;
var destY = position.y + this.height;

var angleRads = calculateAngle( unitX, unitY * -1, destX, destY * -1 );

this.move_x = Math.cos( angleRads ) * this.movement_per_tick;
this.move_y = Math.sin( angleRads ) * this.movement_per_tick;
this.next_x = destX;
this.next_y = destY;

this.shape.rotation = toDegrees( angleRads );
};


Unit.prototype.getX = function()
{
return this.container.x;
};


Unit.prototype.getY = function()
{
return this.container.y;
};

Unit.prototype.getCenterX = function()
{
return this.container.x - this.width / 2;
};


Unit.prototype.getCenterY = function()
{
return this.container.y - this.height / 2;
};


Unit.prototype.remove = function()
{
if ( this.removed )
    {
    return;
    }

this.removed = true;

G.STAGE.removeChild( this.container );

var index = Unit.ALL.indexOf( this );

Unit.ALL.splice( index, 1 );

if ( Game.checkIfSelected( this ) )
    {
    Game.clearSelection();
    }
};


Unit.prototype.tookDamage = function( attacker )
{
this.health -= attacker.damage;

if ( this.health < 0 )
    {
    this.health = 0;
    }

    // update the health bar
var ratio = this.health / this.max_health;
var currentHealth = ratio * this.width;
var missingHealth = (1 - ratio) * this.width;

var g = this.healthBar.graphics;

g.beginFill( 'red' );
g.drawRoundRect( 0, 0, missingHealth, 2, 1 );

g.beginFill( 'green' );
g.drawRoundRect( missingHealth, 0, currentHealth, 2, 1 );
g.endFill();

if ( this.health <= 0 )
    {
    this.remove();
    return true;
    }

return false;
};



Unit.prototype.tick = function()
{
var _this = this;

    // deal with the unit's movement
this.container.x += this.move_x;
this.container.y += this.move_y;

if( circlePointCollision( this.getX(), this.getY(), this.width / 8, this.next_x, this.next_y ) )
    {
    this.container.x += this.move_x;
    this.container.y += this.move_y;


    if ( this.path.length == 0 )
        {
        this.remove();  //HERE
        Game.updateLife( -1 );
        return;
        }

    else
        {
        this.move( this.path.shift() );
        }
    }

    // deal with the unit's attack
if ( this.damage > 0 )
    {
            // see if we can attack right now
    if ( this.attack_count <= 0 )
        {
        var target = this.targetUnit;

            // check if its currently attacking a unit
        if ( target )
            {
                // check if the unit is within the tower's range
            if ( circleCircleCollision( this.getX(), this.getY(), this.range, target.getX(), target.getY(), target.width / 2 ) )
                {
                this.attack_count = this.attack_limit;
                new Bullet({
                        shooter: this,
                        target: target,
                        onCollision: function()
                            {
                                // deal damage, and see if the unit died from this attack or not
                            if ( target.tookDamage( _this ) )
                                {
                                _this.targetUnit = null;
                                }
                            }
                    });
                }

                // can't attack anymore, find other target
            else
                {
                this.targetUnit = null;
                }
            }

            // find a target
        else
            {
            this.targetUnit = Map.getTowerInRange( this );
            }
        }

        // we need to wait a bit
    else
        {
        this.attack_count--;
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