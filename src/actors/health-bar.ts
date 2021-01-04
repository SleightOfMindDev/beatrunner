import * as ex from "excalibur";
import Config from "../config";
import { stats } from "../stats";

export class HealthBar extends ex.Actor {

    constructor() {
        super({
            color: ex.Color.Green,
            pos: new ex.Vector(20, 0),
            width: 0,
            height: 0,
            anchor: ex.Vector.Zero.clone(),
        });

        this.body.collider.type = ex.CollisionType.PreventCollision;
    }
    
    onInitialize(engine: ex.Engine) {
        this.pos = new ex.Vector(20,
                        engine.drawHeight - Config.healthBarHeight - 20);
        this.width = Config.healthBarWidth;
        this.height = Config.healthBarHeight;
        
    }

    onPreUpdate() {
        this.width = Config.healthBarWidth * (stats.hp / Config.totalHp);
    }

    onPostDraw(ctx: CanvasRenderingContext2D) {
       ctx.strokeStyle = this.color.toString();
       ctx.fillStyle = this.color.toString();
       ctx.lineWidth = 3;
       ctx.font = 'normal 30px sans-serif'
       ctx.fillText("HP:", -5, - this.height);
       ctx.strokeRect(-5, -5, Config.healthBarWidth + 10, this.height + 10);
    }

}
