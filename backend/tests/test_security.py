import pytest
from app.core.security import verify_password, get_password_hash

def test_password_hashing():
    password = "secret_password"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed) is True
    assert verify_password("wrong_password", hashed) is False

def test_long_password_hashing():
    # Password longer than 72 bytes to verify pre-hashing resolves the bcrypt constraint
    password = "a" * 100
    hashed = get_password_hash(password)
    assert verify_password(password, hashed) is True
    assert verify_password("a" * 99 + "b", hashed) is False

def test_salt_uniqueness():
    password = "secret_password"
    hashed_1 = get_password_hash(password)
    hashed_2 = get_password_hash(password)
    assert hashed_1 != hashed_2
