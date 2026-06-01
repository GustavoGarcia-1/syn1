export default class PopupManager {
  constructor() {
    this.container = null;
    this.scene = null;
    this.active = false;
    this.playerController = null;
  }

  create(scene, playerController) {
    this.scene = scene;
    this.playerController = playerController;

    const { width, height } = scene.scale;
    this.container = scene.add.container(width / 2, height / 2);
    this.container.setScrollFactor(0);
    this.container.setDepth(200);
    this.container.setVisible(false);
  }

  show(title, body, isGood, onClose) {
    this.container.removeAll(true);

    const bg = this.scene.add.rectangle(0, 0, 520, 320, isGood ? 0x2d5a27 : 0x8b0000, 0.95);
    bg.setStrokeStyle(3, 0xffffff);

    const titleText = this.scene.add.text(0, -120, title, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#fff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 460 },
    }).setOrigin(0.5);

    const bodyText = this.scene.add.text(0, 10, body, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ddd',
      align: 'center',
      wordWrap: { width: 460 },
    }).setOrigin(0.5);

    const continueText = this.scene.add.text(0, 130, 'Press SPACE to continue', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffff00',
    }).setOrigin(0.5);

    // Pulsing continue text
    this.scene.tweens.add({
      targets: continueText,
      alpha: 0.4,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.container.add([bg, titleText, bodyText, continueText]);
    this.container.setVisible(true);
    this.active = true;

    if (this.playerController) {
      this.playerController.freeze();
    }

    this.scene.input.keyboard.once('keydown-SPACE', () => {
      this.hide();
      if (onClose) onClose();
    });
  }

  hide() {
    this.container.setVisible(false);
    this.active = false;
    if (this.playerController) {
      this.playerController.unfreeze();
    }
  }

  isActive() {
    return this.active;
  }
}
