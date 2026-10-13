# EduBerg India - Enterprise Learning Management System

EduBerg India is an enterprise-grade, full-stack Learning Management System built with an **ASP.NET Core 9 Web API** backend, **Entity Framework Core**, **SQLite / PostgreSQL**, and a modern **React** frontend. It features a 3-tier **Courses → Modules → Lessons** curriculum hierarchy, **Admin Validation & Approval workflows** for registrations and enrollments, **Automatic Zoom Meeting generation**, video streaming, quizzes, assignments, discussions, and verified certificates.

---

## 🌟 Key Features

1. **User Authentication & Admin Approval Workflow**:
   - Roles: `Admin`, `Instructor`, `Student`
   - Secure JWT Bearer authentication with BCrypt password hashing
   - **Student Registration Approval Gate**: New student accounts start as `Pending` and must be validated and approved by an Administrator before they are authorized to log in.
   - **Course Enrollment & Class Admission Gate**: Student enrollment applications require Administrator approval before course modules unlock.
   - Admin Dashboard Approval Queue to review, approve, or reject student registrations and course enrollments.

2. **Hierarchical Curriculum Structure (Courses → Modules → Lessons)**:
   - Structured organization: Courses contain **Modules**, and each Module contains sequenced **Lessons**.
   - Collapsible accordion view with per-module progress indicators.
   - Markdown-formatted lesson notes, durations, video streaming embeds, and free preview options.

3. **🔴 Virtual Live Classes & Automatic Zoom Link Generation**:
   - Schedule live classes with **Zoom**, **Google Meet**, **Microsoft Teams**, or **Jitsi**.
   - **Automatic Zoom Integration**: Integrated with Zoom Server-to-Server OAuth 2.0 API to automatically generate Join URLs, Meeting IDs, and Passcodes when left blank.
   - `LIVE NOW 🔴` badges, 1-click Join button, clipboard copy, and cloud recording replays.

4. **Interactive Knowledge Quizzes**:
   - Timed multiple-choice quizzes with pass/fail thresholds and confetti celebrations.
   - In-depth answer explanations and instant grading.

5. **Assignments & Grading**:
   - Deliverables with due dates and max point scoring.
   - Code and solution submission with instructor feedback and grading.

6. **Discussion Forums & Q&A**:
   - Threaded course discussions between instructors and peers.

7. **Verified Certificates of Completion**:
   - Automatically issued by **EduBerg India Academy** upon reaching 100% course lesson progress.
   - Printable certificate layout with verified Certificate ID.

8. **Role-Tailored Dashboards**:
   - **Student**: Enrolled courses, active progress bars, earned certificates, upcoming live Zoom sessions.
   - **Instructor**: Authored courses, student metrics, assignment submissions to grade.
   - **Admin**: System metrics, student registration approval queue, course enrollment approval queue, user directory.

---

## 🚀 Live Localhost URL

- **Web App & UI**: [http://localhost:5000](http://localhost:5000)
- **Interactive Swagger API Docs**: [http://localhost:5000/swagger](http://localhost:5000/swagger)

---

## 🔑 Pre-Seeded Demo Accounts

All demo accounts use password: `Password123!`

| Role | Email | Status | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@eduberg.in` | Approved | Superuser with full approval controls |
| **Instructor** | `instructor@eduberg.in` | Approved | Course creator & instructor |
| **Student** | `student@eduberg.in` | Approved | Enrolled student with active course progress |
| **Pending Student** | `priya@example.com` | Pending | Sample student awaiting Admin approval |

---

## 🛠️ Tech Stack

- **Backend**: C# 13, ASP.NET Core 9 Web API, Entity Framework Core 9
- **Frontend**: React 18, Vite 6, Tailwind CSS 3, Lucide Icons
- **Database**: SQLite (default zero-configuration), PostgreSQL ready
- **Hosting**: Kestrel (port 5000) / Microsoft IIS (`web.config` included)
- **Live Video**: Zoom REST API & Server-to-Server OAuth
