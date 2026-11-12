# Local Development Setup

## Requirements

- Node.js 24.x
- npm >=11.6.2 <12
- Git

## Installation

```bash
nvm install
nvm use

npm run doctor
npm ci
```

## Environment Configuration

```bash
cp .env.example .env
```

Never commit local environment files or credentials.

## Installing Dependencies

Install dependencies for a specific workspace:

```bash
npm install <package> -w @excel-dashboard/web
```

Install development dependencies:

```bash
npm install -D <package> -w @excel-dashboard/api
```

Install repository-wide development tooling:

```bash
npm install -D <package>
```

## Workspace Commands

```bash
npm run <script> -w @excel-dashboard/web
```

The selected workspace must define the requested script.

## Cleanup

Remove generated build artifacts:

```bash
npm run clean
```

Remove build artifacts and installed dependencies:

```bash
npm run clean:all
npm ci
```

## Dependency Lockfile

Commit package-lock.json whenever dependencies change.

Use npm ci for reproducible installations.

Do not generate application-level lockfiles.

## Troubleshooting

### Unsupported Node.js Version

```bash
nvm use
```

### Dependency Installation Problems

```bash
npm run clean:all
npm ci
```

### Environment Validation

```bash
npm run doctor
```

## Code Quality

Run linting across the repository:

```bash
npm run lint
```

Automatically fix supported lint violations:

```bash
npm run lint:fix
```

Format the repository:

```bash
npm run format
```

Check formatting without changing files:

```bash
npm run format:check
```

Lint an individual workspace:

```bash
npm run lint -w @excel-dashboard/web
```

## Editor Integration

Install the recommended VS Code extensions.

Use the workspace TypeScript version.

Prettier formats supported files on save.

ESLint applies supported fixes on explicit save.

Command-line linting and formatting checks remain
the authoritative validation mechanism.
