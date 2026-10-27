# Dezvoltarea asistată de coding agents: un flux de lucru cu skill-uri

Materialul pentru [seminarul PWCC](https://mihai-gheorghe.gitbook.io/pwcc-suport-seminar/dezvoltare-cu-coding-agents) despre dezvoltarea pe faze cu coding agents: opt skill-uri, câte unul pentru fiecare fază a unui task, documentele proiectului pe care le folosesc și aplicația de exemplu, Task API (un backend Node.js și Express, cu înregistrare, autentificare, autorizare și operații CRUD pentru task-uri).

| Director | Conținut |
| --- | --- |
| [`starter/`](starter/) | proiectul de pornire: `AGENTS.md`, skill-urile din `.agents/skills/`, documentele din `docs/` (arhitectura, roadmap-ul, standardele de cod); fără cod |
| [`reference/`](reference/) | același proiect după primul increment din roadmap, `app-foundation`, trecut prin toate cele opt faze: codul, testele, documentele actualizate și fișierele fiecărei faze, în `work/app-foundation/` |

Skill-urile, șabloanele de documente (template-urile) și documentele proiectului sunt în engleză; pagina de seminar le explică în română.

## Pornirea unui proiect nou

Ai nevoie de Git, GitHub CLI (`gh`), Node.js 22.13 sau mai nou și de un coding agent, de exemplu `agy` (vezi [primul seminar](https://mihai-gheorghe.gitbook.io/pwcc-suport-seminar/)).

```bash
git clone https://github.com/or-mihai-or-gheorghe/PWCC.git
cp -r PWCC/agentic-workflow/starter ~/task-api
cd ~/task-api
git init -b main
git add .
git commit -m "chore: add project documents, standards and workflow skills"
gh repo create task-api --private --source=. --remote=origin --push
```

Apoi pornește agentul în directorul proiectului și începe primul task din `docs/ROADMAP.md`:

```bash
agy
```

```
/task-scoping app-foundation
```

Fiecare fază rulează într-o sesiune nouă a agentului. Ordinea fazelor și regulile sunt în `AGENTS.md`.
