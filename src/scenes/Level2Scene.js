import Phaser from 'phaser';

export class Level2Scene extends Phaser.Scene {
  constructor() {
    super('Level2Scene');
  }

  init(data) {
    this.plants = data.plants || 0;
    this.chosenTool = null;
    this.grassCut = 0;
    this.totalGrass = 0;
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#87CEEB');

    // Ground
    const ground = this.add.rectangle(0, height - 40, width * 4, 80, 0x4a8c3f);
    this.physics.add.existing(ground, true);
    ground.body.setOffset(-width * 2, 0);

    // Player
    this.player = this.add.rectangle(100, height - 100, 32, 48, 0x3366cc);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(false);
    this.physics.add.collider(this.player, ground);

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    this.createPlatform(350, height - 140, 100, 20);
    this.createPlatform(700, height - 180, 100, 20);
    this.createPlatform(1100, height - 160, 100, 20);
    this.createPlatform(1500, height - 140, 100, 20);
    this.physics.add.collider(this.player, this.platforms);

    // Tool choice area at the start
    this.showToolChoice(width, height);

    // Grass patches to mow (placed along the level)
    this.grassPatches = [];
    const grassPositions = [400, 600, 800, 1000, 1200, 1400, 1600, 1800];
    for (const gx of grassPositions) {
      const grass = this.add.rectangle(gx, height - 60, 60, 20, 0x006400);
      this.physics.add.existing(grass, true);
      this.grassPatches.push({ obj: grass, cut: false, x: gx });
      this.totalGrass = grassPositions.length;
    }

    // Trees
    for (let x = 200; x < 2200; x += 300) {
      this.add.rectangle(x, height - 100, 16, 60, 0x8B4513);
      this.add.circle(x, height - 145, 30, 0x228B22);
    }

    // Pipe at end
    this.pipe = this.add.rectangle(2050, height - 100, 50, 80, 0x228b22);
    this.add.rectangle(2050, height - 130, 60, 20, 0x1a6b1a);
    this.physics.add.existing(this.pipe, true);

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 2200, height);
    this.physics.world.setBounds(0, 0, 2200, height);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // HUD
    this.plantText = this.add.text(16, 16, `Plants: ${this.plants}/3`, {
      fontSize: '20px', fontFamily: 'Arial', color: '#2d5a27',
      backgroundColor: '#ffffffcc', padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    this.levelText = this.add.text(16, 50, 'Level 2: Lawn Care', {
      fontSize: '16px', fontFamily: 'Arial', color: '#2d5a27',
      backgroundColor: '#ffffffcc', padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    this.toolText = this.add.text(16, 84, 'Tool: Not selected', {
      fontSize: '14px', fontFamily: 'Arial', color: '#555',
      backgroundColor: '#ffffffcc', padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    this.grassText = this.add.text(16, 114, `Grass cut: 0/${this.totalGrass}`, {
      fontSize: '14px', fontFamily: 'Arial', color: '#555',
      backgroundColor: '#ffffffcc', padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    // Popup
    this.popupGroup = this.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(200).setVisible(false);
    this.popupActive = false;
    this.levelComplete = false;
  }

  showToolChoice(width, height) {
    this.choiceGroup = this.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(200);

    const bg = this.add.rectangle(0, 0, 450, 250, 0x333333, 0.95);
    bg.setStrokeStyle(3, 0xffffff);

    const title = this.add.text(0, -90, 'Choose Your Mower', {
      fontSize: '28px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    const gasBtn = this.add.text(-110, 10, 'Gas Mower', {
      fontSize: '22px', fontFamily: 'Arial', color: '#fff',
      backgroundColor: '#cc3333', padding: { x: 20, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const electricBtn = this.add.text(110, 10, 'Electric Mower', {
      fontSize: '22px', fontFamily: 'Arial', color: '#fff',
      backgroundColor: '#228b22', padding: { x: 20, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const hint = this.add.text(0, 80, 'Pick your tool to mow the grass along the level', {
      fontSize: '14px', fontFamily: 'Arial', color: '#aaa',
    }).setOrigin(0.5);

    this.choiceGroup.add([bg, title, gasBtn, electricBtn, hint]);

    gasBtn.on('pointerdown', () => {
      this.chosenTool = 'gas';
      this.toolText.setText('Tool: Gas Mower');
      this.choiceGroup.setVisible(false);
    });

    electricBtn.on('pointerdown', () => {
      this.chosenTool = 'electric';
      this.toolText.setText('Tool: Electric Mower');
      this.choiceGroup.setVisible(false);
    });
  }

  createPlatform(x, y, w, h) {
    const plat = this.add.rectangle(x, y, w, h, 0x8B6914);
    this.platforms.add(plat);
    plat.body.updateFromGameObject();
  }

  showPopup(title, body, isGood) {
    const { width, height } = this.scale;
    this.popupGroup.removeAll(true);

    const bg = this.add.rectangle(0, 0, 500, 320, isGood ? 0x2d5a27 : 0x8b0000, 0.95);
    bg.setStrokeStyle(3, 0xffffff);

    const titleText = this.add.text(0, -120, title, {
      fontSize: '24px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold',
      align: 'center', wordWrap: { width: 440 },
    }).setOrigin(0.5);

    const bodyText = this.add.text(0, 10, body, {
      fontSize: '14px', fontFamily: 'Arial', color: '#ddd',
      align: 'center', wordWrap: { width: 440 },
    }).setOrigin(0.5);

    const continueText = this.add.text(0, 130, 'Press SPACE to continue', {
      fontSize: '16px', fontFamily: 'Arial', color: '#ffff00',
    }).setOrigin(0.5);

    this.popupGroup.add([bg, titleText, bodyText, continueText]);
    this.popupGroup.setVisible(true);
    this.popupActive = true;

    this.input.keyboard.once('keydown-SPACE', () => {
      this.popupGroup.setVisible(false);
      this.popupActive = false;
    });
  }

  update() {
    if (this.popupActive || !this.chosenTool) return;

    const speed = 200;
    const { left, right, up } = this.cursors;

    if (left.isDown || this.wasd.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (right.isDown || this.wasd.right.isDown) {
      this.player.body.setVelocityX(speed);
    } else {
      this.player.body.setVelocityX(0);
    }

    if ((up.isDown || this.wasd.up.isDown) && this.player.body.touching.down) {
      this.player.body.setVelocityY(-450);
    }

    // Cut grass when walking over it
    for (const patch of this.grassPatches) {
      if (patch.cut) continue;
      const dist = Math.abs(this.player.x - patch.x);
      if (dist < 40) {
        patch.cut = true;
        patch.obj.setFillStyle(0x90ee90);
        patch.obj.setAlpha(0.5);
        this.grassCut++;
        this.grassText.setText(`Grass cut: ${this.grassCut}/${this.totalGrass}`);
      }
    }

    // End of level
    const pipeDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.pipe.x, this.pipe.y);
    if (pipeDist < 60 && !this.levelComplete) {
      this.levelComplete = true;
      const isElectric = this.chosenTool === 'electric';
      if (isElectric) this.plants++;

      this.plantText.setText(`Plants: ${this.plants}/3`);

      this.showPopup(
        isElectric ? 'Plant Earned! (' + this.plants + '/3)' : 'No Plant Earned',
        isElectric
          ? 'Great choice! Gas-powered lawn mowers lack the catalytic converters and emission controls that cars have. A single gas mower running for one hour emits as much pollution as driving a car for 100 miles. Electric mowers produce zero direct emissions!'
          : 'Gas-powered lawn mowers have NO emission filtration systems unlike cars. One hour of gas mowing equals 100 miles of car emissions. They release volatile organic compounds, carbon monoxide, and nitrogen oxides directly into the air. Choose electric next time!',
        isElectric
      );

      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('Level3Scene', { plants: this.plants });
      });
    }
  }
}
