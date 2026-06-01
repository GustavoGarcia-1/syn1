import Phaser from 'phaser';

export class Level3Scene extends Phaser.Scene {
  constructor() {
    super('Level3Scene');
  }

  init(data) {
    this.plants = data.plants || 0;
    this.cashLeft = 5;
    this.correctDeposits = 0;
    this.totalBanks = 5;
    this.depositsMade = 0;
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#87CEEB');

    // Ground
    const ground = this.add.rectangle(0, height - 40, width * 5, 80, 0x4a8c3f);
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
    this.createPlatform(800, height - 180, 100, 20);
    this.createPlatform(1300, height - 160, 100, 20);
    this.createPlatform(1800, height - 140, 100, 20);
    this.createPlatform(2300, height - 180, 100, 20);
    this.physics.add.collider(this.player, this.platforms);

    // Trees
    for (let x = 200; x < 3000; x += 300) {
      this.add.rectangle(x, height - 100, 16, 60, 0x8B4513);
      this.add.circle(x, height - 145, 30, 0x228B22);
    }

    // Bank choice points - 5 deposits of $1 each
    this.bankPoints = [];
    const bankPositions = [500, 1000, 1500, 2000, 2500];
    for (let i = 0; i < bankPositions.length; i++) {
      const bx = bankPositions[i];

      // Big bank (left option)
      const bigBank = this.add.rectangle(bx - 50, height - 90, 50, 60, 0x8b0000);
      const bigLabel = this.add.text(bx - 50, height - 130, 'Big Bank', {
        fontSize: '11px', fontFamily: 'Arial', color: '#cc0000', fontStyle: 'bold',
      }).setOrigin(0.5);

      // Credit union (right option)
      const creditUnion = this.add.rectangle(bx + 50, height - 90, 50, 60, 0x228b22);
      const cuLabel = this.add.text(bx + 50, height - 130, 'Green CU', {
        fontSize: '11px', fontFamily: 'Arial', color: '#228b22', fontStyle: 'bold',
      }).setOrigin(0.5);

      const prompt = this.add.text(bx, height - 160, '$1 - [E] Big Bank / [R] Credit Union', {
        fontSize: '11px', fontFamily: 'Arial', color: '#333',
      }).setOrigin(0.5).setVisible(false);

      this.bankPoints.push({
        x: bx, bigBank, creditUnion, bigLabel, cuLabel, prompt,
        decided: false,
      });
    }

    // Pipe at end
    this.pipe = this.add.rectangle(2800, height - 100, 50, 80, 0x228b22);
    this.add.rectangle(2800, height - 130, 60, 20, 0x1a6b1a);
    this.physics.add.existing(this.pipe, true);

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 3000, height);
    this.physics.world.setBounds(0, 0, 3000, height);

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

    this.levelText = this.add.text(16, 50, 'Level 3: Banking Choices', {
      fontSize: '16px', fontFamily: 'Arial', color: '#2d5a27',
      backgroundColor: '#ffffffcc', padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    this.cashText = this.add.text(16, 84, `Cash: $${this.cashLeft}`, {
      fontSize: '14px', fontFamily: 'Arial', color: '#555',
      backgroundColor: '#ffffffcc', padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    this.depositText = this.add.text(16, 114, `Green deposits: ${this.correctDeposits}/${this.totalBanks}`, {
      fontSize: '14px', fontFamily: 'Arial', color: '#555',
      backgroundColor: '#ffffffcc', padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    // Popup
    this.popupGroup = this.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(200).setVisible(false);
    this.popupActive = false;
    this.levelComplete = false;
  }

  createPlatform(x, y, w, h) {
    const plat = this.add.rectangle(x, y, w, h, 0x8B6914);
    this.platforms.add(plat);
    plat.body.updateFromGameObject();
  }

  showPopup(title, body, isGood) {
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
    if (this.popupActive) return;

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

    // Bank interactions
    for (const bp of this.bankPoints) {
      if (bp.decided) continue;
      const dist = Math.abs(this.player.x - bp.x);
      if (dist < 80) {
        bp.prompt.setVisible(true);

        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('E'))) {
          bp.decided = true;
          bp.prompt.setVisible(false);
          bp.bigBank.setFillStyle(0x666666);
          this.cashLeft--;
          this.depositsMade++;
          this.cashText.setText(`Cash: $${this.cashLeft}`);
        }

        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('R'))) {
          bp.decided = true;
          bp.prompt.setVisible(false);
          bp.creditUnion.setFillStyle(0x00ff00);
          this.correctDeposits++;
          this.cashLeft--;
          this.depositsMade++;
          this.cashText.setText(`Cash: $${this.cashLeft}`);
          this.depositText.setText(`Green deposits: ${this.correctDeposits}/${this.totalBanks}`);
        }
      } else {
        bp.prompt.setVisible(false);
      }
    }

    // End of level
    const pipeDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.pipe.x, this.pipe.y);
    if (pipeDist < 60 && !this.levelComplete) {
      this.levelComplete = true;
      const allGreen = this.correctDeposits === this.totalBanks;
      if (allGreen) this.plants++;

      this.plantText.setText(`Plants: ${this.plants}/3`);

      this.showPopup(
        allGreen ? 'Plant Earned! (' + this.plants + '/3)' : 'No Plant Earned',
        allGreen
          ? 'You chose green credit unions every time! The world\'s largest banks funnel trillions of dollars into fossil fuel expansion. Since the Paris Agreement, major banks have poured over $5.5 trillion into fossil fuels. Credit unions and green banks invest in communities and sustainable projects instead.'
          : 'Big banks are among the largest funders of fossil fuel expansion. Since 2016, the top 60 banks have funneled over $5.5 trillion into coal, oil, and gas projects. Moving your money to a credit union or green bank is one of the most impactful financial decisions you can make.',
        allGreen
      );

      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('EndScene', { plants: this.plants });
      });
    }
  }
}
