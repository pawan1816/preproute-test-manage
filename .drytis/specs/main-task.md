# Preproute - Test Management Application

## Task: Build a 5-page React + TypeScript frontend

### Acceptance Criteria

- [ ] **Login Page** — userId + password form, form validation, JWT token stored in localStorage, redirect to dashboard on success, error handling for failed login
- [ ] **Dashboard** — Display all tests in a table, show test details (name, subject, status, created date), Edit/View/Delete actions, "Create New Test" button, search/filter functionality
- [ ] **Create/Edit Test** — Form with: test name, subject dropdown (API), test type tabs (Chapter Wise/PYQ/Mock), topics multi-select (cascading from subject), sub-topics multi-select (cascading from topics), difficulty level (radio buttons), marking scheme (correct/wrong/unattempted), total time, total marks, total questions. Save as draft + Next button. Form validation with Zod.
- [ ] **Add Questions** — Display test details at top, MCQ form with question text, 4 options, correct option selector, explanation, difficulty, topic/sub-topic dropdowns. Add/edit/delete questions. Bulk create via API. Minimum 1 question. Save & Continue button.
- [ ] **Preview & Publish** — Complete test overview with details and questions, expandable question cards, edit test/questions buttons, Publish button with confirmation modal, success modal, redirect to dashboard.
- [ ] **API Integration** — All 12 endpoints integrated: login, subjects, topics by subject, sub-topics by topic, tests CRUD, bulk questions, multi-topic sub-topics, fetchBulk questions. JWT Bearer token on all authenticated requests.
- [ ] **Auth** — Protected routes with auth guard, auto-redirect to login on 401, logout functionality.
- [ ] **UI/UX** — Clean Preproute branding, sidebar navigation, responsive design, loading states, error states, toast notifications.
- [ ] **Code Quality** — TypeScript throughout, Zustand for state, React Hook Form + Zod for validation, Axios with interceptors, clean file structure.

### Technical Stack
- React 18 + TypeScript (Vite)
- React Router v6
- Zustand (state management)
- Axios (HTTP client)
- React Hook Form + Zod (forms & validation)
- Tailwind CSS (styling)
- Lucide React (icons)
- React Hot Toast (notifications)

### Test Credentials
- Username: vedant-admin
- Password: vedant123

### API Base URL
- `/api` (proxied through Express server to `https://admin-moderator-backend-staging.up.railway.app/api`)