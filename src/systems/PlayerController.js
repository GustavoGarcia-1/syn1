import Phaser from 'phaser';

export default class PlayerController {
  constructor() {
    this.sprite = null;
    this.cursors = null;
    this.wasd = null;
    this.speed = 200;
    this.jumpVelocity = -450;
    this.frozen = false;
    this._speedBoostTimer = null;
  }

  create(scene, x, y) {
    this.scene = scene;

    // Create player sprite from atlas
    this.sprite = scene.physics.add.sprite(x, y, 'atlas', 'player/idle/player-idle-1');
    this.sprite.setScale(2);
    this.sprite.body.setSize(20, 28);
    this.sprite.body.setOffset(7, 4);
    this.sprite.setCollideWorldBounds(false);

    // Animations
    scene.anims.create({
      key: 'player-idle',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'player/idle/player-idle-',
        start: 1,
        end: 4,
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'player-run',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'player/run/player-run-',
        start: 1,
        end: 6,
      }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: 'player-jump',
      frames: [{ key: 'atlas', frame: 'player/jump/player-jump-1' }],
      frameRate: 1,
    });

    scene.anims.create({
      key: 'player-fall',
      frames: [{ key: 'atlas', frame: 'player/jump/player-jump-2' }],
      frameRate: 1,
    });

    scene.anims.create({
      key: 'player-crouch',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'player/crouch/player-crouch-',
        start: 1,
        end: 2,
      }),
      frameRate: 4,
      repeat: -1,
    });

    scene.anims.create({
      key: 'player-hurt',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'player/hurt/player-hurt-',
        start: 1,
        end: 2,
      }),
      frameRate: 6,
      repeat: 0,
    });

    // Input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      down: Phaser.Input.Keyboard.KeyCodes.S,
    });

    this.sprite.play('player-idle');

    return this.sprite;
  }

  update() {
    if (this.frozen || !this.sprite || !this.sprite.body) return;

    const { left, right, up, down } = this.cursors;
    const onGround = this.sprite.body.blocked.down || this.sprite.body.touching.down;

    // Horizontal movement
    if (left.isDown || this.wasd.left.isDown) {
      this.sprite.body.setVelocityX(-this.speed);
      this.sprite.setFlipX(true);
    } else if (right.isDown || this.wasd.right.isDown) {
      this.sprite.body.setVelocityX(this.speed);
      this.sprite.setFlipX(false);
    } else {
      this.sprite.body.setVelocityX(0);
    }

    // Jump
    if ((up.isDown || this.wasd.up.isDown) && onGround) {
      this.sprite.body.setVelocityY(this.jumpVelocity);
    }

    // Animations
    if (!onGround) {
      if (this.sprite.body.velocity.y < 0) {
        this.sprite.play('player-jump', true);
      } else {
        this.sprite.play('player-fall', true);
      }
    } else if (down.isDown || this.wasd.down?.isDown) {
      this.sprite.play('player-crouch', true);
    } else if (this.sprite.body.velocity.x !== 0) {
      this.sprite.play('player-run', true);
    } else {
      this.sprite.play('player-idle', true);
    }
  }

  setSpeedBoost(duration) {
    this.speed = 350;
    this.sprite.setTint(0xffff00);

    if (this._speedBoostTimer) {
      this._speedBoostTimer.remove();
    }

    this._speedBoostTimer = this.scene.time.delayedCall(duration, () => {
      this.speed = 200;
      this.sprite.clearTint();
      this._speedBoostTimer = null;
    });
  }

  freeze() {
    this.frozen = true;
    if (this.sprite && this.sprite.body) {
      this.sprite.body.setVelocity(0, 0);
    }
  }

  unfreeze() {
    this.frozen = false;
  }
}
