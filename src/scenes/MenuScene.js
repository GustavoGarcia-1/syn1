import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // Start music if not already playing (persists across scenes)
    if (!this.sound.get('music')) {
      this.sound.play('music', { loop: true, volume: 0.4 });
    }

    // Parallax background (back.png is 384x240, middle.png is 176x368)
    const backScale = height / 240;
    this.bgBack = this.add.tileSprite(0, 0, width / backScale, 240, 'bg-back')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setScale(backScale);

    const midScale = height / 368;
    this.bgMiddle = this.add.tileSprite(0, 0, width / midScale, 368, 'bg-middle')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setScale(midScale);

    // Ground strip
    this.add.rectangle(width / 2, height - 30, width, 60, 0x6a9e3a);

    // Decorative props
    const treeScale = 3;
    this.add.image(100, height - 60, 'atlas-props', 'tree').setScale(treeScale).setOrigin(0.5, 1);
    this.add.image(700, height - 60, 'atlas-props', 'tree').setScale(treeScale).setOrigin(0.5, 1);
    this.add.image(300, height - 60, 'atlas-props', 'bush').setScale(treeScale).setOrigin(0.5, 1);
    this.add.image(550, height - 60, 'atlas-props', 'bush').setScale(treeScale).setOrigin(0.5, 1);
    this.add.image(400, height - 60, 'atlas-props', 'shrooms').setScale(treeScale).setOrigin(0.5, 1);

    // Ensure player anims are available
    if (!this.anims.exists('player-idle')) {
      this.anims.create({
        key: 'player-idle',
        frames: this.anims.generateFrameNames('atlas', {
          prefix: 'player/idle/player-idle-',
          start: 1, end: 4,
        }),
        frameRate: 8, repeat: -1,
      });
    }

    // Decorative Foxy idle
    const foxy = this.add.sprite(width / 2, height - 90, 'atlas', 'player/idle/player-idle-1');
    foxy.setScale(4);
    foxy.play('player-idle');

    // Title
    this.add.text(width / 2, 100, 'Environmental Adventures', {
      fontSize: '64px',
      fontFamily: 'Cambria, Georgia, serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#2d5a27',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 170, 'Make the right choices, to save the planet.', {
      fontSize: '18px',
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      color: '#ffffff',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 3, fill: true },
    }).setOrigin(0.5);

    // Play button
    const playButton = this.add.text(width / 2, 260, 'PLAY GAME', {
      fontSize: '32px',
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      color: '#ffffff',
      backgroundColor: '#2d5a27',
      padding: { x: 30, y: 15 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playButton.on('pointerover', () => playButton.setStyle({ backgroundColor: '#3a7a34' }));
    playButton.on('pointerout', () => playButton.setStyle({ backgroundColor: '#2d5a27' }));
    playButton.on('pointerdown', () => {
      this.scene.start('Level1Scene');
    });

    // Info text
    this.add.text(width / 2, 330, 'Collect 3 plants by making eco friendly choices!', {
      fontSize: '16px',
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      color: '#ffffff',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 3, fill: true },
    }).setOrigin(0.5);
  }

  update() {
    if (this.bgBack) this.bgBack.tilePositionX += 0.2;
    if (this.bgMiddle) this.bgMiddle.tilePositionX += 0.5;
  }
}
