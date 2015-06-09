(function(window)
{
function Tower( args )
{
var squareSize = Map.getSquareSize();

if ( typeof this.name === 'undefined' )
    {
    this.name = 'tower';
    }

if ( typeof this.image === 'undefined' )
    {
    this.image = 'tower_basic';
    }

if ( typeof this.stats === 'undefined' )
    {
    this.stats = Tower.stats;
    }

if ( typeof this.can_target_ground === 'undefined' )
    {
    this.can_target_ground = true;
    }

if ( typeof this.can_target_air === 'undefined' )
    {
    this.can_target_air = true;
    }


this.column = parseInt( args.column, 10 );
this.line = parseInt( args.line, 10 );

this.width = squareSize * 2;
this.height = squareSize * 2;

this.upgrade_level = 0;
this.is_upgrading = false;
this.upgrade_count = 0;
this.is_selling = false;
this.sell_count = 0;

var currentLevel = this.stats[ this.upgrade_level ];

this.damage = currentLevel.damage;
this.range = currentLevel.range;
this.cost = currentLevel.initial_cost;

this.attack_speed = currentLevel.attack_speed;
this.attack_interval = 1 / this.attack_speed;
this.attack_count = 0;

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

    // tower occupies 2x2 squares
Map.setImpassableBox( this.column, this.line, 2 );
}

Tower.ALL = [];

    // each array position corresponds to the upgrade level of the tower
Tower.stats = [
        { damage: 10, range: 50, attack_speed: 2, upgrade_cost: 10, upgrade_time: 1, sell_time: 1, initial_cost: 10 },
        { damage: 15, range: 55, attack_speed: 2.5, upgrade_cost: 10, upgrade_time: 2, sell_time: 1.5 },
        { damage: 20, range: 60, attack_speed: 3, sell_time: 2 }
    ];

var SELECTION_MENU;

Tower.init = function()
{
var container = document.querySelector( '#GameMenu-tower' );

var name = container.querySelector( '.name span' );
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

    tower.startUpgrading();
    };

upgrade.onmouseover = function()
    {
    SELECTION_MENU.showNextUpgrade = true;

    Game.getSelection().updateSelection();
    };
upgrade.onmouseout = function()
    {
    SELECTION_MENU.showNextUpgrade = false;

    Game.getSelection().updateSelection();
    };


SELECTION_MENU = {
        container: container,
        name: name,
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
var base = new createjs.Bitmap( G.PRELOAD.getResult( 'tower_base0' ) );

base.regX = halfWidth;
base.regY = halfHeight;

    // the tower
var shape = new createjs.Bitmap( G.PRELOAD.getResult( this.image ) );

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

G.STAGE.addChildAt( container, 0 );

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

this.updateSelection();

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

if ( SELECTION_MENU.showNextUpgrade && !this.maxUpgrade() )
    {
    var next = this.stats[ this.upgrade_level + 1 ];

    damage       += ' (' + next.damage       + ')';
    attack_speed += ' (' + next.attack_speed + ')';
    range        += ' (' + next.range        + ')';
    }


$( SELECTION_MENU.damage ).text( damage );
$( SELECTION_MENU.attack_speed ).text( attack_speed );
$( SELECTION_MENU.range ).text( range );
};


Tower.prototype.startUpgrading = function()
{
if ( this.is_upgrading )
    {
    return;
    }

    // no more upgrades
if ( this.upgrade_level + 1 >= this.stats.length )
    {
    GameMenu.showMessage( 'No more tower upgrades.' );
    return;
    }

var currentLevel = this.stats[ this.upgrade_level ];
var upgradeCost = currentLevel.upgrade_cost;

if ( !Game.haveEnoughGold( upgradeCost ) )
    {
    GameMenu.showMessage( 'Not enough gold to upgrade.' );
    return;
    }

if ( Game.beforeFirstWave() )
    {
    Game.updateGold( -currentLevel.upgrade_cost );
    this.upgrade();
    return;
    }


this.is_upgrading = true;

Game.updateGold( -currentLevel.upgrade_cost );

this.upgrade_count = 0;

this.progressElement.graphics.clear();
this.progressElement.visible = true;
this.shape.visible = false;

this.updateMenuControls();

this.tick = this.tick_upgrade;
};



Tower.prototype.upgrade = function()
{
    // no more upgrades
if ( this.upgrade_level + 1 >= this.stats.length )
    {
    GameMenu.showMessage( 'No more tower upgrades' );
    return;
    }


    // update the overall cost of the tower
this.cost += this.stats[ this.upgrade_level ].upgrade_cost;

    // upgrade a level
this.upgrade_level++;

var currentLevel = this.stats[ this.upgrade_level ];

this.damage = currentLevel.damage;
this.range = currentLevel.range;
this.attack_speed = currentLevel.attack_speed;
this.attack_interval = 1 / this.attack_speed;
this.attack_count = 0;

    // re-draw the range element (since we may have increased the range in the upgrade)
var g = this.rangeElement.graphics;

g.clear();
g.beginStroke( 'gray' );
g.drawCircle( 0, 0, this.range );
g.endStroke();

    // add some visual clue, to differentiate the towers per their upgrade level
this.baseElement.image = G.PRELOAD.getResult( 'tower_base' + this.upgrade_level );


if ( Game.checkIfSelected( this ) )
    {
    this.updateSelection();
    }
};


Tower.prototype.maxUpgrade = function()
{
if ( this.upgrade_level + 1 >= this.stats.length )
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
if ( this.is_selling )
    {
    return;
    }

if ( Game.beforeFirstWave() )
    {
    this.sell( true );
    return;
    }

this.is_selling = true;

this.sell_count = 0;

this.progressElement.graphics.clear();
this.progressElement.visible = true;
this.shape.visible = false;

this.tick = this.tick_sell;
};


Tower.prototype.sell = function( recoverFullCost )
{
var recover = this.cost;

if ( typeof recoverFullCost === 'undefined' || recoverFullCost === false )
    {
    recover /= 2;
    }


    // recover half the cost
Game.updateGold( recover );

this.remove();
};


Tower.prototype.remove = function()
{
if ( this.removed )
    {
    return;
    }

this.removed = true;

    // remove the shape
G.STAGE.removeChild( this.container );

    // from from the ALL array
var index = Tower.ALL.indexOf( this );

Tower.ALL.splice( index, 1 );

    // remove the selection of this tower
if ( Game.checkIfSelected( this ) )
    {
    Game.clearSelection();
    }

    // remove the tower from the map (and update the pathing)
Map.removeTower( this );
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


Tower.prototype.onBulletHit = function( target )
{
    // deal damage, and see if the unit died from this attack or not
if ( target.tookDamage( this ) )
    {
    this.targetUnit = null;
    }
};


Tower.prototype.tick_attack = function( deltaTime )
{
this.attack_count -= deltaTime;

    // see if we can attack right now
if ( this.attack_count <= 0 )
    {
    var target = this.targetUnit;

        // check if its currently attacking a unit
    if ( target && !target.removed )
        {
        this.rotateTower( target );


            // check if the unit is within the tower's range
        if ( circleCircleCollision( this.getX(), this.getY(), this.range, target.getX(), target.getY(), target.width / 2 ) )
            {
            this.attack_count = this.attack_interval;
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
        this.targetUnit = Map.getUnitInRange( this );
        }
    }
};



Tower.prototype.tick_normal = function( deltaTime )
{
this.tick_attack( deltaTime );
};


Tower.prototype.tick_upgrade = function( deltaTime )
{
this.upgrade_count += deltaTime;

var currentLevel = this.stats[ this.upgrade_level ];
var upgradeTime = currentLevel.upgrade_time;

var ratio = this.upgrade_count / upgradeTime;

var g = this.progressElement.graphics;

g.beginFill( 'gray' );
g.drawRect( 0, 0, this.width * ratio, this.progress_length );
g.endFill();


    // upgrade finish, improve the stats and return to normal tick
if ( this.upgrade_count >= upgradeTime )
    {
    this.progressElement.visible = false;
    this.shape.visible = true;

    this.tick = this.tick_normal;
    this.is_upgrading = false;
    this.upgrade();
    }
};


Tower.prototype.tick_sell = function( deltaTime )
{
if ( !this.is_selling )
    {
    return;
    }

this.sell_count += deltaTime;

var currentLevel = this.stats[ this.upgrade_level ];
var sellTime = currentLevel.sell_time;

var ratio = this.sell_count / sellTime;

var g = this.progressElement.graphics;

g.beginFill( 'rgb(200,0,0)' );
g.drawRect( 0, 0, this.width * ratio, this.progress_length );
g.endFill();

if ( this.sell_count >= sellTime )
    {
    this.sell();
    this.is_selling = false;
    }
};



Tower.prototype.tick = function( deltaTime )
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
