from __future__ import annotations

import hashlib
import hmac
import secrets
from base64 import b64decode, b64encode


PBKDF2_ITERATIONS = 120_000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"{PBKDF2_ITERATIONS}${b64encode(salt).decode()}${b64encode(digest).decode()}"


def verify_password(password: str, password_hash: str) -> bool:
    iteration_text, salt_text, digest_text = password_hash.split("$", maxsplit=2)
    iterations = int(iteration_text)
    salt = b64decode(salt_text.encode())
    expected_digest = b64decode(digest_text.encode())
    actual_digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
    )
    return hmac.compare_digest(actual_digest, expected_digest)


def issue_token() -> str:
    return secrets.token_urlsafe(32)
