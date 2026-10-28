# ODIN

ODIN is a web-based, gamified intelligent tutoring system for introductory C# programming. It pairs a student portal with an embedded Godot game and a backend that analyzes code submissions, tracks progress, and returns contextual feedback.

The project focuses on C# arrays and related programming tasks. ODIN uses code diagnostics and observable interaction signals to guide support. Its behavioral signals are proxies for learning behavior; ODIN does not diagnose a student's mental or clinical state.

## What is in this repository

- **React + TypeScript web client**, built with Vite.
- **Supabase authentication and profile data** for student and instructor experiences.
- **Embedded Godot Web game** served from `/godot/index.html`.
- **ODIN API integration** for game sessions, puzzles, submissions, progress, and instructor views.
- **Profile and achievement views** connected to student progress.

The API is maintained in [kitarsin/odinroot](https://github.com/kitarsin/odinroot).

## How the pieces fit together

```text
Browser
├── ODIN web client (React / Vite)
│   ├── Supabase Auth and profile data
│   └── Godot Web game
└── ODIN Core API (ASP.NET Core)
    ├── C# code diagnostics
    ├── behavioral classification and mastery tracking
    └── adaptive feedback, sessions, and progress
        └── Supabase PostgreSQL
```

The client obtains a Supabase access token and sends authenticated API requests. The game is embedded in the client and communicates with it through browser messages.

## Run the web client locally

### Prerequisites

- Node.js and npm
- A Supabase project configured for ODIN
- A running ODIN Core API
- A Godot Web export at `public/godot/index.html`

### Configure the client

Create a `.env.local` file in the repository root:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ODIN_API_URL=http://localhost:5000
```

Use the public Supabase anon key intended for browser clients. Do not put service-role keys, database passwords, or other server secrets in Vite variables.

### Install and start

```bash
npm install
npm run dev
```

Vite prints the local URL when the development server starts. The API must be reachable from the browser, and its CORS allowlist must include the client origin.

### Build

```bash
npm run build
```

The production build is written to `dist/`.

## Configuration

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL used by the client |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key used by the client |
| `VITE_ODIN_API_URL` | Base URL for the ODIN Core API; defaults to `http://localhost:5000` |

## Related project

- [ODIN Core API](https://github.com/kitarsin/odinroot) — ASP.NET Core service for code submissions, diagnostics, behavioral analysis, mastery, and interventions.

## Research scope

ODIN uses a transparent, rule-based approach for its current C# programming domain. Behavioral classifications are based on observable interaction data and should be interpreted as learning-support signals, not clinical assessments. Evaluation results in the accompanying research describe a prototype study and do not establish causal effectiveness.
