import Phaser from 'phaser';
import { BaseLevel } from './BaseLevel.js';
import GameState from '../systems/GameState.js';

export class Level2Scene extends BaseLevel {
  constructor() {
    super('Level2Scene');
  }

  init(data) {
    super.init(data);
    this.chosenTool = null;
    this.grassCut = 0;
    this.totalGrass = 8;
    this.grassPatches = [];
    GameState.currentLevel = 2;
  }

  getLevelConfig() {
    return {
      worldWidth: 2200,
      levelName: 'Level 2: Lawn Care',
      pipeX: 2050,
      platforms: [
        { x: 400, y: 460 },
        { x: 750, y: 420 },
        { x: 1150, y: 440 },
        { x: 1550, y: 460 },
      ],
      fruitPositions: [
        { x: 400, y: 410 },
        { x: 1150, y: 390 },
      ],
    };
  }

  createLevelContent() {
    const { height } = this.scale;

    // HUD trackers
    this.hud.addTracker('Tool: Not selected', 'tool');
    this.hud.addTracker(`Grass cut: 0/${this.totalGrass}`, 'grass');

    // Grass patches along the level
    const grassPositions = [400, 600, 800, 1000, 1200, 1400, 1600, 1800];
    for (const gx of grassPositions) {
      const grass = this.add.rectangle(gx, height - 52, 60, 20, 0x006400);
      grass.setDepth(1);
      // Add a little grass prop on top
      const grassTop = this.add.image(gx, height - 60, 'atlas-props', 'shrooms');
      grassTop.setScale(2);
      grassTop.setTint(0x006400);
      grassTop.setDepth(1);

      this.grassPatches.push({ rect: grass, top: grassTop, cut: false, x: gx });
    }

    // Show tool choice modal
    this._showToolChoice();
  }

  _showToolChoice() {
    const { width, height } = this.scale;
    this.playerController.freeze();

    this.choiceGroup = this.add.container(width / 2, height / 2)
      .setScrollFactor(0)
      .setDepth(200);

    const bg = this.add.rectangle(0, 0, 480, 280, 0x333333, 0.95);
    bg.setStrokeStyle(3, 0xffffff);

    const title = this.add.text(0, -100, 'Choose Your Mower', {
      fontSize: '28px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    const gasBtn = this.add.text(-120, 10, 'Gas Mower', {
      fontSize: '22px', fontFamily: 'Arial', color: '#fff',
      backgroundColor: '#cc3333', padding: { x: 20, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const electricBtn = this.add.text(120, 10, 'Electric Mower', {
      fontSize: '22px', fontFamily: 'Arial', color: '#fff',
      backgroundColor: '#228b22', padding: { x: 20, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const hint = this.add.text(0, 90, 'Pick your tool to mow the grass along the level', {
      fontSize: '14px', fontFamily: 'Arial', color: '#aaa',
    }).setOrigin(0.5);

    this.choiceGroup.add([bg, title, gasBtn, electricBtn, hint]);

    gasBtn.on('pointerdown', () => {
      this.chosenTool = 'gas';
      this.hud.updateTracker('tool', 'Tool: Gas Mower');
      this.choiceGroup.setVisible(false);
      this.playerController.unfreeze();

      GameState.decisions.level2 = 'bad';
      this.contrastEngine.onBadChoice();
      GameState.environmentalHealth = this.contrastEngine.health;
    });

    electricBtn.on('pointerdown', () => {
      this.chosenTool = 'electric';
      this.hud.updateTracker('tool', 'Tool: Electric Mower');
      this.choiceGroup.setVisible(false);
      this.playerController.unfreeze();

      this.contrastEngine.onGoodChoice();
    });
  }

  update() {
    super.update();
    if (this.popup.isActive() || !this.chosenTool) return;

    const px = this.playerController.sprite.x;

    // Cut grass when walking over it
    for (const patch of this.grassPatches) {
      if (patch.cut) continue;
      const dist = Math.abs(px - patch.x);
      if (dist < 40) {
        patch.cut = true;
        patch.rect.setFillStyle(0x90ee90);
        patch.rect.setAlpha(0.5);
        patch.top.setTint(0x90ee90);
        patch.top.setAlpha(0.5);
        this.grassCut++;
        this.hud.updateTracker('grass', `Grass cut: ${this.grassCut}/${this.totalGrass}`);
      }
    }
  }

  onPipeReached() {
    this.levelComplete = true;
    const isElectric = this.chosenTool === 'electric';
    if (isElectric) {
      GameState.plantScore++;
      GameState.decisions.level2 = 'good';
    }

    this.hud.updatePlants(GameState.plantScore);

    this.popup.show(
      isElectric ? `Plant Earned! (${GameState.plantScore}/3)` : 'No Plant Earned',
      isElectric
        ? 'Great choice! Gas-powered lawn mowers lack the catalytic converters and emission controls that cars have. A single gas mower running for one hour emits as much pollution as driving a car for 100 miles. Electric mowers produce zero direct emissions!'
        : 'Gas-powered lawn mowers have NO emission filtration systems unlike cars. One hour of gas mowing equals 100 miles of car emissions. They release volatile organic compounds, carbon monoxide, and nitrogen oxides directly into the air. Choose electric next time!',
      isElectric,
      () => {
        this.scene.start('Level3Scene', { plants: GameState.plantScore });
      }
    );
  }
}
