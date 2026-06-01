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
      levelName: 'Level 1: Seed Industry',
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

    // HUD tracker
    this.hud.addTracker(`Rejected: 0 / ${this.totalCorporations}`, 'rejected');

    // Place corporations with professional names and building props
    this._createCorporation(600, height, 'MegaSeed Industries', 'prop-house');
    this._createCorporation(1400, height, 'MonoCrop International', 'prop-wooden-house');
    this._createCorporation(2200, height, 'AgriGiant Holdings', 'prop-straw-house');

    // Input keys
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
      fontSize: '13px',
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(3);

    // Interaction prompt (hidden until near)
    const prompt = this.add.text(x, y - building.displayHeight - 32, '[E] Accept  /  [R] Reject', {
      fontSize: '12px',
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      color: '#ffffff',
      backgroundColor: '#00000099',
      padding: { x: 8, y: 4 },
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
          // Accept - no popup, just visual feedback
          corp.decided = true;
          corp.prompt.setVisible(false);
          corp.building.setTint(0x666666);
          corp.label.setColor('#999999');

          GameState.decisions.level1 = 'bad';
          this.contrastEngine.onBadChoice();
          GameState.environmentalHealth = this.contrastEngine.health;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
          // Reject - no popup, just visual feedback
          corp.decided = true;
          corp.prompt.setVisible(false);
          corp.building.setTint(0x88ff88);
          corp.label.setColor('#88ff88');
          this.corporationsRejected++;
          this.hud.updateTracker('rejected', `Rejected: ${this.corporationsRejected} / ${this.totalCorporations}`);

          this.contrastEngine.onGoodChoice();
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
      earned ? `Plant Earned! (${GameState.plantScore} / 3)` : 'No Plant Earned',
      earned
        ? 'You rejected all three seed corporations. Large-scale seed companies like these patent and monopolize seed genetics, forcing farmers to repurchase seeds every season rather than saving them. This practice eliminates thousands of locally adapted crop varieties that have been cultivated over generations. By supporting seed diversity, you help preserve the genetic resilience that protects food systems against disease, drought, and climate change. Diverse crops mean a more stable food supply for everyone.'
        : 'You accepted one or more of the seed corporations. When farmers buy patented seeds from industrial suppliers, they become dependent on a single genetic line. Monoculture farming reduces biodiversity, weakens ecosystems, and makes entire food supplies vulnerable to a single disease or pest. The corporations you accepted control what gets planted, and over time, thousands of unique local crop varieties disappear forever. Reject all three corporations next time to earn the plant.',
      earned,
      () => {
        this.scene.start('Level2Scene', { plants: GameState.plantScore });
      }
    );
  }
}
