# ☑︎ todo-bmad

An experiment in using [BMad Method](https://docs.bmad-method.org/) to create a greenfield todo-list application.

## 📖 Documentation

In addition to the source code and the bmad files, you will find the following documentation files:

| Location | What is it? |
| --- | --- |
| `/requirements/requirements.md` | The original requirements document, which was the only input to the bmad flow. |
| `/notes/notes.md` | Notes that I made as I progressed through the workflow, capturing my observations and thoughts. I didn't make notes of every story create/dev/code review step, but I did make notes on all of the key workflow stages. |
| `/chats/*.md` | Exported transcripts from the various chats that I had with the different agent personas at different stages of the workflow.  Again, I only included one create/dev/code review transcript, but included others from the key workflow stages. |

## 🚀 Running the app

### Development mode

```bash
npm run dev
```

### Production mode

Run a production build first, then start the built artifacts:

```bash
npm run build # compile all packages (must run before start)
npm run start # starts backend (node dist/index.js) and frontend (next start) together
```

### Via Docker

```bash
docker compose up   # build and start both backend and frontend apps
docker compose down # teardown both backend and frontend apps
```

> [!TIP]
> When running the app is available at `http://localhost:3000` and the API at `http://localhost:3001`.

## Testing the app

### Unit tests:

```bash
npm run test
```

**288** unit tests over all three packages giving **100%** coverage with the exception of some excluded framework-level files.

### E2E tests:

```bash
npm run test:e2e    # run in terminal
npm run test:e2e:ui # open playwright ui
```

**21** playwright tests covering all user journeys and error handling.

### Lighthouse tests:

```bash
npm run test:lighthouse
```

> `npm run test:lighthouse` always runs `npm run build` first, then starts the **production** stack (not `npm run dev`), audits it, and stops the stack when done. Scores reflect the production build, not the dev server.

Lighthouse scores when running this script are generally **Performance: 93, Accesibility: 100, Best Practices: 100, SEO: 100**.

Lighthouse scores when run in the browser are **100 across the board**:

<img alt="image" src="https://github.com/user-attachments/assets/936d79fe-0043-4725-b8d1-7367955a0cd7" />

## 🧹 Clearing the database

To clear the local database for a fresh start, run:

```bash
npm run db:reset
```

## 🔐 Security review

See [./chats/13-security-review.md](./chats/13-security-review.md) for the chat transcript when I asked for a security review.

I opted for brevity to fix the critical and high issues via the "quick spec" and "quick dev" approach.
