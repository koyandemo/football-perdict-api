import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { BaseController } from '../controllers/BaseController';
import { BaseService } from '../services/BaseService';
import { MatchService } from '../services/MatchService';

/**
 * Dependency Injection Container
 * Following SOLID principles:
 * - Dependency Inversion Principle: High-level modules depend on abstractions
 * - Single Responsibility Principle: Each factory has one reason to change
 */

// Service container interface
export interface ServiceContainer {
  supabase: SupabaseClient;
  baseController: BaseController;
  baseService: BaseService;
  matchService: MatchService;
}

// Create and configure the service container
class DIContainer implements ServiceContainer {
  public supabase: SupabaseClient;
  public baseController: BaseController;
  public baseService: BaseService;
  public matchService: MatchService;

  constructor() {
    this.supabase = supabase;
    this.baseController = new BaseController();
    this.baseService = new BaseService(this.supabase);
    this.matchService = new MatchService(this.supabase);
  }
}

// Export singleton instance
export const container = new DIContainer();

// Factory functions for creating instances with dependencies
export const createBaseController = (): BaseController => {
  return new BaseController();
};

export const createBaseService = (supabase: SupabaseClient): BaseService => {
  return new BaseService(supabase);
};

export const createMatchService = (supabase: SupabaseClient): MatchService => {
  return new MatchService(supabase);
};

export default container;