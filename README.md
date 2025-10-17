## Running the app

```bash
npm install
npm run dev
```

## Building the app

```bash
npm run build
```

# Supabase Setup Guide

This guide will help you set up Supabase for your FlowMint application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization and enter project details:
   - Name: `flowmint2`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
4. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to Settings → API in your Supabase dashboard
2. Copy the following values:
   - Project URL
   - Anon public key

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## 4. Set Up the Database

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `database/schema.sql`
3. Paste and run the SQL to create all tables, indexes, and RLS policies

## 5. Configure Authentication

1. Go to Authentication → Settings in your Supabase dashboard
2. Enable Google OAuth:
   - Add your Google OAuth client ID and secret
   - Set the redirect URL to: `http://localhost:5173/auth/callback`
3. Configure JWT settings:
   - Set JWT expiry to 3600 seconds (1 hour)
   - Enable email confirmations if desired

## 6. Set Up Row Level Security (RLS)

The schema includes RLS policies that will be automatically applied. These policies:

- Allow back office admins to access all data
- Restrict company admins to their company's data
- Limit company users to their own transactions

## 7. Test the Integration

1. Start your development server: `npm run dev`
2. Try signing in with Google
3. Check that data loads correctly in the dashboard

## 8. Production Deployment

For production:

1. Update your Google OAuth redirect URLs to include your production domain
2. Update the Supabase redirect URLs in Authentication settings
3. Set up proper environment variables in your hosting platform