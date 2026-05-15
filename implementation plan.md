# Implementation Plan for Masjidh Sandha Web Module

## Goal Description
Convert the existing PyQt desktop application (membership, payments, reports, login, WhatsApp integration) into a modern web application using a lightweight framework (e.g., Flask + Jinja or FastAPI + React) while improving architecture, UI/UX, security, and maintainability.

## User Review Required
> [!IMPORTANT]
> The plan proposes a full rewrite using Flask for the backend and vanilla HTML/JS (or optionally a minimal React/Vite frontend). Please confirm the preferred stack (Flask vs FastAPI, vanilla vs React) before we start.

## Open Questions
> [!WARNING]
> - Do you want a single‑page application (React/Vite) or server‑rendered templates (Flask + Jinja)?
> - Which authentication method should be used (session cookies, JWT, OAuth2)?
> - Do you still need WhatsApp Web automation, or will the API‑only approach suffice?
> - Do you require role‑based UI (Admin/Staff/Member) on the web?

## Proposed Changes
---
### 1. Project Structure (new)
- `app/`
  - `__init__.py`
  - `models.py` – ORM (SQLAlchemy) mapping of existing SQLite tables.
  - `schemas.py` – Pydantic models for request/response validation.
  - `routes/`
    - `auth.py` – login, logout, session handling.
    - `members.py` – CRUD for members, membership forms.
    - `payments.py` – endpoints mirroring `PaymentManager` methods.
    - `reports.py` – JSON endpoints returning report data.
  - `services/`
    - `payment_service.py` – business logic extracted from `Payment.py`.
    - `report_service.py` – logic from `Reports.py`.
    - `whatsapp_service.py` – wrapper around `whatsapp_config.py` (API only).
- `frontend/`
  - `index.html` – landing page.
  - `login.html`, `dashboard.html`, `member_form.html`, `reports.html` – Jinja templates (or React components if SPA).
  - `static/` – CSS, JS, images (modern design, glassmorphism, dark mode).
- `config.py` – environment variables, DB URI, secret keys.
- `run.py` – entry point (`flask run`).
---
### 2. Backend Migration
- Replace direct `sqlite3` calls with **SQLAlchemy** models for type safety and easier migrations.
- Create a **Database Access Layer** (`db.py`) providing `save`, `query` helpers (mirroring `save_to_db` and `get_db_records`).
- Port `PaymentManager` logic to `payment_service.py` with clearly defined functions:
  - `record_sandha_payment`
  - `record_meal_contribution`
  - `record_member_donation`
  - `record_zakath_donation`
  - `record_nonmember_donation`
  - `get_member_payment_history`
  - `get_monthly_income_summary`
- Implement **RESTful API** endpoints (POST/GET) for each operation, using JSON payloads.
---
### 3. Authentication & Session Management
- Use **Flask‑Login** for session handling, storing `user_id` and `role` in the session.
- Migrate `LoginDialog` logic to an `/login` route that validates credentials against `users` table, hashes passwords with **bcrypt** (instead of MD5).
- Store `active_user` data in Flask's `g` context.
---
### 4. Front‑end Redesign (Web UI)
- Adopt a **premium UI**: dark theme, glassmorphism cards, smooth micro‑animations using CSS transitions.
- Use **Google Fonts** (e.g., "Inter") for modern typography.
- Build responsive layout with Flexbox/Grid.
- Replace PyQt dialogs with modal HTML forms.
- For SPA option, create a **React** app using Vite, consuming the JSON API.
---
### 5. Report Generation
- Convert `ReportWidget` to a server‑rendered page (`/reports`) that fetches JSON data from `/api/reports/...`.
- Add **CSV export** endpoint (`/api/reports/export`) returning `text/csv` response.
- Implement charting with **Chart.js** for visual summaries.
---
### 6. WhatsApp Integration
- Keep `WhatsAppSender` but expose a backend endpoint `/api/whatsapp/send` that forwards the request.
- Remove UI automation (`pyautogui`) – it's brittle in a server environment.
---
### 7. Improvements & New Suggestions
- **Security**: Switch to bcrypt for password hashing, enforce HTTPS, set `Secure` and `HttpOnly` cookies.
- **Testing**: Add unit tests with **pytest** for services; integration tests for API routes.
- **Dockerization**: Provide a `Dockerfile` and `docker-compose.yml` (DB + app) for easy deployment.
- **CI/CD**: GitHub Actions workflow to run tests and build Docker image.
- **Logging**: Centralized logging with **loguru**; store audit logs in a dedicated table.
- **Configuration**: Use **python‑dotenv** for environment variables; avoid hard‑coded secrets.
- **Internationalization**: Prepare templates for i18n (gettext) to support multiple languages.
- **Performance**: Add pagination for large tables, lazy‑load report data.
- **Accessibility**: Ensure ARIA attributes, keyboard navigation, sufficient contrast.
---
## Verification Plan
### Automated Tests
- Run `pytest` covering:
  - Auth flow (login, logout, role checks).
  - Payment service methods (record, retrieve, summary).
  - Report service JSON structure.
  - WhatsApp endpoint returns proper status codes.
- Execute `flake8`/`black` for code style.
### Manual Verification
- Open the web app in a browser, test UI responsiveness on mobile and desktop.
- Verify CSV export produces correct file.
- Confirm dark mode and animations work.
- Check Docker container starts and connects to SQLite (or switch to PostgreSQL in prod).

*Please review the plan and answer the open questions before we start implementing.*
