# Christian Homeschools Hub

A multi-state directory of Christian homeschool programs, built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- React Hooks for client state (no Redux)

## Folder structure

```
homeschool-hub/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # homepage
│   ├── [state]/
│   │   ├── page.tsx             # state directory
│   │   └── [id]/
│   │       └── page.tsx         # program detail
│   └── api/
│       └── health/
│           └── route.ts         # health check (App Router API route)
├── components/
│   └── StateDirectory.tsx
├── lib/
│   ├── states.ts
│   └── supabase.ts              # Supabase client
├── .env.example
└── package.json
```

The health endpoint lives at `app/api/health/route.ts` because App Router API routes use a `route.ts` file, not `health.ts`.

## Setup

1. Install [Node.js](https://nodejs.org/) 18 or later.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a [Supabase](https://supabase.com/) project and copy the API URL and anon key from **Project Settings → API**.

4. Create your local environment file:

   ```bash
   copy .env.example .env.local
   ```

   On macOS or Linux:

   ```bash
   cp .env.example .env.local
   ```

5. Fill in `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000).

## Routes

| URL | Page |
| --- | --- |
| `/` | Homepage with searchable state list |
| `/texas` | State directory (reads `state` from the URL) |
| `/texas/sample-program` | Program detail (reads `state` and `id` from the URL) |
| `/api/health` | JSON health check, including Supabase configuration status |

## Scripts

```bash
npm run dev      # start the development server
npm run build    # create a production build
npm run start    # serve the production build
npm run lint     # run ESLint
```

## Notes

- Database tables are not created yet. The Supabase client is ready in `lib/supabase.ts`.
- Payments and admin tools are not included.
- `.env.local` is gitignored. Keep keys out of source control.
