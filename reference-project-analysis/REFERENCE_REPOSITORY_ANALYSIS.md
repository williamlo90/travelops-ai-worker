# Reference Repository Analysis for TravelOps AI Worker

**Snapshot riset:** 2026-07-02  
**Tujuan:** mencari kode dan pola yang dapat mempercepat pembangunan TravelOps AI Worker tanpa menjadikannya clone proyek lain.

## Keputusan singkat

Tidak ada satu repository yang layak di-copy utuh. Kandidat paling efektif adalah:

1. **`agent-service-toolkit`** sebagai referensi awal backend agent service.
2. **`otaip`** sebagai referensi domain travel, kontrak data, dan safety gates.
3. **`agent-chat-ui-human-in-the-loop`** sebagai referensi kecil untuk UI approval.
4. **`fastapi-langgraph-agent-production-ready-template`** sebagai checklist infrastruktur backend—bukan base kedua.
5. **Cloudflare Agents** sebagai referensi semantics tool approval—bukan dependency utama.

Strategi yang direkomendasikan adalah **selective adaptation**, bukan fork besar:

```text
TravelOps domain and fixtures       <- OTAIP concepts
FastAPI/LangGraph service skeleton  <- agent-service-toolkit patterns
Approval card interaction           <- agent-chat-ui-human-in-the-loop pattern
Auth/migrations/logging checklist   <- fastapi-langgraph template
Tool approval state semantics       <- Cloudflare Agents pattern
```

Semua domain model, workflow state, policy rules, audit schema, evaluation dataset, dan UI Task Inbox tetap harus menjadi kode kita sendiri.

## A. Shortlist yang paling mungkin diadaptasi

### 1. agent-service-toolkit — base reference terbaik

