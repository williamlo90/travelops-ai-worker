# Backend Sprint 7 — Versioned policy RAG and evidence

## Outcome

The refund workflow now retrieves applicable policy clauses from PostgreSQL/pgvector and binds an
immutable evidence snapshot to its proposal. A proposal advances to `waiting_approval` only when an
active policy matches carrier, product, jurisdiction, and effective date.

## Data lifecycle

```text
version-controlled JSON
→ strict Pydantic validation
→ immutable source version
→ clause chunking
→ deterministic embedding
→ pgvector index
→ metadata filtering
→ ranked retrieval
→ evidence snapshot
```

Invalid source data is rejected before indexing. Reusing a published source/version with changed
content is rejected. Re-ingesting identical content is idempotent.

## Safety behavior

- Missing, stale, wrong-carrier, or wrong-jurisdiction policy causes abstention.
- Multiple simultaneously applicable policy documents are treated as a conflict and cause abstention.
- Similarity score cannot bypass applicability filters.
- Evidence records retain source, version, clause, excerpt, chunk hash, effective date, score, corpus
  version, chunking version, embedding version, and index version.
- Existing evidence does not depend on the current contents of the active index.

## Evaluation

`evaluations/retrieval/golden.json` maps representative queries to relevant clauses. The deterministic
runner reports Recall@3 and MRR and exits non-zero when Recall@3 falls below the committed initial
gate.

This dataset is deliberately small. Its score is local regression evidence, not production-quality
or representative-user evidence.

## Scope boundary

The current deterministic hash embedding exists for repeatable tests and local execution. It is not
marketed as enterprise semantic retrieval quality. A production embedding adapter, larger labelled
corpus, latency distribution, authorization filtering, and operational telemetry remain later sprint
work already captured by the roadmap.

No reranker, hybrid search, external vector database, policy administration UI, or retrieval cache was
added because the current benchmark does not justify them.
