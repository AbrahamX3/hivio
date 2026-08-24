<p align="center">
  <img src="./public/logo.svg" alt="Hivio logo" height="80" />
</p>

## Hivio

**Minimal tracker for Movies & Series.** Keep up with every episode you watch
without the clutter. Log what you are watching, pick up where you left off, and
see what is coming next, all in a calm dashboard.

Built with:

- **Next.js** for the app and routing
- **React** for the UI
- **Drizzle ORM + Neon PostgreSQL** for data and migrations
- **oRPC** for type-safe server procedures
- **Tailwind CSS** for styling
- **TMDB** for movie and series metadata
- **Better Auth + Discord OAuth** for authentication
- **Umami** for privacy‑friendly analytics

---

## Getting started

### 1. Clone and install dependencies

- **Clone the repo**:

```bash
git clone https://github.com/AbrahamX3/hivio.git
cd hivio
```

- **Install dependencies**:

```bash
pnpm install
```

### 2. Set up the database

Create a free PostgreSQL database on [Neon](https://neon.com/) (or use your
own), then set the connection string in your `.env` file (see `.env.example` as
a reference):

```bash
DATABASE_URL="postgresql://user:password@host/dbname"
```

Apply the schema with Drizzle Kit:

```bash
pnpm db:push
```

Or generate and run SQL migrations instead:

```bash
pnpm db:generate
pnpm db:migrate
```

### 3. Update `.env` for the frontend

Copy `.env.example` to `.env` and fill in the values. At minimum you need:

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `BETTER_AUTH_SECRET` (generate one with `openssl rand -base64 32`)
- `TMDB_API_KEY`
- OAuth credentials (`DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`, optionally
  Google)

Optional analytics:

- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` – if you want analytics, sign up for a free
  account at [`https://umami.is/`](https://umami.is/), follow the guide at
  [`https://umami.is/docs/collect-data`](https://umami.is/docs/collect-data),
  and copy the `data-website-id` from the script they provide.

### 4. Start the app in development

```bash
pnpm dev
```

By default the Next.js app runs on `http://localhost:3000`.

---

## Environment variables

All available variables are documented in `.env.example`. Here is a quick
reference:

### Database

- **`DATABASE_URL`**: PostgreSQL connection string used by Drizzle ORM and
  Drizzle Kit. A Neon connection string works out of the box.

### App URLs

- **`NEXT_PUBLIC_SITE_URL`**: The base URL of your app.
  - Local: `http://localhost:3000`
  - Production: your deployed site domain.

### Analytics

- **`NEXT_PUBLIC_UMAMI_WEBSITE_ID`**: Your Umami website ID for analytics (used
  by the Umami script components).

### TMDB

- **`TMDB_API_KEY`**: Your TMDB API key, used to fetch trending titles and
  metadata for movies and series.

### Authentication

- **`BETTER_AUTH_SECRET`**: Secret for Better Auth. You can generate one with:

  ```bash
  openssl rand -base64 32
  ```

- **`BETTER_AUTH_URL`**: Base URL used by Better Auth (defaults to
  `http://localhost:3000` locally).
- **`DISCORD_CLIENT_ID`**: Discord OAuth client ID from the
  [Discord Developer Portal](https://discord.com/developers/applications).
- **`DISCORD_CLIENT_SECRET`**: Discord OAuth client secret from the
  [Discord Developer Portal](https://discord.com/developers/applications).

To set up Discord OAuth and obtain these values, you can follow the Better Auth
Discord guide:
[`https://www.better-auth.com/docs/authentication/discord`](https://www.better-auth.com/docs/authentication/discord).
For local development, make sure your Discord redirect URL is set to:

```text
http://localhost:3000/api/auth/callback/discord
```

Make sure to restart the dev server after changing environment variables.

---

## Scripts

Useful package scripts from `package.json`:

- **`dev`**: Runs the Next.js dev server.
- **`build`**: Builds the Next.js app.
- **`start`**: Starts the built Next.js app.
- **`db:generate`**: Generates SQL migrations from the Drizzle schema.
- **`db:migrate`**: Applies generated migrations to the database.
- **`db:push`**: Pushes schema changes directly to the database.
- **`db:studio`**: Opens Drizzle Studio to browse your data.
- **`lint`**: Runs Oxlint.
- **`typecheck`**: Runs TypeScript type checking.
- **`check`**: Runs linting, type checking, and formatting.
- **`format`**: Formats the codebase with Oxfmt.

---

## Tech stack

- **Framework**: Next.js 16, React 19
- **Database**: PostgreSQL (Neon) via Drizzle ORM
- **APIs**: oRPC + TMDB API
- **Styling**: Tailwind CSS + custom components
- **Auth**: Better Auth with Discord OAuth
- **Analytics**: Umami

---

## Deploying to Production

Guidance for deploying Hivio to a production environment (including hosting the
Next.js app and configuring the production database and environment variables)
will be documented here soon. Stay tuned!

---

## Contributing

Issues and pull requests are welcome on the GitHub repo.

Before opening a PR, please run:

```bash
pnpm run check
```

This command runs linting, type checking, and formatting to keep the codebase
consistent. If you run into setup issues, double‑check your `.env` values first,
then open an issue with details about your environment.
