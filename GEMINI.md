# GEMINI.md - Project Context

## Project Overview
**Unmuted** is a comprehensive mental health support platform built with **React 19**, **Vite**, and **Firebase**. It provides a structured environment for students to express their emotions and book sessions with counselors, who in turn can manage their availability and cases.

### Key Features
- **Role-Based Access:** Distinct workflows for **Students** and **Counselors**.
- **Emotion Tracking:** Interactive emotion selection and feeling input for students.
- **Session Booking:** Calendar-based booking system with real-time countdowns.
- **Counselor Dashboard:** Tools for managing profiles, setting availability, and tracking cases (Upcoming/Completed).
- **Payment Integration:** Razorpay integration (implemented via Firebase Functions).
- **Secure Authentication:** Firebase Auth integration with email verification support.

## Technical Stack
- **Frontend:** React 19, TypeScript, Vite.
- **UI & Styling:** Material UI (MUI), Emotion, Tailwind CSS, Lucide React.
- **Backend:** Firebase (Auth, Firestore, Cloud Functions).
- **Payment Gateway:** Razorpay.
- **Routing:** React Router 7.

## Project Structure
- `/components`: Reusable UI components (Button, Layout, ProtectedRoute, etc.).
- `/context`: Global state management via `AppContext`.
- `/firebase`: Firebase initialization and configuration.
- `/pages`: Application views divided by role (`/student`, `/counselor`).
- `/services`: Backend interaction logic (Firebase services).
- `/unmuted`: Firebase Cloud Functions source code (Node.js 24).
- `/y`: Hosting public directory (as per `firebase.json`).

## Building and Running

### Prerequisites
- Node.js (Latest LTS recommended).
- Firebase CLI (for backend/hosting operations).

### Frontend Development
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run locally:**
    ```bash
    npm run dev
    ```
3.  **Build for production:**
    ```bash
    npm run build
    ```

### Backend (Firebase Functions)
Located in the `/unmuted` directory.
1.  **Install dependencies:**
    ```bash
    cd unmuted && npm install
    ```
2.  **Deploy functions:**
    ```bash
    firebase deploy --only functions
    ```

## Development Conventions
- **Path Aliases:** Use `@/` to refer to the project root (configured in `tsconfig.json`).
- **Styling:** Mixture of MUI components and Tailwind utility classes. Prefer MUI for complex UI components and Tailwind for layout/spacing.
- **Role Management:** Role definitions are `STUDENT` and `COUNSELOR`. Ensure these are handled consistently in uppercase when interacting with `AppContext`.
- **Firebase Security:** Note that `firestore.rules` are currently set to be globally permissive (`allow read, write: if true`). **TODO:** Harden rules before production deployment.
- **Environment Variables:** The project expects a `.env.local` file with `GEMINI_API_KEY` for AI-related features.

## Future Roadmap / TODOs
- Implement specific Firestore security rules.
- Complete Razorpay integration on the frontend.
- Finalize "Data Connect" integration (schema/queries).
