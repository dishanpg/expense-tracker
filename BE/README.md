# Expense Tracker Backend

A NestJS backend application for tracking daily expenses.

## Tech Stack

- **Framework**: NestJS
- **Database**: MySQL
- **ORM**: TypeORM
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn
- MySQL

### Installation

1. Install dependencies:

```bash
yarn install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Update the `.env` file with your MySQL credentials.

4. Start the development server:

```bash
yarn start:dev
```

The application will be running at `http://localhost:3000`.

## Available Scripts

- `yarn start` - Start the application
- `yarn start:dev` - Start in development mode with hot reload
- `yarn start:debug` - Start in debug mode
- `yarn start:prod` - Start in production mode
- `yarn build` - Build the application
- `yarn test` - Run unit tests
- `yarn test:e2e` - Run end-to-end tests
- `yarn test:cov` - Run tests with coverage
- `yarn lint` - Lint the codebase
- `yarn format` - Format the codebase

## API Endpoints

### Health Check

- `GET /` - Returns application health status

## Project Structure

```
src/
├── app.module.ts       # Root application module
├── app.controller.ts   # Root controller with health check
├── app.service.ts      # Root service
└── main.ts             # Application entry point
```

## License

UNLICENSED
