# M1 deployment handoff

The app uses Next.js App Router, strict TypeScript, Tailwind and Supabase Postgres/Storage. No authentication or real integrations. The role switch provides no authorisation.

## Local checks

```sh
npm install
npm run lint
npm run typecheck
npm run build
npm run dev
```

Open http://localhost:3000. Use only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your private `.env.local`. Never commit it or add service-role credentials. The app reports backend failures; it does not silently substitute fixture success.

## Connect or verify Vercel

1. Sign in at https://vercel.com/dashboard and choose the intended team.
2. If a project already exists, open it, then **Settings → Git**. Confirm the connected repository is `tinothecreator/Developer-Lab-Hackathon` and production branch is `main`.
3. Otherwise click **Add New → Project**, find that GitHub repository and click **Import**. If absent, use **Adjust GitHub App Permissions** to grant access to this repository, then return and import.
4. Set the framework preset to **Next.js**, root directory to the repository root (`./`), and leave the build/output defaults. Build command is `npm run build`; install command is `npm ci`. Use a supported Node.js version of at least 20.9 (22.x is suitable).
5. Expand **Environment Variables**, or in an existing project open **Settings → Environment Variables**.
6. Add `NEXT_PUBLIC_SUPABASE_URL` with your Supabase public project URL. Select **Production**, **Preview** and **Development**, then save.
7. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the public anon key for the same project, select those environments and save. Add no other app configuration variables.
8. Click **Deploy**. For an existing deployment, open **Deployments → latest deployment → … → Redeploy** after saving the variables. Environment changes require a new build.
9. Wait for **Ready**, then click **Visit**. Check `/`, `/basket`, `/ngo` and the role switch, then follow `docs/qa/m1-checklist.md`.
10. Confirm the deployed commit matches `git rev-parse HEAD`. Pushes to connected `main` should trigger subsequent production deployments.

Vercel access was not connected in the coding session. A deployment URL or successful project connection is therefore not claimed.

References: [Vercel projects](https://vercel.com/docs/projects/managing-projects), [environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables).
