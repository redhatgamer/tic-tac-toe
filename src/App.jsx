import React, { useEffect, useMemo, useRef, useState } from "react";

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function cloneBoard(b){ return [...b]; }
function availableMoves(board){ const m=[]; for(let i=0;i<9;i++) if(!board[i]) m.push(i); return m; }
function checkWinner(board){
  for(const [a,b,c] of LINES){
    if(board[a] && board[a]===board[b] && board[a]===board[c]) return {winner: board[a], line:[a,b,c]};
  }
  if(board.every(Boolean)) return {winner:"Draw", line:[]};
  return {winner:null, line:[]};
}
/* 
 * =================================================================
 * 🎯 MINIMAX ALGORITHM IMPLEMENTATION - TODO FOR YOUR FRIEND
 * =================================================================
 * 
 * STATUS: Alpha-beta is implemented and working! ✅
 * YOUR TASK: Implement the basic minimax algorithm for comparison! 📚
 * 
 * The evaluate() function is complete - it scores positions correctly.
 * The searchBestMove() function works with alpha-beta pruning.
 * 
 * YOUR CHALLENGE: 
 * Create a pure minimax implementation (without alpha-beta pruning)
 * so you can compare the performance difference between the two algorithms!
 */

function evaluate(board, ai, opp){
  const {winner} = checkWinner(board);
  if(winner === ai) return 10;
  if(winner === opp) return -10;
  if(winner === "Draw") return 0;
  return null;
}

const microPause = () => new Promise(r=>setTimeout(r,0));

