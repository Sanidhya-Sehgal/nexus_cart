# NexusCart 🚀

NexusCart is a premium, AI-powered automation middleware that syncs Shopify product data to WordPress.com blogs. It uses Groq's Llama 3.3 to generate immersive, SEO-optimized product landing pages and automatically handles media uploads and featured images.

## Features ✨

- **AI Copywriting**: Generates sophisticated D2C-style product copy using Groq (Llama 3.3).
- **Automated Sync**: One-click publishing from Shopify to WordPress.
- **Premium Design**: Built-in glassmorphic dashboard and high-end inline CSS for WordPress posts.
- **Media Support**: Automatically uploads Shopify images to the WordPress Media Library and sets them as Featured Images.
- **Shopify Integration**: Direct checkout links on every synced post.

## Tech Stack 🛠️

- **Frontend**: Next.js, Tailwind CSS, Shadcn/UI, Framer Motion.
- **Backend**: Node.js, Express, XML-RPC.
- **AI**: Groq SDK (Llama 3.3 70B).
- **Database**: Supabase (for sync logging).

## Deployment Guide 🌐

### 1. Frontend (Vercel)
- **Framework**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Env Vars**: 
  - `NEXT_PUBLIC_API_URL`: [Your Render Backend URL]/api

### 2. Backend (Render)
- **Environment**: Node.js
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Env Vars**:
  - `PORT`: 5000 (Render sets this automatically)
  - `GROQ_API_KEY`: Your Groq API key
  - `WP_URL`: Your WordPress site URL
  - `WP_AUTH`: `username:application_password`
  - `SHOPIFY_STORE_URL`: `your-store.myshopify.com`
  - `SHOPIFY_ACCESS_TOKEN`: Your Shopify Admin API token
  - `SUPABASE_URL`: Your Supabase Project URL
  - `SUPABASE_KEY`: Your Supabase API Key

## Local Setup 💻

1. Clone the repo.
2. Create a `.env` file in the root with the variables listed above.
3. Run `npm install` in both `frontend` and `backend` directories.
4. Run `npm start` in `backend`.
5. Run `npm run dev` in `frontend`.

---
*Created with ❤️ by NexusCart Team*
