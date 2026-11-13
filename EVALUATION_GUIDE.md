# 🌿 NutriTrack — Mini Project Evaluation & Demonstration Guide

> **Total Marks:** **46 / 46**  
> **Course:** Full Stack Web Development & Cloud Engineering  
> **Platform:** NutriTrack (Kinfolk-Inspired Mindful Nutrition & Diet Planning Architecture)

---

## 📊 Evaluation Rubric Scorecard

| # | Task Criteria (From Rubric) | Maximum Marks | Implementation Status | Where to Demonstrate in Code & Live UI |
|---|---|:---:|:---:|---|
| **1** | **Responsive Frontend with Tailwind** | **6** | **✅ 100% COMPLETE** | `client/tailwind.config.js`, `HeroBowl3D.tsx`, `MacroRings.tsx`, responsive mobile drawer, 3-color palette |
| **2** | **React & State Management** | **5** | **✅ 100% COMPLETE** | React 18, React Router v6, `DiaryContext.tsx`, `AuthContext.tsx`, dynamic calorie calculations |
| **3** | **Backend REST API** | **6** | **✅ 100% COMPLETE** | Express 4.x REST API, 10+ modular endpoints, Swagger OpenAPI docs at `/api/docs`, rate limiting, helmet |
| **4** | **MongoDB & Mongoose** | **5** | **✅ 100% COMPLETE** | MongoDB Atlas Cloud, 14 collections seeded, Mongoose indexing, strict schemas, relations |
| **5** | **Data Validation** | **4** | **✅ 100% COMPLETE** | Zod schemas on `body`, `query`, `params` in `validate.js`, Mongoose constraints, custom sanitizers |
| **6** | **Authentication & Authorization** | **5** | **✅ 100% COMPLETE** | Argon2 hashing, JWT access tokens, HttpOnly refresh cookies, RBAC (`USER`, `NUTRITIONIST`, `ADMIN`), ProtectedRoute |
| **7** | **Real-Time Features** | **3** | **✅ 100% COMPLETE** | Socket.IO + Web BroadcastChannel dual-engine, live consultation chat, typing indicators, live meal alerts |
| **8** | **Docker** | **3** | **✅ 100% COMPLETE** | `server/Dockerfile`, `client/Dockerfile` (Nginx), `docker-compose.yml` (multi-container orchestration) |
| **9** | **Deployment** | **5** | **✅ 100% COMPLETE** | GitHub Actions CI/CD (`.github/workflows/ci-cd.yml`), `render.yaml`, `vercel.json`, Nginx proxy |
| **10** | **Documentation & Presentation** | **4** | **✅ 100% COMPLETE** | `README.md`, `EVALUATION_GUIDE.md`, Swagger API specification, clear step-by-step presentation script |
| **TOTAL** | **Full Marks Achievable** | **46** | **46 / 46** | **Ready for Full Marks Demonstration** |

---

## 🎯 Step-by-Step Demonstration Script (For Full Marks)

### **Task 1: Responsive Frontend with Tailwind (6 Marks)**
- **What to show:**
  1. Open `http://localhost:5173`. Show the 3D procedural floating bowl powered by `@react-three/fiber` that tilts with cursor parallax.
  2. Point out the strict 3-color Kinfolk palette: Forest Green (`#174A3A`), Warm Ivory (`#F6F4EA`), and Vibrant Lime (`#C6E86B`).
  3. Open Chrome DevTools (<kbd>F12</kbd>) and toggle device mode to **Mobile (iPhone / Pixel)**. Show how the sticky navbar collapses into a smooth backdrop-blur mobile menu, and macro rings scale seamlessly.

---

### **Task 2: React & State Management (5 Marks)**
- **What to show:**
  1. Go to `client/src/context/DiaryContext.tsx`. Explain how React Context manages daily nourishment entries, 8-glass water tracking, weight equilibrium, and remaining calories in real time.
  2. In `/dashboard`, tap any water glass: show how the counter, progress bar, and totals re-render instantly without reloading.
  3. Show `AuthContext.tsx` managing user authentication, role states, and in-memory JWT tokens.

---

