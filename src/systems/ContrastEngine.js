import Phaser from 'phaser';

export default class ContrastEngine {
  constructor() {
    this.scene = null;
    this.health = 100;
    this.colorMatrix = null;
    this.animalManager = null;
  }

  create(scene, animalManager) {
    this.scene = scene;
    this.animalManager = animalManager;

    // Set up post-processing color matrix on the main camera
    if (scene.cameras.main.postFX) {
      this.colorMatrix = scene.cameras.main.postFX.addColorMatrix();
    }
  }

  setHealth(value) {
    this.health = Phaser.Math.Clamp(value, 0, 100);
    this._updateVisuals();
  }

  onBadChoice() {
    this.health = Math.max(0, this.health - 25);

    // Tween desaturation
    this._updateVisuals(true);

    // Burst of smog particles using manually created circles
    this._emitSmog(15, 0.15);

    // Trigger animal extinction
    if (this.animalManager) {
      this.animalManager.removeAnimals(2);
    }
  }

  onGoodChoice() {
    // Brief green glow pulse
    if (this.scene && this.scene.cameras.main) {
      this.scene.cameras.main.flash(300, 50, 150, 50, false);
    }
  }

  _emitSmog(count, alpha) {
    const { width, height } = this.scene.scale;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(height - 200, height);
      const circle = this.scene.add.circle(x, y, Phaser.Math.Between(6, 14), 0x888888, alpha);
      circle.setScrollFactor(0);
      circle.setDepth(90);

      this.scene.tweens.add({
        targets: circle,
        y: y - Phaser.Math.Between(60, 150),
        alpha: 0,
        scale: 1.5,
        duration: Phaser.Math.Between(2000, 4000),
        ease: 'Sine.easeOut',
        onComplete: () => circle.destroy(),
      });
    }
  }

  _updateVisuals(animate = false) {
    if (!this.colorMatrix) return;

    const desatAmount = (100 - this.health) / 100;

    if (animate) {
      // Animate the desaturation via a proxy object
      const proxy = { val: Math.max(0, desatAmount - 0.25) };
      this.scene.tweens.add({
        targets: proxy,
        val: desatAmount,
        duration: 1000,
        onUpdate: () => {
          this.colorMatrix.reset();
          if (proxy.val > 0) {
            this.colorMatrix.grayscale(proxy.val, false);
          }
        },
      });
    } else {
      this.colorMatrix.reset();
      if (desatAmount > 0) {
        this.colorMatrix.grayscale(desatAmount, false);
      }
    }
  }

  update() {
    // Ongoing smog drift if health is low
    if (this.health < 60) {
      const intensity = (60 - this.health) / 60;
      if (Math.random() < intensity * 0.02) {
        this._emitSmog(1, intensity * 0.1);
      }
    }
  }
}