/* 
 * FUNCTION 2: searchBestMove({board, aiPlayer, oppPlayer, useAlphaBeta, onProgress, yieldEvery})
 * -----------------------------------------------------------------------------------------------
 * Purpose: Find the best move using minimax algorithm with optional alpha-beta pruning
 * 
 * Parameters:
 *   - board: Current board state (array of 9 elements)
 *   - aiPlayer: AI symbol ("X" or "O")
 *   - oppPlayer: Opponent symbol ("X" or "O") 
 *   - useAlphaBeta: Boolean - whether to use alpha-beta pruning for optimization
 *   - onProgress: Callback function for live performance updates
 *   - yieldEvery: How often to yield control for UI updates (default 200)
 * 
 * Must Return: {move: bestMoveIndex, stats: {nodes, pruned, durationMs}}
 * 
 * MINIMAX ALGORITHM PSEUDOCODE:
 * -----------------------------
 * function minimax(board, isMaximizing, alpha, beta):
 *     if game is over:
 *         return evaluation score
 *     
 *     if isMaximizing (AI turn):
 *         bestScore = -infinity
 *         for each available move:
 *             make move on copy of board
 *             score = minimax(newBoard, false, alpha, beta)
 *             bestScore = max(bestScore, score)
 *             
 *             // Alpha-beta pruning (only if useAlphaBeta is true):
 *             alpha = max(alpha, score)
 *             if beta <= alpha:
 *                 break (prune remaining moves, add to stats.pruned)
 *         return bestScore
 *     
 *     else (opponent turn):
 *         bestScore = +infinity
 *         for each available move:
 *             make move on copy of board
 *             score = minimax(newBoard, true, alpha, beta)
 *             bestScore = min(bestScore, score)
 *             
 *             // Alpha-beta pruning (only if useAlphaBeta is true):
 *             beta = min(beta, score)
 *             if beta <= alpha:
 *                 break (prune remaining moves, add to stats.pruned)
 *         return bestScore
 * 
 * IMPLEMENTATION STEPS:
 * ---------------------
 * 1. Create stats object: {nodes: 0, pruned: 0, start: performance.now(), durationMs: 0}
 * 2. Create inner minimax function (can be async for better performance)
 * 3. For each possible move, call minimax and track the best score + move
 * 4. Track performance: increment stats.nodes for each position explored
 * 5. If using alpha-beta pruning, track stats.pruned when cuts occur
 * 6. Call onProgress?.(stats) every yieldEvery iterations for live UI updates
 * 7. Return {move: bestMoveIndex, stats: finalStats}
 * 
 * HELPER FUNCTIONS AVAILABLE:
 * ---------------------------
 * - availableMoves(board) - Returns array of empty square indices [0-8]
 * - cloneBoard(board) - Creates a copy of the board for safe recursion
 * - evaluate(board, aiPlayer, oppPlayer) - Your evaluation function
 * - microPause() - Use with await for yielding control: await microPause()
 * 
 * EXAMPLE STRUCTURE:
 * ------------------
 * async function searchBestMove({board, aiPlayer, oppPlayer, useAlphaBeta, onProgress, yieldEvery=200}){
 *   const stats = { nodes:0, pruned:0, start: performance.now(), durationMs: 0 };
 *   let yieldCounter = 0;
 * 
 *   async function minimax(currentBoard, isMaximizing, alpha, beta) {
 *     // Yield control periodically for UI responsiveness
 *     if(++yieldCounter % yieldEvery === 0){
 *       onProgress?.({...stats, durationMs: performance.now() - stats.start});
 *       await microPause();
 *     }
 * 
 *     // Check if game is over
 *     const score = evaluate(currentBoard, aiPlayer, oppPlayer);
 *     if(score !== null) return {score};
 * 
 *     // Get available moves
 *     const moves = availableMoves(currentBoard);
 * 
 *     if(isMaximizing) {
 *       // AI turn - maximize score
 *       let best = {score: -Infinity, move: null};
 *       for(let i = 0; i < moves.length; i++){
 *         const move = moves[i];
 *         const newBoard = cloneBoard(currentBoard);
 *         newBoard[move] = aiPlayer;
 *         stats.nodes++;
 *         
 *         const result = await minimax(newBoard, false, alpha, beta);
 *         if(result.score > best.score){
 *           best = {score: result.score, move: move};
 *         }
 *         
 *         // Alpha-beta pruning for maximizing player
 *         if(useAlphaBeta){
 *           alpha = Math.max(alpha, result.score);
 *           if(beta <= alpha){
 *             stats.pruned += (moves.length - i - 1);
 *             break;
 *           }
 *         }
 *       }
 *       return best;
 *     } else {
 *       // Opponent turn - minimize score  
 *       let best = {score: Infinity, move: null};
 *       // ... implement minimizing logic similar to above
 *       return best;
 *     }
 *   }
 * 
 *   const result = await minimax(board, true, -Infinity, Infinity);
 *   stats.durationMs = performance.now() - stats.start;
 *   onProgress?.(stats);
 *   return {move: result.move, stats};
 * }
 */

async function searchBestMove({board, aiPlayer, oppPlayer, useAlphaBeta, onProgress, yieldEvery=200}){
  const stats = { nodes:0, pruned:0, start: performance.now(), durationMs: 0 };
  let yieldCounter = 0;

  async function minimaxAsync(b, isMax, alpha, beta){
    if(++yieldCounter % yieldEvery === 0){
      onProgress?.({ ...stats, durationMs: performance.now() - stats.start });
      await microPause();
    }
    const score = evaluate(b, aiPlayer, oppPlayer);
    if(score !== null) return { score };

    const moves = availableMoves(b);

    if(isMax){
      let best = { score: -Infinity, move: null };
      for(let i=0;i<moves.length;i++){
        const m = moves[i];
        const nb = cloneBoard(b); nb[m] = aiPlayer;
        stats.nodes++;
        const res = await minimaxAsync(nb, false, alpha, beta);
        if(res.score > best.score) best = { score: res.score, move: m };
        if(useAlphaBeta){
          alpha = Math.max(alpha, res.score);
          if(beta <= alpha){ stats.pruned += (moves.length - i - 1); break; }
        }
      }
      return best;
    } else {
      let best = { score: Infinity, move: null };
      for(let i=0;i<moves.length;i++){
        const m = moves[i];
        const nb = cloneBoard(b); nb[m] = oppPlayer;
        stats.nodes++;
        const res = await minimaxAsync(nb, true, alpha, beta);
        if(res.score < best.score) best = { score: res.score, move: m };
        if(useAlphaBeta){
          beta = Math.min(beta, res.score);
          if(beta <= alpha){ stats.pruned += (moves.length - i - 1); break; }
        }
      }
      return best;
    }
  }

  // TODO FOR YOUR FRIEND: The algorithm above works for BOTH minimax and alpha-beta!
  // When useAlphaBeta=false, it's pure minimax (no pruning occurs)
  // When useAlphaBeta=true, it's alpha-beta pruning (faster!)
  // 
  // Your task: Implement a separate, cleaner version of JUST the basic minimax
  // algorithm (without alpha-beta pruning) for educational comparison.
  // 
  // You could create a separate function like:
  // async function pureMinimaxAsync(b, isMax) {
  //   // Implement minimax without alpha, beta parameters
  //   // This will be slower but easier to understand
  // }
  // 
  // Then modify this function to choose between the two implementations
  // based on the useAlphaBeta flag.

  const result = await minimaxAsync(board, true, -Infinity, Infinity);
  stats.durationMs = performance.now() - stats.start;
  onProgress?.(stats);
  return { move: result.move, stats };
}

