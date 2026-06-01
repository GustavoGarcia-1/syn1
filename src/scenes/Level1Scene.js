import Phaser from 'phaser';

export class Level1Scene extends Phaser.Scene {
  constructor() {
    super('Level1Scene');
  }

  init() {
    this.plants = 0;
    this.decisionMade = false;
    this.corporationsRejected = 0;
    this.totalCorporations = 3;
  }

  create() {
    const { width, height } = this.scale;

    // Sky background
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Ground
    const ground = this.add.rectangle(0, height - 40, width * 4, 80, 0x4a8c3f);
    this.physics.add.existing(ground, true);
    ground.body.setOffset(-width * 2, 0);

    // Decorative elements - trees, flowers
    this.createEnvironment();

    // Player
    this.player = this.add.rectangle(100, height - 100, 32, 48, 0x3366cc);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(false);
    this.physics.add.collider(this.player, ground);

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    this.createPlatform(300, height - 140, 120, 20);
    this.createPlatform(500, height - 200, 120, 20);
    this.createPlatform(900, height - 160, 120, 20);
    this.createPlatform(1200, height - 180, 120, 20);
    this.createPlatform(1600, height - 140, 120, 20);
    this.createPlatform(2000, height - 200, 120, 20);

    this.physics.add.collider(this.player, this.platforms);

    // Corporation NPCs - placed along the level
    this.corporations = [];
    this.createCorporation(600, height - 100, 'MegaSeed Corp');
    this.createCorporation(1400, height - 100, 'MonoCrop Inc');
    this.createCorporation(2200, height - 100, 'AgriGiant Co');

    // Camera follow
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 2800, height);
    this.physics.world.setBounds(0, 0, 2800, height);

    // Pipe at end
    this.pipe = this.add.rectangle(2650, height - 100, 50, 80, 0x228b22);
    this.add.rectangle(2650, height - 130, 60, 20, 0x1a6b1a);
    this.physics.add.existing(this.pipe, true);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // HUD (fixed to camera)
    this.plantText = this.add.text(16, 16, 'Plants: 0/3', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#2d5a27',
      backgroundColor: '#ffffffcc',
      padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    this.levelText = this.add.text(16, 50, 'Level 1: Seed Corporations', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#2d5a27',
      backgroundColor: '#ffffffcc',
      padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    this.rejectText = this.add.text(16, 84, `Corporations rejected: ${this.corporationsRejected}/${this.totalCorporations}`, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#555',
      backgroundColor: '#ffffffcc',
      padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    // Popup container (hidden initially)
    this.popupGroup = this.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(200).setVisible(false);
  }

  createEnvironment() {
    const { height } = this.scale;
    // Trees
    for (let x = 150; x < 2800; x += 250) {
      const trunk = this.add.rectangle(x, height - 100, 16, 60, 0x8B4513);
      const leaves = this.add.circle(x, height - 145, 30, 0x228B22);
    }
    // Flowers
    for (let x = 80; x < 2800; x += 120) {
      this.add.circle(x, height - 55, 6, Phaser.Math.RND.pick([0xff69b4, 0xffff00, 0xff6347, 0x9370db]));
    }
  }

  createPlatform(x, y, w, h) {
    const plat = this.add.rectangle(x, y, w, h, 0x8B6914);
    this.platforms.add(plat);
    plat.body.updateFromGameObject();
  }

  createCorporation(x, y, name) {
    const npc = this.add.rectangle(x, y, 40, 48, 0xcc3333);
    this.physics.add.existing(npc, true);

    const label = this.add.text(x, y - 45, name, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#cc0000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const prompt = this.add.text(x, y - 65, '[E] Accept / [R] Reject', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
    }).setOrigin(0.5).setVisible(false);

    this.corporations.push({ npc, label, prompt, name, decided: false });
  }

  showPopup(title, body, isGood) {
    const { width, height } = this.scale;
    this.popupGroup.removeAll(true);

    const bg = this.add.rectangle(0, 0, 500, 300, isGood ? 0x2d5a27 : 0x8b0000, 0.95);
    bg.setStrokeStyle(3, 0xffffff);

    const titleText = this.add.text(0, -110, title, {
      fontSize: '24px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold', align: 'center',
      wordWrap: { width: 440 },
    }).setOrigin(0.5);

    const bodyText = this.add.text(0, 0, body, {
      fontSize: '14px', fontFamily: 'Arial', color: '#ddd', align: 'center',
      wordWrap: { width: 440 },
    }).setOrigin(0.5);

    const continueText = this.add.text(0, 120, 'Press SPACE to continue', {
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

    // Check proximity to corporations
    for (const corp of this.corporations) {
      if (corp.decided) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, corp.npc.x, corp.npc.y);
      if (dist < 80) {
        corp.prompt.setVisible(true);

        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('E'))) {
          corp.decided = true;
          corp.prompt.setVisible(false);
          corp.npc.setFillStyle(0x666666);
          this.showPopup(
            'You accepted ' + corp.name,
            'By buying from large seed corporations, farmers eliminate biodiversity. Monoculture farming wipes out native plant species and makes ecosystems fragile. The short-term profit isn\'t worth the long-term environmental damage.',
            false
          );
        }

        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('R'))) {
          corp.decided = true;
          corp.prompt.setVisible(false);
          corp.npc.setFillStyle(0x228b22);
          corp.label.setColor('#228b22');
          this.corporationsRejected++;
          this.rejectText.setText(`Corporations rejected: ${this.corporationsRejected}/${this.totalCorporations}`);
          this.showPopup(
            'You rejected ' + corp.name + '!',
            'By supporting local seed diversity, you help preserve thousands of plant varieties that would otherwise go extinct. Diverse crops are more resilient to disease and climate change.',
            true
          );
        }
      } else {
        corp.prompt.setVisible(false);
      }
    }

    // Check pipe (end of level)
    const pipeDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.pipe.x, this.pipe.y);
    if (pipeDist < 60 && !this.levelComplete) {
      this.levelComplete = true;
      const earned = this.corporationsRejected === this.totalCorporations;
      if (earned) this.plants = 1;

      this.showPopup(
        earned ? 'Plant Earned! (1/3)' : 'No Plant Earned',
        earned
          ? 'You rejected all the seed corporations! Biodiversity is preserved. Native plants and niche crops survive because farmers like you choose local seeds over corporate monocultures.'
          : 'You accepted some seed corporations. Monoculture farming has reduced plant biodiversity. Reject all corporations next time to earn the plant!',
        earned
      );

      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('Level2Scene', { plants: this.plants });
      });
    }
  }
}
