import pytest
from fastapi import HTTPException
from app.models.user import User, UserRole
from app.core.deps import RoleChecker

def test_role_checker_success():
    # Mock user with CITIZEN role
    user = User(email="test@test.com", role=UserRole.CITIZEN)
    role_checker = RoleChecker(allowed_roles=["CITIZEN", "ADMIN"])
    
    assert role_checker(user) == user

def test_role_checker_failure():
    # Mock user with CITIZEN role
    user = User(email="test@test.com", role=UserRole.CITIZEN)
    role_checker = RoleChecker(allowed_roles=["ADMIN"])
    
    with pytest.raises(HTTPException) as excinfo:
        role_checker(user)
    assert excinfo.value.status_code == 403
