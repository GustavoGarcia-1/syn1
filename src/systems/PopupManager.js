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

    const bg = this.scene.add.rectangle(0, 0, 560, 360, isGood ? 0x1b3d1b : 0x4a0e0e, 0.95);
    bg.setStrokeStyle(2, isGood ? 0x66bb66 : 0xcc6666);

    const titleText = this.scene.add.text(0, -140, title, {
      fontSize: '26px',
      fontFamily: 'Cambria, Georgia, serif',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 500 },
    }).setOrigin(0.5);

    const divider = this.scene.add.rectangle(0, -110, 400, 1, isGood ? 0x66bb66 : 0xcc6666);

    const bodyText = this.scene.add.text(0, 10, body, {
      fontSize: '14px',
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      color: '#e0e0e0',
      align: 'center',
      wordWrap: { width: 500 },
      lineSpacing: 4,
    }).setOrigin(0.5);

    const continueText = this.scene.add.text(0, 150, 'Press SPACE to continue', {
      fontSize: '15px',
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      color: '#ffdd66',
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: continueText,
      alpha: 0.4,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.container.add([bg, titleText, divider, bodyText, continueText]);
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
