// ═══════════════════════════════════════════════════════
// BlockEduPro — SHA-256 Cryptographic Hash Demo
// SVNCKH Student Research Competition
// ═══════════════════════════════════════════════════════
const { useState, useEffect, useRef, useCallback } = React;

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API = isLocal ? "http://localhost:3001" : window.location.origin;

async function sha256browser(msg) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function apiHash(input) {
  try {
    const r = await fetch(`${API}/api/hash`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input }) });
    const d = await r.json();
    return d?.hash || null;
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════
// GLOBAL CSS
// ═══════════════════════════════════════════════════════
const STYLES = `
:root {
  --bg: #030712;
  --bg1: #0a0f1e;
  --bg2: #0f172a;
  --bg3: #1e293b;
  --border: #1e3a5f;
  --border2: #2563eb44;
  --cyan: #22d3ee;
  --cyan2: #06b6d4;
  --blue: #3b82f6;
  --blue2: #1d4ed8;
  --purple: #a78bfa;
  --green: #34d399;
  --red: #f87171;
  --amber: #fbbf24;
  --text: #f1f5f9;
  --text2: #94a3b8;
  --text3: #475569;
  --mono: 'JetBrains Mono', monospace;
  --sans: 'Inter', sans-serif;
  --glow-cyan: 0 0 20px rgba(34,211,238,0.35), 0 0 60px rgba(34,211,238,0.12);
  --glow-blue: 0 0 20px rgba(59,130,246,0.35);
  --shadow: 0 4px 24px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 48px rgba(0,0,0,0.6);
}

@keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes pulseGlow { 0%,100% { box-shadow: var(--glow-cyan); } 50% { box-shadow: 0 0 40px rgba(34,211,238,0.6), 0 0 80px rgba(34,211,238,0.2); } }
@keyframes scanline { 0% { transform:translateY(-100%); } 100% { transform:translateY(100vh); } }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
@keyframes pop { 0%,100% { transform:scale(1); } 50% { transform:scale(1.5); } }
@keyframes spin { to { transform:rotate(360deg); } }
@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
@keyframes dotPulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.5);opacity:0.7;} }
@keyframes flow { 0%{opacity:0.4;} 50%{opacity:1;} 100%{opacity:0.4;} }

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  overflow-x: hidden;
  line-height: 1.6;
}

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: var(--bg1); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: var(--cyan2); }

/* ── Navigation ── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(3,7,18,0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  transition: all 0.3s;
}
.nav-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; gap: 16px;
  padding: 0 24px; height: 60px;
}
.nav-logo {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--sans); font-weight: 800; font-size: 16px;
  white-space: nowrap; text-decoration: none; color: var(--text);
  letter-spacing: -0.4px;
}
.nav-logo-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: linear-gradient(135deg, var(--cyan), var(--blue));
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
}
.nav-logo-text { background: linear-gradient(135deg, var(--cyan), var(--blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-logo-sub { font-size: 10px; color: var(--text3); font-weight: 400; -webkit-text-fill-color: var(--text3); }

.nav-links {
  display: flex; gap: 4px; margin-left: auto;
  list-style: none;
}
.nav-link {
  background: none; border: none; cursor: pointer;
  font-family: var(--sans); font-size: 13px; font-weight: 500;
  color: var(--text2); padding: 7px 14px; border-radius: 8px;
  transition: all 0.2s; white-space: nowrap;
}
.nav-link:hover { color: var(--text); background: rgba(255,255,255,0.06); }
.nav-link.active { color: var(--cyan); background: rgba(34,211,238,0.1); }

.nav-hamburger {
  display: none; background: none; border: none; cursor: pointer;
  color: var(--text2); padding: 8px; margin-left: auto;
}
.nav-mobile {
  display: none; flex-direction: column; gap: 4px;
  padding: 12px 20px 16px;
  border-top: 1px solid var(--border);
  background: rgba(10,15,30,0.98);
}
.nav-mobile.open { display: flex; }
.nav-mobile-link {
  background: none; border: none; cursor: pointer;
  font-family: var(--sans); font-size: 14px; font-weight: 500;
  color: var(--text2); padding: 12px 16px; border-radius: 10px;
  transition: all 0.2s; text-align: left;
}
.nav-mobile-link:hover { color: var(--text); background: rgba(255,255,255,0.05); }
.nav-mobile-link.active { color: var(--cyan); background: rgba(34,211,238,0.1); }

/* ── Page wrapper ── */
.page { min-height: 100vh; padding-top: 60px; }

/* ── Buttons ── */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  border: none; border-radius: 12px;
  font-family: var(--sans); font-size: 14px; font-weight: 600;
  padding: 11px 22px; cursor: pointer; transition: all 0.2s;
  white-space: nowrap;
}
.btn-primary {
  background: linear-gradient(135deg, var(--cyan), var(--blue));
  color: #030712;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: var(--glow-cyan); }
.btn-secondary {
  background: rgba(255,255,255,0.06);
  color: var(--text); border: 1px solid var(--border);
}
.btn-secondary:hover { border-color: var(--cyan); color: var(--cyan); background: rgba(34,211,238,0.08); }
.btn-ghost { background: none; border: 1px solid var(--border); color: var(--text2); }
.btn-ghost:hover { border-color: var(--cyan2); color: var(--cyan); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
.btn-sm { padding: 7px 14px; font-size: 12px; border-radius: 8px; }

/* ── Cards ── */
.card {
  background: linear-gradient(145deg, var(--bg1), rgba(15,23,42,0.8));
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.card:hover { border-color: var(--border2); box-shadow: var(--shadow-lg); }
.card-sm { padding: 16px; border-radius: 14px; }

/* ── Inputs ── */
.inp {
  width: 100%;
  background: rgba(15,23,42,0.8);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font-family: var(--mono);
  font-size: 13px;
  padding: 12px 16px;
  outline: none;
  transition: all 0.2s;
}
.inp:hover { border-color: #2563eb66; }
.inp:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(34,211,238,0.12); background: rgba(15,23,42,0.95); }
textarea.inp { resize: vertical; min-height: 72px; line-height: 1.7; }

/* ── Labels ── */
.label { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px; display: block; }

/* ── Badges ── */
.badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.badge-cyan { background: rgba(34,211,238,0.12); color: var(--cyan); border: 1px solid rgba(34,211,238,0.25); }
.badge-green { background: rgba(52,211,153,0.12); color: var(--green); border: 1px solid rgba(52,211,153,0.25); }
.badge-purple { background: rgba(167,139,250,0.12); color: var(--purple); border: 1px solid rgba(167,139,250,0.25); }
.badge-amber { background: rgba(251,191,36,0.12); color: var(--amber); border: 1px solid rgba(251,191,36,0.25); }

/* ── Section layout ── */
.section { max-width: 1100px; margin: 0 auto; padding: 60px 24px; }
.section-sm { padding: 40px 24px; }

/* ── Hash display ── */
.hash-display {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--cyan);
  word-break: break-all;
  line-height: 2.2;
  letter-spacing: 0.5px;
  text-shadow: 0 0 12px rgba(34,211,238,0.5);
}
.hash-display .h-group { display: inline-block; margin-right: 6px; }
.hash-display .h-group:nth-child(even) { color: var(--blue); text-shadow: 0 0 12px rgba(59,130,246,0.5); }

.hash-char {
  display: inline-block;
  transition: all 0.35s;
}
.hash-char.diff {
  color: var(--red);
  text-shadow: 0 0 10px rgba(248,113,113,0.7);
  animation: pop 0.4s ease;
  background: rgba(248,113,113,0.15);
  border-radius: 3px;
  padding: 0 1px;
}
.hash-char.same { color: var(--text3); }

/* ── Hex grid for avalanche ── */
.hex-grid { display: flex; flex-wrap: wrap; gap: 3px; }
.hex-cell {
  width: 22px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 10px;
  border-radius: 5px; transition: all 0.3s;
  background: var(--bg2);
}
.hex-cell.diff { background: rgba(248,113,113,0.2); color: var(--red); animation: pop 0.4s ease; box-shadow: 0 0 6px rgba(248,113,113,0.3); }
.hex-cell.same { color: var(--text3); }

/* ── Progress bar ── */
.progress-bar { height: 4px; background: var(--bg3); border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--cyan), var(--blue), var(--purple)); border-radius: 99px; transition: width 0.4s; box-shadow: 0 0 8px rgba(34,211,238,0.5); }

/* ── Grid helpers ── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  .section { padding: 40px 16px; }
  .nav-links { display: none; }
  .nav-hamburger { display: flex; }
  .card { padding: 16px; }
  .btn { padding: 10px 18px; }
}
@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: 1fr 1fr; }
}
`;

