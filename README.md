# ENTUDIO ProjectForge AI

An AI-powered engineering project development assistant built for college students, beginners, and aspiring engineers. Convert raw project ideas into structured engineering plans, interactive system architectures, source code, milestone trackers, and academic project reports.

---

## Key Features

- **Dashboard**: Workspace overview with project counters, quick tool launchers, and recent project history pre-seeded with realistic sample engineering projects (*AI-Powered Attendance Management System*, *IoT Smart Campus Energy & HVAC Monitor*, and *Autonomous Line-Following Warehouse Rover*).
- **AI Project Generator**: Generates structured project plans from an idea, domain (`AI/ML`, `Web Development`, `IoT`, `Robotics`, `VLSI`, `Embedded Systems`, `Data Science`, `Other`), difficulty level, language, and duration—including Abstract, Problem Statement, Objectives, Proposed Solution, Technology Stack, Software & Hardware Requirements, System Modules, Development Roadmap, Testing Procedures, Expected Results, and Starter Code.
- **Architecture Designer**: Synthesizes project-specific architecture overviews, pattern classifications, component specifications, data flow steps, module relationships, and interactive **Mermaid.js** flowcharts with zoom controls, Mermaid source copy, and SVG export.
- **AI Code Assistant**: Four-mode coding workbench (**Generate Code**, **Explain Line-by-Line**, **Find & Fix Errors**, **Suggest Improvements**) with syntax highlighting (`highlight.js`), line numbers, copy/save actions, and optional active-project context.
- **Development Tracker**: Per-project milestone checklist with completion progress bar, status filters (`All`, `Pending`, `Completed`), roadmap task import, and timestamped engineering notes saved in `localStorage`.
- **Documentation Generator**: Compiles a 12-section technical project report (**Title Page**, **Abstract**, **Introduction**, **Problem Statement**, **Objectives**, **Existing System**, **Proposed System**, **System Architecture**, **Implementation**, **Results**, **Conclusion**, **Future Scope**) with Copy, Markdown (`.md`), Plain Text (`.txt`), and multi-page PDF (`.pdf`) export.
- **Saved Projects & Settings**: Searchable, domain-filterable project library with edit, duplicate, delete, JSON workspace backup/import, sample restoration, server AI status checking, and an explicit **Demo Mode** fallback when API generation is unavailable.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion (`motion/react`)
- **Diagrams, Code & Export**: Mermaid.js, Highlight.js, jsPDF
- **Backend**: Express (`server.ts`) with Vite middleware in development and static `dist/` serving in production
- **AI SDK**: `@google/genai` (`gemini-4-hydrogen`) executed strictly server-side
- **Persistence**: Browser `localStorage`

---

## Project Structure

```text
├── server.ts                          # Express + Vite server & Gemini AI API routes
├── index.html                         # HTML entry point & Google Fonts
├── metadata.json                      # Application metadata & capabilities
├── package.json                       # Scripts & dependencies
├── vite.config.ts                     # Vite & Tailwind CSS v4 configuration
└── src/
    ├── App.tsx                        # Main workspace shell & page routing
    ├── index.css                      # Global styles & highlight.js theme tokens
    ├── types.ts                       # Shared TypeScript domain interfaces
    ├── components/
    │   ├── AiErrorBanner.tsx          # API error state with retry & Demo Mode action
    │   ├── CodeBlock.tsx              # Syntax-highlighted code viewer with copy/save
    │   ├── MermaidDiagram.tsx         # Interactive Mermaid flowchart viewer & SVG export
    │   ├── Sidebar.tsx                # Responsive navigation sidebar
    │   └── TopBar.tsx                 # Top header with project switcher & primary CTA
    ├── data/
    │   └── sampleProjects.ts          # Pre-seeded sample projects & Demo Mode builders
    ├── pages/
    │   ├── DashboardPage.tsx
    │   ├── ProjectGeneratorPage.tsx
    │   ├── ArchitectureDesignerPage.tsx
    │   ├── CodeAssistantPage.tsx
    │   ├── DevelopmentTrackerPage.tsx
    │   ├── DocumentationGeneratorPage.tsx
    │   ├── SavedProjectsPage.tsx
    │   └── SettingsPage.tsx
    ├── services/
    │   ├── aiService.ts               # Client API calls to /api/ai/*
    │   └── storageService.ts          # LocalStorage persistence helpers
    └── utils/
        └── exportUtils.ts             # Clipboard, Markdown, TXT, and jsPDF exports
```

---

## Server API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Reports server health and whether `GEMINI_API_KEY` is configured |
| `POST` | `/api/ai/project-plan` | Generates a structured JSON project plan |
| `POST` | `/api/ai/architecture` | Generates system architecture details and a Mermaid flowchart |
| `POST` | `/api/ai/code-assistant` | Runs code generation, line-by-line explanation, debugging, or optimization |
| `POST` | `/api/ai/documentation` | Compiles a 12-section academic engineering project report |

---

## Getting Started

### 1. Environment Variables
Copy `.env.example` to `.env` (or configure secrets in your hosting environment):

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

> **Note:** `GEMINI_API_KEY` is read exclusively on the server (`server.ts`) and is never exposed to the browser. If no key is configured, you can enable **Force Demo Mode** in **Settings** or click **Load Sample Output (Demo Mode)** when prompted.

### 2. Install & Run

```bash
# Install dependencies
npm install

# Start development server (Express + Vite middleware on port 3000)
npm run dev

# Type-check TypeScript
npm run lint

# Build production frontend bundle
npm run build

# Start production server
NODE_ENV=production npm start
```
