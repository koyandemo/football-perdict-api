"use strict";
/**
 * Database Initialization Script
 * This script sets up the initial database schema for the football prediction app
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.initDatabase = initDatabase;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
// Validate environment variables
if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
}
if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}
// Create Supabase client with service role key for server-side operations
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
// Function to initialize the database schema
async function initDatabase() {
    try {
        ('Initializing database schema...');
        // Create Leagues table
        const { error: leaguesError } = await exports.supabase.rpc('execute_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS public.leagues (
          league_id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          country VARCHAR(255) NOT NULL,
          logo_url VARCHAR(500),
          slug VARCHAR UNIQUE
        );
        
        ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view leagues" ON public.leagues
          FOR SELECT USING (true);
          
        CREATE POLICY "Anyone can insert leagues" ON public.leagues
          FOR INSERT WITH CHECK (true);
          
        CREATE POLICY "Anyone can update leagues" ON public.leagues
          FOR UPDATE USING (true);
          
        CREATE POLICY "Anyone can delete leagues" ON public.leagues
          FOR DELETE USING (true);
      `
        });
        if (leaguesError) {
            console.error('Error creating leagues table:', leaguesError);
            throw leaguesError;
        }
        ('✓ Leagues table created successfully');
        // Create Teams table
        const { error: teamsError } = await exports.supabase.rpc('execute_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS public.teams (
          team_id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          short_code VARCHAR(10) NOT NULL,
          logo_url VARCHAR(500),
          country VARCHAR(255) NOT NULL,
          slug VARCHAR UNIQUE
        );
        
        ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view teams" ON public.teams
          FOR SELECT USING (true);
          
        CREATE POLICY "Anyone can insert teams" ON public.teams
          FOR INSERT WITH CHECK (true);
          
        CREATE POLICY "Anyone can update teams" ON public.teams
          FOR UPDATE USING (true);
          
        CREATE POLICY "Anyone can delete teams" ON public.teams
          FOR DELETE USING (true);
      `
        });
        if (teamsError) {
            console.error('Error creating teams table:', teamsError);
            throw teamsError;
        }
        ('✓ Teams table created successfully');
        // Create Matches table
        const { error: matchesError } = await exports.supabase.rpc('execute_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS public.matches (
          match_id SERIAL PRIMARY KEY,
          league_id INTEGER REFERENCES public.leagues(league_id) ON DELETE CASCADE,
          home_team_id INTEGER REFERENCES public.teams(team_id) ON DELETE CASCADE,
          away_team_id INTEGER REFERENCES public.teams(team_id) ON DELETE CASCADE,
          match_date DATE NOT NULL,
          match_time TIME NOT NULL,
          venue VARCHAR(255),
          status VARCHAR(50) DEFAULT 'Upcoming',
          slug VARCHAR UNIQUE,
          allow_draw BOOLEAN DEFAULT true
        );
        
        ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view matches" ON public.matches
          FOR SELECT USING (true);
          
        CREATE POLICY "Anyone can insert matches" ON public.matches
          FOR INSERT WITH CHECK (true);
          
        CREATE POLICY "Anyone can update matches" ON public.matches
          FOR UPDATE USING (true);
          
        CREATE POLICY "Anyone can delete matches" ON public.matches
          FOR DELETE USING (true);
      `
        });
        if (matchesError) {
            console.error('Error creating matches table:', matchesError);
            throw matchesError;
        }
        ('✓ Matches table created successfully');
        // Create other necessary tables (simplified)
        const { error: otherTablesError } = await exports.supabase.rpc('execute_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS public.match_outcomes (
          outcome_id SERIAL PRIMARY KEY,
          match_id INTEGER REFERENCES public.matches(match_id) ON DELETE CASCADE,
          home_win_prob INTEGER CHECK (home_win_prob >= 0 AND home_win_prob <= 100),
          draw_prob INTEGER CHECK (draw_prob >= 0 AND draw_prob <= 100),
          away_win_prob INTEGER CHECK (away_win_prob >= 0 AND away_win_prob <= 100),
          CONSTRAINT unique_match_outcome UNIQUE (match_id)
        );
        
        CREATE TABLE IF NOT EXISTS public.user_predictions (
          prediction_id SERIAL PRIMARY KEY,
          user_id INTEGER,
          match_id INTEGER REFERENCES public.matches(match_id) ON DELETE CASCADE,
          predicted_winner VARCHAR(50),
          prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS public.score_predictions (
          score_pred_id SERIAL PRIMARY KEY,
          match_id INTEGER REFERENCES public.matches(match_id) ON DELETE CASCADE,
          home_score INTEGER,
          away_score INTEGER,
          vote_count INTEGER DEFAULT 0
        );
        
        CREATE TABLE IF NOT EXISTS public.comments (
          comment_id SERIAL PRIMARY KEY,
          match_id INTEGER REFERENCES public.matches(match_id) ON DELETE CASCADE,
          user_id INTEGER,
          comment_text TEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Enable RLS on all tables
        ALTER TABLE public.match_outcomes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.user_predictions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.score_predictions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
      `
        });
        if (otherTablesError) {
            console.error('Error creating other tables:', otherTablesError);
            throw otherTablesError;
        }
        ('✓ Other tables created successfully');
        // Create slug functions and triggers
        const { error: functionsError } = await exports.supabase.rpc('execute_sql', {
            sql: `
        -- Function to generate slug from text
        CREATE OR REPLACE FUNCTION public.slugify(text_input TEXT)
        RETURNS TEXT AS $$
        BEGIN
          RETURN lower(trim(regexp_replace(text_input, '[^a-zA-Z0-9]+', '-', 'g'), '-'));
        END;
        $$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;
        
        -- Function to generate league slug
        CREATE OR REPLACE FUNCTION public.generate_league_slug()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.slug := slugify(NEW.name || '-' || NEW.country);
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SET search_path = public;
        
        -- Function to generate team slug
        CREATE OR REPLACE FUNCTION public.generate_team_slug()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.slug := slugify(NEW.name);
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SET search_path = public;
        
        -- Triggers for automatic slug generation
        DROP TRIGGER IF EXISTS set_league_slug ON public.leagues;
        CREATE TRIGGER set_league_slug
        BEFORE INSERT OR UPDATE ON public.leagues
        FOR EACH ROW
        EXECUTE FUNCTION public.generate_league_slug();
        
        DROP TRIGGER IF EXISTS set_team_slug ON public.teams;
        CREATE TRIGGER set_team_slug
        BEFORE INSERT OR UPDATE ON public.teams
        FOR EACH ROW
        EXECUTE FUNCTION public.generate_team_slug();
      `
        });
        if (functionsError) {
            console.error('Error creating functions:', functionsError);
            throw functionsError;
        }
        ('✓ Functions and triggers created successfully');
        ('\n🎉 Database initialization completed successfully!');
        ('\nNext steps:');
        ('1. Restart your API server: npm run dev');
        ('2. Test the league functionality in your admin panel');
    }
    catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}
// Run initialization if this file is executed directly
if (require.main === module) {
    initDatabase().then(() => {
        ('Database setup completed');
        process.exit(0);
    }).catch((error) => {
        console.error('Database setup failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=initDatabase.js.map