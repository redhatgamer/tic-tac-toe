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
 */

async function searchBestMove({board, aiPlayer, oppPlayer, useAlphaBeta, onProgress, yieldEvery=200}){
  const stats = { nodes:0, pruned:0, start: performance.now(), durationMs: 0 };
  let yieldCounter = 0;
  // Pure minimax implementation (no alpha-beta pruning). This is
  // provided for comparison and educational purposes. It explores
  // the entire game tree (no pruning) and counts visited nodes.
  async function pureMinimaxAsync(b, isMax){
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
        const res = await pureMinimaxAsync(nb, false);
        if(res.score > best.score) best = { score: res.score, move: m };
      }
      return best;
    } else {
      let best = { score: Infinity, move: null };
      for(let i=0;i<moves.length;i++){
        const m = moves[i];
        const nb = cloneBoard(b); nb[m] = oppPlayer;
        stats.nodes++;
        const res = await pureMinimaxAsync(nb, true);
        if(res.score < best.score) best = { score: res.score, move: m };
      }
      return best;
    }
  }

  // Minimax with optional alpha-beta pruning. When useAlphaBeta is false
  // this function still works as basic minimax because alpha/beta checks
  // won't trigger pruning, but we provide `pureMinimaxAsync` above as a
  // clearly separate, simpler implementation for teaching and measurement.
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

  

  let result;
  if(useAlphaBeta === false){
    // Use the pure minimax implementation for comparison
    result = await pureMinimaxAsync(board, true);
  } else {
    result = await minimaxAsync(board, true, -Infinity, Infinity);
  }
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
  const [view, setView] = useState("home"); // home | game
  const [turn, setTurn] = useState("X");
  const [mode, setMode] = useState("hvh"); // hvh | hvai | aivai
  const [firstPlayer, setFirstPlayer] = useState("X");
  const [humanPlaysAs, setHumanPlaysAs] = useState("X");
  const [player1Symbol, setPlayer1Symbol] = useState("X");
  const [player2Symbol, setPlayer2Symbol] = useState("O");
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
  const aiSearchIdRef = useRef(0);
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

  function goToGame(){ resetBoard(firstPlayer); setView("game"); }
  function goToModes(){ setView("modes"); }
  function goHome(){ setView("home"); }

  function resetBoard(newFirst=firstPlayer){
    setBoard(Array(9).fill(null));
    setTurn(newFirst);
    setWinner(null);
    setWinLine([]);
    setLastStats({nodes:0, pruned:0, durationMs:0});
    setTotalStats({nodes:0, pruned:0, durationMs:0});
    setThinking(false);
    // bump search id to cancel any in-flight AI searches
    aiSearchIdRef.current += 1;
  }
  function hardReset(){ resetBoard(firstPlayer); setAutoRunning(false); }

  function place(i, symbol){
    if(board[i]) return false;
    const nb = cloneBoard(board); nb[i] = symbol;
    setBoard(nb);
    setTurn(symbol==="X" ? "O":"X");
    return true;
  }

  async function aiMoveFor(symbol, algo, useBoard=null){
    // optional: accept a board snapshot so AI uses the freshest board
    async function _aiMoveFor(symbol, algo, useBoardInner){
      // capture search id so we can ignore stale results
      const searchId = aiSearchIdRef.current;
      // if the provided board is already terminal, don't move
      const term = checkWinner(useBoardInner);
      if(term && term.winner) return;
      setThinking(true);
      const aiPlayer = symbol;
      const oppPlayer = symbol==="X" ? "O":"X";

      const { move, stats } = await searchBestMove({
        board: useBoardInner, aiPlayer, oppPlayer,
        useAlphaBeta: algo === "alphabeta",
        onProgress: (s) => { if(!isMounted.current) return; setLastStats({nodes:s.nodes, pruned:s.pruned, durationMs:s.durationMs}); }
      });
      if(!isMounted.current) return;
      // if a reset or newer search happened, ignore this result
      if(aiSearchIdRef.current !== searchId) return;
      setThinking(false);
      setLastStats(stats);
      setTotalStats(prev => ({ nodes: prev.nodes + stats.nodes, pruned: prev.pruned + stats.pruned, durationMs: prev.durationMs + stats.durationMs }));
      if(move != null){
        // apply move based on the board used for search to avoid overwriting
        const nb = cloneBoard(useBoardInner);
        nb[move] = symbol;
        setBoard(nb);
        setTurn(symbol==="X" ? "O":"X");
      }
    }
    return _aiMoveFor(symbol, algo, useBoard || board);
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
      if(ok){
        // create a fresh snapshot including the player's move so AI searches the correct state
        const nb = cloneBoard(board);
        nb[i] = turn;
        const aiSymbol = humanPlaysAs==="X" ? "O":"X";
        setTimeout(()=>aiMoveFor(aiSymbol, ai1Algo, nb), 50);
      }
      return;
    }
    // aivai disabled
  }

  const statusText = useMemo(()=>{
    if(winner==="Draw") return "Game over: Draw";
    if(winner==="X" || winner==="O") return `Game over: ${winner} wins`;
    // Determine actor label
    if(mode === 'hvh') return `Turn: player (${turn})`;
    if(mode === 'hvai'){
      const aiSymbol = humanPlaysAs === 'X' ? 'O' : 'X';
      return turn === aiSymbol ? `Turn: computer (${turn})` : `Turn: player (${turn})`;
    }
    if(mode === 'aivai') return `Turn: computer (${turn})`;
    return `Turn: ${turn}`;
  }, [winner, turn, mode, humanPlaysAs]);

  const pruningEff = useMemo(()=>{
    const nodes = lastStats.nodes, pruned = lastStats.pruned;
    const denom = nodes + pruned;
    return denom>0 ? `${((pruned/denom)*100).toFixed(1)}%` : "0%";
  }, [lastStats]);

  if(view === "home"){
    return (
      <div className="container">
        <div className="header">
          <div>
            <h1 className="h1">Welcome to Tic‑Tac‑Toe</h1>
            <div className="sub">Minimax vs Alpha‑Beta.</div>
          </div>
          <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            <button 
              className="theme-toggle" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <section style={{display:'flex', justifyContent:'center', alignItems:'center', height:'60vh'}}>
          <button className="btn btn-large" onClick={goToModes}>Start</button>
        </section>

        <footer>Built for Minimax vs Alpha‑Beta comparison with real‑time metrics.</footer>
      </div>
    );
  }

  if(view === "modes"){
    return (
      <div className="container">
        <div className="header">
          <div>
            <h1 className="h1">Select Game Mode</h1>
            <div className="sub">Choose players, sides, and algorithms (where applicable).</div>
          </div>
          <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)} title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button className="btn" onClick={goHome}>Home</button>
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
                label={'Choose first player'}
                name="first"
                value={firstPlayer}
                onChange={(v)=>{ setFirstPlayer(v); resetBoard(v); }}
                options={[{label:"X", value:"X"}, {label:"O", value:"O"}]}
              />
            </div>

            <div className="row" style={{marginTop:12}}>
              {mode === 'hvh' && (
                <>
                  <RadioGroup
                    label="Player 1"
                    name="p1"
                    value={player1Symbol}
                    onChange={(v)=>{ setPlayer1Symbol(v); setPlayer2Symbol(v === 'X' ? 'O' : 'X'); resetBoard(firstPlayer); }}
                    options={[{label:"X", value:"X"}, {label:"O", value:"O"}]}
                  />
                  <RadioGroup
                    label="Player 2"
                    name="p2"
                    value={player2Symbol}
                    onChange={(v)=>{ setPlayer2Symbol(v); setPlayer1Symbol(v === 'X' ? 'O' : 'X'); resetBoard(firstPlayer); }}
                    options={[{label:"X", value:"X"}, {label:"O", value:"O"}]}
                  />
                </>
              )}

              {mode === 'hvai' && (
                <div style={{display:'flex', gap:6, alignItems:'center'}}>
                  <div style={{minWidth:100}}>
                    <div className="label">Computer</div>
                    <div style={{marginTop:6}}>
                      <label className="pill active" style={{padding:'6px 10px', display:'inline-block'}}>{humanPlaysAs === 'X' ? 'O' : 'X'}</label>
                    </div>
                  </div>
                  <div style={{flex:1, maxWidth:180}}>
                    <RadioGroup
                      label="Player"
                      name="humanAs"
                      value={humanPlaysAs}
                      onChange={(v)=>{ setHumanPlaysAs(v); resetBoard(firstPlayer); }}
                      options={[{label:"X", value:"X"}, {label:"O", value:"O"}]}
                    />
                  </div>
                </div>
              )}
            </div>

            {mode !== "hvh" && (
              <div className="row" style={{marginTop:12}}>
                <RadioGroup
                  label={mode==="aivai" ? "Algorithm (X)" : "Algorithm"}
                  name="ai1"
                  value={ai1Algo}
                  onChange={setAi1Algo}
                  options={[{label:"Minimax", value:"minimax"}, {label:"Alpha‑Beta", value:"alphabeta"}]}
                />
                {mode==="aivai" && (
                  <RadioGroup
                    label="Algorithm (O)"
                    name="ai2"
                    value={ai2Algo}
                    onChange={setAi2Algo}
                    options={[{label:"Minimax", value:"minimax"}, {label:"Alpha‑Beta", value:"alphabeta"}]}
                  />
                )}
              </div>
            )}

            <div style={{marginTop:18}}>
              <button className="btn" onClick={()=>{ resetBoard(firstPlayer); setView('game'); }}>Play</button>
              <button className="btn" style={{marginLeft:8}} onClick={goHome}>Cancel</button>
            </div>
          </div>

          {/* No live performance on Modes page per request */}
        </section>

        <footer>Built for Minimax vs Alpha‑Beta comparison with real‑time metrics.</footer>
      </div>
    );
  }

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
          <button className="btn" onClick={goHome}>Home</button>
        </div>
      </div>

      <section className="grid-2">
        <div className="card">
          <div className="label">Selected Mode</div>
          <div className="small">Mode: {mode === 'hvh' ? 'Human vs Human' : mode === 'hvai' ? 'Human vs AI' : 'AI vs AI'}</div>
          <div style={{marginTop:12}}>
            {mode === 'hvai' && <div className="small">Computer: {humanPlaysAs === 'X' ? 'O' : 'X'}</div>}
            {mode === 'hvai' && <div className="small">Player: {humanPlaysAs}</div>}
            {mode === 'hvh' && <div className="small">Player 1: {player1Symbol}</div>}
            {mode === 'hvh' && <div className="small">Player 2: {player2Symbol}</div>}
            {mode !== 'hvh' && <div className="small">Algorithm: {ai1Algo === 'alphabeta' ? 'Alpha‑Beta' : 'Minimax'}</div>}
            {mode === 'aivai' && <div className="small">Algorithm (O): {ai2Algo === 'alphabeta' ? 'Alpha‑Beta' : 'Minimax'}</div>}
          </div>
          <div style={{marginTop:12}}>
            <button className="btn" onClick={goToModes}>Change Mode</button>
          </div>
          {mode === 'aivai' && (
            <div style={{marginTop:12}}>
              <button className="pill" onClick={()=>setAutoRunning(r=>!r)}>{autoRunning ? "Pause":"Start"} Auto‑Play</button>
              <label className="range" style={{marginLeft:12}}>
                Speed
                <input type="range" min={50} max={1000} step={10} value={speedMs} onChange={(e)=>setSpeedMs(parseInt(e.target.value,10))} />
                <span className="small">{speedMs} ms</span>
              </label>
            </div>
          )}
        </div>

        {mode !== 'hvh' && (
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
        )}
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
