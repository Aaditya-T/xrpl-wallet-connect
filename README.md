This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Welcome to wallet connect template for xrpl! 

This is a template for a wallet connect app for the xrpl. It is built with next.js, shadcn and tailwind css!

## Which wallets are supported?

This template supports the following wallets:

- [XUMM](https://xumm.app/)  
- [GEM](https://gemwallet.app/)
- [CROSSMARK](https://crossmark.io/)

## How to use this template?
> Note: This template comes with JWT authentication.

To use this template, you can clone this repository and start building your app. You can also use this template to create a new starter project on xrpl!

To get started, first head over to xumm dev portal [here](https://apps.xumm.dev/) and get your api keys and use the `.env.template` file as a reference to create a `.env` file with your api keys.

Dont forget to also pass in a `ENC_KEY` in your `.env` file. This is the key that will be used to encrypt the user's address to store in cookies.

# Future update plans!

- [ ] Add support for wallet connect.
- [ ] Integrate next-auth for authentication.
- [ ] Make it an npm package!


# Next.js readme 

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

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
