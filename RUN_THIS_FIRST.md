# 🏁 FIRST STEP - CREATE DATABASE TABLES

You need to run the SQL schema directly in your Supabase dashboard:

## Steps:

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com/
   - Select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Copy the SQL Schema**
   - Open the file: `/Users/waiyan/tissy/beperdict/football-perdict-api/init-schema.sql`
   - Copy all the content

4. **Paste and Run in Supabase**
   - Paste the SQL into the Supabase SQL Editor
   - Click "RUN" to execute

5. **Restart Your API Server**
   ```bash
   # In your terminal, press Ctrl+C to stop the server
   # Then start it again:
   npm run dev
   ```

This will:
- Create all necessary tables (leagues, teams, matches, etc.)
- Set up proper relationships between tables
- Configure security policies
- Add automatic slug generation functions
- Insert a test league to verify everything works

After completing these steps, the PGRST205 error should be resolved!