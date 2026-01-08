# Typescript Start

Full-stack starter template with Bun runtime, Hono backend, and React frontend.

## To Start
Run `bun install` and `bun dev` to start.

## To Deploy
1. Have a cloudflare account with a domain name managed by cloudflare
2. Run `bunx wrangler login` to authenticate your account
3. Set your subdomain and domain in `CUSTOM_DOMAIN` at /infra/deploy.ts
4. Run `bun run deploy`

Should work :fingers-crossed:

## Why?
This app is meant to be a starter app that can evolve to scale to 90% of use cases while being super simple up front. To do that it makes some opinionated decisions about runtimes, libraries and infrastructure.

## Auth
Uses BetterAuth initially implemented with just anonymous users and passkeys. The BetterAuth instance relies on a SQLite database.
In dev that's a SQLite file accessed through Bun.sql and when deployed to Cloudflare it's a Cloudflare D1 instance that's created on deploy

## Infrastructure
All the deploy code is writted in /infra/deploy.ts. Yes, it's messy currently. That's an area of cleanup for this project but Cloudflare doesn't currently have great Typescript SDKs for IaC. Will work on it

## Prioritizing
### Avoiding Config Hell
Put as much config into typescript code as possible. Don't 

### Type safety
Typescript/type systems is powerful it should be used as mnuch as possible

### Modularity
Frontend and Backend should be able to evolve separately

**Backend:** Hono with Zod validation, type-safe RPC client  
**Frontend:** React 19 + TanStack Router  
**Runtime:** Bun