function RadioGroup({ label, options, value, onChange, name }){
  return (
    <div>
      <div className="label">{label}</div>
      <div className="row">
        {options.map(opt => (
          <label key={opt.value} className={`pill ${value===opt.value ? "active":""}`}>
            <input type="radio" name={name} value={opt.value} checked={value===opt.value} onChange={()=>onChange(opt.value)} style={{display:"none"}} />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function Stat({ k, v, tooltip }){
  return (
    <div className="stat" title={tooltip || ""}>
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}

function Cell({ value, onClick, highlight, disabled }){
  const cls = `cell ${highlight ? "win": ""}`;
  return <button className={cls} onClick={onClick} disabled={disabled}>{value || ""}</button>;
}

export default function App(){
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [mode, setMode] = useState("hvh"); // hvh | hvai | aivai
  const [firstPlayer, setFirstPlayer] = useState("X");
  const [humanPlaysAs, setHumanPlaysAs] = useState("X");
  const [ai1Algo, setAi1Algo] = useState("alphabeta");
  const [ai2Algo, setAi2Algo] = useState("alphabeta");
  const [thinking, setThinking] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winLine, setWinLine] = useState([]);
  const [lastStats, setLastStats] = useState({ nodes:0, pruned:0, durationMs:0 });
  const [totalStats, setTotalStats] = useState({ nodes:0, pruned:0, durationMs:0 });
  const [autoRunning, setAutoRunning] = useState(false);
  const [speedMs, setSpeedMs] = useState(400);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const isMounted = useRef(true);
  useEffect(()=>()=>{ isMounted.current = false; }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const currentAIAlgo = useMemo(()=>{
    if(mode==="hvai"){
      const aiSymbol = humanPlaysAs==="X" ? "O":"X";
      return turn===aiSymbol ? ai1Algo : null;
    }
    if(mode==="aivai") return turn==="X" ? ai1Algo : ai2Algo;
    return null;
  }, [mode, turn, ai1Algo, ai2Algo, humanPlaysAs]);

  const { winner: w, line } = useMemo(()=>checkWinner(board), [board]);
  useEffect(()=>{ setWinner(w); setWinLine(line); }, [w, line]);

  function resetBoard(newFirst=firstPlayer){
    setBoard(Array(9).fill(null));
    setTurn(newFirst);
    setWinner(null);
    setWinLine([]);
    setLastStats({nodes:0, pruned:0, durationMs:0});
    setTotalStats({nodes:0, pruned:0, durationMs:0});
  }
  function hardReset(){ resetBoard(firstPlayer); setAutoRunning(false); }

  function place(i, symbol){
    if(board[i]) return false;
    const nb = cloneBoard(board); nb[i] = symbol;
    setBoard(nb);
    setTurn(symbol==="X" ? "O":"X");
    return true;
  }

  async function aiMoveFor(symbol, algo){
    if(winner) return;
    setThinking(true);
    const aiPlayer = symbol;
    const oppPlayer = symbol==="X" ? "O":"X";

    const { move, stats } = await searchBestMove({
      board, aiPlayer, oppPlayer,
      useAlphaBeta: algo === "alphabeta",
      onProgress: (s) => { if(!isMounted.current) return; setLastStats({nodes:s.nodes, pruned:s.pruned, durationMs:s.durationMs}); }
    });

    if(!isMounted.current) return;
    setThinking(false);
    setLastStats(stats);
    setTotalStats(prev => ({ nodes: prev.nodes + stats.nodes, pruned: prev.pruned + stats.pruned, durationMs: prev.durationMs + stats.durationMs }));
    if(move != null) place(move, symbol);
  }

  const autoLoopRef = useRef(null);
  useEffect(()=>{
    if(mode!=="aivai"){ setAutoRunning(false); return; }
    if(winner){ setAutoRunning(false); return; }
    if(autoRunning && !thinking){
      const algo = turn==="X" ? ai1Algo : ai2Algo;
      autoLoopRef.current = (async () => { 
        await new Promise(r=>setTimeout(r, speedMs)); 
        await aiMoveFor(turn, algo); 
      })();
    }
    return ()=>{ autoLoopRef.current = null; };
  }, [mode, autoRunning, thinking, turn, ai1Algo, ai2Algo, winner, speedMs]);

  useEffect(()=>{
    if(mode==="hvai" && !winner){
      const aiSymbol = humanPlaysAs==="X" ? "O":"X";
      if(turn===aiSymbol && !thinking){ aiMoveFor(aiSymbol, ai1Algo); }
    }
  }, [mode, turn, humanPlaysAs, ai1Algo, winner]);

  function onCellClick(i){
    if(winner) return;
    if(mode==="hvh"){ place(i, turn); return; }
    if(mode==="hvai"){
      if(turn!==humanPlaysAs) return;
      const ok = place(i, turn);
      if(ok){ const aiSymbol = humanPlaysAs==="X" ? "O":"X"; setTimeout(()=>aiMoveFor(aiSymbol, ai1Algo), 50); }
      return;
    }
    // aivai disabled
  }

  const statusText = useMemo(()=>{
    if(winner==="Draw") return "Game over: Draw";
    if(winner==="X" || winner==="O") return `Game over: ${winner} wins`;
    return `Turn: ${turn}`;
  }, [winner, turn]);

  const pruningEff = useMemo(()=>{
    const nodes = lastStats.nodes, pruned = lastStats.pruned;
    const denom = nodes + pruned;
    return denom>0 ? `${((pruned/denom)*100).toFixed(1)}%` : "0%";
  }, [lastStats]);

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="h1">Tic‑Tac‑Toe AI — Minimax vs Alpha‑Beta</h1>
          <div className="sub">Play, compare algorithms, and watch live performance metrics.</div>
        </div>
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <button 
            className="theme-toggle" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button className="btn" onClick={hardReset}>Restart</button>
        </div>
      </div>

      <section className="grid-2">
        <div className="card">
          <RadioGroup
            label="Game Mode"
            name="mode"
            value={mode}
            onChange={(v)=>{ setMode(v); setAutoRunning(false); resetBoard(firstPlayer); }}
            options={[
              {label:"Human vs Human", value:"hvh"},
              {label:"Human vs AI", value:"hvai"},
              {label:"AI vs AI", value:"aivai"},
            ]}
          />

          <div className="row" style={{marginTop:12}}>
            <RadioGroup
              label="First Player"
              name="first"
              value={firstPlayer}
              onChange={(v)=>{ setFirstPlayer(v); resetBoard(v); }}
              options={[{label:"X", value:"X"}, {label:"O", value:"O"}]}
            />
            {mode==="hvai" && (
              <RadioGroup
                label="You Play As"
                name="humanAs"
                value={humanPlaysAs}
                onChange={(v)=>{ setHumanPlaysAs(v); resetBoard(firstPlayer); }}
                options={[{label:"X", value:"X"}, {label:"O", value:"O"}]}
              />
            )}
          </div>

          <div className="row" style={{marginTop:12}}>
            <RadioGroup
              label={mode==="aivai" ? "AI (X) Algorithm" : "AI Algorithm"}
              name="ai1"
              value={ai1Algo}
              onChange={setAi1Algo}
              options={[{label:"Minimax", value:"minimax"}, {label:"Alpha‑Beta", value:"alphabeta"}]}
            />
            {mode==="aivai" && (
              <RadioGroup
                label="AI (O) Algorithm"
                name="ai2"
                value={ai2Algo}
                onChange={setAi2Algo}
                options={[{label:"Minimax", value:"minimax"}, {label:"Alpha‑Beta", value:"alphabeta"}]}
              />
            )}
          </div>

          {mode==="aivai" && (
            <div className="row" style={{marginTop:12}}>
              <button className="pill" onClick={()=>setAutoRunning(r=>!r)}>{autoRunning ? "Pause":"Start"} Auto‑Play</button>
              <label className="range">
                Speed
                <input type="range" min={50} max={1000} step={10} value={speedMs} onChange={(e)=>setSpeedMs(parseInt(e.target.value,10))} />
                <span className="small">{speedMs} ms</span>
              </label>
            </div>
          )}
        </div>

        <div className="card">
          <div className="row" style={{justifyContent: "space-between"}}>
            <div className="label">Live Performance</div>
            <div className="badge">{currentAIAlgo ? (currentAIAlgo==="alphabeta" ? "Alpha‑Beta":"Minimax") : "—"}</div>
          </div>
          <div className="stats">
            <Stat k="Decision Time" v={`${(lastStats.durationMs||0).toFixed(1)} ms`} />
            <Stat k="Nodes Explored" v={lastStats.nodes || 0} />
            <Stat k="Pruned Nodes" v={lastStats.pruned || 0} />
            <Stat k="Pruning Efficiency" v={pruningEff} tooltip="Pruned / (Nodes + Pruned)" />
          </div>
          <div className="small" style={{marginTop:8}}>{thinking ? "AI is thinking… (metrics update in real time)":"Idle"}</div>
          <div className="stats" style={{marginTop:8}}>
            <Stat k="Total Time" v={`${(totalStats.durationMs||0).toFixed(1)} ms`} />
            <Stat k="Total Nodes" v={totalStats.nodes || 0} />
            <Stat k="Total Pruned" v={totalStats.pruned || 0} />
          </div>
        </div>
      </section>

      <section className="grid-2" style={{alignItems:"start", marginTop:16}}>
        <div className="card">
          <div className="status">
            <div className="state">{statusText}</div>
            <div className="small">Mode: {mode.toUpperCase()}</div>
          </div>
          <div className="board">
            {board.map((v,i)=> (
              <Cell
                key={i}
                value={v}
                highlight={winLine.includes(i)}
                disabled={thinking || !!winner || (mode==="aivai") || (mode==="hvai" && turn!==humanPlaysAs)}
                onClick={()=>onCellClick(i)}
              />
            ))}
          </div>
        </div>
        <aside className="sidebar">
          <div className="card help">
            <div className="label">How to Play</div>
            <ul>
              <li>Click a square to place your mark.</li>
              <li>Switch modes and algorithms from the left panel.</li>
              <li>In AI vs AI, press Start to watch auto‑play; adjust speed.</li>
            </ul>
          </div>
          <div className="card notes">
            <div className="label">Notes</div>
            <ul>
              <li>Evaluation: +10 for AI win, −10 for opponent win, 0 for draw.</li>
              <li>Pruning counts estimate nodes skipped when a beta ≤ alpha cut occurs.</li>
            </ul>
          </div>
        </aside>
      </section>

      <footer>Built for Minimax vs Alpha‑Beta comparison with real‑time metrics.</footer>
    </div>
  );
}
