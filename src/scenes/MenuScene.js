import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#87CEEB');

    this.add.text(width / 2, height / 3, 'EcoQuest', {
      fontSize: '64px',
      fontFamily: 'Georgia, serif',
      color: '#2d5a27',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 3 + 60, 'Make the right choices. Save the planet.', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      color: '#3a7a34',
    }).setOrigin(0.5);

    const playButton = this.add.text(width / 2, height / 2 + 40, 'PLAY GAME', {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#2d5a27',
      padding: { x: 30, y: 15 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playButton.on('pointerover', () => playButton.setStyle({ backgroundColor: '#3a7a34' }));
    playButton.on('pointerout', () => playButton.setStyle({ backgroundColor: '#2d5a27' }));
    playButton.on('pointerdown', () => {
      this.scene.start('Level1Scene');
    });

    // Plant counter info
    this.add.text(width / 2, height - 80, 'Collect 3 plants by making eco-friendly choices!', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#2d5a27',
    }).setOrigin(0.5);
  }
}
