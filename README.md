# NadRacer Client 🚀

The frontend client for NadRacer - a 3D space racing game with blockchain integration.

## 🎮 Features

- **3D Graphics**: Immersive WebGL-powered racing experience using Three.js and OGL
- **Web3 Authentication**: Privy-powered wallet integration
- **Modern UI**: Beautiful interface built with React 19 and Tailwind CSS
- **Blockchain Integration**: Monad blockchain integration for leaderboards
- **Real-time Racing**: Smooth 3D racing mechanics and controls
- **Audio System**: Dynamic sound effects and background music

## 🛠️ Tech Stack

- **React 19** - Latest React features with concurrent rendering
- **Vite** - Lightning-fast build tool and dev server
- **Three.js** - 3D graphics library
- **OGL** - Lightweight WebGL library
- **Tailwind CSS** - Utility-first CSS framework
- **Privy** - Web3 authentication
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mefury/NadRacerV2-Client.git
   cd NadRacerV2-Client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Visit: http://localhost:5173

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm test         # Run tests
```

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_PRIVY_APP_ID=your_privy_app_id_here
VITE_MONAD_APP_ID=your_monad_app_id_here
VITE_MONAD_USERNAME_API=https://www.monadclip.fun
VITE_LEADERBOARD_GAME_ID=21
VITE_CORS_PROXY_URL=https://api.allorigins.win/raw
VITE_API_KEY=your_api_key_here
VITE_API_BASE_URL= # e.g., https://api.nadracer.com (leave empty to use same-origin)
```

## 🏗️ Build

To build for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🎯 Game Controls

- **Arrow Keys / WASD**: Navigate spaceship
- **Mouse**: Camera control
- **Space**: Boost (if available)

## 📱 Deployment

This client can be deployed to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop `dist/` folder
- **GitHub Pages**: Enable in repository settings
- **Railway**: Connect repository and deploy

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under UNLICENSED.

## 👨‍💻 Author

**MEFURY**

---

**Happy Racing! 🏁**