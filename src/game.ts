import * as ex from 'excalibur';
import { playerShip} from './actors/ship';
import { HealthBar } from './actors/health-bar';

import { stats } from './stats';
import { Baddie, FireConfig, FireType as BaddieFireType } from './actors/baddie';
import Config from './config';

import { animManager } from './actors/animation-manager';

export class Game extends ex.Scene {

    constructor(engine: ex.Engine) {
        super(engine);
    }

    onInitialize(engine: ex.Engine) {
        engine.add(animManager);

        engine.add(playerShip);

        const healthBar = new HealthBar();
        engine.add(healthBar);

        const scoreLabel = new ex.Label("Score: " + stats.score, 20, 50);
        scoreLabel.color = ex.Color.Azure;
        scoreLabel.scale = new ex.Vector(3, 3);
        scoreLabel.on('preupdate', function(this: ex.Label, evt){
            this.text = "Score: " + stats.score;
        });
        engine.add(scoreLabel);


        const gameOverLabel = new ex.Label("Game Over", engine.halfDrawWidth - 250, engine.halfDrawHeight);
        gameOverLabel.color = ex.Color.Green.clone();
        gameOverLabel.scale = new ex.Vector(8,8);
        gameOverLabel.actions.blink(1000, 1000, 400).repeatForever();

        interface BaddieConfig {
            x: number,
            fireConfig: FireConfig
        }

        let baddies = [
            {
                x: engine.drawWidth / 3,
                fireConfig: {
                    fireType: BaddieFireType.Shotgun,
                    speed: 150,
                    bulletCount: 8,
                    bulletOffset: 5,
                    fireTimes: Array(100).fill(null).map((x, index) => index * 3000)
                }
                //other properties like frequency range, or timestamps to shoot will go here
            },
            {
                x: engine.drawWidth / 3 * 2,
                fireConfig: {
                    fireType: BaddieFireType.Singleshot,
                    speed: 300,
                    fireTimes: Array(300).fill(null).map((x, index) => index * 1000)
                }
            }
        ];

        let nextBaddieY = 50;

        baddies.map((baddieConfig: BaddieConfig) => {
            let newBaddie = new Baddie(baddieConfig.x, nextBaddieY, 80, 80, baddieConfig.fireConfig);
            nextBaddieY += 90;
            engine.add(newBaddie);
        });

        engine.on('preupdate', () => {
            if (stats.gameOver) {
                engine.add(gameOverLabel);
            }
        });

    }

}