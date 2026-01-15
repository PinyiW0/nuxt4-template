# Nuxt 4 Template

Production-ready Nuxt 4 template with TypeScript, modern tooling, and best practices built-in.

## Stack

- **Nuxt 4.2.1** - Full-stack framework
- **TypeScript** - Type safety with strict checking
- **Tailwind CSS** - Utility-first styling
- **Pinia** - State management
- **VueUse** - Composition utilities

## Development Tools

- **ESLint** - @antfu/eslint-config + Nuxt + Tailwind rules
- **Commitlint** - Conventional commits enforcement
- **Husky** - Pre-commit, commit-msg, pre-push hooks
- **VS Code** - Auto-format on save preconfigured

## Quick Start

```bash
# Install
npm install

# Dev server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Type check
npm run typecheck
```

## Project Structure

```
app/
├── pages/           # File-based routing
│   └── examples/    # Feature examples (excluded in production)
├── stores/          # Pinia stores
│   └── examples/    # Store examples (excluded in production)
└── app.vue          # Root component

server/
└── api/
    └── examples/    # API examples (excluded in production)

docs/                # Development guides
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run generate` | Static site generation |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript validation |
| `npm run commitlint` | Validate commit message |

## Code Quality

### Auto-formatting
- Saves trigger ESLint auto-fix in VS Code
- Configured in `.vscode/settings.json`

### Git Hooks
- **pre-commit** - Lint staged files
- **commit-msg** - Validate commit format
- **pre-push** - TypeScript type checking

### Commit Convention
```bash
feat: add new feature
fix: bug fix
docs: documentation update
style: code style changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

## Examples

Visit `/examples` in dev mode to see:
- TypeScript patterns
- Pinia store usage
- VueUse composables
- Server API integration

**Note**: Examples are automatically excluded in production builds.

## Configuration

### Environment
- Node.js ≥ 22.12.0
- Package manager: npm, pnpm, yarn, or bun

### VS Code Extensions (Recommended)
- Vue - Official
- ESLint
- Tailwind CSS IntelliSense

## Production

Examples and development-only code are excluded via:
- Route rules redirect `/examples/**` → `/`
- Nitro ignore patterns for server examples
- Build-time file exclusion

## Learn More

- [Nuxt Documentation](https://nuxt.com/docs)
- [Pinia Documentation](https://pinia.vuejs.org)
- [VueUse Documentation](https://vueuse.org)
- [Tailwind CSS](https://tailwindcss.com)

---

**Template Version**: 1.0.0
**Nuxt Version**: 4.2.1
**Last Updated**: 2025-12-03
