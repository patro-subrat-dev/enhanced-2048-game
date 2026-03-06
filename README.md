# 🎮 Enhanced 2048 Game

A feature-rich implementation of the classic 2048 puzzle game with smooth animations, sound effects, achievements, and multiple difficulty modes.

## ✨ Features

### 🎯 Core Gameplay
- **Classic 2048 mechanics** - Swipe tiles to merge and reach 2048
- **Smooth animations** - Fluid tile movements and transitions
- **Responsive design** - Works perfectly on desktop and mobile devices
- **Score tracking** - Current score and best score persistence

### 🎨 Visual Effects
- **Particle explosions** - Colorful particles burst when tiles merge
- **Score popups** - Animated score increases with visual feedback
- **Enhanced tile animations** - Improved spawn and merge effects
- **Visual combos** - Glowing effects for consecutive merges

### 🔊 Sound System
- **Dynamic sound effects** - Generated using Web Audio API
- **Unique sounds** - Different tones for moves, merges, wins, and losses
- **Mute/unmute toggle** - Full audio control with visual feedback
- **Melodic sequences** - Pleasant win/lose sound melodies

### 🏆 Advanced Features
- **Undo functionality** - Undo up to 10 previous moves (Ctrl+Z)
- **Multiple difficulty modes**:
  - **Normal**: 2 starting tiles
  - **Hard**: 3 starting tiles
  - **Extreme**: 4 starting tiles
- **Combo system** - Chain merges quickly for score bonuses
- **Achievement system** - 7 unlockable achievements with persistent progress

### 🎖️ Achievements
- **First Win** - Win your first game
- **Scorer** - Reach 1,000 points
- **High Scorer** - Reach 5,000 points
- **Master Scorer** - Reach 10,000 points
- **Combo Master** - Achieve 5x combo
- **Combo Legend** - Achieve 10x combo
- **Perfect Run** - Win without using undo

## 🎮 How to Play

### Controls
- **Arrow Keys** - Move tiles in four directions
- **Ctrl+Z** - Undo last move
- **Undo Button** - Click to undo moves
- **Difficulty Selector** - Choose difficulty level
- **Sound Toggle** - Mute/unmute game sounds
- **New Game Button** - Restart the game

### Gameplay Rules
1. Use arrow keys to move tiles in any direction
2. When two tiles with the same number touch, they merge into one
3. After each move, a new tile randomly appears (90% chance of 2, 10% chance of 4)
4. Create a tile with 2048 to win the game
5. The game ends when you can't make any more moves

### Combo System
- **Chain merges quickly** (within 2 seconds) to build combos
- **Higher combos** = **Higher score multipliers**
- **Combo bonus** increases every 3 consecutive merges
- **Visual feedback** shows current combo level

## 🚀 Quick Start

### Online Play
1. Visit the live demo: [GitHub Pages Demo](https://patro-subrat-dev.github.io/enhanced-2048-game/)
2. Use arrow keys to start playing immediately

### Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/patro-subrat-dev/enhanced-2048-game.git
   cd enhanced-2048-game
   ```

2. **Open in browser**:
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Or using Node.js
   npx http-server -p 8080
   
   # Or simply open index.html in your browser
   ```

3. **Navigate to** `http://localhost:8080`

## 🛠️ Technical Details

### Technologies Used
- **HTML5** - Semantic structure and game layout
- **CSS3** - Animations, transitions, and responsive design
- **Vanilla JavaScript** - Game logic and interactions
- **Web Audio API** - Dynamic sound generation
- **LocalStorage** - Score and achievement persistence

### Key Features Implementation
- **Object-oriented design** with ES6 classes
- **Event-driven architecture** for user interactions
- **State management** for game history and undo functionality
- **Modular sound system** with tone generation
- **Particle system** for visual effects
- **Achievement tracking** with persistent storage

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Android Chrome)

## 📁 Project Structure

```
enhanced-2048-game/
├── index.html          # Main HTML structure
├── style.css           # CSS styles and animations
├── script.js           # Game logic and features
└── README.md           # This file
```

## 🎯 Game Strategy Tips

### Beginner Tips
1. **Corner strategy** - Keep your highest tile in a corner
2. **Build chains** - Create descending tile sequences
3. **Plan ahead** - Think 2-3 moves in advance
4. **Don't rush** - Take time to consider each move

### Advanced Techniques
1. **Combo building** - Set up multiple merge opportunities
2. **Tile management** - Balance tile distribution across the board
3. **Undo strategically** - Use undo to recover from mistakes
4. **Difficulty progression** - Start with Normal, then try Hard/Extreme

## 🌟 Features Showcase

### Visual Effects
- Smooth tile movements with CSS transitions
- Particle explosions on tile merges
- Animated score popups
- Achievement unlock animations
- Combo glow effects

### Audio Experience
- Procedurally generated sound effects
- Different tones for various game events
- Melodic win/lose sequences
- Volume control with visual feedback

### User Experience
- Intuitive controls with keyboard shortcuts
- Visual feedback for all interactions
- Persistent progress across sessions
- Mobile-responsive design
- Accessibility considerations

## 🔮 Future Enhancements

### Planned Features
- [ ] **Leaderboards** - Global and friends leaderboards
- [ ] **Themes** - Multiple visual themes and color schemes
- [ ] **Statistics** - Detailed game statistics and analytics
- [ ] **Time attack mode** - Race against the clock
- [ ] **Custom board sizes** - 3x3, 5x5, 6x6 boards
- [ ] **Power-ups** - Special abilities and bonuses
- [ ] **Multiplayer** - Real-time multiplayer mode

### Potential Improvements
- [ ] **Touch gestures** - Swipe controls for mobile
- [ ] **Keyboard shortcuts** - Additional hotkeys
- [ ] **Save/Load games** - Continue later functionality
- [ ] **Tutorial mode** - Interactive gameplay tutorial
- [ ] **Sound customization** - Custom sound packs

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Bug Reports
1. Check existing issues first
2. Provide detailed reproduction steps
3. Include browser and device information
4. Add screenshots if applicable

### Feature Requests
1. Describe the feature clearly
2. Explain the use case
3. Consider implementation complexity
4. Discuss potential alternatives

### Code Contributions
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Update documentation as needed

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Original 2048** - Created by Gabriele Cirulli
- **Web Audio API** - For dynamic sound generation
- **CSS Animations** - For smooth visual effects
- **Open Source Community** - For inspiration and feedback

## 📞 Contact

- **GitHub**: [@patro-subrat-dev](https://github.com/patro-subrat-dev)
- **Live Demo**: [Enhanced 2048 Game](https://patro-subrat-dev.github.io/enhanced-2048-game/)

---

**Enjoy playing the Enhanced 2048 Game! 🎮✨**

Made with ❤️ and lots of JavaScript magic!
