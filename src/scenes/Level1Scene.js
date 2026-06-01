import Phaser from 'phaser';
import { BaseLevel } from './BaseLevel.js';
import GameState from '../systems/GameState.js';

export class Level1Scene extends BaseLevel {
  constructor() {
    super('Level1Scene');
  }

  init(data) {
    super.init(data);
    this.corporationsRejected = 0;
    this.totalCorporations = 3;
    this.corporations = [];
    GameState.currentLevel = 1;
  }

  getLevelConfig() {
    return {
      worldWidth: 2800,
      levelName: 'Level 1: Seed Corporations',
      pipeX: 2650,
      platforms: [
        { x: 350, y: 460 },
        { x: 600, y: 400 },
        { x: 1000, y: 440 },
        { x: 1300, y: 380 },
        { x: 1700, y: 460 },
        { x: 2100, y: 400 },
      ],
      fruitPositions: [
        { x: 350, y: 410 },
        { x: 1300, y: 330 },
        { x: 2100, y: 350 },
      ],
    };
  }

  createLevelContent() {
    const { height } = this.scale;

    // HUD tracker for corporations rejected
    this.hud.addTracker(`Corporations rejected: 0/${this.totalCorporations}`, 'rejected');

    // Place corporations with building props
    this._createCorporation(600, height, 'MegaSeed Corp', 'prop-house');
    this._createCorporation(1400, height, 'MonoCrop Inc', 'prop-wooden-house');
    this._createCorporation(2200, height, 'AgriGiant Co', 'prop-straw-house');

    // Input keys for E and R
    this.keyE = this.input.keyboard.addKey('E');
    this.keyR = this.input.keyboard.addKey('R');
  }

  _createCorporation(x, sceneHeight, name, propKey) {
    const y = sceneHeight - 60;

    // Building prop
    const building = this.add.image(x, y, propKey);
    building.setScale(3);
    building.setOrigin(0.5, 1);
    building.setDepth(2);

    // Name label
    const label = this.add.text(x, y - building.displayHeight - 10, name, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#cc0000',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(3);

    // Interaction prompt (hidden until near)
    const prompt = this.add.text(x, y - building.displayHeight - 30, '[E] Accept / [R] Reject', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
      backgroundColor: '#ffffffdd',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setVisible(false).setDepth(3);

    this.corporations.push({ x, building, label, prompt, name, decided: false });
  }

  update() {
    super.update();
    if (this.popup.isActive()) return;

    const px = this.playerController.sprite.x;
    const py = this.playerController.sprite.y;

    for (const corp of this.corporations) {
      if (corp.decided) continue;

      const dist = Phaser.Math.Distance.Between(px, py, corp.x, this.scale.height - 100);
      if (dist < 100) {
        corp.prompt.setVisible(true);

        if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
          corp.decided = true;
          corp.prompt.setVisible(false);
          corp.building.setTint(0x666666);

          GameState.decisions.level1 = 'bad';
          this.contrastEngine.onBadChoice();
          GameState.environmentalHealth = this.contrastEngine.health;

          this.popup.show(
            'You accepted ' + corp.name,
            'By buying from large seed corporations, farmers eliminate biodiversity. Monoculture farming wipes out native plant species and makes ecosystems fragile. The short-term profit isn\'t worth the long-term environmental damage.',
            false
          );
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
          corp.decided = true;
          corp.prompt.setVisible(false);
          corp.building.setTint(0x88ff88);
          corp.label.setColor('#228b22');
          this.corporationsRejected++;
          this.hud.updateTracker('rejected', `Corporations rejected: ${this.corporationsRejected}/${this.totalCorporations}`);

          this.contrastEngine.onGoodChoice();

          this.popup.show(
            'You rejected ' + corp.name + '!',
            'By supporting local seed diversity, you help preserve thousands of plant varieties that would otherwise go extinct. Diverse crops are more resilient to disease and climate change.',
            true
          );
        }
      } else {
        corp.prompt.setVisible(false);
      }
    }
  }

  onPipeReached() {
    this.levelComplete = true;
    const earned = this.corporationsRejected === this.totalCorporations;
    if (earned) {
      GameState.plantScore++;
      GameState.decisions.level1 = 'good';
    }

    this.hud.updatePlants(GameState.plantScore);

    this.popup.show(
      earned ? `Plant Earned! (${GameState.plantScore}/3)` : 'No Plant Earned',
      earned
        ? 'You rejected all the seed corporations! Biodiversity is preserved. Native plants and niche crops survive because farmers like you choose local seeds over corporate monocultures.'
        : 'You accepted some seed corporations. Monoculture farming has reduced plant biodiversity. Reject all corporations next time to earn the plant!',
      earned,
      () => {
        this.scene.start('Level2Scene', { plants: GameState.plantScore });
      }
    );
  }
}
