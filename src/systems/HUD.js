export default class HUD {
  constructor() {
    this.scene = null;
    this.plantText = null;
    this.levelText = null;
    this.trackers = {};
  }

  create(scene, levelName) {
    this.scene = scene;

    // Semi-transparent dark panel behind HUD
    this.panel = scene.add.rectangle(0, 0, 260, 0, 0x000000, 0.45)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(99);

    this.plantText = scene.add.text(16, 12, '\u{1F331} Plants: 0 / 3', {
      fontSize: '20px',
      fontFamily: 'Cambria, Georgia, serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(100);

    this.levelText = scene.add.text(16, 40, levelName, {
      fontSize: '15px',
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      color: '#ddeedd',
    }).setScrollFactor(0).setDepth(100);

    this._nextY = 66;
    this._updatePanel();
  }

  updatePlants(count) {
    this.plantText.setText(`\u{1F331} Plants: ${count} / 3`);
  }

  addTracker(label, key) {
    const text = this.scene.add.text(16, this._nextY, label, {
      fontSize: '13px',
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      color: '#ccddcc',
    }).setScrollFactor(0).setDepth(100);

    this.trackers[key] = text;
    this._nextY += 22;
    this._updatePanel();
  }

  updateTracker(key, text) {
    if (this.trackers[key]) {
      this.trackers[key].setText(text);
    }
  }

  _updatePanel() {
    if (this.panel) {
      this.panel.height = this._nextY + 8;
    }
  }
}