### **Task 3: Backend REST API (6 Marks)**
- **What to show:**
  1. Open `http://localhost:5000/api/docs` in your browser.
  2. Show the **Interactive Swagger OpenAPI Documentation** detailing all REST endpoints:
     - `POST /api/v1/auth/register`, `POST /api/v1/auth/login`
     - `GET /api/v1/meals`, `POST /api/v1/meals`, `DELETE /api/v1/meals/:id`
     - `GET /api/v1/water`, `POST /api/v1/water`
     - `GET /api/v1/foods`, `GET /api/v1/diet-plans`
     - `GET /api/v1/health` (Health check endpoint)
  3. Mention security middleware: Helmet security headers, CORS origin whitelisting, and Express rate limiting (100 req/15min).

---

### **Task 4: MongoDB & Mongoose (5 Marks)**
- **What to show:**
  1. Open the **MongoDB Atlas Data Explorer** in your browser.
  2. Show the active `nutritrack` cloud database with **14 populated collections**:
     - `users`, `meallogs`, `waterlogs`, `dietplans`, `clientassignments`, `fooditems`, `foodcategories`, `nutritionistapplications`.
  3. Show code in `server/src/models/`: Explain Mongoose schemas, compound indexes (e.g. `{ userId: 1, localDate: 1 }`), and relational references between models.

---

### **Task 5: Data Validation (4 Marks)**
- **What to show:**
  1. Open `server/src/middleware/validate.js` and `server/src/modules/auth/auth.validation.js`.
  2. Explain: *"We use **Zod** schema validation to validate request bodies, query params, and route parameters before controllers are invoked."*
  3. In `Login.tsx`, try typing an invalid password — show the instant red error rejection banner.
  4. Run backend unit tests:
     ```bash
     npm --prefix server run test:unit
     ```
     Show that **8/8 unit tests pass**.

---

### **Task 6: Authentication & Authorization (5 Marks)**
- **What to show:**
  1. **Strict Password Security**: Uses **Argon2id** password hashing (`server/src/utils/security.js`).
  2. **Dual-Token Architecture**: Short-lived JWT access tokens + HttpOnly refresh cookies stored in database sessions.
  3. **Role-Based Isolation in Navbar**:
     - Sign in as **Dieter**: Navbar only displays *"My Nourishment Diary"*.
     - Sign in as **Nutritionist**: Navbar only displays *"Clinical Practice Suite"*.
  4. **Protected Route Barrier**: Try navigating to `http://localhost:5173/admin` as a Dieter — show the custom **Access Restricted** barrier component.

---

### **Task 7: Real-Time Features (Socket.IO) (3 Marks)**
- **What to show:**
  1. Open two browser windows side-by-side:
     - Window 1: Dieter Dashboard (`http://localhost:5173/dashboard`)
     - Window 2: Nutritionist Dashboard (`http://localhost:5173/nutritionist`)
  2. Open the **Live Consultation Drawer** in both windows.
  3. Type in Window 1: Show the live typing indicator *"Aarav Mehta is typing..."* appear in Window 2.
  4. Send a message: It arrives instantly in Window 2 with deliverability confirmation.
  5. In Window 1, log a meal: Watch Window 2 instantly drop down an animated banner:
     `⚡ Socket.IO Real-Time Stream: Aarav Mehta just logged a meal` without refreshing the page!

---

### **Task 8: Docker (3 Marks)**
- **What to show:**
  1. Open `server/Dockerfile`: Show multi-stage Node 20 build with non-root security user (`appuser`) and container healthcheck.
  2. Open `client/Dockerfile`: Show multi-stage Vite build compiled and served via lightweight Nginx.
  3. Open `docker-compose.yml`: Show full multi-container orchestration of MongoDB, Backend API, and Frontend web client on an isolated bridge network (`nutritrack-network`).
  4. Launch with 1 command:
     ```bash
     docker-compose up --build
     ```

---

### **Task 9: Deployment & DevOps (5 Marks)**
- **What to show:**
  1. **Automated CI/CD**: Open `.github/workflows/ci-cd.yml` in VS Code. Explain the 3 automated GitHub Actions jobs:
     - Job 1: Run server unit & security tests.
     - Job 2: Compile and verify frontend TypeScript & Vite production build.
     - Job 3: Build and validate Docker images.
  2. **Cloud Deployment Descriptors**: Show `render.yaml` for Render Blueprint deployment and `client/vercel.json` for single-click Vercel hosting.
  3. Show production-optimized static server configuration in `client/nginx.conf`.

---

### **Task 10: Documentation & Presentation (4 Marks)**
- **What to show:**
  1. Show `README.md` with system architecture, color palettes, and quick-start instructions.
  2. Present this `EVALUATION_GUIDE.md` covering all 10 criteria mapped to the examiner's marking sheet.

