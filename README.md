# todo-bmad

An experiment in using [BMad Method](https://docs.bmad-method.org/) to create a greenfield todo-list application.

## Documentation

In addition to the source code and the bmad files, in following folders you will find:

- `requirements`: The original requirement document, which was the only input to the bmad flow
- `notes`: Notes that I took as I progressed through the workflow, capturing my observations and thoughts
- `chats`: Exported transcripts from the various chats that I had with the different agent personas at different stages of the workflow (note that I stopped copying these after the first story, with the exception of the first retro

## Running the app

To run locally:

```bash
npm run dev
```

## Testing the app

Unit tests:

```bash
npm run test
```

E2E tests:

```bash
npm run test:e2e    # run in terminal
npm run test:e2e:ui # open playwright ui
```

Lighthouse tests:

```bash
npm run test:lighthouse
```

## Clearing the database

To clear the local database for a fresh start, run:

```bash
npm run db:reset
```
