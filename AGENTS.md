# Cursor Rules for MagNext Frontend Web

## Project Overview

Next.js 16 e-commerce frontend with TypeScript, featuring:

- Internationalization (i18n) with next-intl
- GraphQL API with code generation
- React Server Actions for mutations
- React Query for data fetching in client components
- React Context API for state management
- Shadcn / Radix UI component library
- Tailwind CSS v4

## React Rules

### Component Patterns

- Default to Server Components
- Prefer named exports over default exports
- Group related components in feature directories
- Shared components in `src/components/shared/`
- UI primitives in `src/components/ui/`

### React Best Practices

- **Avoid massive JSX blocks** - Compose smaller, focused components
- **Colocate code that changes together** - Keep related code close
- **Avoid `useEffect` unless absolutely needed** - Prefer derived state, event handlers, or React Query
- **Never use `typeof window === "undefined"` inside `useEffect`** - `useEffect` only runs in the browser after hydration, so `window` is always defined. This guard is useless and misleading.
- **Use `useTransition` for loading states** - For async processes in client components

### State Management

- Use React Context for component tree state
- Use local state (`useState`) for component-specific state
- Use **React Hook Form** with **Zod** for forms
- Form schemas in `src/lib/forms/`
- Use `@hookform/resolvers/zod` for validation

### Error Handling

- Always wrap server actions in try-catch blocks
- Return proper service results (`ok`, `failure`, `unauthenticated`)
- **Avoid console statements** - Only use `console.error` when needed for error logging
- Handle loading and error states in React Query
- Provide user-friendly error messages

## TypeScript

- Use strict TypeScript mode
- Avoid `any` types - use proper types or `unknown`
- Use type imports: `import type { ... }`
- Leverage GraphQL code generation types from `@/graphql/graphql`
- Use **kebab-case** for all file names (enforced by ESLint)

## Next.js Rules

### Initialization

- **ALWAYS** call the `init` tool from `next-devtools-mcp` at the start of every session

### Server Actions

- **ALWAYS** use React Server Functions (Server Actions) for mutations
- Place in `src/lib/actions/` directory
- Use `ok()`, `failure()`, and `unauthenticated()` from `@/lib/utils/service-result`
- Always handle errors and return proper service results

### Routing and Navigation

- **NEVER** import directly from `next/link` or `next/navigation`
- **ALWAYS** use wrapped navigation from `@/i18n/navigation`:
  - `Link`, `useRouter`, `usePathname`, `redirect` from `@/i18n/navigation`
- App uses locale-based routing with `[locale]` segment
- Support parallel routes (`@drawer`) and intercepting routes (`(.)`)

### Internationalization

- All routes under `src/app/[locale]/`
- Use `getTranslations()` from `next-intl/server` in server components
- Use `useTranslations()` from `next-intl` in client components
- Translation files in `messages/` directory
- Support locales: Arabic (`ar`) and English (`en`)

## Code Organization

### Directory Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── contexts/         # React contexts
├── hooks/           # Custom React hooks
├── lib/
│   ├── actions/     # Server Actions
│   ├── clients/     # API clients
│   ├── constants/   # Constants
│   ├── forms/       # Form schemas (Zod)
│   ├── models/      # Data models
│   ├── types/       # TypeScript types
│   └── utils/       # Utility functions
├── i18n/            # Internationalization
└── styles/          # Global styles
```

### Import Organization

Follow ESLint perfectionist import sorting:

1. Side-effect imports
2. Type imports
3. React imports
4. Next.js imports
5. External dependencies
6. Internal imports (`@/*`)
7. Style imports

## API Integration

### GraphQL

- Queries and mutations in `src/lib/constants/api/graphql/`
- Use generated types from `@/graphql/graphql`
- Use `graphqlRequest()` helper from `@/lib/clients/graphql`
- Always pass `authToken` and `storeCode` to GraphQL requests

### Service Result Pattern

- All server actions return `ServiceResult<T>`
- Use `ok(data)`, `failure(errorMessage)`, `unauthenticated()`
- Check with `isOk()`, `isError()`, `isUnauthenticated()`

## Styling

- Use Tailwind CSS v4 utility classes
- Use `cn()` utility from `@/lib/utils` for conditional classes
- CSS variables for theming (defined in `src/app/globals.css`)
- Support mobile-first and RTL for Arabic locale

## Common Patterns

### Authentication

- Use `getAuthToken()` from `@/lib/actions/auth/get-auth-token`
- Handle unauthenticated states properly

### Locale and Store Code

- Get locale with `getLocale()` from `next-intl/server`
- Convert locale to store code with `getStoreCode()` from `@/lib/utils/country`

### Form Handling

- Use React Hook Form with Zod validation
- Form schemas in `src/lib/forms/`
- Use controlled components from `@/components/form-controlled-fields`

## GraphQL Code Generation

- Schemas in `schema.graphql` and `catalog-service-schema.graphql`
- Run `npm run generate:schema` to regenerate types
- Run `npm run generate:catalog-service-schema` for catalog service
- Generated types in `src/graphql/` and `src/catalog-service-graphql/`
