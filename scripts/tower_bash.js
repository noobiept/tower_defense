(function(window)
{
function TowerBash( args )
{
this.name = 'bash tower';
this.image = 'tower_bash';
this.can_target_ground = true;
this.can_target_air = false;
this.stun_chance = 30;
this.slow_chance = 30;
this.stun = 1;
this.stats = TowerBash.stats;

this.attack_animation_length = 40;  // the image is 40x40 px

Tower.call( this, args );

    // have the attack animation depend on the attack speed
this.attack_animation_limit = parseInt( this.attack_limit / 4, 10 );
this.attack_animation_alpha_step = 1 / this.attack_animation_limit;
}

INHERIT_PROTOTYPE( TowerBash, Tower );


TowerBash.stats = [
        { damage: 30, range: 20, attack_speed: 2, attack_radius: 20, slow: 20, upgrade_cost: 10, upgrade_time: 1, sell_time: 1, initial_cost: 50 },
        { damage: 35, range: 22, attack_speed: 3, attack_radius: 22, slow: 30, upgrade_cost: 10, upgrade_time: 2, sell_time: 1.5, filter: { red: 0, green: 0, blue: 150 } },
        { damage: 40, range: 25, attack_speed: 4, attack_radius: 25, slow: 40, sell_time: 2, filter: { red: 150, green: 0, blue: 0 } }
    ];



TowerBash.prototype.setupShape = function()
{
Tower.prototype.setupShape.call( this );

    // add the attack animation
var halfLength = 20;    // the attack image is 40x40 px

var attackAnimation = new createjs.Bitmap( G.PRELOAD.getResult( 'tower_bash_attack' ) );

var scale = (this.width + this.range) / this.attack_animation_length; // scale the image according to the tower's range

attackAnimation.regX = halfLength;
attackAnimation.regY = halfLength;
attackAnimation.scaleX = scale;
attackAnimation.scaleY = scale;

attackAnimation.visible = false;

this.container.addChild( attackAnimation );

this.attack_animation = attackAnimation;
};


TowerBash.prototype.startUpgrading = function()
{
Tower.prototype.startUpgrading.call( this );

this.attack_animation.visible = false;
};


TowerBash.prototype.upgrade = function()
{
Tower.prototype.upgrade.call( this );

    // the attack speed may have changed in the upgrade, so need to update this as well
this.attack_animation_limit = parseInt( this.attack_limit / 4, 10 );

var scale = (this.width + this.range) / this.attack_animation_length; // scale the image according to the tower's range

this.attack_animation.scaleX = scale;
this.attack_animation.scaleY = scale;
};


TowerBash.prototype.tick_attack = function()
{
if ( this.damage > 0 )
    {
    if ( this.attack_count <= this.attack_animation_limit )
        {
        this.attack_animation.visible = false;
        }

    else
        {
        this.attack_animation.alpha -= this.attack_animation_alpha_step;
        }

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
                this.attack_animation.visible = true;
                this.attack_animation.alpha = 1;

                this.attack();
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

/*
    Deals damage in an area around the tower, and has a chance to slow/stun
 */

TowerBash.prototype.attack = function()
{
var currentLevel = this.stats[ this.upgrade_level ];
var radius = currentLevel.attack_radius;
var slow = currentLevel.slow;

var units = Map.getUnits( this.getX(), this.getY(), radius, this );

for (var a = 0 ; a < units.length ; a++)
    {
    var unit = units[ a ];

    unit.tookDamage( this );

    var slowChance = getRandomInt( 0, 100 );

    if ( slowChance <= this.slow_chance )
        {
        unit.slowDown( slow );
        }

    var stunChance = getRandomInt( 0, 100 );

    if ( stunChance <= this.stun_chance )
        {
        unit.stun( this.stun );
        }
    }

if ( this.targetUnit.removed )
    {
    this.targetUnit = null;
    }
};


window.TowerBash = TowerBash;

}(window));