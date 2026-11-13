# NutriTrack — Editorial Kinfolk-Inspired Nutrition & Diet Planning Platform

> *"Kinfolk magazine meets a mindful fitness sanctuary."*

NutriTrack is an editorial, agency-grade nutrition and diet planning web application built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **Three.js** (`@react-three/fiber` & `@react-three/drei`), and **Framer Motion**.

---

## 1. Strict Design System

### A. The 3-Color Palette (Never Deviate)
- **Forest Green** (`#174A3A`): Primary surfaces, dark sections, headings, badges.
- **Ivory** (`#F6F4EA`): Warm page backgrounds, light cards, text on dark surfaces.
- **Lime** (`#C6E86B`): Accents, CTAs, highlight rings, active states, glowing chips.

### B. Typography Pairings
- **Fraunces** (Google Fonts Serif with optical sizing and soft wonk axis): Display headlines, numbers, hero copy, and italic accents.
- **Manrope** (Google Fonts Sans): Clean body copy, UI controls, labels, and nutritional metrics.

---

## 2. Core Modules & Experiences

### 1. Editorial Landing Page (`/`)
- **Sticky Glassy Navbar**: `bg-ivory/80 backdrop-blur-md` with Fraunces logo and pill action button.
- **Hero Split**:
  - Left: Giant Fraunces headline `Eat well. / Feel unstoppable.` with italic lime-accented typography and dual CTAs.
  - Right: **Procedural 3D Hero Scene** built with `@react-three/fiber` featuring a floating ceramic ivory bowl, avocado half, kale greens, cherry tomatoes, soft studio lighting, lime rim lights, and cursor parallax tilt.
- **Stats Strip**: 4 animated count-up metrics (12,000+ dieters, 98% adherence, 5.0 rating, 50+ practitioners).
- **Features Grid**: 6 ivory cards on forest background with custom lime icon chips.
- **How It Works**: 3 steps with oversized ghost numerals (`01`, `02`, `03`).
- **Role Portals**: Direct access cards to the Dieter, Nutritionist, and Admin experiences.
- **Minimal Editorial Footer**: Philosophy and links in Forest & Ivory.

### 2. Dieter Experience (`/dashboard`)
- **Greeting Header**: Personalized `"Good morning, Aarav"` with current date.
- **Concentric Macro Rings**: Custom animated SVG stroke-dashoffset rings rendering live Calories, Protein, Carbs, and Fats in Lime and Forest on Ivory.
- **Categorized Daily Nourishment Log**: Breakfast, Lunch, Dinner, and Snacks with food photography, portions, macros, and delete actions.
- **Mindful Water Tracker**: 8-glass visual indicator (2.0L goal) with tap-to-fill/empty animated controls.
- **Weekly Calorie Rhythm**: 7-day bar chart (Forest bars with Lime glow for today).
- **Weight Equilibrium**: Interactive weight logging widget with trend history.
- **Quick-Add Meal Modal**: Live whole food database search with portion multipliers (0.5x, 1x, 1.5x, 2x) or manual custom macronutrient entry.

### 3. Nutritionist Suite (`/nutritionist`)
- **Clinical Client Roster**: Filterable table showing client avatar, goal, adherence %, last active, and status.
- **Interactive Client Inspection Drawer**: Drill down into client macro stats, review today's logged meals, and prescribe clinical notes directly to their journal.

### 4. Admin Platform Governance (`/admin`)
- **Platform KPI Stat Cards**: Total Dieters, Active Subscriptions, Verified Nutritionists, Catalog Items.
- **User & Nutritionist Management**: Filterable user table with role-specific badges (Dieter = Lime, Nutritionist = Forest, Admin = Outlined).
- **Moderation Actions**: Approve or reject pending nutritionist applications with instant state updates.

### 5. Role Switcher & Login (`/login`)
- Centered Ivory card on Forest Green background with 1-click persona switching (Dieter, Nutritionist, Admin) for immediate demonstration and review.

---

## 3. Getting Started

### Prerequisites
- Node.js `v18+` or `v22+`
- NPM `v9+` or `v11+`

### Installation & Running Locally
```bash
# Clone or open the repository
cd nutritrack

# Install client packages
cd client
npm install

# Start Vite dev server
npm run dev
```

The application will start on **`http://localhost:5173`** (or `http://localhost:5174`).

### Production Build & Type Checking
```bash
cd client
npm run build
```
Generates an optimized production bundle with TypeScript strict checking and lazy chunk splitting for the 3D scene.
