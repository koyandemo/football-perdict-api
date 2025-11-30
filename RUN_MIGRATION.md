# How to Run Database Migrations

To set up the users table and enable authentication, you need to run the database migration in your Supabase dashboard.

## Steps:

1. **Open your Supabase Dashboard**
   - Go to https://app.supabase.com/
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Copy the Migration File**
   - Open the file: `/Users/waiyan/tissy/beperdict/football-perdict-api/supabase/migrations/20251130002000_create_users_table.sql`
   - Copy all the content

4. **Run the Migration**
   - Paste the content into the Supabase SQL Editor
   - Click "RUN" to execute

5. **Restart Your API Server**
   ```bash
   # In your terminal:
   # Press Ctrl+C to stop the server
   # Then run:
   npm run dev
   ```

## After Migration

After running the migration, you'll have:
- A `users` table with all required fields
- A default admin user with:
  - Email: `admin@example.com`
  - Password: `admin123`
- All necessary indexes and security policies

The authentication system will then be fully functional.