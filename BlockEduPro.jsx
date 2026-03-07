const { useState, useEffect, useRef, useCallback, useMemo } = React;


// ═══════════════════════════════════════════════════════════════════
// CONFIG — point to your Node.js gateway
// ═══════════════════════════════════════════════════════════════════
const API = "http://localhost:3001";

// ═══════════════════════════════════════════════════════════════════
// SHA-256 (browser fallback when backend unreachable)
// ═══════════════════════════════════════════════════════════════════
async function sha256browser(msg) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// ═══════════════════════════════════════════════════════════════════
// API CLIENT
// ═══════════════════════════════════════════════════════════════════
async function api(path, method = "GET", body = null) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  try {
    const r = await fetch(`${API}${path}`, opts);
    return r.json();
  } catch {
    return null; // backend offline
  }
}

// ═══════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════════
const G = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#04060d;--s1:#080d19;--s2:#0d1424;--s3:#121a2e;--s4:#1a2340;
  --border:#1e2d4a;--border2:#243558;
  --cyan:#00f5ff;--cyan2:#00c8d8;--cyan-dim:rgba(0,245,255,0.12);
  --purple:#7c3aed;--purple2:#a855f7;--purple-dim:rgba(124,58,237,0.15);
  --amber:#f59e0b;--amber-dim:rgba(245,158,11,0.12);
  --green:#10b981;--green-dim:rgba(16,185,129,0.12);
  --red:#ef4444;--red-dim:rgba(239,68,68,0.12);
  --text:#e8f4f8;--text2:#8fa3be;--text3:#3d5278;
  --mono:'Space Mono',monospace;--sans:'Outfit',sans-serif;
  --r:10px;--r2:14px;
}
body{background:var(--bg);color:var(--text);font-family:var(--mono);overflow-x:hidden;line-height:1.5}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--s1)}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:4px}

/* ── Layout ── */
.app{display:grid;grid-template-rows:52px 1fr;height:100vh;overflow:hidden}
.header{
  display:flex;align-items:center;gap:16px;padding:0 20px;
  background:var(--s1);border-bottom:1px solid var(--border);
  position:relative;z-index:50
}
.logo{font-family:var(--sans);font-size:17px;font-weight:800;color:var(--cyan);white-space:nowrap;letter-spacing:-0.3px}
.logo em{color:var(--text3);font-style:normal;font-weight:400;font-size:12px;margin-left:6px}
.tabs{display:flex;gap:2px;flex:1;justify-content:center}
.tab{
  background:none;border:none;color:var(--text3);font-family:var(--mono);font-size:11px;
  padding:6px 14px;border-radius:6px;cursor:pointer;transition:all .15s;white-space:nowrap
}
.tab:hover{color:var(--text2);background:var(--s3)}
.tab.on{color:var(--cyan);background:var(--cyan-dim);border-bottom:2px solid var(--cyan)}
.hdr-right{display:flex;align-items:center;gap:10px;margin-left:auto}
.status-dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:pulse-dot 2s infinite}
@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.5}}
.status-dot.off{background:var(--red);box-shadow:0 0 6px var(--red);animation:none}
.status-txt{font-size:10px;color:var(--text3)}
.diff-sel{
  background:var(--s3);border:1px solid var(--border);border-radius:6px;
  color:var(--cyan);font-family:var(--mono);font-size:11px;padding:4px 8px;outline:none
}

.body{display:grid;grid-template-columns:220px 1fr;overflow:hidden;height:100%}
.sidebar{
  background:var(--s1);border-right:1px solid var(--border);
  padding:14px 10px;display:flex;flex-direction:column;gap:4px;
  overflow-y:auto
}
.sb-lbl{font-size:9px;font-weight:700;color:var(--text3);letter-spacing:1.5px;text-transform:uppercase;padding:8px 8px 4px}
.sb-btn{
  background:none;border:1px solid transparent;border-radius:8px;
  color:var(--text2);font-family:var(--mono);font-size:11px;
  padding:9px 10px;cursor:pointer;text-align:left;transition:all .15s;
  display:flex;align-items:center;gap:8px
}
.sb-btn:hover{color:var(--text);background:var(--s3);border-color:var(--border)}
.sb-btn.on{color:var(--cyan);background:var(--cyan-dim);border-color:rgba(0,245,255,.25)}
.sb-hr{height:1px;background:var(--border);margin:6px 4px}
.concept-tag{
  font-size:10px;color:var(--text3);padding:3px 10px;display:flex;align-items:center;gap:6px
}

.content{overflow-y:auto;padding:24px 28px;background:var(--bg)}

/* ── Cards ── */
.card{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:18px 20px;margin-bottom:14px}
.card-h{font-family:var(--sans);font-size:15px;font-weight:700;color:var(--text);margin-bottom:3px}
.card-sub{font-size:11px;color:var(--text2);margin-bottom:14px;line-height:1.6}

.ph{font-family:var(--sans);font-size:22px;font-weight:800;color:var(--text);margin-bottom:4px}
.ps{font-size:12px;color:var(--text2);margin-bottom:22px}

