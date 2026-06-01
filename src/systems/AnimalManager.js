import Phaser from 'phaser';

export default class AnimalManager {
  constructor() {
    this.scene = null;
    this.animals = [];
  }

  create(scene, worldWidth) {
    this.scene = scene;

    // Eagles in the sky
    const eagleCount = Math.floor(worldWidth / 800);
    for (let i = 0; i < eagleCount; i++) {
      const x = 300 + i * 700 + Phaser.Math.Between(-100, 100);
      const y = Phaser.Math.Between(60, 150);
      const eagle = scene.add.sprite(x, y, 'atlas', 'eagle/eagle-attack-1');
      eagle.setScale(2);
      eagle.play('eagle-fly');

      // Gentle bobbing tween
      scene.tweens.add({
        targets: eagle,
        y: y - 30,
        duration: 2000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Slow horizontal drift
      scene.tweens.add({
        targets: eagle,
        x: eagle.x + 150,
        duration: 4000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.animals.push(eagle);
    }

    // Frogs on the ground
    const frogCount = Math.floor(worldWidth / 600);
    for (let i = 0; i < frogCount; i++) {
      const x = 200 + i * 500 + Phaser.Math.Between(-50, 50);
      const y = scene.scale.height - 76;
      const frog = scene.add.sprite(x, y, 'atlas', 'frog/idle/frog-idle-1');
      frog.setScale(2);
      frog.play('frog-idle');
      this.animals.push(frog);
    }

    // Opossums walking back and forth on the ground
    const opossumCount = Math.floor(worldWidth / 900);
    for (let i = 0; i < opossumCount; i++) {
      const x = 500 + i * 800 + Phaser.Math.Between(-100, 100);
      const y = scene.scale.height - 72;
      const opossum = scene.add.sprite(x, y, 'atlas', 'opossum/opossum-1');
      opossum.setScale(2);
      opossum.play('opossum-walk');

      // Walk back and forth
      scene.tweens.add({
        targets: opossum,
        x: opossum.x + 120,
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Linear',
        onYoyo: () => opossum.setFlipX(true),
        onRepeat: () => opossum.setFlipX(false),
      });

      this.animals.push(opossum);
    }
  }

  removeAnimals(count) {
    let removed = 0;
    for (let i = this.animals.length - 1; i >= 0 && removed < count; i--) {
      const animal = this.animals[i];
      if (animal && animal.active) {
        this.scene.tweens.add({
          targets: animal,
          alpha: 0,
          scale: 0,
          duration: 800,
          ease: 'Power2',
          onComplete: () => animal.destroy(),
        });
        this.animals.splice(i, 1);
        removed++;
      }
    }
  }

  getAnimalCount() {
    return this.animals.filter((a) => a && a.active).length;
  }
}
