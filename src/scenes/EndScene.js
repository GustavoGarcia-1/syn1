import Phaser from 'phaser';
import GameState from '../systems/GameState.js';

export class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  init(data) {
    this.plants = data.plants !== undefined ? data.plants : GameState.plantScore;
  }

  create() {
    const { width, height } = this.scale;
    const won = this.plants === 3;

    if (won) {
      this._createVictoryScreen(width, height);
    } else {
      this._createLossScreen(width, height);
    }

    // Play again button
    const replayBtn = this.add.text(width / 2, height - 70, 'PLAY AGAIN', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#2d5a27',
      padding: { x: 25, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

    replayBtn.on('pointerover', () => replayBtn.setStyle({ backgroundColor: '#3a7a34' }));
    replayBtn.on('pointerout', () => replayBtn.setStyle({ backgroundColor: '#2d5a27' }));
    replayBtn.on('pointerdown', () => {
      GameState.reset();
      this.scene.start('MenuScene');
    });
  }

  _createVictoryScreen(width, height) {
    // Bright parallax background (back.png is 384x240, middle.png is 176x368)
    const backScale = height / 240;
    const bg = this.add.tileSprite(0, 0, width / backScale, 240, 'bg-back')
      .setOrigin(0, 0)
      .setScale(backScale);

    const midScale = height / 368;
    const bgMid = this.add.tileSprite(0, 0, width / midScale, 368, 'bg-middle')
      .setOrigin(0, 0)
      .setScale(midScale);

    this.bgBack = bg;
    this.bgMiddle = bgMid;

    // Ground
    this.add.rectangle(width / 2, height - 30, width, 60, 0x6a9e3a);

    // Decorative trees
    this.add.image(80, height - 60, 'atlas-props', 'tree').setScale(3).setOrigin(0.5, 1);
    this.add.image(720, height - 60, 'atlas-props', 'tree').setScale(3).setOrigin(0.5, 1);

    // Title
    this.add.text(width / 2, 60, 'You Did It!', {
      fontSize: '52px',
      fontFamily: 'Georgia, serif',
      color: '#2d5a27',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Crown
    this.add.text(width / 2, 110, '\u2654', {
      fontSize: '48px',
    }).setOrigin(0.5);

    // Foxy victory pose
    const foxy = this.add.sprite(width / 2, height - 100, 'atlas', 'player/idle/player-idle-1');
    foxy.setScale(4);
    foxy.play('player-idle');

    // Plant display with gems
    for (let i = 0; i < 3; i++) {
      const px = width / 2 - 100 + i * 100;
      const gem = this.add.sprite(px, 165, 'atlas', 'gem/gem-1');
      gem.setScale(4);
      gem.play('gem-sparkle');
    }

    // Congratulations
    this.add.text(width / 2, 210, 'Congratulations! You made all the right decisions.', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      color: '#2d5a27',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, 310, [
      'By rejecting corporate seed monopolies, you preserved biodiversity.',
      'By choosing electric over gas, you cut harmful emissions.',
      'By banking green, you defunded fossil fuel expansion.',
      '',
      'With these 3 plants, you\'ve done your part to keep',
      'people fed, ecosystems healthy, and the planet thriving.',
      '',
      'Small choices add up. Every decision matters.',
    ].join('\n'), {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#3a5a34',
      align: 'center',
      lineSpacing: 5,
    }).setOrigin(0.5);

    // Confetti particles
    this._createConfetti(width, height);
  }

  _createLossScreen(width, height) {
    // Desaturated background
    this.cameras.main.setBackgroundColor('#4a4a4a');

    // Apply grayscale post-processing
    if (this.cameras.main.postFX) {
      this.cameras.main.postFX.addColorMatrix().grayscale(0.6, false);
    }

    this.add.text(width / 2, 80, 'Game Over', {
      fontSize: '48px',
      fontFamily: 'Georgia, serif',
      color: '#cc4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, 150, `Plants collected: ${this.plants}/3`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Sad Foxy
    const foxy = this.add.sprite(width / 2, 230, 'atlas', 'player/hurt/player-hurt-1');
    foxy.setScale(4);

    this.add.text(width / 2, 340, [
      'You didn\'t make all the right choices this time.',
      '',
      'The environment needs every decision to count.',
      'From the seeds we plant, to the tools we use,',
      'to where we put our money \u2014 it all matters.',
      '',
      'Try again and make every choice count!',
    ].join('\n'), {
      fontSize: '15px',
      fontFamily: 'Arial',
      color: '#cccccc',
      align: 'center',
      lineSpacing: 5,
    }).setOrigin(0.5);
  }

  _createConfetti(width, height) {
    // Use simple colored rectangles for confetti particles
    const colors = [0xff6347, 0xffff00, 0x32cd32, 0x1e90ff, 0xff69b4, 0xffa500];

    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(-100, -10);
      const color = Phaser.Math.RND.pick(colors);
      const size = Phaser.Math.Between(4, 10);
      const confetti = this.add.rectangle(x, y, size, size, color);
      confetti.setDepth(20);

      this.tweens.add({
        targets: confetti,
        y: height + 20,
        x: confetti.x + Phaser.Math.Between(-80, 80),
        rotation: Phaser.Math.Between(0, 6),
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 2000),
        repeat: -1,
        onRepeat: () => {
          confetti.y = Phaser.Math.Between(-100, -10);
          confetti.x = Phaser.Math.Between(50, width - 50);
        },
      });
    }
  }

  update() {
    if (this.bgBack) this.bgBack.tilePositionX += 0.2;
    if (this.bgMiddle) this.bgMiddle.tilePositionX += 0.5;
  }
}
