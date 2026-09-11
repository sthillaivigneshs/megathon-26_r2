# ReLoop Voice Assistance — Architecture & Usage

## Overview

ReLoop Voice Assistance enables e-waste collectors to interact with the collection form using natural language commands in **English**, **Hindi**, and **Hinglish**. It follows the same offline-first architecture as the rest of the Collector app.

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                  Flutter Collector App                   │
│                                                         │
│  CollectionFormScreen                                   │
│  ┌──────────────┐    ┌────────────────┐                │
│  │ Voice Modal   │───▶│ VoiceService   │                │
│  │ (mic FAB)     │    │                │                │
│  └──────────────┘    │ Online? ──▶ POST /api/v1/voice  │
│                      │ Offline? ──▶ localParseCommand  │
│                      └────────────────┘                │
│                              │                          │
│                    VoiceCommandResponse                  │
│                    (structured intent)                   │
│                              │                          │
│                    Populates form fields                 │
│                    (category, weight, qty, hazard)       │
│                              │                          │
│                    [confirm] ──▶ SQLite PENDING queue    │
│                              │                          │
│                    SyncService ──▶ Backend API           │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                   FastAPI Backend                        │
│                                                         │
│  POST /api/v1/voice/parse-command                       │
│  POST /api/v1/voice/parse-audio                         │
│                                                         │
│  ┌──────────────────────────────────────────┐          │
│  │ VoiceAssistantService                     │          │
│  │ ┌──────────────────┐                     │          │
│  │ │ DemoVoiceProvider │ (default, offline)  │          │
│  │ ├──────────────────┤                     │          │
│  │ │ LocalVoiceProvider│ (air-gapped)        │          │
│  │ ├──────────────────┤                     │          │
│  │ │GeminiVoiceProvider│ (optional, API key) │          │
│  │ └──────────────────┘                     │          │
│  └──────────────────────────────────────────┘          │
│                                                         │
│  Returns VoiceCommandResponse (Pydantic)                │
│  ⚠ NEVER executes database mutations directly           │
└────────────────────────────────────────────────────────┘
```

## Safety Principles

1. **No direct DB mutation**: The voice service ONLY returns structured `VoiceCommandResponse` intents. Domain services handle actual database writes.
2. **Confirmation required**: `save_collection` and any `requires_confirmation: true` intent triggers an explicit UI confirmation dialog before executing.
3. **Validated schemas**: All voice responses are Pydantic-validated (`VoiceCommandResponse`). No freeform LLM execution against the database.
4. **Offline-safe**: The Flutter app includes a complete local parser that works without network access.

## Supported Voice Commands

### Collection Commands
| Command Pattern | Intent | Example |
|---|---|---|
| "Collect N [category] [weight kg]" | `create_collection` | "Collect 3 laptops weighing 5 kg" |
| "Add N [category]" | `add_item` | "Add 2 phones" |
| "N [category] [weight] kilo jama kiya" | `create_collection` | "2 laptop 3 kilo jama kiya hai" |

### Weight
| Command Pattern | Intent | Example |
|---|---|---|
| "Weight is N kg" | `update_weight` | "Weight is 4.5 kg" |
| "Wajan N kilo" | `update_weight` | "Wajan 3 kilo hai" |

### Hazard
| Command Pattern | Intent | Example |
|---|---|---|
| "Battery is swollen" | `report_hazard` | hazard_status: swollen_battery |
| "Leaking / leak detected" | `report_hazard` | hazard_status: leakage |
| "Damaged battery" | `report_hazard` | hazard_status: damaged_battery |

### Actions
| Command Pattern | Intent | Example |
|---|---|---|
| "Save this collection" | `save_collection` | requires_confirmation: true |
| "Sync / Upload" | `trigger_sync` | Triggers SyncService |
| "Cancel" / "Radd karo" | `cancel` | Clears current voice action |

### Supported Categories
Laptop, Mobile, Printer, Television/Screen, Charger/Cable, Battery, PCB/Motherboard

### Supported Languages
- **English**: Full support
- **Hindi (Devanagari)**: एक, दो, तीन, etc.
- **Hinglish**: "2 laptop 3 kilo jama kiya hai"

## Configuration

### Backend Environment Variables

```bash
# Voice Assistant toggle (default: true)
VOICE_ASSISTANT_ENABLED=true

# Provider selection: demo | local | gemini (default: demo)
VOICE_PROVIDER=demo

# Optional: Gemini API key (only needed if VOICE_PROVIDER=gemini)
GEMINI_API_KEY=your-key-here

# Gemini model (default: gemini-1.5-flash)
GEMINI_AUDIO_MODEL=gemini-1.5-flash

# Voice confidence threshold (default: 0.70)
VOICE_CONFIDENCE_THRESHOLD=0.70

# Max audio payload size (default: 10MB)
VOICE_MAX_AUDIO_BYTES=10485760
```

### Provider Hierarchy

| Provider | API Key Required | Network Required | Use Case |
|---|---|---|---|
| `demo` | No | No | Testing, demos, development |
| `local` | No | No | Air-gapped production |
| `gemini` | Yes (`GEMINI_API_KEY`) | Yes | Production with Gemini multimodal |

## API Endpoints

### POST `/api/v1/voice/parse-command`
Accepts JSON with either `command_text` (string) or `audio_base64` (base64-encoded audio bytes + `mime_type`).

**Request:**
```json
{
  "command_text": "Collect 2 laptops weighing 3 kg"
}
```

**Response:**
```json
{
  "intent": "create_collection",
  "items": [{"category": "Laptop", "quantity": 2, "declared_weight": 3.0}],
  "total_weight_kg": 3.0,
  "hazard_status": "no_hazard",
  "confidence": 0.96,
  "requires_confirmation": false,
  "spoken_feedback": "Recorded 2 Laptop, weight 3.0 kg.",
  "language": "en",
  "provider": "demo"
}
```

### POST `/api/v1/voice/parse-audio`
Accepts multipart file upload. Bearer auth required.

## Flutter Integration

The `CollectionFormScreen` has a green mic FAB button that opens a voice command modal. Commands populate the form fields directly. Save commands trigger a confirmation dialog before writing to the SQLite offline queue.

The `VoiceService` in Flutter:
1. If online + auth token available → calls backend `/api/v1/voice/parse-command`
2. If offline or backend unreachable → uses `localParseCommand()` (identical deterministic parser)

Both paths return the same `VoiceCommandResponse` model, ensuring consistent behavior.

## Testing

```bash
# Backend voice tests (18 tests)
PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/test_voice_assistant.py -v

# Full backend regression (70 tests)
PYTHONPATH=backend backend/.venv/bin/pytest backend/tests -v

# Flutter voice tests
cd collector_app && flutter test test/voice_assistant_test.dart -v

# Full Flutter test suite
cd collector_app && flutter test
```
