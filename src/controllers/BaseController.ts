import { Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Generic interface for API responses
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Base controller class implementing common CRUD operations
 * Following SOLID principles, specifically:
 * - Single Responsibility Principle: Each method has one reason to change
 * - Open/Closed Principle: Extendable but not modifiable
 * - Dependency Inversion Principle: Depends on abstractions, not concretions
 */
export class BaseController {
  /**
   * Unified response formatter
   * @param res Express Response object
   * @param statusCode HTTP status code
   * @param data Response data
   * @returns Formatted JSON response
   */
  public sendResponse<T>(
    res: Response,
    statusCode: number,
    data: ApiResponse<T>
  ): Response {
    return res.status(statusCode).json(data);
  }

  /**
   * Handle successful responses
   */
  public sendSuccess<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    return this.sendResponse(res, statusCode, {
      success: true,
      message,
      data
    });
  }

  /**
   * Handle error responses
   */
  public sendError(
    res: Response,
    message: string,
    error?: any,
    statusCode: number = 500
  ): Response {
    console.error(message, error);
    return this.sendResponse(res, statusCode, {
      success: false,
      message,
      error: error?.message || error?.toString() || 'Unknown error'
    });
  }

  /**
   * Handle not found responses
   */
  public sendNotFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    return this.sendResponse(res, 404, {
      success: false,
      message
    });
  }

  /**
   * Generic method to fetch all records from a table
   */
  public async getAll<T>(
    res: Response,
    supabase: SupabaseClient,
    tableName: string,
    orderBy: string = 'created_at',
    selectFields: string = '*'
  ): Promise<Response> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(selectFields)
        .order(orderBy);

      if (error) throw error;

      return this.sendSuccess(res, data);
    } catch (error: any) {
      return this.sendError(
        res,
        `Failed to fetch ${tableName}`,
        error
      );
    }
  }

  /**
   * Generic method to fetch a single record by ID
   */
  public async getById<T>(
    res: Response,
    supabase: SupabaseClient,
    tableName: string,
    id: string | number,
    idField: string = 'id',
    selectFields: string = '*'
  ): Promise<Response> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(selectFields)
        .eq(idField, id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return this.sendNotFound(res, `${tableName} not found`);
        }
        throw error;
      }

      return this.sendSuccess(res, data);
    } catch (error: any) {
      return this.sendError(
        res,
        `Failed to fetch ${tableName}`,
        error
      );
    }
  }

  /**
   * Generic method to create a new record
   */
  public async create<T>(
    res: Response,
    supabase: SupabaseClient,
    tableName: string,
    payload: Partial<T>,
    selectFields: string = '*'
  ): Promise<Response> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert([payload as any])
        .select(selectFields)
        .single();

      if (error) throw error;

      return this.sendSuccess(
        res,
        data,
        `${tableName} created successfully`,
        201
      );
    } catch (error: any) {
      return this.sendError(
        res,
        `Failed to create ${tableName}`,
        error,
        400
      );
    }
  }

  /**
   * Generic method to update a record by ID
   */
  public async update<T>(
    res: Response,
    supabase: SupabaseClient,
    tableName: string,
    id: string | number,
    payload: Partial<T>,
    idField: string = 'id',
    selectFields: string = '*'
  ): Promise<Response> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(payload as any)
        .eq(idField, id)
        .select(selectFields)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return this.sendNotFound(res, `${tableName} not found`);
        }
        throw error;
      }

      if (!data) {
        return this.sendNotFound(res, `${tableName} not found`);
      }

      return this.sendSuccess(
        res,
        data,
        `${tableName} updated successfully`
      );
    } catch (error: any) {
      return this.sendError(
        res,
        `Failed to update ${tableName}`,
        error,
        400
      );
    }
  }

  /**
   * Generic method to delete a record by ID
   */
  public async delete(
    res: Response,
    supabase: SupabaseClient,
    tableName: string,
    id: string | number,
    idField: string = 'id'
  ): Promise<Response> {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(idField, id);

      if (error) {
        if (error.code === 'PGRST116') {
          return this.sendNotFound(res, `${tableName} not found`);
        }
        throw error;
      }

      return this.sendSuccess(
        res,
        undefined,
        `${tableName} deleted successfully`
      );
    } catch (error: any) {
      return this.sendError(
        res,
        `Failed to delete ${tableName}`,
        error
      );
    }
  }
}