- GitHub: [JoshuaC215/agent-service-toolkit](https://github.com/JoshuaC215/agent-service-toolkit)
- Snapshot: sekitar **4.4k stars**.
- Lisensi: **MIT**.
- Stack: Python, LangGraph, FastAPI, PostgreSQL, Pydantic, Docker Compose, pytest; UI bawaan Streamlit.
- Kesesuaian: **tinggi untuk backend skeleton**, rendah untuk product/domain/UI.

Yang bisa diadaptasi:

- susunan `agents`, `schema`, `core`, `service`, dan `client`;
- endpoint invoke/stream dan pola asynchronous service;
- dependency/configuration management;
- Docker Compose untuk PostgreSQL + backend;
- test harness dengan LLM mocking;
- checkpointing dan pola `interrupt()` untuk human-in-the-loop.

Yang harus dibuang atau ditulis ulang:

- Streamlit chat UI;
- chatbot/message history sebagai pusat domain;
- multi-agent catalogue dan contoh research assistant;
- protocol generik jika menghalangi resource API seperti `/tasks` dan `/approvals`.

Verdict: **ADAPT AS SKELETON, DO NOT FORK BLINDLY.** Ini kandidat paling masuk akal untuk mempercepat plumbing backend, tetapi domain model harus segera diubah dari chat/session menjadi task/case/approval/tool execution.

### 2. OTAIP — referensi domain travel terbaik

- GitHub: [telivity-otaip/otaip](https://github.com/telivity-otaip/otaip)
- Snapshot: sekitar **30 stars**; repository relatif baru.
- Lisensi: **Apache-2.0**.
- Stack/fokus: TypeScript strict, airline/hotel lifecycle, typed agents, adapters, pipeline contracts, event store, approval gates.
- Cakupan: search, pricing, booking, ticketing, exchange, refund, settlement, TMC operations, IRROPS.
- Kesesuaian: **sangat tinggi untuk vocabulary dan domain contracts**, rendah sebagai base aplikasi kita.

Yang bisa diadaptasi:

- vocabulary booking, exchange, refund, waiver, reissue, void, IRROPS, settlement;
- pemisahan domain action dari provider/GDS adapter;
- typed pipeline contracts;
- gate sebelum tindakan: schema conformance, semantic validation, intent lock, cross-step consistency, confidence gate, dan action classification;
- realistic fixtures serta failure cases untuk refund/change;
- prinsip bahwa model tidak boleh mengarang booking/offer identifier atau melakukan ticketing tanpa approval.

Yang tidak perlu di-copy:

- 75-agent architecture;
- BSP/ARC settlement dan fare construction lengkap;
- seluruh adapter Amadeus/Sabre/NDC;
- TypeScript domain implementation jika backend utama kita Python;
- klaim maturity tanpa memverifikasi sendiri test dan implementasinya.

Verdict: **MINE FOR DOMAIN IDEAS AND TEST CASES.** Ini repository paling mirip secara bisnis, tetapi terlalu luas dan baru untuk dijadikan fondasi teknis. Gunakan sebagai kamus domain dan sumber edge case, bukan source tree utama.

### 3. agent-chat-ui-human-in-the-loop — pola UI approval terkecil

- GitHub: [piotrgoral/agent-chat-ui-human-in-the-loop](https://github.com/piotrgoral/agent-chat-ui-human-in-the-loop)
- Snapshot: sekitar **5 stars**.
- Lisensi: **MIT**.
- Fokus: React UI untuk review tool call dan human-in-the-loop.
- Kesesuaian: **menengah untuk interaction pattern**, bukan aplikasi lengkap.

Yang bisa diadaptasi:

- state UI `approval-requested`, approved, rejected, dan completed;
- approval card yang menampilkan tool serta arguments;
- mekanisme resume setelah keputusan reviewer;
- visual separation antara proposal agent dan hasil eksekusi.

Yang harus ditulis ulang:

- chat-centric layout;
- approval state yang hanya hidup di frontend;
- tidak adanya role, reason, expiry, version, dan audit record.

Verdict: **COPY SMALL UI PATTERNS WITH ATTRIBUTION.** Gunakan sebagai referensi interaction, lalu pindahkan approval truth ke PostgreSQL/backend.

### 4. fastapi-langgraph-agent-production-ready-template — checklist backend

- GitHub: [wassim249/fastapi-langgraph-agent-production-ready-template](https://github.com/wassim249/fastapi-langgraph-agent-production-ready-template)
- Snapshot: sekitar **2.5k stars**.
- Lisensi: **MIT**.
- Stack: FastAPI, LangGraph, PostgreSQL/pgvector, Alembic, JWT, rate limiting, structured logs, Langfuse, Prometheus/Grafana, optional Redis/Valkey.
- Kesesuaian: **tinggi sebagai checklist production concerns**, sedang sebagai base.

Yang bisa diadaptasi:

- Alembic migration setup;
- structured logging dengan request/user correlation;
- authentication and rate-limit boundaries;
- configuration layering;
- timeout budget dan explicit provider fallback;
- observability wiring.

Yang jangan di-copy sekaligus:

- mem0 + pgvector sebelum use case retrieval terbukti;
- circular model fallback yang dapat menyembunyikan degradation;
- Prometheus, Grafana, Langfuse, cache, memory, dan vector stack pada milestone pertama;
- klaim “production-ready” tanpa failure testing sendiri.

Verdict: **REFERENCE, NOT FOUNDATION.** Jika digabung utuh dengan `agent-service-toolkit`, hasilnya dua skeleton bertabrakan. Pilih struktur dari satu base; ambil checklist infra dari repo ini secara selektif.

### 5. Cloudflare Agents — semantics approval yang bersih

- GitHub: [cloudflare/agents](https://github.com/cloudflare/agents)
- Snapshot: sekitar **5.2k stars**.
- Lisensi: **MIT**.
- Fokus: TypeScript agent SDK/runtime, durable state, tools, frontend integration, human approval.
- Kesesuaian: **tinggi sebagai API-design reference**, rendah sebagai stack utama karena kita memilih FastAPI/Python.

Yang bisa diadaptasi:

- deklarasi `needsApproval` pada tool berdasarkan arguments;
- tool-call lifecycle yang eksplisit;
- per-tool approval response;
- distinction antara denial dan execution error;
- frontend rendering berdasarkan typed tool state.

Yang tidak perlu di-copy:

- Cloudflare runtime coupling;
- chat transport dan SDK-specific state;
- TypeScript backend jika membuat dua runtime tanpa alasan.

Verdict: **TRANSLATE THE CONTRACT, NOT THE CODEBASE.** Implementasikan konsep serupa pada Python `ToolPolicy` dan approval API.

## B. Kandidat tambahan: berguna, tetapi bukan sumber utama

| Repository | Stars | Lisensi | Nilai bagi TravelOps | Keputusan |
|---|---:|---|---|---|
| [vstorm-co/full-stack-ai-agent-template](https://github.com/vstorm-co/full-stack-ai-agent-template) | ~1.5k | MIT | FastAPI + Next.js, auth, RAG, streaming | Ambil setup frontend/API jika rapi; tolak dukungan enam agent framework dan 20+ integrasi |
| [ibbybuilds/aegra](https://github.com/ibbybuilds/aegra) | ~1k | Apache-2.0 | PostgreSQL-backed LangGraph-compatible agent backend | Pelajari thread/run persistence; jangan membangun clone LangGraph Platform |
| [tgoai/tgo](https://github.com/tgoai/tgo) | ~512 | Modified Apache-2.0 | Customer-service workflow, RAG, tools, human collaboration | Referensi produk; jangan copy sebelum review syarat lisensi tambahan |
| [langchain-ai/agents-from-scratch-ts](https://github.com/langchain-ai/agents-from-scratch-ts) | ~39 | Tidak ditemukan pada snapshot | Email triage, tools, interrupt, human review | Pelajari konsep; jangan salin kode tanpa lisensi eksplisit |
| [krishnashakula/IRAS](https://github.com/krishnashakula/IRAS) | ~7 | Tidak ditemukan pada snapshot | FastAPI + LangGraph + PostgreSQL approval untuk incident response | Arsitekturnya dekat; jangan copy kode karena status lisensi tidak jelas |
| [alexrisch/agent-web-kit](https://github.com/alexrisch/agent-web-kit) | ~18 | Tidak ditemukan pada snapshot | Next.js frontend untuk agent-service-toolkit | Boleh dilihat; jangan salin sebelum lisensi diklarifikasi |

## C. Kandidat yang harus ditolak sebagai base

### TGO

Secara fitur terlihat dekat dengan customer operations, tetapi lisensinya menyatakan modified Apache-2.0 dengan syarat tambahan. Jangan menganggapnya setara Apache standar. Tanpa legal review, gunakan hanya sebagai referensi produk dari dokumentasi publik.

### IRAS dan repository tanpa lisensi

Repository publik tanpa lisensi bukan berarti bebas disalin. Secara default, hak cipta tetap melekat pada pemilik. Kita boleh mempelajari ide dan menulis implementasi independen, tetapi tidak menyalin source code.

### Full-stack template yang menjanjikan semuanya

Template dengan auth, RAG, memory, enam framework, dua puluh integrasi, dashboards, dan multi-agent sering menghasilkan banyak plumbing yang tidak dipahami. Hiring signal akan turun jika repository terlihat seperti hasil rename template.

### OTAIP sebagai full fork

Walaupun lisensinya permisif dan domainnya tepat, full fork akan membuat project kita terlihat seperti travel platform clone. Cakupannya jauh melampaui killer demo TravelOps dan akan mengaburkan kontribusi kita.

## D. Rekomendasi keputusan build/adapt

| TravelOps component | Keputusan | Sumber referensi | Batas adaptasi |
|---|---|---|---|
| FastAPI configuration and service bootstrap | Adapt | agent-service-toolkit | Pertahankan hanya wiring yang dipahami dan diuji |
| LangGraph checkpoint/interrupt | Adapt | agent-service-toolkit + official LangGraph behavior | State domain dirancang ulang sebagai `TravelTaskState` |
| PostgreSQL migrations | Adapt | fastapi-langgraph template | Schema task/audit/approval milik kita |
| Travel entities and edge cases | Reimplement | OTAIP concepts | Jangan port 75 agents atau full fare engine |
| Tool safety gates | Reimplement | OTAIP + Cloudflare Agents | Policy deterministic di backend, bukan prompt |
| Approval card | Adapt | agent-chat-ui-human-in-the-loop | Tambahkan reviewer identity, reason, expiry, version |
| Task Inbox and Task Workspace | Build | Tidak ada kandidat yang tepat | Ini pembeda produk utama kita |
| Tool execution ledger | Build | Pattern from blueprint | Idempotency, attempts, result, error, timestamps |
| Audit timeline | Build | Pattern from blueprint | Append-only domain events/correlation IDs |
| Evaluation dataset | Build | Travel fixtures inspired by OTAIP | Expected action, citation, approval, final state |
| Policy RAG | Build minimally | Haystack/LangGraph concepts if needed | Start with small deterministic corpus and citations |
| Observability | Adapt later | OpenTelemetry/Langfuse patterns | Instrument critical spans only in first slice |

## E. Proposed reuse sequence

### Step 1 — inspect before copying

Clone candidates into a separate `_references` directory or use Git submodules only for temporary inspection. Record exact commit SHA and license. Do not merge foreign history into the product repository.

### Step 2 — create a clean-room application skeleton

Create our own folders and domain names first:

```text
backend/app/domain/tasks
backend/app/domain/approvals
backend/app/domain/tools
backend/app/domain/policies
backend/app/workflows
backend/app/adapters
frontend/app/tasks
frontend/app/agent-runs
frontend/app/evaluations
```

Then adapt only small, attributable plumbing sections where the license allows it.

### Step 3 — preserve attribution

For copied MIT/Apache code:

- retain license and copyright notices;
- create `THIRD_PARTY_NOTICES.md`;
- record repository URL, commit SHA, file, and modifications;
- avoid copying trademarks, branding, sample data, or screenshots.

### Step 4 — verify independence

The finished project must visibly contain original engineering:

- TravelOps domain model;
- risk policy and approval protocol;
- mock booking/refund APIs;
- policy corpus and citations;
- idempotent tool ledger;
- task-centric UI;
- failure tests and evaluation dataset;
- architecture decisions explaining every adaptation.

## Final recommendation

If we want to start implementation efficiently, use this order:

1. **Study and selectively adapt `agent-service-toolkit`** for FastAPI/LangGraph/PostgreSQL plumbing.
2. **Extract a small TravelOps domain matrix from OTAIP**: refund, change, cancellation, waiver, and escalation only.
3. **Implement our own Task Inbox and domain API.** This must not inherit a chat-first model.
4. **Adapt one small MIT approval-card pattern** and connect it to a durable backend approval record.
5. **Use the production template only as a gap checklist** for migrations, auth, logging, and timeouts.

The most dangerous move is copying the repository that looks most complete. The most defensible move is copying only licensed plumbing, independently implementing the TravelOps domain, and documenting exactly what came from where.

## Sources

- [OTAIP repository](https://github.com/telivity-otaip/otaip)
- [agent-service-toolkit repository](https://github.com/JoshuaC215/agent-service-toolkit)
- [FastAPI LangGraph production-ready template](https://github.com/wassim249/fastapi-langgraph-agent-production-ready-template)
- [Cloudflare Agents human-in-the-loop documentation](https://github.com/cloudflare/agents/blob/main/docs/human-in-the-loop.md)
- [agent-chat-ui-human-in-the-loop](https://github.com/piotrgoral/agent-chat-ui-human-in-the-loop)
- [Aegra repository](https://github.com/ibbybuilds/aegra)
- [TGO repository](https://github.com/tgoai/tgo)
- [IRAS repository](https://github.com/krishnashakula/IRAS)
- [agents-from-scratch-ts](https://github.com/langchain-ai/agents-from-scratch-ts)
