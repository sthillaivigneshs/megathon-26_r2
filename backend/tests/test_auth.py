import pytest
from app.core.security import create_access_token, decode_token
from datetime import timedelta

def test_token_creation_and_decryption():
    data = {"sub": "user@example.com", "role": "CITIZEN"}
    token = create_access_token(data)
    decoded = decode_token(token)
    assert decoded["sub"] == "user@example.com"
    assert decoded["role"] == "CITIZEN"
