export default class HUD {
  constructor() {
    this.scene = null;
    this.plantText = null;
    this.levelText = null;
    this.trackers = {};
  }

  create(scene, levelName) {
    this.scene = scene;

    this.plantText = scene.add.text(16, 16, 'Plants: 0/3', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#2d5a27',
      backgroundColor: '#ffffffcc',
      padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    this.levelText = scene.add.text(16, 50, levelName, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#2d5a27',
      backgroundColor: '#ffffffcc',
      padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    this._nextY = 84;
  }

  updatePlants(count) {
    this.plantText.setText(`Plants: ${count}/3`);
  }

  addTracker(label, key) {
    const text = this.scene.add.text(16, this._nextY, label, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#555',
      backgroundColor: '#ffffffcc',
      padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    this.trackers[key] = text;
    this._nextY += 34;
  }

  updateTracker(key, text) {
    if (this.trackers[key]) {
      this.trackers[key].setText(text);
    }
  }
}
