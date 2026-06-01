import Phaser from 'phaser';
import { BaseLevel } from './BaseLevel.js';
import GameState from '../systems/GameState.js';

export class Level3Scene extends BaseLevel {
  constructor() {
    super('Level3Scene');
  }

  init(data) {
    super.init(data);
    this.cashLeft = 5;
    this.correctDeposits = 0;
    this.totalBanks = 5;
    this.depositsMade = 0;
    this.bankPoints = [];
    GameState.currentLevel = 3;
  }

  getLevelConfig() {
    return {
      worldWidth: 3000,
      levelName: 'Level 3: Banking Choices',
      pipeX: 2800,
      platforms: [
        { x: 400, y: 460 },
        { x: 850, y: 420 },
        { x: 1350, y: 440 },
        { x: 1850, y: 460 },
        { x: 2350, y: 420 },
      ],
      fruitPositions: [
        { x: 850, y: 370 },
        { x: 1850, y: 410 },
        { x: 2350, y: 370 },
      ],
    };
  }

  createLevelContent() {
    const { height } = this.scale;

    // HUD trackers
    this.hud.addTracker(`Cash: $${this.cashLeft}`, 'cash');
    this.hud.addTracker(`Green deposits: ${this.correctDeposits} / ${this.totalBanks}`, 'deposits');

    // Bank choice points
    const bankPositions = [500, 1000, 1500, 2000, 2500];
    for (const bx of bankPositions) {
      this._createBankPoint(bx, height);
    }

    // Input keys
    this.keyE = this.input.keyboard.addKey('E');
    this.keyR = this.input.keyboard.addKey('R');
  }

  _createBankPoint(x, sceneHeight) {
    const y = sceneHeight - 60;

    // Big bank (left)
    const bigBank = this.add.image(x - 60, y, 'prop-house');
    bigBank.setScale(1.5);
    bigBank.setOrigin(0.5, 1);
    bigBank.setTint(0xffaaaa);
    bigBank.setDepth(2);

    const bigLabel = this.add.text(x - 60, y - bigBank.displayHeight - 5, 'National Bank', {
      fontSize: '11px', fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(3);

    // Credit union (right)
    const creditUnion = this.add.image(x + 60, y, 'prop-plant-house');
    creditUnion.setScale(1.5);
    creditUnion.setOrigin(0.5, 1);
    creditUnion.setTint(0xaaffaa);
    creditUnion.setDepth(2);

    const cuLabel = this.add.text(x + 60, y - creditUnion.displayHeight - 5, 'Green Credit Union', {
      fontSize: '11px', fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(3);

    // Prompt
    const prompt = this.add.text(x, sceneHeight - 160, '$1  -  [E] National Bank  /  [R] Credit Union', {
      fontSize: '12px', fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      color: '#ffffff',
      backgroundColor: '#00000099', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setVisible(false).setDepth(3);

    this.bankPoints.push({
      x, bigBank, creditUnion, bigLabel, cuLabel, prompt, decided: false,
    });
  }

  update() {
    super.update();
    if (this.popup.isActive()) return;

    const px = this.playerController.sprite.x;

    for (const bp of this.bankPoints) {
      if (bp.decided) continue;

      const dist = Math.abs(px - bp.x);
      if (dist < 90) {
        bp.prompt.setVisible(true);

        if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
          bp.decided = true;
          bp.prompt.setVisible(false);
          bp.bigBank.setTint(0x666666);
          bp.bigLabel.setColor('#999999');
          this.cashLeft--;
          this.depositsMade++;
          this.hud.updateTracker('cash', `Cash: $${this.cashLeft}`);

          this.contrastEngine.onBadChoice();
          GameState.environmentalHealth = this.contrastEngine.health;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
          bp.decided = true;
          bp.prompt.setVisible(false);
          bp.creditUnion.setTint(0x00ff00);
          bp.cuLabel.setColor('#88ff88');
          this.correctDeposits++;
          this.cashLeft--;
          this.depositsMade++;
          this.hud.updateTracker('cash', `Cash: $${this.cashLeft}`);
          this.hud.updateTracker('deposits', `Green deposits: ${this.correctDeposits} / ${this.totalBanks}`);

          this.contrastEngine.onGoodChoice();
        }
      } else {
        bp.prompt.setVisible(false);
      }
    }
  }

  onPipeReached() {
    this.levelComplete = true;
    const allGreen = this.correctDeposits === this.totalBanks;
    if (allGreen) {
      GameState.plantScore++;
      GameState.decisions.level3 = 'good';
    } else {
      GameState.decisions.level3 = 'bad';
    }

    this.hud.updatePlants(GameState.plantScore);

    this.popup.show(
      allGreen ? `Plant Earned! (${GameState.plantScore} / 3)` : 'No Plant Earned',
      allGreen
        ? 'You deposited all of your money into green credit unions. The world\'s largest commercial banks are among the primary financiers of fossil fuel expansion. Since the Paris Agreement was signed in 2015, the top 60 banks have collectively provided more than $5.5 trillion in loans and underwriting to coal, oil, and gas companies. Credit unions and community development financial institutions invest deposits locally, funding renewable energy projects, affordable housing, and small businesses rather than subsidizing the extraction of fossil fuels. Where you bank directly determines what industries your money supports.'
        : 'You deposited some of your money into national banks. Major commercial banks use customer deposits to finance fossil fuel projects worldwide. Since the Paris Agreement, the 60 largest banks have directed over $5.5 trillion toward coal, oil, and gas expansion. Every dollar deposited in these institutions contributes to their lending capacity for these projects. Credit unions and green bank instead reinvest in local communities and sustainable development.',
      allGreen,
      () => {
        this.scene.start('EndScene', { plants: GameState.plantScore });
      }
    );
  }
}