/* ── Buttons ── */
.btn{
  border:none;border-radius:8px;font-family:var(--mono);font-size:11px;font-weight:700;
  padding:8px 16px;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px
}
.btn-cyan{background:var(--cyan);color:#000}
.btn-cyan:hover{background:#33f8ff;box-shadow:0 0 20px rgba(0,245,255,.35);transform:translateY(-1px)}
.btn-ghost{background:var(--s3);color:var(--text);border:1px solid var(--border)}
.btn-ghost:hover{border-color:var(--cyan);color:var(--cyan)}
.btn-red{background:var(--red-dim);color:var(--red);border:1px solid rgba(239,68,68,.3)}
.btn-red:hover{background:rgba(239,68,68,.25)}
.btn-purple{background:var(--purple-dim);color:var(--purple2);border:1px solid rgba(124,58,237,.3)}
.btn-purple:hover{background:rgba(124,58,237,.25)}
.btn:disabled{opacity:.35;cursor:not-allowed;transform:none!important;box-shadow:none!important}
.btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}

/* ── Inputs ── */
.inp{
  background:var(--s3);border:1px solid var(--border);border-radius:7px;
  color:var(--text);font-family:var(--mono);font-size:11px;padding:8px 11px;
  outline:none;transition:border-color .2s;width:100%
}
.inp:focus{border-color:var(--cyan)}
textarea.inp{resize:vertical;min-height:54px}

/* ── Chain ── */
.chain-wrap{display:flex;flex-direction:column;gap:0}
.block-card{
  border:1px solid var(--border);border-radius:var(--r2);background:var(--s2);
  overflow:hidden;transition:all .3s;
  animation:blk-in .4s cubic-bezier(.34,1.56,.64,1)
}
@keyframes blk-in{from{opacity:0;transform:translateY(18px) scale(.96)}to{opacity:1;transform:none}}
.block-card.valid{border-color:rgba(16,185,129,.4);box-shadow:0 0 24px rgba(16,185,129,.07)}
.block-card.invalid{border-color:rgba(239,68,68,.5);box-shadow:0 0 24px rgba(239,68,68,.12);animation:shake .35s ease}
@keyframes shake{0%,100%{transform:none}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.block-card.tampered{border-color:var(--amber);box-shadow:0 0 20px var(--amber-dim)}
.blk-hdr{
  padding:9px 15px;display:flex;align-items:center;justify-content:space-between;
  border-bottom:1px solid var(--border);background:var(--s3)
}
.blk-idx{font-family:var(--sans);font-size:13px;font-weight:700;color:var(--text2)}
.blk-badge{font-size:10px;padding:2px 9px;border-radius:20px;font-weight:700}
.badge-ok{background:var(--green-dim);color:var(--green)}
.badge-bad{background:var(--red-dim);color:var(--red)}
.badge-tamper{background:var(--amber-dim);color:var(--amber)}
.blk-body{padding:13px 15px;display:grid;gap:7px}
.fld{display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:start}
.fld-k{font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:1px;padding-top:2px}
.fld-v{font-size:10.5px;color:var(--text2);word-break:break-all;line-height:1.7}
.fld-v.hash{color:var(--cyan);font-size:10px}
.fld-v.genesis{color:var(--text3)}
.fld-v.amber{color:var(--amber)}
.chain-connector{
  display:flex;flex-direction:column;align-items:center;padding:6px 0;
  position:relative
}
.conn-line{width:1px;height:20px;background:linear-gradient(to bottom,var(--border2),var(--cyan));opacity:.5}
.conn-label{font-size:9px;color:var(--text3);background:var(--bg);padding:2px 8px;border-radius:4px;
  border:1px solid var(--border);position:absolute;top:50%;transform:translateY(-50%)}

/* ── Mining Panel ── */
.mine-panel{
  background:var(--s4);border:1px solid var(--border2);border-radius:9px;
  padding:14px;margin-top:10px
}
.mine-title{font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px}
.nonce-big{
  font-family:var(--sans);font-size:30px;font-weight:900;color:var(--amber);
  text-align:center;letter-spacing:-1px;font-variant-numeric:tabular-nums
}
.hash-live{font-size:9.5px;color:var(--text3);text-align:center;word-break:break-all;margin-top:3px;min-height:14px}
.hash-live span{color:var(--cyan)}
.mine-bar{height:3px;background:var(--border);border-radius:2px;margin-top:10px;overflow:hidden}
.mine-fill{height:100%;background:linear-gradient(90deg,var(--cyan),var(--purple2));border-radius:2px;transition:width .08s}
.mine-stats{display:flex;justify-content:space-between;margin-top:6px;font-size:9px;color:var(--text3)}
.mining-pulse{color:var(--amber);animation:pulse-txt 1s infinite}
@keyframes pulse-txt{0%,100%{opacity:1}50%{opacity:.4}}

/* ── Hash Viz ── */
.hash-flow{display:grid;gap:12px}
.hash-io-grid{display:grid;grid-template-columns:1fr 36px 1fr;gap:12px;align-items:center}
.hash-box{background:var(--s3);border:1px solid var(--border);border-radius:10px;padding:13px}
.hash-box-lbl{font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
.hash-box-val{font-size:11.5px;color:var(--cyan);word-break:break-all;min-height:38px;line-height:1.7}
.hash-arrow{text-align:center;color:var(--cyan);font-size:22px}

/* ── Avalanche ── */
.hex-grid{display:flex;flex-wrap:wrap;gap:2px}
.hex-c{
  width:19px;height:21px;display:flex;align-items:center;justify-content:center;
  font-size:9.5px;border-radius:3px;background:var(--s3);transition:all .25s
}
.hex-c.diff{background:rgba(239,68,68,.25);color:var(--red);animation:pop .4s ease}
.hex-c.same{color:var(--text3)}
@keyframes pop{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
.diff-big{font-family:var(--sans);font-size:48px;font-weight:900;color:var(--amber);text-align:center}
.diff-sub{font-size:11px;color:var(--text2);text-align:center;margin-top:2px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* ── Hash Steps ── */
.step-list{display:grid;gap:8px}
.step-row{
  display:flex;gap:10px;padding:10px 12px;
  background:var(--s3);border:1px solid var(--border);border-radius:8px;
  align-items:flex-start;animation:step-in .3s ease both
}
@keyframes step-in{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
.step-num{
  width:20px;height:20px;border-radius:50%;background:var(--cyan-dim);
  display:flex;align-items:center;justify-content:center;
  font-size:9px;font-weight:700;color:var(--cyan);flex-shrink:0
}
.step-txt{font-size:10px;color:var(--text2);word-break:break-all;line-height:1.7}
.step-txt strong{color:var(--cyan)}

/* ── Merkle Tree ── */
.merkle-wrap{overflow-x:auto;padding:10px 0}
.merkle-svg{display:block;margin:0 auto}
.merkle-controls{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center}
.merkle-input-row{display:flex;gap:8px;margin-bottom:8px}
.tx-chip{
  background:var(--s3);border:1px solid var(--border);border-radius:6px;
  padding:6px 10px;display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text2)
}
.tx-chip button{background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px}
.tx-chip button:hover{color:var(--red)}
.tx-list{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;min-height:32px}

/* ── Tamper Detection ── */
.tamper-panel{border:1px solid var(--amber);background:var(--amber-dim);border-radius:10px;padding:14px;margin-top:12px}
.tamper-title{font-size:10px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:flex;align-items:center;gap:6px}
.detection-result{
  font-size:11px;line-height:1.8;
  display:grid;gap:4px
}
.det-row{display:grid;grid-template-columns:110px 1fr;gap:8px}
.det-k{color:var(--text3);font-size:10px}
.det-v{color:var(--text);word-break:break-all;font-size:10px}
.det-v.bad{color:var(--red)}
.det-v.ok{color:var(--green)}

/* ── Tutorial ── */
.tut-pills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px}
.tut-pill{
  padding:5px 14px;border-radius:20px;font-size:10px;border:1px solid var(--border);
  cursor:pointer;transition:all .15s;color:var(--text2);background:var(--s2)
}
.tut-pill:hover{border-color:var(--border2);color:var(--text)}
.tut-pill.on{background:var(--cyan-dim);border-color:rgba(0,245,255,.3);color:var(--cyan)}
.tut-pill.done{background:var(--green-dim);border-color:rgba(16,185,129,.3);color:var(--green)}
.tut-box{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:24px}
.tut-h{font-family:var(--sans);font-size:21px;font-weight:800;margin-bottom:10px}
.tut-body{font-size:11.5px;color:var(--text2);line-height:2}
.tut-body strong{color:var(--cyan)}
.tut-body code{background:var(--s4);padding:1px 6px;border-radius:4px;color:var(--amber);font-size:10.5px}
.tut-body .demo-box{
  background:var(--s4);border:1px solid var(--border2);border-radius:8px;
  padding:12px;margin:10px 0;font-size:10.5px;line-height:2.1
}

/* ── Quiz ── */
.quiz-prog{height:4px;background:var(--s3);border-radius:4px;margin-bottom:18px;overflow:hidden}
.quiz-prog-fill{height:100%;background:linear-gradient(90deg,var(--cyan),var(--purple2));border-radius:4px;transition:width .4s cubic-bezier(.34,1.56,.64,1)}
.quiz-box{background:var(--s2);border:1px solid var(--border);border-radius:var(--r2);padding:24px}
.quiz-q{font-family:var(--sans);font-size:17px;font-weight:700;color:var(--text);margin-bottom:18px;line-height:1.4}
.quiz-opts{display:grid;gap:8px}
.quiz-opt{
  background:var(--s3);border:1px solid var(--border);border-radius:8px;
  color:var(--text2);font-family:var(--mono);font-size:11px;padding:12px 14px;
  cursor:pointer;text-align:left;transition:all .15s;display:flex;align-items:center;gap:10px
}
.quiz-opt:hover:not(:disabled){border-color:var(--cyan);color:var(--text)}
.quiz-opt.right{border-color:var(--green);background:var(--green-dim);color:var(--green)}
.quiz-opt.wrong{border-color:var(--red);background:var(--red-dim);color:var(--red)}
.opt-letter{
  width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:700;background:var(--s4);flex-shrink:0
}
.quiz-fb{margin-top:14px;padding:12px 14px;border-radius:8px;font-size:11px;line-height:1.7}
.fb-ok{background:var(--green-dim);border:1px solid rgba(16,185,129,.3);color:var(--green)}
.fb-bad{background:var(--red-dim);border:1px solid rgba(239,68,68,.3);color:var(--red)}

/* ── Info boxes ── */
.info{background:var(--cyan-dim);border:1px solid rgba(0,245,255,.2);border-radius:8px;padding:10px 13px;font-size:10.5px;color:var(--cyan);line-height:1.7;margin-bottom:12px}
.warn{background:var(--amber-dim);border:1px solid rgba(245,158,11,.3);border-radius:8px;padding:10px 13px;font-size:10.5px;color:var(--amber);line-height:1.7;margin-bottom:12px}

/* ── Confetti ── */
.confetti{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;overflow:hidden}
.cf{position:absolute;width:7px;height:7px;border-radius:2px;animation:cf-fall linear forwards}
@keyframes cf-fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}

/* ── Metric chips ── */
.metrics{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.metric{
  background:var(--s3);border:1px solid var(--border);border-radius:8px;
  padding:8px 14px;display:flex;flex-direction:column;gap:2px;min-width:100px
}
.metric-v{font-family:var(--sans);font-size:20px;font-weight:800;color:var(--cyan)}
.metric-k{font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px}
`;

// ═══════════════════════════════════════════════════════════════════
// CONFETTI
// ═══════════════════════════════════════════════════════════════════
function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i, left: Math.random() * 100,
    color: ["#00f5ff","#7c3aed","#f59e0b","#10b981","#ef4444","#a855f7"][i % 6],
    delay: Math.random() * 2.5, dur: 2 + Math.random() * 2.5,
  }));
  return (
    <div className="confetti">
      {pieces.map(p => (
        <div key={p.id} className="cf" style={{
          left: `${p.left}%`, background: p.color,
          animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// BLOCKCHAIN SIMULATOR
// ═══════════════════════════════════════════════════════════════════
function BlockchainView({ difficulty, setDifficulty, backendOk }) {
  const [chain, setChain] = useState(null);
  const [mining, setMining] = useState(null); // index being mined
  const [mineState, setMineState] = useState({ nonce: 0, hash: "", elapsed: 0, progress: 0 });
  const [newData, setNewData] = useState("Học sinh A đạt điểm 10");
  const [newTxs, setNewTxs] = useState(["Giao dịch 1"]);
  const [txInput, setTxInput] = useState("");
  const [confetti, setConfetti] = useState(false);
  const [tamperIdx, setTamperIdx] = useState(null);
  const [tamperVal, setTamperVal] = useState("");
  const [showTamper, setShowTamper] = useState({});
  const abortRef = useRef(false);
  const esRef = useRef(null);

  const loadChain = useCallback(async () => {
    const d = await api("/api/chain");
    if (d) setChain(d);
  }, []);

  useEffect(() => { loadChain(); }, [loadChain]);

  // Apply difficulty change
  useEffect(() => {
    api("/api/difficulty", "POST", { difficulty });
  }, [difficulty]);

  const addBlock = async () => {
    const d = await api("/api/block/add", "POST", {
      data: newData || `Block ${chain?.length ?? "?"}`,
      transactions: newTxs
    });
    if (d?.chain) { setChain(d.chain); setNewTxs([]); }
  };

  const tamper = async (index) => {
    const val = tamperVal || "DATA TAMPERING DETECTED";
    const d = await api("/api/block/tamper", "POST", { index, data: val });
    if (d?.chain) setChain(d.chain);
    setTamperIdx(null);
    setTamperVal("");
  };

  const restore = async (index) => {
    const d = await api("/api/block/restore", "POST", { index });
    if (d?.chain) { setChain(d.chain); boom(); }
  };

  const reset = async () => {
    const d = await api("/api/reset", "POST");
    if (d?.chain) setChain(d.chain);
  };

  const boom = () => { setConfetti(true); setTimeout(() => setConfetti(false), 3000); };

  const startMining = (index) => {
    if (esRef.current) esRef.current.close();
    abortRef.current = false;
    setMining(index);
    setMineState({ nonce: 0, hash: "", elapsed: 0, progress: 0 });

    const es = new EventSource(`${API}/api/mine/stream?index=${index}`);
    esRef.current = es;

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMineState({
        nonce: data.nonce,
        hash: data.hash || "",
        elapsed: data.elapsed || 0,
        progress: Math.min(99, (data.nonce / 500000) * 100),
      });
      if (data.done) {
        es.close();
        setMining(null);
        if (data.chain) setChain(data.chain);
        if (!data.failed) boom();
      }
    };
    es.onerror = () => { es.close(); setMining(null); };
  };

  const stopMining = () => { if (esRef.current) esRef.current.close(); setMining(null); };

  if (!chain) return (
    <div style={{ color: "var(--text2)", textAlign: "center", padding: 60, fontSize: 12 }}>
      {backendOk ? "⏳ Đang tải blockchain..." : "⚠️ Backend offline — hãy khởi động server.js trước"}
    </div>
  );

  const { difficulty: diff, valid, length, chain: blocks } = chain;

  return (
    <div>
      <Confetti active={confetti} />
      <div className="ph">⛓ Blockchain Simulator</div>
      <div className="ps">Thêm block, tamper data, mine với PoW — mọi thứ tính toán thực tế trong backend Java/Node</div>

      <div className="metrics">
        <div className="metric"><span className="metric-v">{length}</span><span className="metric-k">Blocks</span></div>
        <div className="metric"><span className="metric-v" style={{ color: valid ? "var(--green)" : "var(--red)" }}>{valid ? "✓" : "✗"}</span><span className="metric-k">Chain Valid</span></div>
        <div className="metric"><span className="metric-v" style={{ color: "var(--amber)" }}>{diff}</span><span className="metric-k">Difficulty</span></div>
        <div className="metric"><span className="metric-v">{blocks.filter(b => b.tampered).length}</span><span className="metric-k">Tampered</span></div>
      </div>

      {!valid && <div className="warn">⚠️ Chain INVALID — một hoặc nhiều block đã bị tamper. Hãy mine lại để phục hồi!</div>}

      {/* Add block form */}
      <div className="card">
        <div className="card-h">+ Thêm Block mới</div>
        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>DATA</div>
            <input className="inp" value={newData} onChange={e => setNewData(e.target.value)} placeholder="Nhập dữ liệu..." />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>TRANSACTIONS ({newTxs.length})</div>
            <div className="tx-list">
              {newTxs.map((tx, i) => (
                <div key={i} className="tx-chip">
                  <span>{tx}</span>
                  <button onClick={() => setNewTxs(t => t.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="inp" style={{ flex: 1 }} value={txInput} onChange={e => setTxInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && txInput.trim()) { setNewTxs(t => [...t, txInput.trim()]); setTxInput(""); } }}
                placeholder="Nhập transaction → Enter" />
              <button className="btn btn-ghost" onClick={() => { if (txInput.trim()) { setNewTxs(t => [...t, txInput.trim()]); setTxInput(""); } }}>+ Add</button>
            </div>
          </div>
          <div className="btn-row">
            <button className="btn btn-cyan" onClick={addBlock}>⛏ Mine & Add Block</button>
            <button className="btn btn-red" onClick={reset}>↺ Reset Chain</button>
          </div>
        </div>
      </div>

      {/* Chain visualization */}
      <div className="chain-wrap">
        {blocks.map((block, i) => {
          const isGenesis = block.index === 0;
          const status = block.tampered ? "tampered" : block.blockValid ? "valid" : "invalid";
          const isMining = mining === block.index;

          return (
            <div key={block.index}>
              <div className={`block-card ${status}`}>
                <div className="blk-hdr">
                  <span className="blk-idx">{isGenesis ? "⛓ Genesis" : `⬡ Block #${block.index}`}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {block.tampered && <span className="blk-badge badge-tamper">⚠ Tampered</span>}
                    <span className={`blk-badge ${block.blockValid && !block.tampered ? "badge-ok" : "badge-bad"}`}>
                      {block.blockValid && !block.tampered ? "✓ Valid" : "✗ Invalid"}
                    </span>
                  </div>
                </div>
                <div className="blk-body">
                  <div className="fld"><span className="fld-k">Timestamp</span><span className="fld-v">{new Date(block.timestamp).toLocaleTimeString("vi-VN")}</span></div>
                  <div className="fld"><span className="fld-k">Data</span><span className="fld-v" style={{ color: block.tampered ? "var(--amber)" : "var(--text)" }}>{block.data}</span></div>
                  {block.transactions?.length > 0 && (
                    <div className="fld"><span className="fld-k">Txs ({block.transactions.length})</span>
                      <span className="fld-v">{block.transactions.slice(0, 2).join(" · ")}{block.transactions.length > 2 ? " ..." : ""}</span>
                    </div>
                  )}
                  {block.merkleRoot && <div className="fld"><span className="fld-k">Merkle</span><span className="fld-v hash">{block.merkleRoot.slice(0, 20)}…</span></div>}
                  <div className="fld"><span className="fld-k">Prev Hash</span><span className={`fld-v ${isGenesis ? "genesis" : "hash"}`}>{block.previousHash.slice(0, 24)}…</span></div>
                  <div className="fld"><span className="fld-k">Nonce</span><span className="fld-v" style={{ color: "var(--amber)" }}>{block.nonce?.toLocaleString()}</span></div>
                  <div className="fld"><span className="fld-k">Hash</span>
                    <span className="fld-v hash" style={{ color: block.blockValid ? "var(--cyan)" : "var(--red)" }}>
                      {block.hash?.slice(0, 32)}…
                    </span>
                  </div>

                  {/* Tamper Detection panel */}
                  {!block.blockValid && !isGenesis && (
                    <div className="tamper-panel">
                      <div className="tamper-title">🔍 Tamper Detection</div>
                      <div className="detection-result">
                        <div className="det-row"><span className="det-k">Hash mismatch</span><span className="det-v bad">✗ Phát hiện</span></div>
                        <div className="det-row"><span className="det-k">Prev hash link</span><span className="det-v bad">✗ Bị đứt</span></div>
                        <div className="det-row"><span className="det-k">Stored hash</span><span className="det-v bad">{block.hash?.slice(0, 20)}…</span></div>
                        <div className="det-row"><span className="det-k">Giải pháp</span><span className="det-v" style={{ color: "var(--amber)" }}>Mine lại block này</span></div>
                      </div>
                    </div>
                  )}

                  {/* Controls */}
                  {!isGenesis && (
                    <div className="btn-row" style={{ marginTop: 4 }}>
                      {!isMining ? (
                        <button className="btn btn-cyan" onClick={() => startMining(block.index)}>⛏ Mine</button>
                      ) : (
                        <button className="btn btn-red" onClick={stopMining}>⏹ Stop</button>
                      )}
                      {!block.tampered && (
                        <button className="btn btn-ghost" onClick={() => {
                          setTamperIdx(tamperIdx === block.index ? null : block.index);
                          setTamperVal(block.data);
                        }}>
                          {tamperIdx === block.index ? "✕ Đóng" : "🔧 Tamper"}
                        </button>
                      )}
                      {(block.tampered || !block.blockValid) && (
                        <button className="btn btn-purple" onClick={() => restore(block.index)}>🔄 Restore All</button>
                      )}
                    </div>
                  )}

                  {/* Tamper input */}
                  {tamperIdx === block.index && (
                    <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                      <div style={{ fontSize: 10, color: "var(--amber)" }}>⚠️ Thay đổi dữ liệu để tamper block:</div>
                      <input className="inp" value={tamperVal} onChange={e => setTamperVal(e.target.value)} />
                      <button className="btn btn-red" onClick={() => tamper(block.index)}>🔧 Áp dụng Tamper</button>
                    </div>
                  )}

                  {/* Mining panel */}
                  {isMining && (
                    <div className="mine-panel">
                      <div className="mine-title">⚡ Mining in progress...</div>
                      <div className="nonce-big">{mineState.nonce?.toLocaleString()}</div>
                      <div className="hash-live">
                        {mineState.hash && <>
                          <span style={{ color: "var(--cyan)" }}>{mineState.hash.slice(0, "0".repeat(diff).length)}</span>
                          {mineState.hash.slice("0".repeat(diff).length, 12)}…
                        </>}
                      </div>
                      <div className="mine-bar"><div className="mine-fill" style={{ width: `${mineState.progress}%` }} /></div>
                      <div className="mine-stats">
                        <span>Target: {"0".repeat(diff)}...</span>
                        <span className="mining-pulse">⛏ Searching...</span>
                        <span>{(mineState.elapsed / 1000).toFixed(1)}s</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {i < blocks.length - 1 && (
                <div className="chain-connector">
                  <div className="conn-line" />
                  <span className="conn-label">previousHash →</span>
                  <div className="conn-line" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SHA-256 + AVALANCHE VIEW
// ═══════════════════════════════════════════════════════════════════
function HashView({ backendOk }) {
  const [input, setInput] = useState("Xin chào Blockchain!");
  const [hash, setHash] = useState("");
  const [steps, setSteps] = useState([]);
  const [loadingSteps, setLoadingSteps] = useState(false);

  // Avalanche
  const [av1, setAv1] = useState("Hello Blockchain");
  const [av2, setAv2] = useState("Hello Blockchajn");
  const [h1, setH1] = useState(""); const [h2, setH2] = useState("");

  useEffect(() => {
    const compute = async () => {
      const d = await api("/api/hash", "POST", { input });
      if (d?.hash) setHash(d.hash);
      else { const h = await sha256browser(input); setHash(h); }
    };
    compute();
  }, [input]);

  useEffect(() => {
    const compute = async () => {
      const d1 = await api("/api/hash", "POST", { input: av1 });
      const d2 = await api("/api/hash", "POST", { input: av2 });
      if (d1?.hash) setH1(d1.hash); else setH1(await sha256browser(av1));
      if (d2?.hash) setH2(d2.hash); else setH2(await sha256browser(av2));
    };
    compute();
  }, [av1, av2]);

  const loadSteps = async () => {
    setLoadingSteps(true);
    const d = await api("/api/hash/steps", "POST", { input });
    if (d?.steps) setSteps(d.steps);
    setLoadingSteps(false);
  };

  const diffCount = h1 && h2 ? [...h1].filter((c, i) => c !== h2[i]).length : 0;
  const diffPct = h1 ? Math.round((diffCount / 64) * 100) : 0;

  return (
    <div>
      <div className="ph">🔐 SHA-256 & Avalanche Effect</div>
      <div className="ps">Backend tính SHA-256 thực (Java MessageDigest / Node crypto) — không mock</div>

      {/* Main hash demo */}
      <div className="card">
        <div className="card-h">SHA-256 Hash</div>
        <div className="card-sub">Hàm băm một chiều: dù input thay đổi 1 bit, output thay đổi hoàn toàn</div>
        <div className="hash-io-grid">
          <div className="hash-box">
            <div className="hash-box-lbl">📝 Input</div>
            <textarea className="inp" style={{ height: 80, resize: "vertical" }} value={input} onChange={e => setInput(e.target.value)} />
          </div>
          <div className="hash-arrow">→</div>
          <div className="hash-box">
            <div className="hash-box-lbl">🔑 SHA-256 Output (256 bits = 64 hex chars)</div>
            <div className="hash-box-val">{hash}</div>
          </div>
        </div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={loadSteps} disabled={loadingSteps}>
            {loadingSteps ? "⏳ Loading..." : "🔬 Xem từng bước SHA-256"}
          </button>
        </div>

        {steps.length > 0 && (
          <div className="step-list" style={{ marginTop: 14 }}>
            {steps.map((s, i) => {
              const [label, ...rest] = s.split(": ");
              return (
                <div key={i} className="step-row" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="step-num">{i + 1}</div>
                  <div className="step-txt"><strong>{label}</strong>{rest.length ? ": " + rest.join(": ") : ""}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Avalanche Effect */}
      <div className="card">
        <div className="card-h">🌊 Avalanche Effect Visualizer</div>
        <div className="card-sub">Thay đổi 1 ký tự → xem bao nhiêu hex characters thay đổi (lý tưởng &gt; 50%)</div>

        <div className="two-col" style={{ marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>INPUT 1</div>
            <input className="inp" value={av1} onChange={e => setAv1(e.target.value)} />
            <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 4, wordBreak: "break-all" }}>{h1.slice(0, 32)}…</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>INPUT 2</div>
            <input className="inp" value={av2} onChange={e => setAv2(e.target.value)} />
            <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 4, wordBreak: "break-all" }}>{h2.slice(0, 32)}…</div>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "12px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: 14 }}>
          <div className="diff-big">{diffCount}<span style={{ fontSize: 24, color: "var(--text3)" }}>/64</span></div>
          <div className="diff-sub">ký tự hex khác nhau — <strong style={{ color: diffPct >= 50 ? "var(--green)" : "var(--amber)" }}>{diffPct}%</strong> thay đổi</div>
        </div>

        {h1 && h2 && (
          <div className="two-col">
            {[{ label: "Hash 1", h: h1, other: h2 }, { label: "Hash 2", h: h2, other: h1 }].map(({ label, h, other }) => (
              <div key={label} style={{ background: "var(--s3)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 9, color: "var(--text3)", marginBottom: 6 }}>{label}</div>
                <div className="hex-grid">
                  {[...h].map((c, i) => (
                    <div key={i} className={`hex-c ${c !== other[i] ? "diff" : "same"}`}>{c}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MERKLE TREE INTERACTIVE
// ═══════════════════════════════════════════════════════════════════
function MerkleView({ backendOk }) {
  const [txs, setTxs] = useState(["Alice→Bob: 5 BTC", "Bob→Carol: 2 BTC", "Carol→Dave: 1 BTC", "Dave→Eve: 0.5 BTC"]);
  const [txInput, setTxInput] = useState("");
  const [tree, setTree] = useState(null);
  const [selected, setSelected] = useState(null);

  const buildTree = useCallback(async () => {
    if (txs.length === 0) { setTree(null); return; }
    const d = await api("/api/merkle", "POST", { transactions: txs });
    if (d?.root) setTree(d);
    else {
      // Browser fallback
      function sha256b(s) { return sha256browser(s); }
      // simplified browser build
    }
  }, [txs]);

  useEffect(() => { buildTree(); }, [buildTree]);

  const addTx = () => {
    if (txInput.trim()) { setTxs(t => [...t, txInput.trim()]); setTxInput(""); }
  };

  const removeTx = (i) => setTxs(t => t.filter((_, j) => j !== i));

  // Render Merkle tree as SVG
  const renderTree = () => {
    if (!tree || !tree.levels) return null;
    const levels = tree.levels;
    const svgW = Math.max(700, levels[levels.length - 1].length * 160);
    const nodeH = 64;
    const levelGap = 70;
    const svgH = levels.length * (nodeH + levelGap) + 20;
    const txLevel = tree.transactions || [];

    // Compute node positions
    const positions = [];
    levels.forEach((level, li) => {
      const posRow = [];
      const total = level.length;
      level.forEach((_, ni) => {
        const x = (svgW / (total + 1)) * (ni + 1);
        const y = li * (nodeH + levelGap) + 40;
        posRow.push({ x, y });
      });
      positions.push(posRow);
    });

    // Tx positions (bottom)
    const txY = levels.length * (nodeH + levelGap) + 40;
    const txPositions = txLevel.map((_, i) => ({
      x: (svgW / (txLevel.length + 1)) * (i + 1),
      y: txY
    }));

    const isSelected = (hash) => selected === hash;
    const nodeColor = (hash) => {
      if (isSelected(hash)) return "#00f5ff";
      if (hash === tree.root) return "#7c3aed";
      return "#1a2340";
    };

    return (
      <svg width={svgW} height={svgH + 100} className="merkle-svg" style={{ minWidth: 600 }}>
        {/* Draw edges between levels */}
        {levels.map((level, li) => {
          if (li >= levels.length - 1) return null;
          return level.map((_, ni) => {
            const parent = positions[li][ni];
            const childBase = ni * 2;
            const children = [childBase, childBase + 1].filter(ci => ci < positions[li + 1]?.length);
            return children.map(ci => {
              const child = positions[li + 1][ci];
              return (
                <line key={`${li}-${ni}-${ci}`}
                  x1={parent.x} y1={parent.y + nodeH / 2}
                  x2={child.x} y2={child.y - nodeH / 2}
                  stroke="#1e2d4a" strokeWidth="1.5" />
              );
            });
          });
        })}

        {/* Edges from leaf level to transactions */}
        {positions.length > 0 && txPositions.map((tp, i) => {
          const leafRow = positions[positions.length - 1];
          const parentIdx = Math.min(Math.floor(i / 2), leafRow.length - 1);
          const lp = leafRow[parentIdx] || leafRow[0];
          if (!lp) return null;
          return (
            <line key={`leaf-${i}`}
              x1={lp.x} y1={lp.y + nodeH / 2}
              x2={tp.x} y2={tp.y - 22}
              stroke="#243558" strokeWidth="1" strokeDasharray="4,4" />
          );
        })}

        {/* Draw hash nodes */}
        {levels.map((level, li) => level.map((hash, ni) => {
          const pos = positions[li][ni];
          const isRoot = li === 0;
          const isSel = isSelected(hash);
          return (
            <g key={`${li}-${ni}`} style={{ cursor: "pointer" }} onClick={() => setSelected(isSel ? null : hash)}>
              <rect x={pos.x - 65} y={pos.y - nodeH / 2} width={130} height={nodeH}
                rx={8} fill={isRoot ? "#2a1d5e" : isSel ? "#0d2a3a" : "#0d1424"}
                stroke={isRoot ? "#7c3aed" : isSel ? "#00f5ff" : "#1e2d4a"}
                strokeWidth={isRoot || isSel ? 2 : 1} />
              {isRoot && <text x={pos.x} y={pos.y - nodeH / 2 - 6} textAnchor="middle" fill="#a855f7" fontSize="9" fontFamily="Space Mono" fontWeight="700">ROOT</text>}
              <text x={pos.x} y={pos.y - 6} textAnchor="middle" fill={isRoot ? "#a855f7" : isSel ? "#00f5ff" : "#3d5278"} fontSize="8" fontFamily="Space Mono">
                {hash.slice(0, 8)}
              </text>
              <text x={pos.x} y={pos.y + 8} textAnchor="middle" fill={isRoot ? "#7c3aed" : isSel ? "#00c8d8" : "#1e2d4a"} fontSize="7" fontFamily="Space Mono">
                {hash.slice(8, 16)}…
              </text>
              <text x={pos.x} y={pos.y + 20} textAnchor="middle" fill={isSel ? "#00f5ff" : "#3d5278"} fontSize="8" fontFamily="Space Mono">
                L{li} #{ni}
              </text>
            </g>
          );
        }))}

        {/* Transaction leaves */}
        {txLevel.map((tx, i) => {
          const tp = txPositions[i];
          const txHash = tx.hash;
          const isSel = isSelected(txHash);
          return (
            <g key={`tx-${i}`} style={{ cursor: "pointer" }} onClick={() => setSelected(isSel ? null : txHash)}>
              <rect x={tp.x - 65} y={tp.y - 22} width={130} height={44}
                rx={6} fill={isSel ? "#0d2a1a" : "#080d19"}
                stroke={isSel ? "#10b981" : "#243558"} strokeWidth={isSel ? 2 : 1} />
              <text x={tp.x} y={tp.y - 7} textAnchor="middle" fill={isSel ? "#10b981" : "#8fa3be"} fontSize="8" fontFamily="Space Mono">
                {tx.data.slice(0, 14)}{tx.data.length > 14 ? "…" : ""}
              </text>
              <text x={tp.x} y={tp.y + 7} textAnchor="middle" fill={isSel ? "#00f5ff" : "#3d5278"} fontSize="7" fontFamily="Space Mono">
                {txHash.slice(0, 10)}…
              </text>
              <text x={tp.x} y={tp.y + 18} textAnchor="middle" fill="#1e2d4a" fontSize="7">TX #{i}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div>
      <div className="ph">🌳 Merkle Tree Interactive</div>
      <div className="ps">Thêm/xóa transactions — tree tự động cập nhật. Click node để highlight đường đến root</div>

      <div className="card">
        <div className="card-h">Transactions</div>
        <div className="tx-list">
          {txs.map((tx, i) => (
            <div key={i} className="tx-chip">
              <span>{tx}</span>
              <button onClick={() => removeTx(i)}>✕</button>
            </div>
          ))}
        </div>
        <div className="merkle-input-row">
          <input className="inp" style={{ flex: 1 }} value={txInput} onChange={e => setTxInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTx()} placeholder="Thêm transaction → Enter" />
          <button className="btn btn-cyan" onClick={addTx}>+ Add</button>
        </div>
      </div>

      {tree && (
        <>
          <div className="info">
            🌳 <strong>Merkle Root:</strong> <span style={{ fontFamily: "var(--mono)", fontSize: 10 }}>{tree.root}</span>
            <br />Thay đổi bất kỳ transaction nào → root thay đổi hoàn toàn (Avalanche Effect ở cấp tree)
          </div>
          <div className="merkle-wrap">{renderTree()}</div>

          {selected && (
            <div className="card">
              <div className="card-h">🔍 Node chi tiết</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--cyan)", wordBreak: "break-all" }}>{selected}</div>
              {tree.transactions?.find(t => t.hash === selected) && (
                <div style={{ marginTop: 8, color: "var(--text2)", fontSize: 11 }}>
                  📄 Data: <strong>{tree.transactions.find(t => t.hash === selected).data}</strong>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TUTORIAL
// ═══════════════════════════════════════════════════════════════════
const TUTS = [
  {
    title: "1. Hash Function",
    color: "var(--cyan)",
    content: <>
      <p><strong>Hash function</strong> chuyển đổi dữ liệu tùy ý → chuỗi fixed-length.</p>
      <p><strong>SHA-256</strong> (Secure Hash Algorithm 256-bit) là chuẩn dùng trong Bitcoin:</p>
      <div className="demo-box">
        SHA256("Hello") → <strong>185f8db32921bd46d35c4f64...</strong><br/>
        SHA256("Hellp") → <strong>ab7b9c6a82d3e5f1c4901...</strong> (hoàn toàn khác!)<br/>
        SHA256(1TB data) → vẫn là <strong>64 ký tự hex</strong>
      </div>
      <p>4 tính chất quan trọng: <strong>Deterministic</strong> · <strong>One-way</strong> · <strong>Avalanche</strong> · <strong>Collision-resistant</strong></p>
    </>
  },
  {
    title: "2. Block Structure",
    color: "var(--purple2)",
    content: <>
      <p>Mỗi <strong>Block</strong> là một container chứa:</p>
      <div className="demo-box">
        <span style={{ color: "var(--cyan)" }}>index</span>: 3 (số thứ tự)<br/>
        <span style={{ color: "var(--cyan)" }}>timestamp</span>: 1709123456789<br/>
        <span style={{ color: "var(--cyan)" }}>data</span>: "Alice gửi Bob 5 BTC"<br/>
        <span style={{ color: "var(--cyan)" }}>previousHash</span>: "0000a3f8..." ← hash của block trước<br/>
        <span style={{ color: "var(--cyan)" }}>nonce</span>: 48291 ← số tìm được khi mining<br/>
        <span style={{ color: "var(--amber)" }}>hash</span> = SHA256(index+timestamp+data+prevHash+nonce)
      </div>
      <p>Hash của block = "dấu vân tay" duy nhất. Thay đổi bất kỳ field nào → hash hoàn toàn khác.</p>
    </>
  },
  {
    title: "3. Chain & Immutability",
    color: "var(--green)",
    content: <>
      <p>Các block nối nhau qua <strong>previousHash</strong> tạo thành "chuỗi" — Blockchain!</p>
      <div className="demo-box">
        [Block 1: hash=<strong>000a</strong>] → [Block 2: prev=<strong>000a</strong>, hash=<strong>000b</strong>] → [Block 3: prev=<strong>000b</strong>]
      </div>
      <p>Nếu sửa dữ liệu Block 2:</p>
      <div className="demo-box">
        Block 2 hash thay đổi → <strong style={{ color: "var(--red)" }}>000x</strong><br/>
        Block 3 lưu prev=<strong>000b</strong> ≠ <strong>000x</strong> → <span style={{ color: "var(--red)" }}>INVALID!</span><br/>
        Block 4, 5, ... → <span style={{ color: "var(--red)" }}>INVALID theo domino!</span>
      </div>
      <p>Để làm giả: phải tính lại hash của <strong>tất cả blocks phía sau</strong> — cực kỳ tốn công!</p>
    </>
  },
  {
    title: "4. Proof of Work",
    color: "var(--amber)",
    content: <>
      <p><strong>PoW</strong> là cơ chế đồng thuận của Bitcoin — đòi hỏi "bằng chứng đã làm việc".</p>
      <p>Quy tắc: tìm <code>nonce</code> sao cho:</p>
      <div className="demo-box">
        SHA256(data + nonce).startsWith(<strong style={{ color: "var(--amber)" }}>"0000"</strong>)  ← difficulty = 4
      </div>
      <p>Vì không có cách nào đoán trước — chỉ có thể <strong>brute-force</strong>:</p>
      <div className="demo-box">
        nonce=0: <span style={{ color: "var(--red)" }}>a3f8... ✗</span><br/>
        nonce=1: <span style={{ color: "var(--red)" }}>7b2d... ✗</span><br/>
        ...<br/>
        nonce=48291: <span style={{ color: "var(--green)" }}>0000a4b7... ✓ FOUND!</span>
      </div>
      <p>Difficulty cao hơn → nhiều số 0 hơn → cần thử nhiều nonce hơn → tốn nhiều CPU hơn → khó fake hơn!</p>
    </>
  },
  {
    title: "5. Merkle Tree",
    color: "var(--purple2)",
    content: <>
      <p><strong>Merkle Tree</strong> là cấu trúc dữ liệu để xác minh transactions hiệu quả.</p>
      <div className="demo-box">
        TX1 TX2 TX3 TX4  ← Transactions<br/>
        H1  H2  H3  H4   ← SHA256(TXi)<br/>
        H12     H34      ← SHA256(H1+H2), SHA256(H3+H4)<br/>
        <strong style={{ color: "var(--purple2)" }}>ROOT</strong>           ← SHA256(H12+H34) → lưu vào Block Header
      </div>
      <p>Lợi ích: để xác minh TX3 hợp lệ, chỉ cần H4 + H12 + Root — không cần download toàn bộ chain! (SPV Proof)</p>
      <p>→ Thử tab <strong>Merkle Tree</strong> để visualize!</p>
    </>
  },
  {
    title: "6. Avalanche Effect",
    color: "var(--red)",
    content: <>
      <p><strong>Avalanche Effect</strong> là tính chất quan trọng nhất của hàm hash mật mã:</p>
      <div className="demo-box">
        SHA256("Hello Blockchain") = <strong>2cf24d...</strong><br/>
        SHA256("Hello Blockchajn") = <strong>a7f891...</strong> ← đổi 1 chữ "i"→"j"<br/>
        <span style={{ color: "var(--red)" }}>≈ 50% bit thay đổi!</span>
      </div>
      <p>Tại sao quan trọng với Blockchain?</p>
      <ul style={{ marginLeft: 18, lineHeight: 2.2 }}>
        <li>Không thể <strong>đoán trước</strong> hash khi biết input gần đúng</li>
        <li>Không thể <strong>tối ưu ngược</strong> (reverse engineer) input từ hash</li>
        <li>PoW mining phải brute-force 100% — không có shortcut</li>
      </ul>
    </>
  },
];

function TutorialView() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(new Set());
  const go = (i) => { setDone(d => new Set([...d, step])); setStep(i); };
  return (
    <div>
      <div className="ph">📚 Blockchain từ A đến Z</div>
      <div className="ps">6 khái niệm cốt lõi được giải thích bằng ví dụ thực tế</div>
      <div className="tut-pills">
        {TUTS.map((t, i) => (
          <button key={i} className={`tut-pill ${step === i ? "on" : done.has(i) ? "done" : ""}`} onClick={() => go(i)}>
            {done.has(i) ? "✓ " : ""}{t.title}
          </button>
        ))}
      </div>
      <div className="tut-box">
        <div className="tut-h" style={{ color: TUTS[step].color }}>{TUTS[step].title}</div>
        <div className="tut-body">{TUTS[step].content}</div>
        <div className="btn-row">
          {step > 0 && <button className="btn btn-ghost" onClick={() => go(step - 1)}>← Trước</button>}
          {step < TUTS.length - 1 && <button className="btn btn-cyan" onClick={() => go(step + 1)}>Tiếp →</button>}
          {step === TUTS.length - 1 && <button className="btn btn-cyan" onClick={() => go(0)}>↺ Bắt đầu lại</button>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// QUIZ
// ═══════════════════════════════════════════════════════════════════
const QS = [
  { q: "SHA-256 luôn tạo output có kích thước bao nhiêu?", opts: ["128 bits (32 hex)", "256 bits (64 hex)", "512 bits (128 hex)", "Tùy theo input"], ans: 1, exp: "SHA-256 luôn cho output 256 bits = 64 ký tự hex, bất kể input có kích thước nào — đây là tính fixed-length output." },
  { q: "Trong blockchain 10 blocks, kẻ tấn công sửa data của Block #4. Điều gì xảy ra?", opts: ["Chỉ Block #4 invalid", "Block #4 → #10 đều invalid", "Không có gì thay đổi vì data được mã hóa", "Toàn bộ chain từ #1 invalid"], ans: 1, exp: "Hash Block #4 thay đổi → previousHash trong Block #5 không khớp → Block #5 invalid → hiệu ứng domino đến Block #10." },
  { q: "Mục đích của 'nonce' trong mining là gì?", opts: ["Mã hóa dữ liệu của block", "Số tùy ý được tăng dần để tìm hash hợp lệ", "Timestamp của block", "Chữ ký số của miner"], ans: 1, exp: "Nonce là số được tăng dần (0, 1, 2...) trong vòng lặp PoW mining. Miner thay đổi nonce cho đến khi tìm hash bắt đầu bằng đủ số 0 (theo difficulty)." },
  { q: "Merkle Root lưu trong Block Header dùng để làm gì?", opts: ["Lưu trữ toàn bộ transactions", "Xác minh transaction nhanh mà không cần download toàn bộ chain", "Tính toán PoW", "Kết nối với block trước"], ans: 1, exp: "Merkle Root cho phép SPV (Simplified Payment Verification): xác minh 1 TX chỉ cần O(log n) hashes thay vì toàn bộ chain — cực kỳ hiệu quả cho light clients." },
  { q: "Avalanche Effect có nghĩa là gì?", opts: ["Hash càng lớn càng an toàn", "Thay đổi 1 bit input → hơn 50% output bits thay đổi", "Blockchain mở rộng theo cấp số nhân", "Mining khó hơn theo thời gian"], ans: 1, exp: "Avalanche Effect: 1 bit input thay đổi → ~50% output bits thay đổi ngẫu nhiên. Điều này khiến PoW mining phải brute-force hoàn toàn, không có shortcut hay pattern nào để khai thác." },
  { q: "Tại sao tăng difficulty làm blockchain an toàn hơn?", opts: ["Vì data được mã hóa mạnh hơn", "Vì miner cần thử nhiều nonce hơn → tốn nhiều CPU/thời gian hơn để tấn công", "Vì block size tăng", "Vì có nhiều validators hơn"], ans: 1, exp: "Difficulty cao → cần tìm hash với nhiều số 0 đầu hơn → xác suất ngẫu nhiên thấp hơn → cần nhiều lần thử hơn → kẻ tấn công cần nhiều computing power hơn toàn bộ mạng lưới." },
];

function QuizView() {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const q = QS[cur];

  const pick = (i) => {
    if (sel !== null) return;
    setSel(i);
    if (i === q.ans) { setScore(s => s + 1); setConfetti(true); setTimeout(() => setConfetti(false), 2000); }
  };

  const next = () => {
    if (cur < QS.length - 1) { setCur(c => c + 1); setSel(null); }
    else setDone(true);
  };

  const reset = () => { setCur(0); setSel(null); setScore(0); setDone(false); };

  if (done) {
    const pct = Math.round((score / QS.length) * 100);
    return (
      <div>
        <Confetti active={pct >= 80} />
        <div className="ph">📊 Kết quả</div>
        <div className="quiz-box" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontFamily: "var(--sans)", fontSize: 72, fontWeight: 900, color: pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--amber)" : "var(--red)", lineHeight: 1 }}>
            {score}/{QS.length}
          </div>
          <div style={{ fontSize: 18, color: "var(--text2)", marginTop: 8, fontFamily: "var(--sans)" }}>{pct}% chính xác</div>
          <div style={{ fontSize: 13, color: "var(--text)", marginTop: 16, maxWidth: 400, margin: "16px auto 0" }}>
            {pct >= 80 ? "🎉 Xuất sắc! Bạn đã nắm vững Blockchain fundamentals!" :
             pct >= 60 ? "📖 Khá tốt! Ôn lại Tutorial để củng cố thêm." :
             "💪 Thử lại nhé! Đọc Tutorial và dùng Simulator trước."}
          </div>
          <div className="btn-row" style={{ justifyContent: "center", marginTop: 24 }}>
            <button className="btn btn-cyan" onClick={reset}>↺ Làm lại Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Confetti active={confetti} />
      <div className="ph">❓ Quiz — Kiểm tra kiến thức</div>
      <div className="ps">{QS.length} câu hỏi về Hash, Block, Chain, PoW, Merkle, Avalanche</div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: "var(--text3)" }}>Câu {cur + 1}/{QS.length}</span>
        <div style={{ flex: 1 }}>
          <div className="quiz-prog"><div className="quiz-prog-fill" style={{ width: `${(cur / QS.length) * 100}%` }} /></div>
        </div>
        <span style={{ fontSize: 11, color: "var(--green)" }}>✓ {score} đúng</span>
      </div>

      <div className="quiz-box">
        <div className="quiz-q">{q.q}</div>
        <div className="quiz-opts">
          {q.opts.map((opt, i) => (
            <button key={i} className={`quiz-opt ${sel !== null ? (i === q.ans ? "right" : i === sel ? "wrong" : "") : ""}`}
              onClick={() => pick(i)} disabled={sel !== null}>
              <span className="opt-letter">{["A","B","C","D"][i]}</span>
              {opt}
            </button>
          ))}
        </div>
        {sel !== null && (
          <>
            <div className={`quiz-fb ${sel === q.ans ? "fb-ok" : "fb-bad"}`}>
              {sel === q.ans ? "✅ Chính xác! " : "❌ Chưa đúng. "}{q.exp}
            </div>
            <div className="btn-row">
              <button className="btn btn-cyan" onClick={next}>
                {cur < QS.length - 1 ? "Câu tiếp →" : "Xem kết quả 📊"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
const VIEWS = [
  { id: "tutorial", label: "📚 Tutorial" },
  { id: "chain",    label: "⛓ Simulator" },
  { id: "hash",     label: "🔐 SHA-256" },
  { id: "merkle",   label: "🌳 Merkle Tree" },
  { id: "quiz",     label: "❓ Quiz" },
];

const CONCEPTS = [
  ["⬡", "SHA-256 Hashing"],
  ["⬡", "Proof of Work"],
  ["⬡", "Immutability"],
  ["⬡", "Avalanche Effect"],
  ["⬡", "Chain Validation"],
  ["⬡", "Merkle Tree"],
  ["⬡", "Tamper Detection"],
  ["⬡", "SPV Proof"],
];

function App() {
  const [view, setView] = useState("tutorial");
  const [difficulty, setDifficulty] = useState(3);
  const [backendOk, setBackendOk] = useState(false);

  // Check backend health
  useEffect(() => {
    const check = async () => {
      const d = await api("/health");
      setBackendOk(!!d?.status);
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{G}</style>
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="logo">⛓ BlockEdu <em>Pro / Full-Stack Blockchain Visualizer</em></div>
          <div className="tabs">
            {VIEWS.map(v => (
              <button key={v.id} className={`tab ${view === v.id ? "on" : ""}`} onClick={() => setView(v.id)}>
                {v.label}
              </button>
            ))}
          </div>
          <div className="hdr-right">
            <div className={`status-dot ${backendOk ? "" : "off"}`} />
            <span className="status-txt">{backendOk ? "Backend OK" : "Backend offline"}</span>
            <select className="diff-sel" value={difficulty} onChange={e => setDifficulty(Number(e.target.value))}>
              <option value={1}>Diff: 1</option>
              <option value={2}>Diff: 2</option>
              <option value={3}>Diff: 3</option>
              <option value={4}>Diff: 4</option>
              <option value={5}>Diff: 5</option>
            </select>
          </div>
        </header>

        {/* Body */}
        <div className="body">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sb-lbl">Modules</div>
            {VIEWS.map(v => (
              <button key={v.id} className={`sb-btn ${view === v.id ? "on" : ""}`} onClick={() => setView(v.id)}>
                <span>{v.label.split(" ")[0]}</span>
                {v.label.split(" ").slice(1).join(" ")}
              </button>
            ))}

            <div className="sb-hr" />
            <div className="sb-lbl">Khái niệm</div>
            {CONCEPTS.map(([icon, name]) => (
              <div key={name} className="concept-tag"><span>{icon}</span>{name}</div>
            ))}

            <div className="sb-hr" />
            <div className="sb-lbl">Backend</div>
            <div className="concept-tag" style={{ flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
              <span style={{ color: "var(--cyan)", fontSize: 10 }}>node server.js</span>
              <span style={{ fontSize: 9, color: "var(--text3)", lineHeight: 1.6 }}>
                SHA-256: crypto.createHash<br />
                PoW: SSE stream<br />
                Merkle: buildMerkleTree()<br />
                Port: 3001
              </span>
            </div>

            {!backendOk && (
              <div className="warn" style={{ margin: "8px 4px 0", fontSize: 10 }}>
                ⚠️ Chạy: <code style={{ color: "var(--cyan)" }}>node server.js</code> để kết nối backend
              </div>
            )}
          </aside>

          {/* Content */}
          <main className="content">
            {view === "tutorial" && <TutorialView />}
            {view === "chain"    && <BlockchainView difficulty={difficulty} setDifficulty={setDifficulty} backendOk={backendOk} />}
            {view === "hash"     && <HashView backendOk={backendOk} />}
            {view === "merkle"   && <MerkleView backendOk={backendOk} />}
            {view === "quiz"     && <QuizView />}
          </main>
        </div>
      </div>
    </>
  );
}
