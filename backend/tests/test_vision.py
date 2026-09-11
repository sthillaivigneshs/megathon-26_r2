import pytest
from unittest.mock import MagicMock
from app.services.vision_verification_service import vision_service
from app.models.batch import Item
from app.core.config import settings

def test_gemini_verification_success():
    db = MagicMock()
    # Mock item exists and has a photo_url
    item = Item(id=1, photo_url="http://storage/test.jpg")
    db.query.return_value.filter.return_value.first.return_value = item
    
    settings.VISION_VERIFICATION_ENABLED = True
    
    # Run verification (Gemini provider is mocked internally to always return success)
    verified_item = vision_service.verify_item_photo(db, 1)
    
    assert verified_item.verified_is_ewaste is True
    assert verified_item.verified_decision == "ACCEPT"
    assert verified_item.verified_provider == "gemini"
    assert db.commit.called

def test_fallback_verification():
    db = MagicMock()
    # Mock item exists and has a photo_url
    item = Item(id=1, photo_url="http://storage/test.jpg")
    db.query.return_value.filter.return_value.first.return_value = item
    
    settings.VISION_VERIFICATION_ENABLED = False
    
    # Run verification (uses fallback provider)
    verified_item = vision_service.verify_item_photo(db, 1)
    
    assert verified_item.verified_is_ewaste is False
    assert verified_item.verified_decision == "MANUAL_REVIEW"
    assert verified_item.verified_provider == "manual"
