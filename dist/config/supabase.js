"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
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
//# sourceMappingURL=supabase.js.map