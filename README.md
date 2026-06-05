# Engineering Demonstrations Hub

An interactive, premium portfolio hub built with **Next.js 16 (App Router)** and **Tailwind CSS**. This hub aggregates six distinct engineering projects demonstrating advanced web software development concepts, including state management, 3D vector math, custom AI game engines, responsive SVG charts, API caching layers, and high-frequency telemetry simulation.

---

## 🛠️ Tech Stack & Key Concepts
*   **Framework**: Next.js 16 (App Router, Server Actions, API Routes).
*   **Styling**: Tailwind CSS configured for a dark-themed SCADA/Bloomberg-inspired dashboard.
*   **State Management**: Zustand (for high-frequency event synchronization) and React hooks (`useReducer`/`useState`).
*   **3D Graphics**: Three.js + React Three Fiber + Drei (for client-side WebGL scene assembly).
*   **Chess Rule Engine**: `chess.js` (for en passant, castling, promotion, checkmate validation).
*   **Heuristics & Search**: Custom Minimax algorithm with Alpha-Beta pruning, evaluation scores, and Piece-Square Tables (PST).

---

## 🚀 Projects Included

### 1. ♟️ Chess AI Simulator
A fully responsive chess environment that lets you play against an adjustable bot or watch two bots battle in an automated simulation loop.
*   **Custom AI**: A local Minimax search engine with Alpha-Beta pruning, positional scoring matrices (Piece-Square Tables), and dynamic tie-breaking random jitter.
*   **Repetition Control**: Employs normalized FEN history checking during the search tree traversal to apply a $-300\text{ centipawn}$ penalty to previously visited board states, preventing stalemate loops.
*   **Operator Dashboard**: Renders a vertical **Advantage Evaluation Bar** showing real-time position evaluation, captured material feeds, and a standard algebraic notation (SAN) move ledger.

### 2. 🎛️ SCADA Digital Twin
A 3D industrial mixing vessel simulation representing industrial SCADA and HMI processes.
*   **3D Viewport**: Rendered client-side using React Three Fiber. Animates fluid levels, valve states, and pipe flow particles dynamically.
*   **Physics Simulator**: Simulates high-frequency updates (500ms stream) of system pressure, liquid level, and temperature.
*   **Safety Interlocks**: Employs interlocks (e.g., dry-run protection to turn off pumps when Vessel A is empty; deadheading protection that triggers rapid pressure spikes when pumps run against a closed valve).

### 3. 📉 Market Time Machine
A gamified stock market simulator where you analyze Week-of news headlines and 30-day graphs to predict if a stock went UP or DOWN.
*   **Custom SVG Charting**: Responsive charting built from scratch without bulky libraries to ensure React 19 / Next 16 compatibility.
*   **Timeline Reveal**: Animates future T+1 to T+5 days of data into view using SVG `stroke-dashoffset` transitions.
*   **Identity Reveal**: Discloses company info, percentage returns, and background context. Tracks streaks and high scores in `localStorage`, issuing a performance report card upon completing all scenarios.

### 4. 📺 YouTube Feed Aggregator
A custom RSS aggregator designed to group channel uploads into custom-named categories.
*   **Zero Frontend Exposure**: Server-side proxy API routes to completely mask developer API keys from browser components.
*   **Quota Optimization**: In-memory server caching with a 15-minute Time-to-Live (TTL) window to guard against the 10k unit Daily YouTube quota limit.
*   **Asynchronous Concurrency**: Pulls content resolution requests concurrently using `Promise.allSettled` for resiliency.

### 5. 📊 Sorting Visualizer
A 60FPS real-time visualization of classical sorting algorithms.
*   **Algorithms**: Bubble, Selection, Insertion, Merge, Quick, and Bogo Sort.
*   **Engine**: Built using **TypeScript Generators** (`function*` / `yield`) to pause execution states dynamically, rendering comparative steps without lag.
*   **Audio Synthesis**: Employs Web Audio API synth oscillators to generate frequencies relative to active values.

### 6. ⚔️ Rock Paper Scissors 3D
A boundary-constrained predator-prey entity physics simulation.
*   **Sim Mechanics**: Entities chase prey and flee predators (Rock chases Scissors, Scissors chases Paper, Paper chases Rock) within 2D/3D boxes.
*   **Mathematical Models**: Uses vector magnitude calculations for distance detection and target selection.

---

## 💻 Getting Started

### Prerequisites
*   Node.js 18+ or 20+

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/repo-name.git
   cd repo-name
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by creating a `.env.local` file:
   ```env
   YOUTUBE_API_KEY=your_actual_youtube_data_api_v3_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build & Deploy
Verify production builds before deploying:
```bash
npm run build
```
This project is configured for **Vercel** deployment. Connecting your Git branch will trigger automated preview deployments on every push.
