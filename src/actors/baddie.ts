import * as ex from "excalibur";
import { Images, Sounds, gameSheet, explosionSpriteSheet } from "../resources";
import Config from "../config";
import { Bullet } from "./bullet";
import { animManager } from "./animation-manager";
import { stats } from "../stats";

export class Baddie extends ex.Actor {
    // All bullets belonging to baddies
    public static Bullets: Bullet[] = [];

    private anim?: ex.Animation;
    private explode?: ex.Animation;
    private fireTimer?: ex.Timer;
    private fireAngle: number = Math.random() * Math.PI * 2;
    constructor(x: number, y: number, width: number, height: number) {
        super({
            pos: new ex.Vector(x, y),
            width: width,
            height: height,
        });

        // Passive recieves collision events but does not participate in resolution
        this.body.collider.type = ex.CollisionType.Passive;

        // Setup listeners
        this.on('precollision', this.onPreCollision);

    }

    // OnInitialize is called before the 1st actor update
    onInitialize(engine: ex.Engine) {
        // Initialize actor

        // Setup visuals
        this.anim = gameSheet.getAnimationByIndices(engine, [10, 11, 12], 100)
        this.anim.scale = new ex.Vector(4, 4);
        this.addDrawing("default", this.anim);

        this.explode = explosionSpriteSheet.getAnimationForAll(engine, 40);
        this.explode.scale = new ex.Vector(3, 3);
        this.explode.loop = false;

        // Setup patrolling behavior
        this.actions.moveTo(this.pos.x, this.pos.y + 800, Config.enemySpeed)
                    .moveTo(this.pos.x + 800, this.pos.y, Config.enemySpeed)
                    .moveTo(this.pos.x + 800, this.pos.y + 800, Config.enemySpeed)
                    .moveTo(this.pos.x, this.pos.y, Config.enemySpeed)
                    .repeatForever();

        // Setup firing timer, repeats forever
        this.fireTimer = new ex.Timer({
            fcn: () => { this. fire(engine) },
            interval: Config.enemyFireInterval,
            repeats: true,
            numberOfRepeats: -1
        });
        engine.addTimer(this.fireTimer);

    }

    // Fires before excalibur collision resoulation
    private onPreCollision(evt: ex.PreCollisionEvent) {
        // only kill a baddie if it collides with something that isn't a baddie or a baddie bullet
        if(!(evt.other instanceof Baddie) &&
           !ex.Util.contains(Baddie.Bullets, evt.other)) {
            Sounds.explodeSound.play();
            if (this.explode) {
                animManager.play(this.explode, this.pos);
            }

            stats.score += 100;
            if (this.fireTimer) {
                this.fireTimer.cancel();
            }
            this.kill();
         }
    }


    private fire(engine: ex.Engine) {
        this.fireAngle += Math.PI/20;
        const bulletVelocity = new ex.Vector(
            Config.enemyBulletVelocity * Math.cos(this.fireAngle),
            Config.enemyBulletVelocity * Math.sin(this.fireAngle));

        const bullet = new Bullet(this.pos.x, this.pos.y, bulletVelocity.x, bulletVelocity.y, this);
        Baddie.Bullets.push(bullet);
        engine.add(bullet);
    }
}
