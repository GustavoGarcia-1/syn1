import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const { width, height } = this.scale;
    const barW = 400;
    const barH = 30;
    const barX = (width - barW) / 2;
    const barY = height / 2 + 40;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title text
    this.add.text(width / 2, height / 2 - 60, 'Synthesis 1', {
      fontSize: '42px',
      fontFamily: 'Cambria, Georgia, serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 10, 'Project 3', {
      fontSize: '28px',
      fontFamily: 'Cambria, Georgia, serif',
      color: '#c0c0c0',
    }).setOrigin(0.5);

    // Loading bar
    this.add.rectangle(width / 2, barY, barW + 4, barH + 4, 0x333355);
    const bar = this.add.rectangle(barX + 2, barY - barH / 2 + 2, 0, barH, 0x5588bb);
    bar.setOrigin(0, 0);

    this.add.text(width / 2, barY + 30, 'Loading...', {
      fontSize: '14px',
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      color: '#888899',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      bar.width = barW * value;
    });

    // ---- ATLAS FILES ----
    this.load.atlas('atlas', 'assets/atlas/atlas.png', 'assets/atlas/atlas.json');
    this.load.atlas('atlas-props', 'assets/atlas/atlas-props.png', 'assets/atlas/atlas-props.json');

    // ---- ENVIRONMENT ----
    this.load.image('bg-back', 'assets/environment/back.png');
    this.load.image('bg-middle', 'assets/environment/middle.png');
    this.load.image('tileset', 'assets/environment/tileset.png');
    this.load.image('bg-green', 'assets/environment/bg-green.png');

    // ---- PROPS (individual images) ----
    const props = [
      'big-crate', 'block-big', 'block', 'bush', 'crate', 'door', 'door-opened',
      'face-block', 'house', 'palm', 'pine', 'plant-house', 'platform-long',
      'rock', 'rock-1', 'rock-2', 'shrooms', 'sign', 'small-platform',
      'straw-house', 'tree-house', 'tree', 'wooden-house',
    ];
    for (const p of props) {
      this.load.image(`prop-${p}`, `assets/props/${p}.png`);
    }

    // ---- FRUIT SPRITESHEETS (Pixel Adventure - 32x32 frames) ----
    this.load.spritesheet('fruit-apple', 'assets/items/apple.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('fruit-strawberry', 'assets/items/strawberry.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('fruit-orange', 'assets/items/orange.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('fruit-cherries', 'assets/items/pa-cherries.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('fruit-collected', 'assets/fx/fruit-collected.png', { frameWidth: 32, frameHeight: 32 });

    // ---- FX ----
    this.load.spritesheet('confetti', 'assets/fx/confetti.png', { frameWidth: 16, frameHeight: 16 });

    // ---- MUSIC ----
    this.load.audio('music', 'assets/environment/Space Jazz.mp3');
  }

  create() {
    // ---- CREATE ANIMATIONS ----

    // Eagle
    this.anims.create({
      key: 'eagle-fly',
      frames: this.anims.generateFrameNames('atlas', {
        prefix: 'eagle/eagle-attack-',
        start: 1, end: 4,
      }),
      frameRate: 8, repeat: -1,
    });

    // Frog idle
    this.anims.create({
      key: 'frog-idle',
      frames: this.anims.generateFrameNames('atlas', {
        prefix: 'frog/idle/frog-idle-',
        start: 1, end: 4,
      }),
      frameRate: 6, repeat: -1,
    });

    // Opossum walk
    this.anims.create({
      key: 'opossum-walk',
      frames: this.anims.generateFrameNames('atlas', {
        prefix: 'opossum/opossum-',
        start: 1, end: 6,
      }),
      frameRate: 8, repeat: -1,
    });

    // Cherry spin
    this.anims.create({
      key: 'cherry-spin',
      frames: this.anims.generateFrameNames('atlas', {
        prefix: 'cherry/cherry-',
        start: 1, end: 7,
      }),
      frameRate: 10, repeat: -1,
    });

    // Gem sparkle
    this.anims.create({
      key: 'gem-sparkle',
      frames: this.anims.generateFrameNames('atlas', {
        prefix: 'gem/gem-',
        start: 1, end: 5,
      }),
      frameRate: 8, repeat: -1,
    });

    // Item feedback
    this.anims.create({
      key: 'item-feedback',
      frames: this.anims.generateFrameNames('atlas', {
        prefix: 'item-feedback/item-feedback-',
        start: 1, end: 4,
      }),
      frameRate: 12, repeat: 0,
    });

    // Fruit animations (Pixel Adventure)
    const fruits = ['fruit-apple', 'fruit-strawberry', 'fruit-orange', 'fruit-cherries'];
    for (const fruit of fruits) {
      this.anims.create({
        key: `${fruit}-spin`,
        frames: this.anims.generateFrameNumbers(fruit, { start: 0, end: 16 }),
        frameRate: 14, repeat: -1,
      });
    }

    this.anims.create({
      key: 'fruit-collect-fx',
      frames: this.anims.generateFrameNumbers('fruit-collected', { start: 0, end: 5 }),
      frameRate: 14, repeat: 0,
    });

    // Transition to menu
    this.scene.start('MenuScene');
  }
}
