This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## This starts a Postgres database in the background
`sudo docker compose up -d`

## This applies your schema to the database
`pnpm prisma migrate dev --name init`

## This generates the type-safe Prisma client
`pnpm prisma generate`

## Next-Auth handles all the auth logic. Bcrypt hashes passwords.
`pnpm install next-auth bcrypt`
`pnpm install --save-dev @types/bcrypt`

## Stop your old database (if running)
`sudo docker compose down`

## Build and run everything
`sudo docker compose up --build`

## Using Docker (The Deliverable)
Prerequisite: You must have Docker Desktop installed and running on your computer.

First, we need to get the database running so we can set up its tables.
Open your terminal in the project's root folder and run:
`sudo docker compose up -d db`

## Run Database Migrations
`pnpm prisma migrate dev`

## Build & Run Your Full Application
`sudo docker compose up --build`

## To stop the Application
go back to your terminal and press Ctrl + C.
As a good practice, run the following command:
`sudo docker compose down`

## Alternative Method: Running Locally (Without Docker)
You can also run the app "natively" on your machine without using Docker for the app itself. This is a common setup for development.
1. Install PostgreSQL: You must install and run PostgreSQL directly on your computer (e.g., using Postgres.app for Mac or the official Windows installer).
2. Start Local Database: Make sure your local PostgreSQL service is running.
3. Update .env File: Change the DATABASE_URL in your .env file to point to your local database, which might have different credentials (e.g., postgresql://your_local_user:your_local_pass@localhost:5432/portfolio_db).
4. Install Dependencies: Run pnpm install to make sure you have all packages.
5. Run Migrations: Run pnpm prisma migrate dev to set up your local database tables.
6. Run the Dev Server: In one terminal, run pnpm dev.
7. Access Your App: Open http://localhost:3000 in your browser.

## Please Note 
When running the sudo docker compose up –build command, comment the 1 line of prisma.config.ts