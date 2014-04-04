(function(window)
{
function Unit( args )
{
var squareSize = Map.getSquareSize();
var interval = createjs.Ticker.getInterval();
var intervalSeconds = interval / 1000;

if ( typeof this.name === 'undefined' )
    {
    this.name = 'unit';
    }

if ( typeof this.stats === 'undefined' )
    {
    this.stats = {
            damage: 2,
            range: 50,
            movement_speed: 60,
            gold: 5,
            attack_speed: 1,
            max_health: 20,
            health_regeneration: 2
        };
    }

if ( typeof this.image === 'undefined' )
    {
    this.image = 'creep';
    }

if ( typeof this.slowImage === 'undefined' )
    {
    this.slowImage = 'creep_slow';
    }

if ( typeof this.width === 'undefined' )
    {
    this.width = squareSize;
    }

if ( typeof this.height === 'undefined' )
    {
    this.height = squareSize;
    }

if ( typeof this.is_ground_unit === 'undefined' )
    {
    this.is_ground_unit = true;
    }

this.column = args.column;
this.line = args.line;

this.damage = this.stats.damage;
this.range = this.stats.range;
this.gold = this.stats.gold;
this.movement_speed = this.stats.movement_speed;    // pixels per second
this.movement_per_tick = intervalSeconds * this.movement_speed; // pixels per tick
this.is_slow_down = false;
this.slow_duration = 2;
this.slow_count = 0;
this.slow_limit = 0;


this.attack_speed = this.stats.attack_speed;
this.attack_limit = 1 / (intervalSeconds * this.attack_speed);
this.attack_count = 0;

this.max_health = this.stats.max_health;
this.health = this.max_health;
this.health_regeneration = this.stats.health_regeneration;
this.regeneration_count = 0;
this.regeneration_limit = 1 / (intervalSeconds * this.health_regeneration);

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
this.slowElement = null;
this.healthBar = null;
this.shape = null;

this.setupShape();

Unit.ALL.push( this );

if ( this.is_ground_unit )
    {
    Unit.ALL_GROUND.push( this );
    }

else
    {
    Unit.ALL_AIR.push( this );
    }

this.setMoveDestination( this.destination_column, this.destination_line );
}

Unit.ALL = [];
Unit.ALL_GROUND = [];
Unit.ALL_AIR = [];

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
var g;

    // the unit
var shape = new createjs.Bitmap( G.PRELOAD.getResult( this.image ) );

shape.regX = halfWidth;
shape.regY = halfHeight;

    // health bar

var healthBar = new createjs.Shape();

healthBar.x = 0;
healthBar.y = -2;
healthBar.regX = halfWidth;
healthBar.regY = halfHeight;

g = healthBar.graphics;

g.beginFill( 'green' );
g.drawRoundRect( 0, 0, width, 2, 1 );
g.endFill();

    // the range circle
var range = new createjs.Shape();

g = range.graphics;

g.beginStroke( 'gray' );
g.drawCircle( 0, 0, this.range );
g.endStroke();

range.visible = false;

    // the slow circle (is added when the unit is being slowed down)
var slow = new createjs.Bitmap( G.PRELOAD.getResult( this.slowImage ) );

slow.regX = halfWidth;
slow.regY = halfHeight;

slow.visible = false;

    // container of all the elements
var container = new createjs.Container();

var position = Map.getPosition( this.column, this.line );

container.addChild( shape );
container.addChild( healthBar );
container.addChild( range );
container.addChild( slow );
container.x = position.x + halfWidth;
container.y = position.y + halfHeight;

G.STAGE.addChild( container );

this.container = container;
this.healthBar = healthBar;
this.rangeElement = range;
this.slowElement = slow;
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

this.path = Map.getPath( startPosition[ 0 ], startPosition[ 1 ], column, line );

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

var position = Map.getPosition( next.x, next.y );

var destX = position.x + this.width / 2;
var destY = position.y + this.height / 2;

var angleRads = calculateAngle( unitX, unitY * -1, destX, destY * -1 );

this.move_x = Math.cos( angleRads ) * this.movement_per_tick;
this.move_y = Math.sin( angleRads ) * this.movement_per_tick;
this.next_x = destX;
this.next_y = destY;

var rotation = toDegrees( angleRads );

this.shape.rotation = rotation;
this.slowElement.rotation = rotation;
};


Unit.prototype.getX = function()
{
return this.container.x;
};


Unit.prototype.getY = function()
{
return this.container.y;
};


Unit.prototype.remove = function()
{
if ( this.removed )
    {
    return;
    }

this.removed = true;

G.STAGE.removeChild( this.container );

    // remove from 'all' array and 'ground' or 'air' array
var index = Unit.ALL.indexOf( this );

Unit.ALL.splice( index, 1 );

if ( this.is_ground_unit )
    {
    index = Unit.ALL_GROUND.indexOf( this );

    Unit.ALL_GROUND.splice( index, 1 );
    }

else
    {
    index = Unit.ALL_AIR.indexOf( this );

    Unit.ALL_AIR.splice( index, 1 );
    }


if ( Game.checkIfSelected( this ) )
    {
    Game.clearSelection();
    }
};


/*
    Slows down the unit for a certain time (subtract the argument to the current .movement_speed)
 */

Unit.prototype.slowDown = function( minusMovementSpeed )
{
this.is_slow_down = true;

this.slowElement.visible = true;

var intervalSeconds = createjs.Ticker.getInterval() / 1000;

var slowMovementSpeed = this.movement_speed - minusMovementSpeed;

this.movement_per_tick = intervalSeconds * slowMovementSpeed;
this.slow_count = 0;
this.slow_limit = this.slow_duration / intervalSeconds;

var angleRads = calculateAngle( this.getX(), this.getY() * -1, this.next_x, this.next_y * -1 );

this.move_x = Math.cos( angleRads ) * this.movement_per_tick;
this.move_y = Math.sin( angleRads ) * this.movement_per_tick;
};


Unit.prototype.returnNormalSpeed = function()
{
this.is_slow_down = false;

this.slowElement.visible = false;

var intervalSeconds = createjs.Ticker.getInterval() / 1000;

this.movement_per_tick = intervalSeconds * this.movement_speed;

var angleRads = calculateAngle( this.getX(), this.getY() * -1, this.next_x, this.next_y * -1 );

this.move_x = Math.cos( angleRads ) * this.movement_per_tick;
this.move_y = Math.sin( angleRads ) * this.movement_per_tick;
};



Unit.prototype.tookDamage = function( attacker )
{
this.health -= attacker.damage;

if ( this.health < 0 )
    {
    this.health = 0;
    }


this.updateHealthBar();

if ( this.health <= 0 )
    {
    if ( !this.removed )
        {
        new Message({
                text: '+' + this.gold,
                color: 'rgb(187, 186, 81)',
                x: this.getX(),
                y: this.getY() - this.height
            });

            // add the gold earn from killing this unit
        Game.updateGold( this.gold );

        this.remove();
        }

    return true;
    }

return false;
};



Unit.prototype.onBulletHit = function( target )
{
    // deal damage, and see if the unit died from this attack or not
if ( target.tookDamage( this ) )
    {
    this.targetUnit = null;
    }
};


Unit.prototype.updateHealthBar = function()
{
var ratio = this.health / this.max_health;
var currentHealth = ratio * this.width;
var missingHealth = (1 - ratio) * this.width;

var g = this.healthBar.graphics;

g.beginFill( 'red' );
g.drawRoundRect( 0, 0, missingHealth, 2, 1 );

g.beginFill( 'green' );
g.drawRoundRect( missingHealth, 0, currentHealth, 2, 1 );
g.endFill();
};



Unit.prototype.tick = function()
{
if ( this.is_slow_down )
    {
    this.slow_count++;

    if ( this.slow_count >= this.slow_limit )
        {
        this.returnNormalSpeed();
        }
    }

    // deal with the unit's movement
this.container.x += this.move_x;
this.container.y += this.move_y;

if( circlePointCollision( this.getX(), this.getY(), this.width / 8, this.next_x, this.next_y ) )
    {
    this.container.x += this.move_x;
    this.container.y += this.move_y;


    if ( this.path.length == 0 )
        {
        this.remove();
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
                        target: target
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

    // deal with the health regeneration
if ( this.regeneration_count <= 0 )
    {
    if ( this.health < this.max_health )
        {
        this.regeneration_count = this.regeneration_limit;
        this.health++;
        this.updateHealthBar();
        }
    }

else
    {
    this.regeneration_count--;
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