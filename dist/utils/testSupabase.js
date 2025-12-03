"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSupabaseConnection = void 0;
const supabase_1 = require("../config/supabase");
// Test Supabase connection
const testSupabaseConnection = async () => {
    try {
        // Test query to check if we can connect to the database
        const { data, error } = await supabase_1.supabase
            .from('leagues')
            .select('*')
            .limit(1);
        if (error) {
            console.error('Supabase connection test failed:', error);
            return false;
        }
        ('Supabase connection test successful');
        return true;
    }
    catch (error) {
        console.error('Supabase connection test failed with exception:', error);
        return false;
    }
};
exports.testSupabaseConnection = testSupabaseConnection;
//# sourceMappingURL=testSupabase.js.map