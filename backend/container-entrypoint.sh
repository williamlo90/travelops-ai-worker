#!/bin/sh
set -eu

if [ "${TRAVELOPS_DEV_MIGRATE:-false}" = "true" ]; then
  uv run alembic upgrade head
  uv run python scripts/setup_checkpoints.py
  uv run python scripts/ingest_policies.py
fi

if [ "${TRAVELOPS_DEV_SEED:-false}" = "true" ]; then
  uv run python scripts/seed_demo.py
fi

exec "$@"
