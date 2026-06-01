import Phaser from 'phaser';

export class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  init(data) {
    this.plants = data.plants || 0;
  }

  create() {
    const { width, height } = this.scale;
    const won = this.plants === 3;

    this.cameras.main.setBackgroundColor(won ? '#87CEEB' : '#4a4a4a');

    if (won) {
      // Victory screen
      this.add.text(width / 2, 80, 'You Did It!', {
        fontSize: '52px', fontFamily: 'Georgia, serif', color: '#2d5a27', fontStyle: 'bold',
      }).setOrigin(0.5);

      // Plant display
      for (let i = 0; i < 3; i++) {
        const px = width / 2 - 80 + i * 80;
        // Stem
        this.add.rectangle(px, 200, 6, 40, 0x228B22);
        // Flower
        this.add.circle(px, 175, 18, Phaser.Math.RND.pick([0xff69b4, 0xffff00, 0xff6347]));
        // Leaves
        this.add.ellipse(px - 12, 200, 16, 8, 0x32CD32);
        this.add.ellipse(px + 12, 205, 16, 8, 0x32CD32);
      }

      // Crown
      this.add.text(width / 2, 140, '\u2654', {
        fontSize: '48px',
      }).setOrigin(0.5);

      this.add.text(width / 2, 280, 'Congratulations! You made all the right decisions.', {
        fontSize: '20px', fontFamily: 'Georgia, serif', color: '#2d5a27',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.add.text(width / 2, 380, [
        'By rejecting corporate seed monopolies, you preserved biodiversity.',
        'By choosing electric over gas, you cut harmful emissions.',
        'By banking green, you defunded fossil fuel expansion.',
        '',
        'With these 3 plants, you\'ve done your part to keep',
        'people fed, ecosystems healthy, and the planet thriving.',
        '',
        'Small choices add up. Every decision matters.',
      ].join('\n'), {
        fontSize: '15px', fontFamily: 'Arial', color: '#3a5a34',
        align: 'center', lineSpacing: 6,
      }).setOrigin(0.5);

    } else {
      // Not all plants earned
      this.add.text(width / 2, 100, 'Game Over', {
        fontSize: '48px', fontFamily: 'Georgia, serif', color: '#cc4444', fontStyle: 'bold',
      }).setOrigin(0.5);

      this.add.text(width / 2, 170, `Plants collected: ${this.plants}/3`, {
        fontSize: '28px', fontFamily: 'Arial', color: '#ffffff',
      }).setOrigin(0.5);

      this.add.text(width / 2, 280, [
        'You didn\'t make all the right choices this time.',
        '',
        'The environment needs every decision to count.',
        'From the seeds we plant, to the tools we use,',
        'to where we put our money \u2014 it all matters.',
        '',
        'Try again and make every choice count!',
      ].join('\n'), {
        fontSize: '16px', fontFamily: 'Arial', color: '#cccccc',
        align: 'center', lineSpacing: 6,
      }).setOrigin(0.5);
    }

    // Play again button
    const replayBtn = this.add.text(width / 2, height - 80, 'PLAY AGAIN', {
      fontSize: '28px', fontFamily: 'Arial', color: '#ffffff',
      backgroundColor: '#2d5a27', padding: { x: 25, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    replayBtn.on('pointerover', () => replayBtn.setStyle({ backgroundColor: '#3a7a34' }));
    replayBtn.on('pointerout', () => replayBtn.setStyle({ backgroundColor: '#2d5a27' }));
    replayBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