// ═══════════════════════════════════════════════════════
// HOME VIEW
// ═══════════════════════════════════════════════════════
const FEATURES = [
  { icon: "🔐", title: "Fixed-Length Output", desc: "SHA-256 luôn tạo ra đúng 256 bits (64 ký tự hex), bất kể kích thước đầu vào — từ 1 byte đến 1 terabyte.", color: "var(--cyan)" },
  { icon: "⛔", title: "One-Way Function", desc: "Không thể tái tạo dữ liệu gốc từ hash output. Đây là nền tảng của bảo mật số hiện đại.", color: "var(--blue)" },
  { icon: "🌊", title: "Avalanche Effect", desc: "Thay đổi 1 ký tự khiến ~50% output bits thay đổi hoàn toàn ngẫu nhiên — không thể đoán trước.", color: "var(--purple)" },
  { icon: "🧬", title: "Collision Resistant", desc: "Xác suất tìm hai đầu vào khác nhau có cùng hash output gần bằng 0 — an toàn tuyệt đối.", color: "var(--green)" },
];

// Animated blockchain canvas background
function BlockchainCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    let W, H;
    // Blockchain nodes
    const NODES = 18;
    const nodes = [];
    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      // Re-init nodes on resize
      nodes.length = 0;
      for (let i = 0; i < NODES; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: 3 + Math.random() * 4,
          hue: Math.random() > 0.5 ? 190 : 220,
          alpha: 0.4 + Math.random() * 0.5,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };
    window.addEventListener('resize', resize);
    resize();

    // Flowing hash text particles
    const hashChars = '0123456789abcdef';
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * (typeof W !== 'undefined' ? W : 800),
      y: Math.random() * (typeof H !== 'undefined' ? H : 400),
      char: hashChars[Math.floor(Math.random() * hashChars.length)],
      speed: 0.3 + Math.random() * 0.5,
      alpha: 0.06 + Math.random() * 0.12,
      size: 10 + Math.random() * 8,
      changeTimer: Math.floor(Math.random() * 80),
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.012;

      // Draw falling hex characters
      particles.forEach(p => {
        p.y += p.speed;
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
        p.changeTimer--;
        if (p.changeTimer <= 0) {
          p.char = hashChars[Math.floor(Math.random() * hashChars.length)];
          p.changeTimer = 40 + Math.floor(Math.random() * 60);
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = `hsl(190, 90%, 65%)`;
        ctx.font = `${p.size}px JetBrains Mono, monospace`;
        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();
      });

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.pulse += 0.04;
      });

      // Draw edges (block links)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.18;
            const hue = (i + j) % 2 === 0 ? 190 : 220;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = `hsl(${hue}, 90%, 65%)`;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 8]);
            ctx.lineDashOffset = -t * 8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          }
        }
      }

      // Draw nodes (glowing dots)
      nodes.forEach((n, i) => {
        const pulseFactor = 0.5 + 0.5 * Math.sin(n.pulse);
        const glowR = n.r * (1.5 + pulseFactor * 1.2);
        // Glow
        ctx.save();
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR * 3);
        grad.addColorStop(0, `hsla(${n.hue}, 90%, 65%, ${n.alpha * 0.6})`);
        grad.addColorStop(1, `hsla(${n.hue}, 90%, 65%, 0)`);
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR * 3, 0, Math.PI * 2);
        ctx.fill();
        // Core dot
        ctx.globalAlpha = n.alpha;
        ctx.fillStyle = `hsl(${n.hue}, 90%, 72%)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + pulseFactor, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Tiny block squares for some nodes
        if (i % 4 === 0) {
          ctx.save();
          ctx.globalAlpha = 0.12;
          ctx.strokeStyle = `hsl(${n.hue}, 80%, 65%)`;
          ctx.lineWidth = 1;
          const s = 18 + pulseFactor * 6;
          ctx.strokeRect(n.x - s/2, n.y - s/2, s, s);
          ctx.restore();
        }
      });

      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animFrame); window.removeEventListener('resize', resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0,
    }} />
  );
}

function HomeView({ setTab }) {
  const [demoInput, setDemoInput] = useState("Hello, SVNCKH!");
  const [demoHash, setDemoHash] = useState("");
  const [computing, setComputing] = useState(false);
  const [typedHash, setTypedHash] = useState("");
  const typedRef = useRef("");

  useEffect(() => {
    let cancelled = false;
    setComputing(true);
    const run = async () => {
      const h = await apiHash(demoInput) || await sha256browser(demoInput);
      if (!cancelled) { setDemoHash(h); setComputing(false); }
    };
    const t = setTimeout(run, 180);
    return () => { cancelled = true; clearTimeout(t); };
  }, [demoInput]);

  // Typewriter effect for hash display on Home
  useEffect(() => {
    if (!demoHash) return;
    typedRef.current = "";
    setTypedHash("");
    let i = 0;
    const tick = setInterval(() => {
      typedRef.current = demoHash.slice(0, i + 1);
      setTypedHash(typedRef.current);
      i++;
      if (i >= demoHash.length) clearInterval(tick);
    }, 18);
    return () => clearInterval(tick);
  }, [demoHash]);

  return (
    <div className="page">
      {/* ── Animated Hero ── */}
      <section style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(180deg, #020810 0%, #030712 100%)",
        borderBottom: "1px solid var(--border)",
        minHeight: 520,
      }}>
        {/* Blockchain canvas layer */}
        <BlockchainCanvas />

        {/* Radial glow overlays */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(34,211,238,0.13) 0%, transparent 65%)", pointerEvents: "none", zIndex: 1 }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to top, #030712, transparent)", pointerEvents: "none", zIndex: 1 }} />

        <div className="section" style={{ paddingTop: 90, paddingBottom: 70, textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ animation: "fadeIn 0.7s ease" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
              <span className="badge badge-cyan" style={{ fontSize: 12, padding: "5px 14px" }}>🎓 SVNCKH 2025 — Nghiên Cứu Khoa Học Sinh Viên</span>
            </div>

            <h1 style={{ fontFamily: "var(--sans)", fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-3px", marginBottom: 18 }}>
              <span style={{ background: "linear-gradient(135deg, #22d3ee, #3b82f6, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 24px rgba(34,211,238,0.35))" }}>CryptoHash</span>
              <br />
              <span style={{ fontSize: "0.65em", color: "#f1f5f9", letterSpacing: "-1px" }}>SHA-256 Visualizer</span>
            </h1>

            <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: "var(--text2)", maxWidth: 540, margin: "0 auto 32px", lineHeight: 1.9 }}>
              Khám phá cách hàm băm mật mã hoạt động qua các trực quan hóa tương tác.
              Hiểu các tính chất của SHA-256 bảo mật blockchain hiện đại.
            </p>

            {/* Animated hash pill */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
              <div style={{
                background: "rgba(3,7,18,0.7)", border: "1px solid rgba(34,211,238,0.25)",
                borderRadius: 12, padding: "10px 18px",
                fontFamily: "var(--mono)", fontSize: 11, color: "var(--cyan)",
                letterSpacing: "1px", backdropFilter: "blur(8px)",
                boxShadow: "0 0 24px rgba(34,211,238,0.1)",
                maxWidth: 520, wordBreak: "break-all", textAlign: "left",
              }}>
                <span style={{ color: "var(--text3)", marginRight: 8 }}>SHA256(input) →</span>
                {typedHash}
                <span style={{ animation: "blink 1s infinite", color: "var(--cyan)" }}>|</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => setTab("demo")} style={{ fontSize: 15, padding: "13px 30px", boxShadow: "0 0 32px rgba(34,211,238,0.3)" }}>
                🚀 Thử Hash Demo
              </button>
              <button className="btn btn-secondary" onClick={() => setTab("about")} style={{ fontSize: 15, padding: "13px 24px" }}>
                📖 Về Dự Án
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ background: "var(--bg1)", borderBottom: "1px solid var(--border)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { val: "256", unit: "bits", label: "output cố định" },
            { val: "64", unit: "hex chars", label: "mỗi hash" },
            { val: "2²⁵⁶", unit: "combinations", label: "không thể đảo ngược" },
            { val: "~50%", unit: "bits changed", label: "avalanche effect" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "8px 32px", borderRight: i < 3 ? "1px solid var(--border)" : "none", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: "var(--cyan)" }}>
                {s.val} <span style={{ fontSize: 12, color: "var(--blue)" }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Live mini demo ── */}
      <div className="section section-sm" style={{ paddingBottom: 0 }}>
        <div className="card" style={{ background: "linear-gradient(145deg, rgba(10,15,30,0.95), rgba(15,23,42,0.7))", border: "1px solid rgba(34,211,238,0.2)", animation: "fadeInUp 0.6s 0.1s both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--cyan)", boxShadow: "var(--glow-cyan)", animation: "dotPulse 2s infinite" }} />
            <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>Live SHA-256 — gõ bất kỳ ký tự nào</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
            <div>
              <div className="label">Input</div>
              <input className="inp" value={demoInput} onChange={e => setDemoInput(e.target.value)} placeholder="Nhập văn bản..." />
            </div>
            <div style={{ textAlign: "center", color: "var(--cyan)", fontSize: 22, opacity: 0.8 }}>→</div>
            <div>
              <div className="label">SHA-256 Output <span style={{ color: "var(--cyan)", textTransform: "none" }}>(luôn 64 chars)</span></div>
              <div style={{ minHeight: 46, padding: "12px 16px", background: "rgba(3,7,18,0.85)", border: "1px solid var(--border)", borderRadius: 12 }}>
                {computing ? (
                  <span style={{ color: "var(--text3)", fontSize: 12 }}>⏳ computing...</span>
                ) : (
                  <span className="hash-display" style={{ fontSize: 11, lineHeight: 1.9 }}>
                    {demoHash.slice(0, 32)}<br />{demoHash.slice(32)}
                  </span>
                )}
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--text3)" }}>
                Độ dài: <span style={{ color: "var(--green)", fontFamily: "var(--mono)" }}>{demoHash.length}</span> ký tự hex = <span style={{ color: "var(--cyan)", fontFamily: "var(--mono)" }}>256 bits</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 Properties ── */}
      <div className="section">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 10 }}>4 Tính Chất Quan Trọng của SHA-256</h2>
          <p style={{ color: "var(--text2)", fontSize: 15, maxWidth: 520, margin: "0 auto" }}>Những tính chất toán học này là nền tảng bảo mật của blockchain hiện đại.</p>
        </div>
        <div className="grid-2" style={{ gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={{ animation: `fadeInUp 0.5s ${i * 0.08}s both`, cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = f.color + "66"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = ""; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 28, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: f.color + "18", border: `1px solid ${f.color}33`, flexShrink: 0 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: f.color }}>{f.title}</div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <button className="btn btn-primary" onClick={() => setTab("demo")} style={{ fontSize: 15, padding: "14px 34px", boxShadow: "0 0 32px rgba(34,211,238,0.25)" }}>
            ⚡ Mở Demo Tương Tác →
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// HASH DEMO VIEW  
// ═══════════════════════════════════════════════════════
function HashDemoView() {
  const [activeSection, setActiveSection] = useState("interactive");

  // Interactive hash
  const [input, setInput] = useState("Hello, World!");
  const [hash, setHash] = useState("");
  const [computing, setComputing] = useState(false);
  const [justComputed, setJustComputed] = useState(false);

  // Fixed length
  const fixedExamples = [
    { label: "Short (1 char)", input: "A" },
    { label: "Medium", input: "Hello" },
    { label: "Sentence", input: "Hello, World!" },
    { label: "Long paragraph", input: "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs." },
  ];
  const [fixedHashes, setFixedHashes] = useState({});

  // Avalanche
  const [av1, setAv1] = useState("hello");
  const [av2, setAv2] = useState("hellp");
  const [h1, setH1] = useState("");
  const [h2, setH2] = useState("");

  useEffect(() => {
    let cancelled = false;
    setComputing(true);
    const handleCompute = async () => {
      const h = await apiHash(input) || await sha256browser(input);
      if (!cancelled) {
        setHash(h);
        setComputing(false);
        setJustComputed(true);
        setTimeout(() => setJustComputed(false), 600);
      }
    };
    const t = setTimeout(handleCompute, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [input]);

  useEffect(() => {
    const run = async () => {
      const results = {};
      for (const ex of fixedExamples) {
        results[ex.input] = await apiHash(ex.input) || await sha256browser(ex.input);
      }
      setFixedHashes(results);
    };
    run();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const r1 = await apiHash(av1) || await sha256browser(av1);
      const r2 = await apiHash(av2) || await sha256browser(av2);
      if (!cancelled) { setH1(r1); setH2(r2); }
    };
    const t = setTimeout(run, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [av1, av2]);

  const diffCount = h1 && h2 ? [...h1].filter((c, i) => c !== h2[i]).length : 0;
  const diffPct = h1 ? Math.round((diffCount / 64) * 100) : 0;

  const sections = [
    { id: "interactive", label: "⚡ Interactive" },
    { id: "fixed", label: "📏 Fixed Length" },
    { id: "avalanche", label: "🌊 Avalanche Effect" },
    { id: "explain", label: "📚 Explanation" },
  ];

  return (
    <div className="page">
      <div className="section" style={{ paddingBottom: 0, paddingTop: 40 }}>
        <h1 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 8 }}>
          🔐 SHA-256 Hash Demo
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 28 }}>
          Interactive demonstration of SHA-256 cryptographic hash properties
        </p>

        {/* Section tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 32, padding: "4px", background: "var(--bg1)", borderRadius: 14, border: "1px solid var(--border)", width: "fit-content" }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ background: activeSection === s.id ? "rgba(34,211,238,0.15)" : "none", border: "none", borderRadius: 10, padding: "8px 16px", color: activeSection === s.id ? "var(--cyan)" : "var(--text2)", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", outline: activeSection === s.id ? "1px solid rgba(34,211,238,0.3)" : "none" }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section" style={{ paddingTop: 0 }}>

        {/* ── INTERACTIVE ── */}
        {activeSection === "interactive" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>SHA-256 Hash Generator</h3>
              <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 20 }}>Type any text and see its SHA-256 hash update in real-time</p>

              <div className="label">Input Text</div>
              <textarea className="inp" style={{ marginBottom: 16 }} value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message here..." />

              <div className="label">SHA-256 Hash Output
                <span style={{ marginLeft: 8, fontFamily: "var(--mono)", fontSize: 10, color: "var(--cyan)", textTransform: "none", fontWeight: 400 }}>
                  {hash.length}/64 hex characters = 256 bits
                </span>
              </div>
              <div style={{
                background: "rgba(3,7,18,0.8)", border: `1px solid ${justComputed ? "var(--cyan)" : "var(--border)"}`,
                borderRadius: 14, padding: "18px 20px", minHeight: 80, transition: "border-color 0.4s",
                boxShadow: justComputed ? "var(--glow-cyan)" : "none",
              }}>
                {computing ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text3)", fontSize: 13 }}>
                    <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Computing hash...
                  </div>
                ) : hash ? (
                  <div>
                    <div className="hash-display">
                      {[...Array(4)].map((_, gi) => (
                        <span key={gi} className="h-group" style={{ display: "block", marginBottom: 2 }}>
                          {hash.slice(gi*16, gi*16+16).split("").map((c, ci) => (
                            <span key={ci} style={{ fontFamily: "var(--mono)", marginRight: ci % 4 === 3 ? "8px" : "1px" }}>{c}</span>
                          ))}
                        </span>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: "var(--text3)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span>Algorithm: <span style={{ color: "var(--cyan)" }}>SHA-256</span></span>
                      <span>Size: <span style={{ color: "var(--cyan)" }}>256 bits</span></span>
                      <span>Hex chars: <span style={{ color: "var(--green)" }}>{hash.length}</span></span>
                      <span>Input bytes: <span style={{ color: "var(--amber)" }}>{new TextEncoder().encode(input).length}</span></span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="card" style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.04), rgba(59,130,246,0.04))", border: "1px solid rgba(34,211,238,0.15)" }}>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8 }}>
                💡 <strong style={{ color: "var(--cyan)" }}>Try this:</strong> Change a single character in your input and watch how the entire hash output changes completely — this is the <strong style={{ color: "var(--purple)" }}>Avalanche Effect</strong>.
                The hash always stays exactly <strong style={{ color: "var(--green)" }}>64 characters</strong> long, no matter how short or long your input is.
              </p>
            </div>
          </div>
        )}

        {/* ── FIXED LENGTH ── */}
        {activeSection === "fixed" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Fixed-Length Output Property</h3>
              <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 24 }}>
                SHA-256 <strong style={{ color: "var(--cyan)" }}>always</strong> produces exactly 64 hexadecimal characters (256 bits), regardless of input size.
              </p>

              <div style={{ display: "grid", gap: 14 }}>
                {fixedExamples.map((ex, i) => {
                  const h = fixedHashes[ex.input] || "";
                  return (
                    <div key={i} style={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
                      <div style={{ padding: "12px 16px", background: "rgba(15,23,42,0.5)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="badge badge-cyan" style={{ fontSize: 10 }}>{ex.label}</span>
                          <code style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)", background: "rgba(34,211,238,0.08)", padding: "3px 10px", borderRadius: 6 }}>
                            "{ex.input.slice(0, 40)}{ex.input.length > 40 ? "..." : ""}"
                          </code>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, color: "var(--text3)" }}>Input: <span style={{ color: "var(--amber)", fontFamily: "var(--mono)" }}>{ex.input.length} chars</span></span>
                          <span style={{ fontSize: 11, color: "var(--text3)" }}>→ Output: <span style={{ color: "var(--green)", fontFamily: "var(--mono)" }}>{h.length || "..."} chars ✓</span></span>
                        </div>
                      </div>
                      <div style={{ padding: "12px 16px" }}>
                        {h ? (
                          <span className="hash-display" style={{ fontSize: 12 }}>{h.slice(0,32)}<br/>{h.slice(32)}</span>
                        ) : (
                          <span style={{ color: "var(--text3)", fontSize: 12 }}>Computing...</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 12, fontSize: 13, color: "var(--text2)" }}>
                ✅ All outputs are exactly <strong style={{ color: "var(--green)" }}>64 hex characters</strong> = <strong style={{ color: "var(--cyan)" }}>256 bits</strong> — the "fixed-length" property.
              </div>
            </div>
          </div>
        )}

        {/* ── AVALANCHE ── */}
        {activeSection === "avalanche" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Avalanche Effect Visualizer</h3>
              <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 24 }}>
                Change 1 character and watch how <strong style={{ color: "var(--red)" }}>~50% of the hash changes</strong> completely.
              </p>

              <div className="grid-2" style={{ marginBottom: 20 }}>
                <div>
                  <div className="label">Input A</div>
                  <input className="inp" value={av1} onChange={e => setAv1(e.target.value)} />
                </div>
                <div>
                  <div className="label">Input B <span style={{ color: "var(--amber)", textTransform: "none", fontSize: 10, fontWeight: 400 }}>(try changing one character)</span></div>
                  <input className="inp" value={av2} onChange={e => setAv2(e.target.value)} />
                </div>
              </div>

              {/* Difference counter */}
              <div style={{ textAlign: "center", padding: "24px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
                <div style={{ fontFamily: "var(--sans)", fontSize: "clamp(42px,8vw,72px)", fontWeight: 900, lineHeight: 1, color: diffPct >= 40 ? "var(--green)" : "var(--amber)", textShadow: diffPct >= 40 ? "0 0 40px rgba(52,211,153,0.4)" : "0 0 40px rgba(251,191,36,0.4)" }}>
                  {diffPct}%
                </div>
                <div style={{ fontSize: 14, color: "var(--text2)", marginTop: 8 }}>
                  of hash bits changed &nbsp;
                  <span style={{ color: diffPct >= 40 ? "var(--green)" : "var(--amber)", fontWeight: 600 }}>({diffCount}/64 hex chars differ)</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="progress-bar" style={{ maxWidth: 300, margin: "0 auto" }}>
                    <div className="progress-fill" style={{ width: `${diffPct}%`, background: diffPct >= 40 ? "linear-gradient(90deg,var(--green),var(--cyan))" : "linear-gradient(90deg,var(--amber),var(--red))" }} />
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "var(--text3)" }}>
                  {diffPct >= 40 ? "✅ Good avalanche effect (≥40%)" : `⚠️ Low avalanche — try changing more characters`}
                </div>
              </div>

              {/* Hash grids */}
              {h1 && h2 && (
                <div className="grid-2">
                  {[{ label: `Hash A ("${av1.slice(0,20)}${av1.length>20?"...":""}") `, h: h1, other: h2 }, { label: `Hash B ("${av2.slice(0,20)}${av2.length>20?"...":""}") `, h: h2, other: h1 }].map(({ label, h, other }) => (
                    <div key={label} style={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 14, padding: 14 }}>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10, fontFamily: "var(--mono)" }}>{label}</div>
                      <div className="hex-grid">
                        {[...h].map((c, i) => (
                          <div key={i} className={`hex-cell ${c !== other[i] ? "diff" : "same"}`}>{c}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EXPLANATION ── */}
        {activeSection === "explain" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                {
                  icon: "🔐", title: "What is a Cryptographic Hash Function?", color: "var(--cyan)",
                  body: (<>
                    <p style={{ marginBottom: 12 }}>A <strong style={{ color: "var(--cyan)" }}>cryptographic hash function</strong> is a mathematical algorithm that maps data of any size to a fixed-size string of bits — the "hash" or "digest".</p>
                    <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", fontFamily: "var(--mono)", fontSize: 12, borderLeft: "3px solid var(--cyan)" }}>
                      SHA256("Hello") → <span style={{ color: "var(--cyan)" }}>185f8db32921bd46d35c4f64...</span><br />
                      SHA256("1 TB file") → <span style={{ color: "var(--cyan)" }}>also 64 hex chars</span>
                    </div>
                  </>)
                },
                {
                  icon: "📏", title: "Fixed-Length Output", color: "var(--blue)",
                  body: (<>
                    <p>SHA-256 <strong style={{ color: "var(--blue)" }}>always</strong> produces exactly <strong style={{ color: "var(--green)" }}>256 bits = 32 bytes = 64 hexadecimal characters</strong>.</p>
                    <p style={{ marginTop: 8, color: "var(--text2)" }}>This property makes it easy to compare and store hashes — you always know exactly how much space you need.</p>
                  </>)
                },
                {
                  icon: "⛔", title: "One-Way (Pre-image Resistance)", color: "var(--purple)",
                  body: (<>
                    <p>It is <strong style={{ color: "var(--red)" }}>computationally infeasible</strong> to reverse a hash — to find an input that produces a given hash output.</p>
                    <p style={{ marginTop: 8, color: "var(--text2)" }}>There are 2²⁵⁶ possible outputs. Finding the input by brute force would take longer than the age of the universe, even with all computers on Earth.</p>
                  </>)
                },
                {
                  icon: "🌊", title: "Avalanche Effect", color: "var(--red)",
                  body: (<>
                    <p>Changing <strong style={{ color: "var(--amber)" }}>even one bit</strong> of the input causes approximately <strong style={{ color: "var(--red)" }}>50% of the output bits</strong> to change randomly.</p>
                    <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", fontFamily: "var(--mono)", fontSize: 12, borderLeft: "3px solid var(--red)", marginTop: 10 }}>
                      SHA256("<span style={{ color: "var(--text)" }}>hell</span><span style={{ color: "var(--green)" }}>o</span>") = <span style={{ color: "var(--cyan)" }}>2cf24dba...</span><br />
                      SHA256("<span style={{ color: "var(--text)" }}>hell</span><span style={{ color: "var(--red)" }}>p</span>") = <span style={{ color: "var(--amber)" }}>a7f891c4...</span> ← completely different!
                    </div>
                  </>)
                },
              ].map((item, i) => (
                <div key={i} className="card" style={{ animation: `fadeInUp 0.4s ${i*0.08}s both` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: item.color }}>{item.title}</h3>
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8 }}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ABOUT THE PROJECT
// ═══════════════════════════════════════════════════════
const TECH_STACK = [
  { name: "SHA-256", role: "Hash Algorithm", icon: "🔐", color: "var(--cyan)" },
  { name: "React 18", role: "Frontend UI", icon: "⚛️", color: "var(--blue)" },
  { name: "Node.js", role: "Backend Server", icon: "🟢", color: "var(--green)" },
  { name: "Web Crypto API", role: "Browser Crypto", icon: "🔑", color: "var(--purple)" },
  { name: "JavaScript", role: "Logic Layer", icon: "🟨", color: "var(--amber)" },
  { name: "HTML + CSS", role: "Presentation", icon: "🎨", color: "var(--red)" },
];

const TIMELINE = [
  { phase: "Research", desc: "Study SHA-256 specification (FIPS 180-4), hash function properties, and educational frameworks" },
  { phase: "Design", desc: "Design UI/UX flow for interactive visualizations of cryptographic concepts" },
  { phase: "Development", desc: "Build Node.js backend API + React frontend with real SHA-256 computation" },
  { phase: "Testing", desc: "Verify hash outputs against NIST test vectors and cross-browser compatibility" },
  { phase: "Documentation", desc: "Write educational content explaining concepts for student audiences" },
];

function AboutProjectView() {
  return (
    <div className="page">
      <div className="section">
        <div style={{ marginBottom: 48, animation: "fadeInUp 0.5s ease" }}>
          <span className="badge badge-cyan" style={{ marginBottom: 16, display: "inline-flex" }}>📋 SVNCKH 2025</span>
          <h1 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 12 }}>
            About This Project
          </h1>
          <p style={{ fontSize: 16, color: "var(--text2)", lineHeight: 1.8, maxWidth: 700 }}>
            An interactive educational platform to demonstrate the mathematical properties of the{" "}
            <strong style={{ color: "var(--cyan)" }}>SHA-256 cryptographic hash function</strong> — the core of blockchain security and modern cryptography.
          </p>
        </div>

        <div className="grid-2" style={{ marginBottom: 40 }}>
          <div className="card" style={{ animation: "fadeInUp 0.5s 0.1s both" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🎯</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: "var(--cyan)" }}>Project Goal</h3>
            <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8 }}>
              This project makes cryptographic hash functions{" "}
              <strong style={{ color: "var(--text)" }}>visually understandable</strong> for students without deep mathematics backgrounds — using interactive demos instead of equations.
            </p>
          </div>
          <div className="card" style={{ animation: "fadeInUp 0.5s 0.15s both" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🔬</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: "var(--purple)" }}>Why SHA-256?</h3>
            <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8 }}>
              SHA-256 is the backbone of Bitcoin, blockchain networks, digital signatures, and TLS/SSL. Understanding it is foundational to{" "}
              <strong style={{ color: "var(--text)" }}>modern cybersecurity</strong>.
            </p>
          </div>
        </div>

        <div className="card" style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.06), rgba(59,130,246,0.06))", border: "1px solid rgba(34,211,238,0.2)", marginBottom: 40, animation: "fadeInUp 0.5s 0.2s both" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <div style={{ fontSize: 48, lineHeight: 1 }}>🏆</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--cyan)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>
                Sinh Viên Nghiên Cứu Khoa Học (SVNCKH) 2025
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Student Research Competition</h3>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8 }}>
                This demo was created for the <strong style={{ color: "var(--text)" }}>SVNCKH</strong> competition, an annual event that encourages undergraduate and graduate students to conduct original research and build innovative projects.
              </p>
              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span className="badge badge-cyan">🇻🇳 Vietnam</span>
                <span className="badge badge-purple">🎓 Undergraduate Research</span>
                <span className="badge badge-green">🔐 Cybersecurity</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Technology Stack</h2>
          <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>Built with web-native technologies — no heavy external dependencies.</p>
          <div className="grid-3" style={{ gap: 14 }}>
            {TECH_STACK.map((t, i) => (
              <div key={i} className="card card-sm" style={{ display: "flex", alignItems: "center", gap: 14, animation: `fadeInUp 0.4s ${i * 0.07}s both` }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{t.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: t.color, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Development Process</h2>
          <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>Research-driven development following the scientific method.</p>
          <div style={{ display: "grid", gap: 12 }}>
            {TIMELINE.map((item, i) => (
              <div key={i} className="card card-sm" style={{ display: "flex", alignItems: "flex-start", gap: 16, animation: `fadeInUp 0.4s ${i * 0.07}s both` }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,var(--cyan),var(--blue))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#030712", flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15, marginBottom: 4 }}>{item.phase}</div>
                  <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ABOUT THE TEAM
// ═══════════════════════════════════════════════════════
const TEAM = [
  { name: "Lâm Tuấn Vũ", role: "Trưởng nhóm · Backend Developer", avatar: "👨‍💻", desc: "Phụ trách server Node.js, cài đặt SHA-256, lõi logic blockchain và API backend.", color: "var(--cyan)" },
  { name: "Đỗ Gia Khiêm", role: "Frontend Developer", avatar: "👨‍🎨", desc: "Thiết kế và xây dựng giao diện React tương tác, layout responsive và các visualizations.", color: "var(--purple)" },
  { name: "Nguyễn Vũ Thắng", role: "Nghiên cứu & Tài liệu", avatar: "📚", desc: "Nghiên cứu tài liệu SHA-256 (FIPS 180-4), biên soạn nội dung giáo dục và thuyết minh dự án.", color: "var(--green)" },
];

const SUPERVISOR = {
  name: "TS. Nguyễn Hoài Đức",
  title: "Giảng viên hướng dẫn · Faculty Supervisor",
  dept: "Bộ môn Khoa học Máy tính",
  uni: "Trường Đại học",
  desc: "Hướng dẫn phương pháp nghiên cứu khoa học, định hướng nội dung mật mã học và phản biện kỹ thuật trong suốt quá trình thực hiện đề tài.",
};

function AboutTeamView() {
  return (
    <div className="page">
      <div className="section">
        <div style={{ marginBottom: 40, animation: "fadeInUp 0.5s ease" }}>
          <span className="badge badge-purple" style={{ marginBottom: 16, display: "inline-flex" }}>👥 Our Team</span>
          <h1 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 12 }}>About the Team</h1>
          <p style={{ fontSize: 16, color: "var(--text2)", maxWidth: 600, lineHeight: 1.8 }}>
            A group of Vietnamese computer science students passionate about cryptography, cybersecurity, and making complex concepts accessible.
          </p>
        </div>

        {/* Supervisor */}
        <div className="card" style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.06), rgba(59,130,246,0.06))", border: "1px solid rgba(167,139,250,0.25)", marginBottom: 40, animation: "fadeInUp 0.5s 0.1s both" }}>
          <div style={{ fontSize: 11, color: "var(--purple)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 16 }}>
            🎓 Giảng viên hướng dẫn / Faculty Supervisor
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <div style={{ width: 68, height: 68, borderRadius: 16, background: "linear-gradient(135deg, var(--purple), var(--blue))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>👩‍🏫</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 3 }}>{SUPERVISOR.name}</div>
              <div style={{ fontSize: 13, color: "var(--purple)", fontWeight: 600, marginBottom: 3 }}>{SUPERVISOR.title}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>{SUPERVISOR.dept} · {SUPERVISOR.uni}</div>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7 }}>{SUPERVISOR.desc}</p>
            </div>
          </div>
        </div>

        {/* Team members */}
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Student Members</h2>
        <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>4 students from the Faculty of Information Technology</p>
        <div className="grid-2" style={{ marginBottom: 48 }}>
          {TEAM.map((m, i) => (
            <div key={i} className="card" style={{ animation: `fadeInUp 0.45s ${i * 0.1}s both`, transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${m.color}18, ${m.color}35)`, border: `1px solid ${m.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{m.avatar}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>{m.role}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Competition info */}
        <div className="card" style={{ animation: "fadeInUp 0.5s 0.3s both" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "var(--cyan)" }}>🏆 Competition Details</h3>
          <div style={{ display: "grid", gap: 0 }}>
            {[
              { key: "Competition", val: "Sinh Viên Nghiên Cứu Khoa Học (SVNCKH)" },
              { key: "Field", val: "Cryptography & Information Security" },
              { key: "Topic", val: "Interactive Demonstration of SHA-256 Hash Function Properties" },
              { key: "Level", val: "Undergraduate Research" },
              { key: "Year", val: "2025" },
            ].map(({ key, val }) => (
              <div key={key} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, alignItems: "start", padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 }}>{key}</span>
                <span style={{ fontSize: 14, color: "var(--text)" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// NAVIGATION + APP ROOT
// ═══════════════════════════════════════════════════════
const TABS = [
  { id: "home",  label: "Home" },
  { id: "demo",  label: "Hash Demo" },
  { id: "about", label: "About the Project" },
  { id: "team",  label: "About the Team" },
];

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="2" y1="6" x2="20" y2="6"/>
      <line x1="2" y1="11" x2="20" y2="11"/>
      <line x1="2" y1="16" x2="20" y2="16"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="4" x2="18" y2="18"/>
      <line x1="18" y1="4" x2="4" y2="18"/>
    </svg>
  );
}

function App() {
  const [tab, setTab] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  const switchTab = (id) => {
    setTab(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{STYLES}</style>

      {/* Top Navigation */}
      <nav className="nav">
        <div className="nav-inner">
          <a className="nav-logo" onClick={() => switchTab("home")} style={{ cursor: "pointer" }}>
            <div className="nav-logo-icon">⛓</div>
            <div>
              <span className="nav-logo-text">CryptoHash</span>
              <span className="nav-logo-sub"> Demo</span>
            </div>
          </a>

          <ul className="nav-links">
            {TABS.map(t => (
              <li key={t.id}>
                <button className={`nav-link ${tab === t.id ? "active" : ""}`} onClick={() => switchTab(t.id)}>
                  {t.label}
                </button>
              </li>
            ))}
          </ul>

          <button className="nav-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
            {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>

        <div className={`nav-mobile ${mobileOpen ? "open" : ""}`}>
          {TABS.map(t => (
            <button key={t.id} className={`nav-mobile-link ${tab === t.id ? "active" : ""}`} onClick={() => switchTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Page Content */}
      {tab === "home"  && <HomeView setTab={switchTab} />}
      {tab === "demo"  && <HashDemoView />}
      {tab === "about" && <AboutProjectView />}
      {tab === "team"  && <AboutTeamView />}

      {/* Footer */}
      <footer style={{ background: "var(--bg1)", borderTop: "1px solid var(--border)", padding: "24px", textAlign: "center" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", fontSize: 12, color: "var(--text3)", lineHeight: 2 }}>
          <strong style={{ color: "var(--cyan)" }}>CryptoHash Demo</strong> · SHA-256 Visualizer for SVNCKH 2025 &nbsp;·&nbsp;
          Built with React 18 &amp; Node.js &nbsp;·&nbsp;
          Hash computations powered by{" "}
          <code style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--cyan)" }}>crypto.subtle</code>{" "}
          &amp; Node.js <code style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--cyan)" }}>crypto</code>
        </div>
      </footer>
    </>
  );
}
