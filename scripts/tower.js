(function(window)
{
function Tower( args )
{
var squareSize = Map.getSquareSize();

if ( !this.name )
    {
    this.name = 'tower';
    }

this.column = parseInt( args.column, 10 );
this.line = parseInt( args.line, 10 );

this.width = squareSize * 2;
this.height = squareSize * 2;

this.damage = 10;
this.health = 20;
this.range = 50;
this.cost = Tower.cost;

this.attack_limit = 50;
this.attack_count = this.attack_limit;
this.attack_speed = 1 / (createjs.Ticker.getInterval() / 1000 * this.attack_limit);
this.targetUnit = null;
this.removed = false;

this.container = null;
this.rangeElement = null;
this.shape = null;

this.setupShape();

Tower.ALL.push( this );

Map.addTower( this );
}

Tower.ALL = [];
Tower.cost = 10;

var SELECTION_MENU;

Tower.init = function()
{
var container = document.querySelector( '#GameMenu-tower' );

var name = container.querySelector( '.name span' );
var health = container.querySelector( '.health span' );
var damage = container.querySelector( '.damage span' );
var attack_speed = container.querySelector( '.attack_speed span' );
var range = container.querySelector( '.range span' );

SELECTION_MENU = {
        container: container,
        name: name,
        health: health,
        damage: damage,
        attack_speed: attack_speed,
        range: range
    };
};


Tower.prototype.setupShape = function()
{
var width = this.width;
var height = this.height;

var shape = new createjs.Shape();

var g = shape.graphics;

g.beginFill( 'blue' );
g.drawRect( 0, 0, width, height );
g.endFill();


    // the range circle
var range = new createjs.Shape();

var g = range.graphics;

g.beginStroke( 'gray' );
g.drawCircle( 0, 0, this.range );
g.endStroke();

range.visible = false;

range.regX = -(width / 2);
range.regY = -(height / 2);

var container = new createjs.Container();

container.addChild( shape );
container.addChild( range );


var position = Map.getPosition( this.column, this.line );

container.x = position.x;
container.y = position.y;

G.STAGE.addChild( container );

this.container = container;
this.rangeElement = range;
this.shape = shape;
};

Tower.prototype.selected = function()
{
    // show the range
this.rangeElement.visible = true;

    // show the game menu
$( SELECTION_MENU.container ).css( 'display', 'flex' );

    // update the info that won't change during the selection
$( SELECTION_MENU.name ).text( this.name );
$( SELECTION_MENU.damage ).text( this.damage );
$( SELECTION_MENU.attack_speed ).text( this.attack_speed );
$( SELECTION_MENU.range ).text( this.range );
};

Tower.prototype.unselected = function()
{
this.rangeElement.visible = false;

    // hide the game menu
$( SELECTION_MENU.container ).css( 'display', 'none' );
};

Tower.prototype.updateSelection = function()
{
$( SELECTION_MENU.health ).text( this.health );
};



Tower.prototype.getX = function()
{
return this.container.x;
};


Tower.prototype.getY = function()
{
return this.container.y;
};


Tower.prototype.remove = function()
{
if ( this.removed )
    {
    return;
    }

this.removed = true;

G.STAGE.removeChild( this.container );

Map.removeTower( this );

var index = Tower.ALL.indexOf( this );

Tower.ALL.splice( index, 1 );

if ( Game.checkIfSelected( this ) )
    {
    Game.clearSelection();
    }
};


Tower.prototype.tookDamage = function( attacker )
{
this.health -= attacker.damage;

if ( this.health <= 0 )
    {
    this.remove();
    return true;
    }

return false;
};


Tower.prototype.tick = function()
{
if ( this.damage > 0 )
    {
    var target = this.targetUnit;

        // check if its currently attacking a unit
    if ( target )
        {
            // check if the unit is within the tower's range
        if ( circleCircleCollision( this.getX(), this.getY(), this.range, target.getX(), target.getY(), target.width / 2 ) )
            {
            this.attack_count--;

            if ( this.attack_count < 0 )
                {
                this.attack_count = this.attack_limit;

                    // deal damage, and see if the unit died from this attack or not
                if ( target.tookDamage( this ) )
                    {
                    Game.updateGold( target.gold );
                    this.targetUnit = null;
                    }
                }
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
        this.targetUnit = Map.getUnitInRange( this );
        }
    }
};


Tower.removeAll = function()
{
for (var a = 0 ; a < Tower.ALL.length ; a++)
    {
    Tower.ALL[ a ].remove();

    a--;
    }
};



window.Tower = Tower;

}(window));