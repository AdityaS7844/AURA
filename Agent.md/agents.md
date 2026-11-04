
# AURA - Project Development Rules

## 1. Project Identity
AURA is an AI Personalized Wardrobe application.

## 2. Technology Stack
- Frontend: React + Vite
- Styling: Tailwind CSS v4
- Animations: Framer Motion
- Icons: Lucide React
- Backend: Python FastAPI
- Database: SQLite + SQLAlchemy
- AI: Google Gemini API
- Weather: Open-Meteo

## 3. Documentation Rules
- Read docs/00_PROJECT_OVERVIEW.txt first.
- Follow the relevant documentation before implementing features.
- docs/04_API.txt is the API contract.
- docs/08_SCHEMA.txt is the database contract.
- docs/06_GEMINI_INTEGRATION.txt defines AI behaviour.
- Do not independently change the architecture.

## 4. Coding Rules
- Write clean, modular, beginner-friendly code.
- Use reusable React components.
- Keep API calls separate from UI components.
- Use Python services for business logic.
- Use environment variables for secrets.
- Never expose Gemini API keys in frontend code.
- Validate all Gemini responses on the backend.
- Never recommend clothes outside the user's wardrobe.

## 5. Design Rules
- Primary: #4B2E9E
- Accent: #7355CF
- Background: #F7F5FC
- Use Outfit and Inter fonts.
- Desktop-first, responsive design.
- Maintain a premium fashion-tech aesthetic.

## 6. Agent Workflow
1. Read relevant documentation.
2. Prepare an implementation plan.
3. Explain which files will be created or modified.
4. Implement only the requested milestone.
5. Run the application and tests.
6. Fix errors before reporting completion.
7. Summarize changes and wait for approval.

## 7. Important Restrictions
- Never implement all milestones in one task.
- Never skip testing.
- Never delete existing project data without approval.
- Never install unnecessary packages.
- Ask before changing the approved architecture.
