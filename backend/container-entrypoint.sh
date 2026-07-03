#!/bin/sh
set -eu

if [ "${TRAVELOPS_DEV_MIGRATE:-false}" = "true" ]; then
  uv run alembic upgrade head
fi

if [ "${TRAVELOPS_DEV_SEED:-false}" = "true" ]; then
  uv run python scripts/seed_demo.py
fi

exec "$@"
