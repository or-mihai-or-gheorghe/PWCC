# <Project name>

<One paragraph: what the application does and for whom.>

## Features

| Feature | Endpoint or command | Since |
| --- | --- | --- |
| <feature> | `<METHOD /path>` | <task slug> |

## Requirements

- <runtime and tools, with versions>

## Setup

```bash
npm install
cp .env.example .env    # then fill in the values
```

## Configuration

| Variable | Meaning | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `3000` |

## Run

```bash
npm start
```

## Test

```bash
npm test
```

<Manual testing: requests or API collection.>

## Development workflow

Every change goes through the phases in `AGENTS.md`; the task files are in `work/<slug>/`.
