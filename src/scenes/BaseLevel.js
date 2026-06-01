import Phaser from 'phaser';
import GameState from '../systems/GameState.js';
import PlayerController from '../systems/PlayerController.js';
import PopupManager from '../systems/PopupManager.js';
import HUD from '../systems/HUD.js';
import ContrastEngine from '../systems/ContrastEngine.js';
import AnimalManager from '../systems/AnimalManager.js';

export class BaseLevel extends Phaser.Scene {
  init(data) {
    // Sync plant score from previous scene or GameState
    if (data && data.plants !== undefined) {
      GameState.plantScore = data.plants;
    }
    this.levelComplete = false;
  }

  create() {
    const config = this.getLevelConfig();
    const { width, height } = this.scale;

    // World bounds
    this.physics.world.setBounds(0, 0, config.worldWidth, height);

    // Parallax background (back.png is 384x240, middle.png is 176x368)
    this.bgBackScale = height / 240;
    this.bgBack = this.add.tileSprite(0, 0, width / this.bgBackScale, 240, 'bg-back')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setScale(this.bgBackScale);

    this.bgMiddleScale = height / 368;
    this.bgMiddle = this.add.tileSprite(0, 0, width / this.bgMiddleScale, 368, 'bg-middle')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setScale(this.bgMiddleScale);

    // Ground using repeated tileset blocks
    this.ground = this.physics.add.staticGroup();
    this._createGround(config.worldWidth, height);

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    if (config.platforms) {
      for (const p of config.platforms) {
        this._createPlatform(p.x, p.y, p.width || 96);
      }
    }

    // Decorative props scattered along the level
    this._createEnvironmentProps(config.worldWidth, height);

    // Player
    this.playerController = new PlayerController();
    const playerSprite = this.playerController.create(this, 100, height - 120);
    this.physics.add.collider(playerSprite, this.ground);
    this.physics.add.collider(playerSprite, this.platforms);

    // HUD
    this.hud = new HUD();
    this.hud.create(this, config.levelName);
    this.hud.updatePlants(GameState.plantScore);

    // Popup manager
    this.popup = new PopupManager();
    this.popup.create(this, this.playerController);

    // Animal manager
    this.animalManager = new AnimalManager();
    this.animalManager.create(this, config.worldWidth);

    // Contrast engine
    this.contrastEngine = new ContrastEngine();
    this.contrastEngine.create(this, this.animalManager);
    this.contrastEngine.setHealth(GameState.environmentalHealth);

    // Power-up fruits
    this.fruits = [];
    if (config.fruitPositions) {
      this._createFruits(config.fruitPositions);
    }

    // End-of-level pipe (door prop)
    this.pipe = this.add.image(config.pipeX, height - 84, 'atlas-props', 'door');
    this.pipe.setScale(3);
    this.physics.add.existing(this.pipe, true);

    // Camera
    this.cameras.main.startFollow(playerSprite, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, config.worldWidth, height);

    // Level-specific content
    this.createLevelContent();
  }

  update() {
    if (this.popup.isActive()) return;

    this.playerController.update();
    this.contrastEngine.update();

    // Parallax scrolling based on camera position (divide by scale since tilePosition is in texture space)
    const camX = this.cameras.main.scrollX;
    if (this.bgBack) this.bgBack.tilePositionX = (camX * 0.1) / this.bgBackScale;
    if (this.bgMiddle) this.bgMiddle.tilePositionX = (camX * 0.3) / this.bgMiddleScale;

    // Fruit collection
    this._checkFruitCollection();

    // Check pipe proximity
    if (!this.levelComplete) {
      const dist = Phaser.Math.Distance.Between(
        this.playerController.sprite.x,
        this.playerController.sprite.y,
        this.pipe.x,
        this.pipe.y
      );
      if (dist < 60) {
        this.onPipeReached();
      }
    }
  }

  // --- Override in subclasses ---
  getLevelConfig() {
    return {
      worldWidth: 2800,
      levelName: 'Level',
      pipeX: 2650,
      platforms: [],
      fruitPositions: [],
      animalCount: 3,
    };
  }

  createLevelContent() {
    // Override in subclasses
  }

  onPipeReached() {
    // Override in subclasses
  }

  // --- Internal helpers ---

  _createGround(worldWidth, sceneHeight) {
    // Create a long ground strip using a colored rectangle + tileset texture on top
    const groundY = sceneHeight - 40;
    const groundRect = this.add.rectangle(worldWidth / 2, groundY + 20, worldWidth, 80, 0x6a9e3a);
    this.physics.add.existing(groundRect, true);
    this.ground.add(groundRect);

    // Tile the top of the ground with atlas blocks for visual detail
    const blockSize = 16 * 3; // scaled 3x
    for (let x = 0; x < worldWidth; x += blockSize) {
      const tile = this.add.image(x + blockSize / 2, groundY - blockSize / 2 + 20, 'atlas-props', 'block');
      tile.setScale(3);
    }
  }

  _createPlatform(x, y, platformWidth) {
    // Use the platform-long prop (32x16 native, scaled 3x = 96x48)
    const segmentWidth = 32 * 3;
    const segments = Math.max(1, Math.round(platformWidth / segmentWidth));
    const totalWidth = segments * segmentWidth;
    const startX = x - totalWidth / 2 + segmentWidth / 2;

    for (let i = 0; i < segments; i++) {
      const px = startX + i * segmentWidth;
      const img = this.add.image(px, y, 'atlas-props', 'platform-long');
      img.setScale(3);
    }

    // Single physics body for the whole platform
    const plat = this.add.rectangle(x, y, totalWidth, 16 * 3, 0x000000, 0);
    this.platforms.add(plat);
    plat.body.updateFromGameObject();
  }

  _createEnvironmentProps(worldWidth, sceneHeight) {
    const groundY = sceneHeight - 60;
    const propTypes = ['tree', 'bush', 'shrooms', 'rock'];

    for (let x = 200; x < worldWidth - 200; x += Phaser.Math.Between(180, 350)) {
      const type = Phaser.Math.RND.pick(propTypes);
      const img = this.add.image(x, groundY, 'atlas-props', type);
      img.setScale(3);
      img.setOrigin(0.5, 1);
      img.setDepth(1);
    }
  }

  _createFruits(positions) {
    const fruitKeys = ['fruit-apple', 'fruit-strawberry', 'fruit-orange', 'fruit-cherries'];

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const key = fruitKeys[i % fruitKeys.length];
      const fruit = this.physics.add.sprite(pos.x, pos.y, key, 0);
      fruit.setScale(1.5);
      fruit.body.setAllowGravity(false);
      fruit.body.setImmovable(true);
      fruit.play(`${key}-spin`);

      // Gentle bobbing
      this.tweens.add({
        targets: fruit,
        y: fruit.y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.fruits.push({ sprite: fruit, collected: false });
    }
  }

  _checkFruitCollection() {
    for (const f of this.fruits) {
      if (f.collected) continue;
      const dist = Phaser.Math.Distance.Between(
        this.playerController.sprite.x,
        this.playerController.sprite.y,
        f.sprite.x,
        f.sprite.y
      );
      if (dist < 40) {
        f.collected = true;

        // Play collect animation
        const fx = this.add.sprite(f.sprite.x, f.sprite.y, 'fruit-collected', 0);
        fx.setScale(1.5);
        fx.play('fruit-collect-fx');
        fx.once('animationcomplete', () => fx.destroy());

        f.sprite.destroy();

        // Speed boost
        this.playerController.setSpeedBoost(3000);
      }
    }
  }
}
