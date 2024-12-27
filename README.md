<img src="public/logo.png" alt="Hivio" width="auto" height="100">

# Hivio - Your Watchlist Companion

Hivio (pronounced /haɪˈviːoʊ/, HAY-vee-oh) is a web tool designed to help you effortlessly search, add, manage, and organize your favorite series and movies through a user-friendly interface. It also enables discovery of new content you might enjoy by exploring other users' profiles.

[![wakatime](https://wakatime.com/badge/user/a1d0a4b7-5299-43e3-bfa9-723a4830894f/project/5aaeb9ef-4535-48a0-a308-ebfc05e1b01e.svg)](https://wakatime.com/badge/user/a1d0a4b7-5299-43e3-bfa9-723a4830894f/project/5aaeb9ef-4535-48a0-a308-ebfc05e1b01e)

## Tech Stack

- [Next.js](https://nextjs.org)
- [EdgeDB](https://www.edgedb.com)
- [Vercel](https://vercel.com)
- [TypeScript](https://www.typescriptlang.org)
- [React Hook Forms](https://react-hook-form.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com/)
- [TMDb API](https://www.themoviedb.org)

## Getting Started Locally

1. Clone this repository with the following command and head over to the
   project.

```bash
git clone https://github.com/AbrahamX3/hivio.git
```

2. Install EdgeDB, download it here:
   [https://www.edgedb.com/install](https://www.edgedb.com/install)

3. Run the following command to create and start a development EdgeDB instance
   (might take a while due to migrations) locally

```bash
edgedb project init
```

3. Rename the `.env.example` file to `.env`.

4. Head over to [https://www.themoviedb.org/](https://www.themoviedb.org/) and
   create an account. Then head over to
   [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
   to apply for an API key. In your `.env` file, fill in the `TMDB_API_KEY`
   variable with your API key. This is needed to fetch the data from TMDb when
   adding a new title.

5. To setup EdgeDB authentication (used to access the dashboard and create
   public profiles), run the following command

```bash
 edgedb ui
```

6. Head over to
   [http://localhost:10704/ui/main/auth](http://localhost:10704/ui/main/auth),
   navigate to `Providers` and find the `Google` provider (currently the only
   provider configured in the Hivio app). Go to
   [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
   and create a new OAuth client ID. Once you have created the client ID, copy
   the `Client ID` and `Client Secret` and paste them in the `Client ID` and
   `Client Secret` fields of the `Google` provider in the UI. For
   `additional_scope` add `profile email` as the value, this is needed for
   creating the user's profile, then click on `Add Provider`.

7. In the Google API Console, in the same page where you copied your OAuth data,
   add the following url to `Authorized JavaScript origins`:
   `http://localhost:3000` and in `Authorized redirect URIs`:
   `http://localhost:10702/db/main/ext/auth/callback`.

8. Then head over to the `Config` tab on the EdgeDB UI and fill in the
   `app_name` with a name for your app, click on `Generate Random Key` and for
   `allowed_redirect_urls` add the following urls below and press `Update`:

```bash
http://localhost:3000
http://localhost:3000/hive
http://localhost:3000/auth/signin
```

8. Install your dependencies with the following command

```bash
pnpm install
```

9. Run the prebuild command to generate the EdgeDB queries and interfaces.

```bash
pnpm run prebuild
```

8. Finally, run the following command to start the development server with the
   following command

```bash
pnpm run dev
```

9. Open [http://localhost:3000](http://localhost:3000) with your browser to see
   the application. You can click on `Get Started` to login with your Google
   account.

## Deploying to Production

1. You'll need an [EdgeDB cloud instance](https://www.edgedb.com/cloud) to
   deploy to production. Generate a secret key and have your instance details on
   hand to then provide to the following enviorment variables:

```
EDGEDB_SECRET_KEY=""
EDGEDB_INSTANCE=""
```

2. Run the following command to authenticate and apply migrations to your cloud
   instance (this might take a while to do):

```bash
edgedb cloud login
```

```bash
edgedb migrate -I <username>/<instance_name>
```

3. Then do the steps in `Getting Started Locally` from 6 to 8 with the only
   modification being replacing the URL's with your production url details.
   Example `http://localhost:3000/` to `https://hivio.vercel.app/`

4. Deploy to Vercel or any other cloud provider

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAbrahamX3%2Fhivio&env=NEXT_PUBLIC_BASE_URL,TMDB_API_KEY,EDGEDB_SECRET_KEY,EDGEDB_INSTANCE&envDescription=EDGEDB_SECRET_KEY&envLink=https%3A%2F%2Fwww.edgedb.com%2Fcloud&project-name=hivio&repository-name=hivio&demo-title=Hivio&demo-description=A%20watchlist%20companion%20that%20helps%20you%20easily%20search%2C%20add%2C%20manage%20and%20organize%20your%20series%20and%20movies%20through%20a%20user-friendly%20interface&demo-url=https%3A%2F%2Fhivio.vercel.app)

## License

Licensed under the
[MIT license](https://github.com/AbrahamX3/hivio/edit/master/LICENSE.md)
