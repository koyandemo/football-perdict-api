import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Generic interface for database operation results
 */
export interface DatabaseResult<T> {
  data?: T;
  error?: any;
}

/**
 * Base service class implementing common database operations
 * Following SOLID principles:
 * - Single Responsibility Principle: Each method has one reason to change
 * - Open/Closed Principle: Extendable but not modifiable
 * - Dependency Inversion Principle: Depends on abstractions, not concretions
 */
export class BaseService {
  protected supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Generic method to fetch all records from a table
   */
  public async findAll<T>(
    tableName: string,
    orderBy: string = 'created_at',
    selectFields: string = '*'
  ): Promise<DatabaseResult<T[]>> {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select(selectFields)
        .order(orderBy);

      if (error) throw error;

      return { data: data as T[] };
    } catch (error: any) {
      return { error };
    }
  }

  /**
   * Generic method to fetch a single record by ID
   */
  public async findById<T>(
    tableName: string,
    id: string | number,
    idField: string = 'id',
    selectFields: string = '*'
  ): Promise<DatabaseResult<T>> {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select(selectFields)
        .eq(idField, id)
        .single();

      if (error) {
        return { error };
      }

      return { data: data as T };
    } catch (error: any) {
      return { error };
    }
  }

  /**
   * Generic method to create a new record
   */
  public async create<T>(
    tableName: string,
    payload: Partial<T>,
    selectFields: string = '*'
  ): Promise<DatabaseResult<T>> {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .insert([payload as any])
        .select(selectFields)
        .single();

      if (error) throw error;

      return { data: data as T };
    } catch (error: any) {
      return { error };
    }
  }

  /**
   * Generic method to update a record by ID
   */
  public async update<T>(
    tableName: string,
    id: string | number,
    payload: Partial<T>,
    idField: string = 'id',
    selectFields: string = '*'
  ): Promise<DatabaseResult<T>> {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .update(payload as any)
        .eq(idField, id)
        .select(selectFields)
        .single();

      if (error) {
        return { error };
      }

      return { data: data as T };
    } catch (error: any) {
      return { error };
    }
  }

  /**
   * Generic method to delete a record by ID
   */
  public async delete(
    tableName: string,
    id: string | number,
    idField: string = 'id'
  ): Promise<DatabaseResult<boolean>> {
    try {
      const { error } = await this.supabase
        .from(tableName)
        .delete()
        .eq(idField, id);

      if (error) {
        return { error };
      }

      return { data: true };
    } catch (error: any) {
      return { error };
    }
  }

  /**
   * Generic method to find records by criteria
   */
  public async findByCriteria<T>(
    tableName: string,
    criteria: Record<string, any>,
    selectFields: string = '*'
  ): Promise<DatabaseResult<T[]>> {
    try {
      let query = this.supabase.from(tableName).select(selectFields);

      // Apply criteria
      Object.keys(criteria).forEach(key => {
        query = query.eq(key, criteria[key]);
      });

      const { data, error } = await query;

      if (error) throw error;

      return { data: data as T[] };
    } catch (error: any) {
      return { error };
    }
  }

  /**
   * Generic method to find a single record by criteria
   */
  public async findOneByCriteria<T>(
    tableName: string,
    criteria: Record<string, any>,
    selectFields: string = '*'
  ): Promise<DatabaseResult<T>> {
    try {
      let query = this.supabase.from(tableName).select(selectFields);

      // Apply criteria
      Object.keys(criteria).forEach(key => {
        query = query.eq(key, criteria[key]);
      });

      const { data, error } = await query.single();

      if (error) {
        return { error };
      }

      return { data: data as T };
    } catch (error: any) {
      return { error };
    }
  }
}