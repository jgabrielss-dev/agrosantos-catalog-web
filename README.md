
```
# Agrosantos Digital Catalog & Admin Dashboard

This repository contains the front-end architecture and server-side logic for the Agrosantos digital catalog. Built with Next.js (App Router), it serves as a high-performance, SEO-optimized e-commerce storefront coupled with a Zero-Trust administrative dashboard for inventory and showcase management.

## 🏗️ Architecture & Core Engineering

This project abandons heavy client-side state management in favor of a **Hybrid Rendering Strategy**, leveraging Next.js Server Components for data fetching and secure mutations, while keeping Client Components strictly for interactive UI elements.

### 🔑 Key Technical Highlights

* **Zero-Trust Admin Routing:** The `/adm` dashboard is protected via Next.js Server Actions and encrypted HTTP-Only cookies. Administrative logic and mutation functions are never bundled or exposed to the client browser.
* **Multi-Dimensional Search Engine:** Built using native `URLSearchParams` to handle complex intersections of text queries and category filters. This ensures all search states are instantly shareable, SSR-friendly, and highly performant.
* **Contextual Display Engine:** The UI dynamically reads from a relational Supabase structure to render isolated "Showcases" (e.g., Global Highlights vs. Category-Specific Highlights) without hardcoding IDs into the front-end.
* **Z-Index Physics & Layout Shifts:** Custom UI engineering using Tailwind CSS to create fluid, overlapping search interfaces (`sticky top-0`) that override the global layout upon scrolling, maximizing mobile conversion space.
* **RPC (Remote Procedure Call) Integration:** Offloads heavy data extraction (e.g., distinct category mapping) directly to PostgreSQL functions, preventing memory bottlenecks on the Vercel edge network.

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router) / React
* **Styling:** Tailwind CSS
* **Database & BaaS:** Supabase (PostgreSQL)
* **Security:** Supabase RLS (Row Level Security) + Custom HTTP-Only Cookies

## ⚙️ Environment Variables

To run this project locally, create a `.env.local` file in the root directory with the following variables:

```env
# Public Supabase Keys (Safe to expose to the browser)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Master Password for the Admin Dashboard (Server-Side Only)
ADMIN_PASSWORD=your_secure_admin_password
```

## 🚀 How to Run (Local Environment)

1. Clone the repository.
2. Install dependencies:
   **Bash**

   ```
   npm install
   ```
3. Set up your `.env.local` file.
4. Start the development server:
   **Bash**

   ```
   npm run dev
   ```
5. Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) for the storefront and [http://localhost:3000/adm](https://www.google.com/search?q=http://localhost:3000/adm) for the dashboard.

## ☁️ Deployment Strategy

This application is fully optimized for **Vercel** deployment.

* Server Actions seamlessly translate to Serverless Functions.
* Route caching is dynamically invalidated using `revalidatePath()` upon admin mutations, ensuring the storefront is instantly updated without rebuilding the entire site.

---

*Architected and developed by [João Gabriel](https://github.com/your-github-username).*
