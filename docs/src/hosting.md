# Hosting
All hosting services are selected for good performance, high usage limits and high availability worldwide for completely free

::: tip
You can also get free subdomains like [*.is-a.dev](https://github.com/is-a-dev/register), [*.rweb.site](https://github.com/katorlys/rweb.site) or other similar ones for your web services
:::

## Frontend - Cloudflare
[Cloudflare Pages](https://pages.cloudflare.com) provides completely free hosting for static websites.
The website is deployed to cloudflare's global CDN ensuring fast access and high availability all around the globe.
Cloudflare Pages also provides a ```*.pages.dev``` subdomain or allows using a custom domain.

First the documentation [VitePress] is built and then its output is copied to the public folder of the frontend website [React, NextJS] to then be built and deployed by Cloudflare.

Both the documentation and frontend use Static Site Generation [SSG] since the website is mostly static and it allows us to deploy to Cloudflare Pages for completely free

::: details Configuration
Settings > Build Configuration
```
Build command:  bash build-frontend.sh
Build output:   frontend/out
Root directory: /
```

\
Settings > Variables and Secrets
|   Type    |     Name     |  Value  |
|:---------:|:------------:|:-------:|
| Plaintext | NODE_VERSION | 20.18.0 |
:::

## Backend - Render
[Render](https://render.com/) imposes stricter limits on the free plan compared to Cloudflare Pages but it is sufficient for hosting multiple small scale projects or even keep one service running 24/7.
The Free plan allows 750hours uptime and 100GB bandwidth per month combined for all projects on the account.
Render also provides a ```*.onrender.com``` subdomain or allows using a custom domain.

Render supports deployment of multiple languages but this project uses NodeJS with ExpressJS and Socket.io

::: warning
Abuse of uptime pinging for 24/7 availability may be against [Render's Terms Of Service](https://render.com/terms)
:::
