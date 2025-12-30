# Deployment Guide: Vercel + Vercel Postgres

Your application currently uses **SQLite**, which works great locally but **does not work on Vercel** (because Vercel is serverless and loses files after each request). You need to switch to a cloud database like **Vercel Postgres**.

Follow these steps to deploy your application.

## Prerequisite: GitHub
1.  Initialize a git repository if you haven't:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on [GitHub](https://github.com/new).
3.  Push your code to GitHub.

## Step 1: Prepare Code for Production (Postgres)

You need to update your Prisma schema to work with Postgres.

1.  Open `prisma/schema.prisma`.
2.  Change the `datasource` block to:

    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("POSTGRES_PRISMA_URL") // uses connection pooling
      directUrl = env("POSTGRES_URL_NON_POOLING") // uses a direct connection
    }
    ```

3.  **IMPORTANT**: Do *not* run `npx prisma db push` locally yet if you don't have Postgres installed locally. You will do this via Vercel.

## Step 2: Create Project on Vercel

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your **GitHub Repository**.

## Step 3: Add Database (Vercel Postgres)

1.  On the Vercel project configuration page (before you click Deploy), look for **Storage** on the left or specific database options, OR...
2.  Just click **Deploy** for now. **The build will fail** because of the database, but that's okay. We need to create the project first.
3.  Once the project is created (even if build failed), go to the **Storage** tab in your Vercel project dashboard.
4.  Click **"Create Database"** -> Select **"Postgres"**.
5.  Accept the terms and create it.
6.  Once created, click **"Connect Project"** and select your project.
7.  **Auto-config**: Vercel will automatically add environment variables (`POSTGRES_PRISMA_URL`, etc.) to your project settings.

## Step 4: Run Database Migration

You need to push your schema to this new cloud database. You can do this from your local machine if you link it, OR use the Vercel command line.

**Option A: The Easy Way (Redeploy)**
1.  Go to **Deployments** tab in Vercel.
2.  Click the three dots on your failed deployment -> **Redeploy**.
3.  This time, check the **Build Logs**.
    *   If it fails on `prisma generate`, you might need to add a "Build Command" in settings: `npx prisma generate && next build`.
    *   **CRITICAL**: You usually need to run migrations. The best way is to add a "post-install" script or run it locally.

**Option B: Link Local to Vercel (Recommended)**
1.  Install Vercel CLI: `npm i -g vercel`
2.  Login: `vercel login`
3.  Link your project: `vercel link`
4.  Pull environment variables: `vercel env pull .env.development.local`
5.  Now your local terminal can talk to the Vercel DB. Run:
    ```bash
    npx prisma db push
    ```
    *This creates the tables in your cloud database.*

## Step 5: Final Deploy
1.  Push any changes to GitHub (like the `schema.prisma` change).
2.  Vercel will trigger a new deployment.
3.  Once green, your site is live!

---

## Troubleshooting

*   **Error: "P1001: Can't reach database server"**: Check your "Environment Variables" in Vercel. Ensure `POSTGRES_PRISMA_URL` is set.
*   **Data is missing**: Swapping from SQLite to Postgres means you start with an **empty database**. You will need to create your admin account again (run the seed script or manually insert via Vercel Storage "Data" tab).
