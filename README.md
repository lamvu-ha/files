# BlockEdu Pro — Full-Stack Blockchain Education Platform

## Kiến trúc hệ thống

```
[Browser / React JSX]
        ↓ REST API + Server-Sent Events
[Node.js Gateway — server.js]   ←→  [Java Core (khi có javac)]
        ↓ SHA-256 / PoW / Merkle / Chain
[In-Memory Blockchain State]
```

## Cấu trúc thư mục

```
blockedu-pro/
├── java-core/                  ← Java Backend (deploy khi có JDK)
│   └── src/com/blockedu/
│       ├── model/Block.java
│       ├── core/Blockchain.java
│       ├── core/ProofOfWork.java
│       ├── util/HashUtil.java
│       └── api/BlockchainServer.java
├── gateway/
│   └── server.js               ← Node.js backend (chạy ngay, zero deps)
└── frontend/
    └── BlockEduPro.jsx         ← React frontend (copy vào Claude Artifact)
```

---

## Cách chạy

### Option A — Node.js Gateway (khuyến nghị, không cần build)

```bash
cd gateway
node server.js
# → http://localhost:3001
```

Sau đó paste `BlockEduPro.jsx` vào Claude Artifact (React mode).

### Option B — Java Backend (cần JDK với javac)

```bash
cd java-core
mkdir -p out
find src -name "*.java" | xargs javac -d out/
java -cp out com.blockedu.api.BlockchainServer 8080
# → http://localhost:8080
```

Đổi `const API = "http://localhost:8080"` trong frontend.

### Option C — Demo nhanh (không cần backend)

Paste `BlockEduPro.jsx` vào Claude Artifact — SHA-256 fallback chạy trong browser qua Web Crypto API.

---

## API Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/chain` | Lấy toàn bộ blockchain |
| POST | `/api/block/add` | Thêm block mới (auto-mine) |
| POST | `/api/block/tamper` | Tamper dữ liệu block |
| POST | `/api/block/restore` | Re-mine để khôi phục |
| GET | `/api/mine/stream?index=N` | **SSE streaming** mining realtime |
| POST | `/api/hash` | Tính SHA-256 |
| POST | `/api/hash/steps` | Các bước SHA-256 (visualize) |
| POST | `/api/merkle` | Build Merkle Tree |
| POST | `/api/difficulty` | Đặt difficulty (1-5) |
| POST | `/api/reset` | Reset blockchain |
| GET | `/api/validate` | Validate toàn bộ chain |
| GET | `/health` | Health check |

---

## Tính năng

- ⛓ **Blockchain Simulator** — Add block, mine với PoW, xem chain live
- 🔧 **Tamper Detection** — Sửa data → chain invalid → cascade effect
- ⚡ **Mining Animation** — Server-Sent Events stream nonce realtime
- 🔐 **SHA-256 Visualizer** — Step-by-step hashing
- 🌊 **Avalanche Effect** — So sánh bit-level 2 hashes
- 🌳 **Merkle Tree Interactive** — SVG tree, click để highlight path
- 📚 **Tutorial 6 bước** — Hash → Block → Chain → PoW → Merkle → Avalanche
- ❓ **Quiz 6 câu** — Với giải thích chi tiết và điểm số

## Công nghệ

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React JSX, CSS Variables, SVG |
| Backend | Node.js (http, crypto) / Java 21 |
| Hashing | Node crypto.createHash / Java MessageDigest |
| Streaming | Server-Sent Events (SSE) |
| Merkle | Custom implementation |
