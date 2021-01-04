// Main Game Logic
import * as ex from 'excalibur';
import Config from './config';
import { Sounds, loader } from './resources';
import { Game } from './game';

const engine = new ex.Engine({
    backgroundColor: ex.Color.Black
});
engine.backgroundColor = ex.Color.Black;
engine.setAntialiasing(false);

// Setup game scene
engine.add('game', new Game(engine));
engine.goToScene('game');

// Game events to handle
engine.on('hidden', () => {
    console.log('pause');
    engine.stop();
});
engine.on('visible', () => {
    console.log('start');
    engine.start();
});

engine.input.keyboard.on('press', (evt: ex.Input.KeyEvent) => {
    if (evt.key === ex.Input.Keys.D) {
      engine.isDebug = !engine.isDebug;
    }
});

engine.start(loader).then(() => {
   Sounds.laserSound.volume = Config.soundVolume;
   Sounds.explodeSound.volume = Config.soundVolume;
   Sounds.enemyFireSound.volume = Config.soundVolume;
   Sounds.powerUp.volume = Config.soundVolume;
   Sounds.rocketSound.volume = Config.soundVolume;
   
   console.log("Game Resources Loaded");
});