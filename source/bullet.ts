import { Unit } from "./units/unit";
import { Tower } from "./tower";
import { getAsset } from "./assets";
import {
    calculateAngle,
    circleCircleCollision,
    toDegrees,
} from "@drk4/utilities";

var CONTAINER; // createjs.Container() which will hold all the bullet elements

export interface BulletArgs {
    shooter: Tower;
    target: Unit;
}

export class Bullet {
    static ALL = [];

    /**
     * Create the container which will hold all the bullet elements.
     */
    static init(parent) {
        CONTAINER = new createjs.Container();

        parent.addChild(CONTAINER);
    }

    static removeAll() {
        for (var a = Bullet.ALL.length - 1; a >= 0; a--) {
            Bullet.ALL[a].remove();
        }
    }

    private shooter: Tower;
    private target: Unit;
    private width: number;
    private height: number;
    private radius: number;
    private movement_speed: number;
    private shape: createjs.Bitmap;
    private removed: boolean;

    constructor(args: BulletArgs) {
        this.shooter = args.shooter;
        this.target = args.target;

        this.width = 4;
        this.height = 4;
        this.radius = 2;
        this.movement_speed = 140;

        this.shape = null;
        this.removed = false;

        this.setupShape();

        Bullet.ALL.push(this);
    }

    setupShape() {
        var width = this.width;
        var height = this.height;

        var shape = new createjs.Bitmap(getAsset("bullet"));

        shape.regX = width / 2;
        shape.regY = height / 2;
        shape.x = this.shooter.getX();
        shape.y = this.shooter.getY();

        CONTAINER.addChild(shape);

        this.shape = shape;
    }

    tick(deltaTime) {
        var target = this.target;

        // target already died
        if (target.removed) {
            this.remove();
            return;
        }

        var targetX = target.getX();
        var targetY = target.getY();
        var targetRadius = target.width / 2;

        var angle = calculateAngle(
            this.shape.x,
            this.shape.y * -1,
            targetX,
            targetY * -1
        );

        this.shape.x += Math.cos(angle) * this.movement_speed * deltaTime;
        this.shape.y += Math.sin(angle) * this.movement_speed * deltaTime;

        this.shape.rotation = toDegrees(angle);

        if (
            circleCircleCollision(
                this.shape.x,
                this.shape.y,
                this.radius,
                targetX,
                targetY,
                targetRadius
            )
        ) {
            this.shooter.onBulletHit(target);

            this.remove();
        }
    }

    remove() {
        if (this.removed) {
            return;
        }

        this.removed = true;

        CONTAINER.removeChild(this.shape);

        var index = Bullet.ALL.indexOf(this);

        Bullet.ALL.splice(index, 1);
    }
}
