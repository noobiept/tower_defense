(function(window)
{
function Tower( args )
{
var squareSize = Map.getSquareSize();
var intervalSeconds = createjs.Ticker.getInterval() / 1000;

if ( !this.name )
    {
    this.name = 'tower';
    }

this.column = parseInt( args.column, 10 );
this.line = parseInt( args.line, 10 );

this.width = squareSize * 2;
this.height = squareSize * 2;

this.upgrade_level = 0;
this.is_upgrading = false;
this.upgrade_count = 0;
this.upgrade_limit = 0;
this.is_selling = false;
this.sell_count = 0;
this.sell_limit = 0;

this.stats_level = [
        { damage: 10, health: 20, range: 50, attack_speed: 2, upgrade_cost: 10, upgrade_time: 1, sell_time: 1 },
        { damage: 15, health: 30, range: 55, attack_speed: 4, upgrade_cost: 10, upgrade_time: 2, sell_time: 1.5, filter: { red: 0, green: 0, blue: 150 } },
        { damage: 20, health: 40, range: 60, attack_speed: 6, sell_time: 2, filter: { red: 150, green: 0, blue: 0 } }
    ];

var currentLevel = this.stats_level[ this.upgrade_level ];

this.damage = currentLevel.damage;
this.range = currentLevel.range;
this.cost = Tower.cost;

this.attack_speed = currentLevel.attack_speed;
this.attack_limit = 1 / (intervalSeconds * this.attack_speed);
this.attack_count = 0;

this.max_health = currentLevel.health;
this.health = this.max_health;
this.health_regeneration = 2;
this.regeneration_count = 0;
this.regeneration_limit = 1 / (intervalSeconds * this.health_regeneration);


this.targetUnit = null;
this.removed = false;

this.container = null;
this.rangeElement = null;
this.shape = null;
this.progressElement = null;
this.progress_length = 3;

this.setupShape();
this.tick = this.tick_normal;

Tower.ALL.push( this );

Game.updateGold( -this.cost );

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
var upgradeMessage = container.querySelector( '.upgradeMessage' );
var sellMessage = container.querySelector( '.sellMessage' );

upgrade.onclick = function()
    {
        // if we can click on this element, it means we have a tower selected, so we can assume that what we get is a tower object
    var tower = Game.getSelection();
    var upgradeCost = tower.stats_level[ tower.upgrade_level ].upgrade_cost;
    if ( Game.haveEnoughGold( upgradeCost ) )
        {
        tower.startUpgrading();
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
        upgradeMessage: upgradeMessage,
        sellMessage: sellMessage,
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

    // progress bar (shown when upgrading or selling the tower)
var progress = new createjs.Shape();

progress.x = -halfWidth;
progress.y = -this.progress_length / 2;


progress.visible = false;

    // the container
var container = new createjs.Container();

var position = Map.getPosition( this.column, this.line );

container.addChild( base );
container.addChild( shape );
container.addChild( range );
container.addChild( progress );
container.x = position.x + halfWidth;
container.y = position.y + halfHeight;

G.STAGE.addChild( container );

this.container = container;
this.rangeElement = range;
this.baseElement = base;
this.progressElement = progress;
this.shape = shape;
};

Tower.prototype.selected = function()
{
    // show the range
this.rangeElement.visible = true;

    // show the game menu
$( SELECTION_MENU.container ).css( 'display', 'flex' );


this.updateMenuControls();


    // update the info that won't change during the selection
$( SELECTION_MENU.name ).text( this.name );
};

Tower.prototype.unselected = function()
{
this.rangeElement.visible = false;

    // hide the game menu
$( SELECTION_MENU.container ).css( 'display', 'none' );
};


Tower.prototype.updateMenuControls = function()
{
if ( this.is_upgrading )
    {
    $( SELECTION_MENU.upgrade ).css( 'display', 'none' );
    $( SELECTION_MENU.sellMessage ).css( 'display', 'none' );
    $( SELECTION_MENU.upgradeMessage ).css( 'display', 'block' );
    }

else if ( this.is_selling )
    {
    $( SELECTION_MENU.upgrade ).css( 'display', 'none' );
    $( SELECTION_MENU.upgradeMessage ).css( 'display', 'none' );
    $( SELECTION_MENU.sellMessage ).css( 'display', 'block' );
    }

else
    {
    $( SELECTION_MENU.upgradeMessage ).css( 'display', 'none' );
    $( SELECTION_MENU.sellMessage ).css( 'display', 'none' );

    if ( this.maxUpgrade() )
        {
        $( SELECTION_MENU.upgrade ).css( 'display', 'none' );
        }

    else
        {
        $( SELECTION_MENU.upgrade ).css( 'display', 'block' );
        }
    }
};


Tower.prototype.updateSelection = function()
{
this.updateMenuControls();

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


Tower.prototype.startUpgrading = function()
{
    // no more upgrades
if ( this.upgrade_level + 1 >= this.stats_level.length )
    {
    console.log('no more tower upgrades');
    return;
    }

this.is_upgrading = true;


var currentLevel = this.stats_level[ this.upgrade_level ];
var intervalSeconds = createjs.Ticker.getInterval() / 1000;

Game.updateGold( -currentLevel.upgrade_cost );

this.upgrade_count = 0;
this.upgrade_limit = currentLevel.upgrade_time / intervalSeconds;

this.progressElement.graphics.clear();
this.progressElement.visible = true;
this.shape.visible = false;

this.tick = this.tick_upgrade;
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
this.cost += this.stats_level[ this.upgrade_level ].upgrade_cost;

    // upgrade a level
this.upgrade_level++;

var currentLevel = this.stats_level[ this.upgrade_level ];

    // add the increase in health from the upgrade to the current health
    // for example going from 20hp to 30hp (max_health) with current health of 5hp, after upgrade it ends up with 15hp
var prevMaxHealth = this.max_health;

this.health += currentLevel.health - prevMaxHealth;
this.max_health = currentLevel.health;
this.damage = currentLevel.damage;
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


Tower.prototype.startSelling = function()
{
this.is_selling = true;

var currentLevel = this.stats_level[ this.upgrade_level ];
var intervalSeconds = createjs.Ticker.getInterval() / 1000;

this.sell_count = 0;
this.sell_limit = currentLevel.sell_time / intervalSeconds;

this.progressElement.graphics.clear();
this.progressElement.visible = true;
this.shape.visible = false;

this.tick = this.tick_sell;
};


Tower.prototype.sell = function()
{
    // recover half the cost
Game.updateGold( this.cost / 2 );

this.remove();
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


Tower.prototype.tick_attack = function()
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


Tower.prototype.tick_regeneration = function()
{
    // deal with the health regeneration
if ( this.regeneration_count <= 0 )
    {
    if ( this.health < this.max_health )
        {
        this.regeneration_count = this.regeneration_limit;
        this.health++;
        }
    }

else
    {
    this.regeneration_count--;
    }
};


Tower.prototype.tick_normal = function()
{
this.tick_attack();
this.tick_regeneration();
};

Tower.prototype.tick_upgrade = function()
{
this.upgrade_count++;

var ratio = this.upgrade_count / this.upgrade_limit;

var g = this.progressElement.graphics;

g.beginFill( 'gray' );
g.drawRect( 0, 0, this.width * ratio, this.progress_length );
g.endFill();


    // upgrade finish, improve the stats and return to normal tick
if ( this.upgrade_count >= this.upgrade_limit )
    {
    this.progressElement.visible = false;
    this.shape.visible = true;

    this.upgrade();
    this.tick = this.tick_normal;
    this.is_upgrading = false;
    }

this.tick_regeneration();
};


Tower.prototype.tick_sell = function()
{
if ( !this.is_selling )
    {
    return;
    }

this.sell_count++;

var ratio = this.sell_count / this.sell_limit;

var g = this.progressElement.graphics;

g.beginFill( 'rgb(200,0,0)' );
g.drawRect( 0, 0, this.width * ratio, this.progress_length );
g.endFill();

if ( this.sell_count >= this.sell_limit )
    {
    this.sell();
    this.is_selling = false;
    }

this.tick_regeneration();
};



Tower.prototype.tick = function()
{
    // this will be overridden to either tick_normal(), tick_upgrade() or tick_sell() depending on the tower's current state
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