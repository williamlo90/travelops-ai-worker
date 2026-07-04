from hashlib import sha256
from math import sqrt

EMBEDDING_DIMENSIONS = 32
EMBEDDING_VERSION = "deterministic-hash-v1"


def embed(text: str) -> list[float]:
    values = [0.0] * EMBEDDING_DIMENSIONS
    for token in text.lower().split():
        digest = sha256(token.encode()).digest()
        values[int.from_bytes(digest[:2], "big") % EMBEDDING_DIMENSIONS] += (
            1.0 if digest[2] % 2 else -1.0
        )
    norm = sqrt(sum(value * value for value in values)) or 1.0
    return [value / norm for value in values]
