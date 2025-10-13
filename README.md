# Tic‑Tac‑Toe AI — Minimax vs Alpha‑Beta (Web App)

This is a web-based Tic‑Tac‑Toe application comparing **Minimax** vs **Alpha‑Beta pruning** with live performance metrics.

## Features
- Modes: **Human vs Human**, **Human vs AI**, **AI vs AI (auto‑play)**
- Choose **who goes first**, which **algorithm(s)** to use, and **your side** in Human vs AI
- Live metrics while AI is thinking: **decision time**, **nodes explored**, **pruned nodes**, **pruning efficiency**
- Visual feedback: winning line highlight, disabled cells while AI thinks
- Controls: restart, start/pause auto‑play, speed slider for AI vs AI

## Tech
- React + Vite
- No Tailwind required (custom CSS in `src/styles.css`).

## Run locally
```bash
npm install
npm run dev
```
Open the printed local URL (usually http://localhost:5173).

## Build
```bash
npm run build
npm run preview
```

## Project structure
```
.
├─ index.html
├─ package.json
└─ src
   ├─ App.jsx
   ├─ main.jsx
   └─ styles.css
```

## Algorithm notes
- Evaluation function: **+10** for AI win, **−10** for opponent win, **0** for draw.
- Both **Minimax** and **Alpha‑Beta** share the same evaluation and branching; alpha‑beta prunes explored children when `beta <= alpha`.
- Metrics are collected per decision and accumulated across the whole game.
