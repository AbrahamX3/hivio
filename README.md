<img src="public/logo.png" alt="Hivio" width="auto" height="100">

# Hivio - Your Watchlist Companion

Hivio, pronounced /haɪˈviːoʊ/ (HAY-vee-oh), is a watchlist companion that helps
you easily search, add, manage and organize your series and movies through a
user-friendly interface; helping you keep track of your favorite movies and
shows. It also helps you discover new content that you might want to watch with
the help of the Hivio community, a collection of public user profiles you can
discover.

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
bun install
```

9. Run the prebuild command to generate the EdgeDB generator and interfaces.

```bash
bun run prebuild
```

8. Finally, run the following command to start the development server with the
   following command

```bash
bun run dev
```

9. Open [http://localhost:3000](http://localhost:3000) with your browser to see
   the application. You can click on `Get Started` to login with your Google
   account.

## License

Licensed under the
[MIT license](https://github.com/AbrahamX3/hivio/edit/master/LICENSE.md)
