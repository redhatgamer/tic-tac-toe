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

function ThemeToggle({ isDarkMode, onClick, title }){
  return (
    <button 
      className="theme-toggle" 
      onClick={onClick}
      title={title}
    >
      <div className="theme-toggle-inner">
        {isDarkMode ? (
          // Sun icon for light mode
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        ) : (
          // Moon icon for dark mode
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </div>
    </button>
  );
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
      <div className="home-layout">
        <div className="home-hero">
          <div className="home-background-pattern"></div>
          <div className="home-content">
            <div className="home-header">
              <ThemeToggle 
                isDarkMode={isDarkMode}
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              />
            </div>
            
            <div className="home-main">
              <div className="home-title-section">
                <h1 className="home-title">Tic‑Tac‑Toe</h1>
                <div className="home-subtitle">Minimax vs Alpha‑Beta</div>
                <div className="home-description">
                  Experience the power of game theory algorithms in action. 
                  Compare minimax and alpha-beta pruning with real-time performance metrics.
                </div>
              </div>
              
              <div className="home-game-preview">
                <div className="preview-board">
                  <div className="preview-cell">X</div>
                  <div className="preview-cell">O</div>
                  <div className="preview-cell">X</div>
                  <div className="preview-cell">O</div>
                  <div className="preview-cell">X</div>
                  <div className="preview-cell">O</div>
                  <div className="preview-cell">X</div>
                  <div className="preview-cell">O</div>
                  <div className="preview-cell">X</div>
                </div>
              </div>
            </div>
            
            <div className="home-actions">
              <button className="btn-hero" onClick={goToModes}>
                <span>Start Playing</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Smart AI</h3>
            <p>Advanced algorithms that never lose</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Metrics</h3>
            <p>Watch performance data update live</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔬</div>
            <h3>Algorithm Comparison</h3>
            <p>See the difference between minimax approaches</p>
          </div>
        </div>

        <div className="contributors-section">
          <div className="contributors-container">
            <h2 className="contributors-title">Contributors</h2>
            <div className="contributors-grid">
              <div className="contributor-card">
                <div className="contributor-info">
                  <h4 className="contributor-name">Carlos Mejia</h4>
                </div>
              </div>

              <div className="contributor-card">
                <div className="contributor-info">
                  <h4 className="contributor-name">Mandy Saint Simon</h4>
                </div>
              </div>

              <div className="contributor-card">
                <div className="contributor-info">
                  <h4 className="contributor-name">Pablo Valdes</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if(view === "modes"){
    return (
      <div className="modes-layout">
        <div className="modes-header">
          <div className="modes-nav">
            <button className="nav-btn" onClick={goHome}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              Home
            </button>
            <ThemeToggle 
              isDarkMode={isDarkMode}
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            />
          </div>
          <div className="modes-title-section">
            <h1 className="modes-title">Game Setup</h1>
            <div className="modes-subtitle">Configure your perfect match</div>
          </div>
        </div>

        <div className="modes-wizard">
          <div className="wizard-step">
            <div className="step-number">1</div>
            <div className="step-card">
              <h3 className="step-title">Choose Game Mode</h3>
              <RadioGroup
                label=""
                name="mode"
                value={mode}
                onChange={(v)=>{ setMode(v); setAutoRunning(false); resetBoard(firstPlayer); }}
                options={[
                  {label:"Human vs Human", value:"hvh"},
                  {label:"Human vs AI", value:"hvai"},
                  {label:"AI vs AI", value:"aivai"},
                ]}
              />
            </div>
          </div>

          <div className="wizard-step">
            <div className="step-number">2</div>
            <div className="step-card">
              <h3 className="step-title">Player Configuration</h3>
              <div className="config-section">
                <RadioGroup
                  label="First Player"
                  name="first"
                  value={firstPlayer}
                  onChange={(v)=>{ setFirstPlayer(v); resetBoard(v); }}
                  options={[{label:"X", value:"X"}, {label:"O", value:"O"}]}
                />
                
                {mode === 'hvh' && (
                  <div className="player-config">
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
                  </div>
                )}

                {mode === 'hvai' && (
                  <div className="ai-config">
                    <div className="ai-preview">
                      <div className="ai-player">
                        <span className="ai-label">Computer</span>
                        <span className="ai-symbol">{humanPlaysAs === 'X' ? 'O' : 'X'}</span>
                      </div>
                    </div>
                    <RadioGroup
                      label="You Play As"
                      name="humanAs"
                      value={humanPlaysAs}
                      onChange={(v)=>{ setHumanPlaysAs(v); resetBoard(firstPlayer); }}
                      options={[{label:"X", value:"X"}, {label:"O", value:"O"}]}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {mode !== "hvh" && (
            <div className="wizard-step">
              <div className="step-number">3</div>
              <div className="step-card">
                <h3 className="step-title">AI Configuration</h3>
                <div className="algo-selection">
                  <RadioGroup
                    label={mode==="aivai" ? "Algorithm for X" : "AI Algorithm"}
                    name="ai1"
                    value={ai1Algo}
                    onChange={setAi1Algo}
                    options={[{label:"Minimax", value:"minimax"}, {label:"Alpha‑Beta", value:"alphabeta"}]}
                  />
                  {mode==="aivai" && (
                    <RadioGroup
                      label="Algorithm for O"
                      name="ai2"
                      value={ai2Algo}
                      onChange={setAi2Algo}
                      options={[{label:"Minimax", value:"minimax"}, {label:"Alpha‑Beta", value:"alphabeta"}]}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="wizard-actions">
            <button className="btn-wizard-primary" onClick={()=>{ resetBoard(firstPlayer); setView('game'); }}>
              <span>Start Game</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            </button>
            <button className="btn-wizard-secondary" onClick={goHome}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-layout">
      <div className="game-header">
        <div className="game-title-section">
          <h1 className="game-title">Tic‑Tac‑Toe AI</h1>
          <div className="game-subtitle">Minimax vs Alpha‑Beta Analysis</div>
        </div>
        <div className="game-controls">
          <ThemeToggle 
            isDarkMode={isDarkMode}
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          />
          <button className="btn" onClick={hardReset}>Restart</button>
          <button className="btn" onClick={goHome}>Home</button>
        </div>
      </div>

      <div className="game-main">
        <div className="game-left-panel">
          <div className="game-status-card">
            <div className="status-header">
              <div className="status-indicator"></div>
              <div className="status-text">{statusText}</div>
            </div>
            <div className="game-mode-info">
              <span className="mode-badge">{mode.toUpperCase()}</span>
            </div>
          </div>

          <div className="game-board-container">
            <div className="board-wrapper">
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
          </div>

          <div className="game-info-card">
            <div className="game-config">
              <h4>Current Configuration</h4>
              <div className="config-details">
                {mode === 'hvai' && (
                  <>
                    <div className="config-item">
                      <span className="config-label">Computer:</span>
                      <span className="config-value">{humanPlaysAs === 'X' ? 'O' : 'X'}</span>
                    </div>
                    <div className="config-item">
                      <span className="config-label">Player:</span>
                      <span className="config-value">{humanPlaysAs}</span>
                    </div>
                  </>
                )}
                {mode === 'hvh' && (
                  <>
                    <div className="config-item">
                      <span className="config-label">Player 1:</span>
                      <span className="config-value">{player1Symbol}</span>
                    </div>
                    <div className="config-item">
                      <span className="config-label">Player 2:</span>
                      <span className="config-value">{player2Symbol}</span>
                    </div>
                  </>
                )}
                {mode !== 'hvh' && (
                  <div className="config-item">
                    <span className="config-label">Algorithm:</span>
                    <span className="config-value">{ai1Algo === 'alphabeta' ? 'Alpha‑Beta' : 'Minimax'}</span>
                  </div>
                )}
                {mode === 'aivai' && (
                  <div className="config-item">
                    <span className="config-label">Algorithm (O):</span>
                    <span className="config-value">{ai2Algo === 'alphabeta' ? 'Alpha‑Beta' : 'Minimax'}</span>
                  </div>
                )}
              </div>
              <button className="btn-config" onClick={goToModes}>Change Setup</button>
            </div>

            {mode === 'aivai' && (
              <div className="auto-play-controls">
                <h4>Auto-Play Controls</h4>
                <div className="auto-controls">
                  <button className="btn-auto" onClick={()=>setAutoRunning(r=>!r)}>
                    {autoRunning ? "Pause" : "Start"}
                  </button>
                  <div className="speed-control">
                    <label>Speed: {speedMs}ms</label>
                    <input 
                      type="range" 
                      min={50} 
                      max={1000} 
                      step={10} 
                      value={speedMs} 
                      onChange={(e)=>setSpeedMs(parseInt(e.target.value,10))} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {mode !== 'hvh' && (
          <div className="game-right-panel">
            <div className="performance-dashboard">
              <div className="dashboard-header">
                <h3>Performance Dashboard</h3>
                <div className="algorithm-badge">
                  {currentAIAlgo ? (currentAIAlgo==="alphabeta" ? "Alpha‑Beta":"Minimax") : "—"}
                </div>
              </div>

              <div className="metrics-grid">
                <div className="metric-card primary">
                  <div className="metric-icon">⚡</div>
                  <div className="metric-content">
                    <div className="metric-value">{(lastStats.durationMs||0).toFixed(1)}ms</div>
                    <div className="metric-label">Decision Time</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">🔍</div>
                  <div className="metric-content">
                    <div className="metric-value">{lastStats.nodes || 0}</div>
                    <div className="metric-label">Nodes Explored</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">✂️</div>
                  <div className="metric-content">
                    <div className="metric-value">{lastStats.pruned || 0}</div>
                    <div className="metric-label">Pruned Nodes</div>
                  </div>
                </div>

                <div className="metric-card accent">
                  <div className="metric-icon">📊</div>
                  <div className="metric-content">
                    <div className="metric-value">{pruningEff}</div>
                    <div className="metric-label">Efficiency</div>
                  </div>
                </div>
              </div>

              <div className="thinking-indicator">
                {thinking ? (
                  <div className="thinking-active">
                    <div className="thinking-spinner"></div>
                    <span>AI is thinking... (metrics update in real time)</span>
                  </div>
                ) : (
                  <div className="thinking-idle">Ready for next move</div>
                )}
              </div>

              <div className="total-stats">
                <h4>Session Totals</h4>
                <div className="total-grid">
                  <div className="total-item">
                    <span className="total-label">Total Time:</span>
                    <span className="total-value">{(totalStats.durationMs||0).toFixed(1)}ms</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Total Nodes:</span>
                    <span className="total-value">{totalStats.nodes || 0}</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Total Pruned:</span>
                    <span className="total-value">{totalStats.pruned || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="help-panel">
              <div className="help-section">
                <h4>How to Play</h4>
                <ul>
                  <li>Click a square to place your mark</li>
                  <li>Watch real-time AI performance metrics</li>
                  <li>Switch modes anytime via "Change Setup"</li>
                  {mode === 'aivai' && <li>Use auto-play controls to watch AI vs AI</li>}
                </ul>
              </div>
              
              <div className="notes-section">
                <h4>Algorithm Notes</h4>
                <ul>
                  <li>+10 for AI win, −10 for opponent, 0 for draw</li>
                  <li>Pruning shows nodes skipped by alpha-beta cuts</li>
                  <li>Efficiency = Pruned / (Nodes + Pruned)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
