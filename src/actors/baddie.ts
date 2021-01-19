import * as ex from "excalibur";
import { Images, Sounds, gameSheet, explosionSpriteSheet } from "../resources";
import Config from "../config";
import { Bullet } from "./bullet";
import { animManager } from "./animation-manager";
import { stats } from "../stats";
import { playerShip } from "./ship";
import { Random } from "excalibur";
import { degToRad } from "../utils";

export enum FireType {
    Shotgun,
    Singleshot
}

export interface FireConfig {
    fireType: FireType,
    speed: number,
    maxMissAngle?: number,
    bulletCount?: number,
    bulletOffset?: number,
    fireTimes: ReadonlyArray<number>
}

const random = new Random;

export class Baddie extends ex.Actor {
    // All bullets belonging to baddies
    public static Bullets: Bullet[] = [];

    private anim?: ex.Animation;
    private explode?: ex.Animation;
    private fireTimers: ex.Timer[] = [];
    private fireConfig: FireConfig;

    constructor(x: number, y: number, width: number, height: number, fireConfig: FireConfig) {
        super({
            pos: new ex.Vector(x, y),
            width: width,
            height: height,
        });

        // Passive recieves collision events but does not participate in resolution
        this.body.collider.type = ex.CollisionType.Passive;

        // Setup listeners
        this.on('precollision', this.onPreCollision);

        this.fireConfig = fireConfig;
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
        this.actions.moveTo(100, this.pos.y, Config.enemySpeed)
                    .moveTo(engine.drawWidth - 100, this.pos.y, Config.enemySpeed)
                    .repeatForever();

        // Setup firing timer, repeats forever
        this.fireConfig.fireTimes.forEach((time) => {
            let timer = new ex.Timer({
                fcn: () => { this.fire(engine) },
                interval: time,
                repeats: false
            });
            engine.addTimer(timer);

            this.fireTimers.push(timer);
        })        
    }

    // Fires before excalibur collision resoulation
    private onPreCollision(evt: ex.PreCollisionEvent) {
        //disable this logic for the moment - we don't need the handle this. Maybe add some sort of hitstun for this later?

        // only kill a baddie if it collides with something that isn't a baddie or a baddie bullet
        // if(!(evt.other instanceof Baddie) &&
        //    !ex.Util.contains(Baddie.Bullets, evt.other)) {
        //     Sounds.explodeSound.play();
        //     if (this.explode) {
        //         animManager.play(this.explode, this.pos);
        //     }

        //     stats.score += 100;
        //     if (this.fireTimer) {
        //         this.fireTimer.cancel();
        //     }
        //     this.kill();
        //  }
    }


    private fire(engine: ex.Engine) {

        let playerLocation = playerShip.pos;
        //calculate the correct firing angle to hit the player's ship
        let correctAngle = Math.atan2(playerLocation.y - this.pos.y, playerLocation.x - this.pos.x);

        let offsetAngle = random.floating(-degToRad(this.fireConfig.maxMissAngle! || 0), degToRad(this.fireConfig.maxMissAngle! || 0));

        let fireAngle = correctAngle + offsetAngle;

        switch(this.fireConfig.fireType){
            case FireType.Shotgun:
                const minAngle = fireAngle + degToRad(this.fireConfig.bulletOffset! * -1 * this.fireConfig.bulletCount! / 2);
                
                for(let i = 0; i < this.fireConfig.bulletCount!; i++){
                    const shotgunAngle = minAngle + (degToRad(this.fireConfig.bulletOffset!) * i);

                    const bulletVelocity = new ex.Vector(
                        this.fireConfig.speed * Math.cos(shotgunAngle),
                        this.fireConfig.speed * Math.sin(shotgunAngle));

                    const bullet = new Bullet(this.pos.x, this.pos.y, bulletVelocity.x, bulletVelocity.y, this);
                    Baddie.Bullets.push(bullet);
                    engine.add(bullet);
                }
                break;
            case FireType.Singleshot:
                const bulletVelocity = new ex.Vector(
                    this.fireConfig.speed * Math.cos(fireAngle),
                    this.fireConfig.speed * Math.sin(fireAngle));

                const bullet = new Bullet(this.pos.x, this.pos.y, bulletVelocity.x, bulletVelocity.y, this);
                Baddie.Bullets.push(bullet);
                engine.add(bullet);
                break;
        }
    }
}
