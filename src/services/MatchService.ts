import { SupabaseClient } from "@supabase/supabase-js";
import { BaseService } from "./BaseService";
import { Match, MatchWithDetails } from "../interfaces";

/**
 * Service class for match-related operations
 * Following SOLID principles:
 * - Single Responsibility Principle: Only handles match-related operations
 * - Open/Closed Principle: Extendable but not modifiable
 * - Dependency Inversion Principle: Depends on abstractions, not concretions
 */
export class MatchService extends BaseService {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  /**
   * Get all matches with optional filtering and related data
   */
  async getAllMatches(filters?: {
    league_id?: string | number;
    date?: string;
    status?: string;
  }): Promise<{ data?: MatchWithDetails[]; error?: any }> {
    try {
      let query = this.supabase
        .from("matches")
        .select(
          `
          *,
          home_team:teams!matches_home_team_id_fkey(name, short_code),
          away_team:teams!matches_away_team_id_fkey(name, short_code),
          league:leagues!matches_league_id_fkey(name)
        `
        )
        .order("match_date", { ascending: false });

      // Apply filters if provided
      if (filters?.league_id) {
        query = query.eq("league_id", filters.league_id);
      }

      if (filters?.date) {
        query = query.eq("match_date::date", filters.date);
      }

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data as MatchWithDetails[] };
    } catch (error: any) {
      return { error };
    }
  }

  /**
   * Get a specific match by ID with related data
   */
  async getMatchById(
    id: string | number
  ): Promise<{ data?: MatchWithDetails; error?: any }> {
    try {
      const { data, error } = await this.supabase
        .from("matches")
        .select(
          `
          *,
          home_team:teams!matches_home_team_id_fkey(name, short_code, logo_url),
          away_team:teams!matches_away_team_id_fkey(name, short_code, logo_url),
          league:leagues!matches_league_id_fkey(name, country)
        `
        )
        .eq("match_id", id)
        .single();
      if (error) {
        return { error };
      }

      return { data: data as MatchWithDetails };
    } catch (error: any) {
      return { error };
    }
  }
}
