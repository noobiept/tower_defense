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

this.upgrade_level = 0;
this.stats_level = [
        { damage: 10, health: 20, range: 50, attack_speed: 2, upgrade_cost: 10 },
        { damage: 15, health: 30, range: 55, attack_speed: 4, upgrade_cost: 10, filter: { red: 0, green: 0, blue: 150 } },
        { damage: 20, health: 40, range: 60, attack_speed: 6, filter: { red: 150, green: 0, blue: 0 } }
    ];

var currentLevel = this.stats_level[ this.upgrade_level ];

this.damage = currentLevel.damage;
this.health = currentLevel.health;
this.range = currentLevel.range;
this.cost = Tower.cost;

this.attack_speed = currentLevel.attack_speed;
this.attack_limit = 1 / (createjs.Ticker.getInterval() / 1000 * this.attack_speed);
this.attack_count = 0;

this.targetUnit = null;
this.removed = false;

this.container = null;
this.rangeElement = null;
this.shape = null;

this.setupShape();

Tower.ALL.push( this );

Map.addTower( this );
Unit.redoMoveDestination();
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
var upgrade = container.querySelector( '.upgrade' );

upgrade.onclick = function()
    {
        // if we can click on this element, it means we have a tower selected, so we can assume that what we get is a tower object
    var tower = Game.getSelection();
    var upgradeCost = tower.stats_level[ tower.upgrade_level ].upgrade_cost;
    if ( Game.haveEnoughGold( upgradeCost ) )
        {
        tower.upgrade();
        Game.updateGold( -upgradeCost );

            // can't upgrade anymore, we can remove the upgrade button
        if ( tower.maxUpgrade() )
            {
            SELECTION_MENU.showNextUpgrade = false;
            $( upgrade ).css( 'display', 'none' );
            }
        }

    else
        {
        console.log('not enough gold to upgrade');
        }
    };

upgrade.onmouseover = function()
    {
    SELECTION_MENU.showNextUpgrade = true;
    };
upgrade.onmouseout = function()
    {
    SELECTION_MENU.showNextUpgrade = false;
    };


SELECTION_MENU = {
        container: container,
        name: name,
        health: health,
        damage: damage,
        attack_speed: attack_speed,
        range: range,
        upgrade: upgrade,
        showNextUpgrade: false
    };
};


Tower.prototype.setupShape = function()
{
var width = this.width;
var height = this.height;
var halfWidth = width / 2;
var halfHeight = height / 2;

    // the tower base
var base = new createjs.Bitmap( G.PRELOAD.getResult( 'tower_base' ) );

base.regX = halfWidth;
base.regY = halfHeight;

    // the tower
var shape = new createjs.Bitmap( G.PRELOAD.getResult( 'tower1' ) );

shape.regX = halfWidth;
shape.regY = halfHeight;
shape.rotation = getRandomInt( 0, 360 );

    // the range circle
var range = new createjs.Shape();

var g = range.graphics;

g.beginStroke( 'gray' );
g.drawCircle( 0, 0, this.range );
g.endStroke();

range.visible = false;


var container = new createjs.Container();

var position = Map.getPosition( this.column, this.line );

container.addChild( base );
container.addChild( shape );
container.addChild( range );
container.x = position.x + halfWidth;
container.y = position.y + halfHeight;

G.STAGE.addChild( container );

this.container = container;
this.rangeElement = range;
this.baseElement = base;
this.shape = shape;
};

Tower.prototype.selected = function()
{
    // show the range
this.rangeElement.visible = true;

    // show the game menu
$( SELECTION_MENU.container ).css( 'display', 'flex' );

if ( this.maxUpgrade() )
    {
    $( SELECTION_MENU.upgrade ).css( 'display', 'none' );
    }

else
    {
    $( SELECTION_MENU.upgrade ).css( 'display', 'block' );
    }

    // update the info that won't change during the selection
$( SELECTION_MENU.name ).text( this.name );

};

Tower.prototype.unselected = function()
{
this.rangeElement.visible = false;

    // hide the game menu
$( SELECTION_MENU.container ).css( 'display', 'none' );
};

Tower.prototype.updateSelection = function()
{
var damage = this.damage;
var attack_speed = this.attack_speed;
var range = this.range;
var health = this.health;

if ( SELECTION_MENU.showNextUpgrade )
    {
    var next = this.stats_level[ this.upgrade_level + 1 ];

    damage       += ' (' + next.damage       + ')';
    attack_speed += ' (' + next.attack_speed + ')';
    range        += ' (' + next.range        + ')';
    health       += ' (' + next.health       + ')';
    }


$( SELECTION_MENU.damage ).text( damage );
$( SELECTION_MENU.attack_speed ).text( attack_speed );
$( SELECTION_MENU.range ).text( range );
$( SELECTION_MENU.health ).text( health );
};


Tower.prototype.upgrade = function()
{
    // no more upgrades
if ( this.upgrade_level + 1 >= this.stats_level.length )
    {
    console.log('no more tower upgrades');
    return;
    }

    // update the overall cost of the tower
this.cost = this.stats_level[ this.upgrade_level ].upgrade_cost;

    // upgrade a level
this.upgrade_level++;

var currentLevel = this.stats_level[ this.upgrade_level ];

this.damage = currentLevel.damage;
this.health = currentLevel.health;
this.range = currentLevel.range;
this.attack_speed = currentLevel.attack_speed;


    // re-draw the range element (since we may have increased the range in the upgrade)
var g = this.rangeElement.graphics;

g.clear();
g.beginStroke( 'gray' );
g.drawCircle( 0, 0, this.range );
g.endStroke();

    // add some visual clue, to differentiate the towers per their upgrade level
var filter = new createjs.ColorFilter( 1, 1, 1, 1, currentLevel.filter.red, currentLevel.filter.green, currentLevel.filter.blue );

this.baseElement.filters = [
        filter
    ];

this.baseElement.cache( 0, 0, this.width, this.height );
};


Tower.prototype.maxUpgrade = function()
{
if ( this.upgrade_level + 1 >= this.stats_level.length )
    {
    return true;
    }

return false;
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

Unit.redoMoveDestination();
};


/*
    Rotate the tower (the center part, not the whole element) to point in the direction of a unit
 */

Tower.prototype.rotateTower = function( unit )
{
var angleRads = calculateAngle( this.getX(), this.getY() * -1, unit.getX(), unit.getY() * -1 );

var angleDegrees = toDegrees( angleRads );

this.shape.rotation = angleDegrees;
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
var _this = this;

if ( this.damage > 0 )
    {
        // see if we can attack right now
    if ( this.attack_count <= 0 )
        {
        var target = this.targetUnit;

            // check if its currently attacking a unit
        if ( target )
            {
            this.rotateTower( target );


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
                                Game.updateGold( target.gold );
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
            this.targetUnit = Map.getUnitInRange( this );
            }
        }

        // we need to wait a bit
    else
        {
        this.attack_count--;
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