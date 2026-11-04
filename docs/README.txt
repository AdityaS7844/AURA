AURA - CORRECTED PROJECT DOCUMENTATION
======================================

These nine .txt files have been reviewed and aligned to the current
AURA direction: purple desktop-first wardrobe application using
React + FastAPI + SQLite + Gemini API.

Read in this order:
1. 00_PROJECT_OVERVIEW.txt
2. 01_USE_CASES_USERS.txt
3. 02_UI_UX.txt
4. 03_FUNCTIONS_MODULES.txt
5. 04_API.txt
6. 05_BACKEND.txt
7. 06_GEMINI_INTEGRATION.txt
8. 07_MILESTONES.txt
9. 08_SCHEMA.txt

Important changes:
- Replaced the old custom Python scoring engine with Gemini-based
  structured outfit recommendations.
- SQLite remains the persistent database; Gemini does not store records.
- Added backend-only Gemini API key handling.
- Added strict validation of Gemini-returned clothing IDs.
- Aligned UI/UX with the AURA purple desktop-first app direction.
- Clarified feedback storage and prompt-based personalisation.
- Updated API, schema, tests and milestones to match.

Before implementation:
- Create your own .env from .env.example.
- Obtain a Gemini API key from Google's official AI developer tools.
- Never commit .env or expose the API key in React.
- Check current Gemini model availability and SDK documentation when
  implementing the integration.
