# NutriKart Deployment Guide

This guide outlines the steps to deploy the NutriKart Full-Stack application into a production environment.

## 1. Prerequisites
- A **Supabase** Project (for managed PostgreSQL database, Authentication, and Storage).
- A **Spoonacular API Key**.
- A standard VPS provider (AWS EC2, DigitalOcean, Render, or Railway) to host the Express application.
- **Vercel** or **Netlify** to host the React Frontend.
- A valid domain name (optional).

## 2. Infrastructure Setup (Supabase)

1. **Create Project**: Sign in to Supabase and create a new project.
2. **Setup Schema**: Navigate to the Supabase SQL Editor and execute the `db/supabase_schema.sql` script to generate tables for users, admins, restaurants, food_items, and orders.
3. **Configure Authentication**: 
   - Enable Email Sign-In.
   - Set up API endpoints for custom Role-Based metadata tracking via JWT if applicable.
4. **Configure Storage**:
   - Create a new public bucket named `vendor-documents` for FSSAI, Shop License, and Restaurant ID Proof URLs.

## 3. Backend Deployment (Node.js/Express)

Option 1: **Render / Railway (PaaS)**
1. Connect your Git repository to Render/Railway.
2. Select the `backend` folder as your root directory via the provider settings.
3. Configure the **Environment Variables**:
   ```
   PORT=5000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   SPOONACULAR_API_KEY=your_spoonacular_api_key
   ```
4. Set the Build Command: `npm install`
5. Set the Start Command: `npm start` (or `node server.js`)
6. Deploy and copy the assigned API URL (e.g., `https://nutrikart-api.onrender.com`).

## 4. Frontend Deployment (Vite/React via Vercel)

1. Connect your Git repository to Vercel.
2. Set the Root Directory to `frontend`.
3. Vercel will automatically detect the **Vite** framework.
4. Add the **Environment Variables** for Vite:
   ```
   VITE_API_BASE_URL=https://nutrikart-api.onrender.com
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Install Command: `npm install`
8. Click Deploy.

## 5. First-Time Initialization
1. Visit the deployed frontend URL.
2. Register an account with the role "admin".
3. Since this is the first registration, it will bypass the 2-admin limit check and assign you maximum permissions.
4. Have your vendors signup, submit their restaurant docs, and await your approval via the admin dashboard!
