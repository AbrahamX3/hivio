<p align="center">
  <img src="./public/logo.svg" alt="Hivio logo" height="80" />
</p>

## Hivio

**Minimal tracker for Movies & Series.** Keep up with every episode you watch without the clutter. Log what you are watching, pick up where you left off, and see what is coming next, all in a calm dashboard.

Built with:

- **Next.js** for the app and routing
- **React** for the UI
- **Convex** for the backend, data, and actions
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

### 2. Run Convex setup (`predev`)

Run the Convex dashboard + dev server once to create or link a Convex project and generate `.env.local`:

```bash
pnpm run predev
```

The CLI will ask whether you want to **create a new Convex project** or **choose an existing one**. Completing this step creates or updates `.env.local` with the Convex connection variables.

### 3. Update `.env.local` for the frontend

Open `.env.local` and add/update the following variables (use `.env.example` as a reference):

- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

You can get `NEXT_PUBLIC_CONVEX_SITE_URL` from the Convex dashboard:

- Go to **URL & Deploy Key**
- Click **Show development credentials**
- Copy the **HTTP Actions URL** (the URL that ends in `.site`)
- Paste it as the value for `NEXT_PUBLIC_CONVEX_SITE_URL`

Optional analytics:

- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` – if you want analytics, sign up for a free account at [`https://umami.is/`](https://umami.is/), follow the guide at [`https://umami.is/docs/collect-data`](https://umami.is/docs/collect-data), and copy the `data-website-id` from the script they provide.

### 4. Set Convex environment variables

The following environment variables are stored in Convex, not in `.env.local`. Run these commands once (using your own values for the placeholders):

```bash
pnpm dlx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
pnpm dlx convex env set SITE_URL=http://localhost:3000
pnpm dlx convex env set DISCORD_CLIENT_ID=<your_client_id>
pnpm dlx convex env set DISCORD_CLIENT_SECRET=<your_client_secret>
pnpm dlx convex env set TMDB_API_KEY=<your_tmdb_api_key>
```

### 5. Start the app in development

This project runs the frontend and Convex backend together.

```bash
pnpm dev
```

By default:

- The Next.js app runs on `http://localhost:3000`
- Convex runs on its own dev port and connects using `CONVEX_DEPLOYMENT` / `NEXT_PUBLIC_CONVEX_URL`

---

## Environment variables

All available variables are documented in `.env.example`. Here is a quick reference:

### Convex / backend

- **`CONVEX_DEPLOY_KEY`**: Used for Production and Preview deployments when running `convex deploy`. Create it in the Convex dashboard under project settings.
- **`CONVEX_DEPLOYMENT`**: Name/ID of the Convex deployment used by `npx convex dev` (for example, the dev deployment created in your Convex dashboard).
- **`NEXT_PUBLIC_CONVEX_URL`**: The Convex `.cloud` URL for your deployment.
- **`NEXT_PUBLIC_CONVEX_SITE_URL`**: The Convex `.site` URL for your deployment.

### App URLs

- **`NEXT_PUBLIC_SITE_URL`**: The base URL of your app.
  - Local: `http://localhost:3000`
  - Production: your deployed site domain.
- **`SITE_URL`**: Used by Convex / auth flows and the dashboard; set this to the public URL of your app in production.

### Analytics

- **`NEXT_PUBLIC_UMAMI_WEBSITE_ID`**: Your Umami website ID for analytics (used by the Umami script components).

### TMDB

- **`TMDB_API_KEY`**: Your TMDB API key, used to fetch trending titles and metadata for movies and series.

### Authentication

- **`BETTER_AUTH_SECRET`**: Secret for Better Auth. You can generate one with:

  ```bash
  openssl rand -base64 32
  ```
- **`DISCORD_CLIENT_ID`**: Discord OAuth client ID from the [Discord Developer Portal](https://discord.com/developers/applications).
- **`DISCORD_CLIENT_SECRET`**: Discord OAuth client secret from the [Discord Developer Portal](https://discord.com/developers/applications).

To set up Discord OAuth and obtain these values, you can follow the Better Auth Discord guide: [`https://www.better-auth.com/docs/authentication/discord`](https://www.better-auth.com/docs/authentication/discord).
For local development, make sure your Discord redirect URL is set to:

```text
http://localhost:3000/api/auth/callback/discord
```

Make sure to restart the dev server after changing environment variables.

---

## Scripts

Useful package scripts from `package.json`:

- **`dev`**: Runs Next.js and Convex dev servers in parallel.
- **`dev:frontend`**: Runs the Next.js dev server only.
- **`dev:backend`**: Runs `convex dev` only.
- **`predev`**: Ensures Convex dev is ready and opens the Convex dashboard.
- **`build`**: Builds the Next.js app.
- **`start`**: Starts the built Next.js app.
- **`lint`**: Runs ESLint.
- **`typecheck`**: Runs TypeScript type checking.
- **`check`**: Runs linting, type checking, and formatting.
- **`format`**: Formats the codebase with Prettier.
- **`deploy`**: Deploys the Convex backend.

---

## Tech stack

- **Framework**: Next.js 16, React 19
- **Backend**: Convex
- **Styling**: Tailwind CSS + custom components
- **Data & APIs**: TMDB API
- **Auth**: Better Auth with Discord OAuth
- **Analytics**: Umami

---

## Deploying to Production

Guidance for deploying Hivio to a production environment (including hosting the Next.js app and configuring the Convex production deployment and environment variables) will be documented here soon. Stay tuned!

---

## Contributing

Issues and pull requests are welcome on the GitHub repo.

Before opening a PR, please run:

```bash
pnpm run check
```

This command runs linting, type checking, and formatting to keep the codebase consistent. If you run into setup issues, double‑check your `.env.local` values first, then open an issue with details about your environment.
