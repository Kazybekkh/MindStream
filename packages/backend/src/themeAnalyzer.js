/**
 * Theme Analysis Service
 * Implements decaying relevance algorithm for detecting dominant themes
 * in user speech over time.
 */

class ThemeAnalyzer {
  constructor(decayRate = 0.95, threshold = 0.3) {
    this.themes = new Map(); // Map<string, number> - theme -> relevance score
    this.decayRate = decayRate; // How quickly themes decay (0-1)
    this.threshold = threshold; // Minimum score to consider theme relevant
    this.lastUpdate = Date.now();
  }

  /**
   * Update theme scores with new text input
   */
  updateThemes(text) {
    const now = Date.now();
    const timeDelta = (now - this.lastUpdate) / 1000; // seconds

    // Apply decay to existing themes
    this.applyDecay(timeDelta);

    // Extract and boost themes from new text
    const newThemes = this.extractThemes(text);
    for (const [theme, boost] of newThemes.entries()) {
      const currentScore = this.themes.get(theme) || 0;
      this.themes.set(theme, currentScore + boost);
    }

    this.lastUpdate = now;

    // Clean up themes below threshold
    this.pruneThemes();

    return this.getDominantTheme();
  }

  /**
   * Apply exponential decay to all theme scores
   */
  applyDecay(timeDelta) {
    const decayFactor = Math.pow(this.decayRate, timeDelta);
    for (const [theme, score] of this.themes.entries()) {
      this.themes.set(theme, score * decayFactor);
    }
  }

  /**
   * Extract themes from text (simple keyword-based for now)
   * TODO: Integrate NLP or LLM for better theme extraction
   */
  extractThemes(text) {
    const themes = new Map();
    const words = text.toLowerCase().split(/\s+/);

    // Simple keyword categorization
    const themeKeywords = {
      'nature': ['tree', 'forest', 'mountain', 'river', 'ocean', 'sky', 'nature', 'landscape'],
      'technology': ['computer', 'code', 'robot', 'ai', 'digital', 'cyber', 'tech', 'future'],
      'emotion': ['happy', 'sad', 'angry', 'love', 'fear', 'joy', 'excited', 'calm'],
      'abstract': ['dream', 'cosmic', 'surreal', 'abstract', 'infinite', 'void', 'ethereal'],
      'urban': ['city', 'street', 'building', 'urban', 'metro', 'downtown', 'traffic'],
      'fantasy': ['magic', 'dragon', 'wizard', 'fantasy', 'mythical', 'legendary', 'enchanted']
    };

    for (const word of words) {
      for (const [theme, keywords] of Object.entries(themeKeywords)) {
        if (keywords.includes(word)) {
          themes.set(theme, (themes.get(theme) || 0) + 1.0);
        }
      }
    }

    return themes;
  }

  /**
   * Remove themes below threshold
   */
  pruneThemes() {
    for (const [theme, score] of this.themes.entries()) {
      if (score < this.threshold) {
        this.themes.delete(theme);
      }
    }
  }

  /**
   * Get the currently dominant theme
   */
  getDominantTheme() {
    let maxScore = 0;
    let dominantTheme = 'abstract';

    for (const [theme, score] of this.themes.entries()) {
      if (score > maxScore) {
        maxScore = score;
        dominantTheme = theme;
      }
    }

    return {
      theme: dominantTheme,
      score: maxScore,
      allThemes: Object.fromEntries(this.themes)
    };
  }

  /**
   * Generate a visual prompt based on dominant theme
   */
  generatePrompt(dominantTheme) {
    const styleModifiers = {
      'nature': 'lush, organic, natural lighting, photorealistic',
      'technology': 'futuristic, neon, cyberpunk, high-tech',
      'emotion': 'expressive, colorful, emotional, artistic',
      'abstract': 'surreal, dreamlike, ethereal, abstract art',
      'urban': 'gritty, metropolitan, urban landscape, cinematic',
      'fantasy': 'magical, fantastical, mystical, epic fantasy art'
    };

    const basePrompt = 'A dynamic visual representation of';
    const style = styleModifiers[dominantTheme] || 'artistic, creative';
    
    return `${basePrompt} ${dominantTheme}, ${style}, high quality, 4k`;
  }

  reset() {
    this.themes.clear();
    this.lastUpdate = Date.now();
  }
}

export default ThemeAnalyzer;
