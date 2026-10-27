# Task API

A REST API for personal tasks (to-dos): users register, sign in with a JSON Web Token and manage their own tasks. Node.js and Express 5; data in a local JSON file first, in Cloud Firestore later.

Status: no code yet. The increments are listed in `docs/ROADMAP.md`.

## Features

| Feature | Endpoint or command | Since |
| --- | --- | --- |
| None yet | | |

## Requirements

- Node.js 22 or newer, with npm
- Git, and GitHub CLI (`gh`) for pull requests

## Development workflow

Every change goes through the phases described in `AGENTS.md`, each one a skill in `.agents/skills/`. The files of a task are in `work/<slug>/`. A task starts with the task-scoping skill, for example: "Start the roadmap item app-foundation".
