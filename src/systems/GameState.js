// Global singleton tracking state across scenes
const GameState = {
  plantScore: 0,
  currentLevel: 1,
  environmentalHealth: 100,
  decisions: {
    level1: null, // 'good' | 'bad' | null
    level2: null,
    level3: null,
  },

  reset() {
    this.plantScore = 0;
    this.currentLevel = 1;
    this.environmentalHealth = 100;
    this.decisions.level1 = null;
    this.decisions.level2 = null;
    this.decisions.level3 = null;
  },
};

export default GameState;
