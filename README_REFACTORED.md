# Football Prediction API - Refactored Architecture

This document describes the refactored architecture of the Football Prediction API, which now follows SOLID principles and DRY (Don't Repeat Yourself) principles.

## Architecture Overview

The refactored API follows a modular architecture with clear separation of concerns:

```
src/
├── config/                 # Configuration files
├── controllers/            # Base controller and legacy controllers
├── interfaces/             # TypeScript interfaces for entities
├── middleware/             # Express middleware
├── modules/                # Feature modules (league, team, match, etc.)
│   └── league/            # Example module structure
│       ├── league.controller.ts
│       └── league.routes.ts
├── routes/                 # Legacy route files
├── services/               # Base service and specialized services
└── utils/                  # Utility functions
```

## SOLID Principles Implementation

### 1. Single Responsibility Principle (SRP)
Each class and module has only one reason to change:
- `BaseController`: Handles common CRUD operations only
- `BaseService`: Handles common database operations only
- `MatchService`: Handles match-specific operations only
- `LeagueController`: Handles league-specific operations only

### 2. Open/Closed Principle (OCP)
Classes are open for extension but closed for modification:
- Extend `BaseController` for new controllers
- Extend `BaseService` for new services
- Add new modules without modifying existing ones

### 3. Liskov Substitution Principle (LSP)
Subtypes can be substituted for their base types:
- Any controller can use `BaseController` methods
- Any service can use `BaseService` methods

### 4. Interface Segregation Principle (ISP)
Clients depend only on the interfaces they use:
- Specific interfaces for each entity (`League`, `Team`, `Match`, etc.)
- Controllers depend on abstractions, not concrete implementations

### 5. Dependency Inversion Principle (DIP)
High-level modules depend on abstractions, not concrete implementations:
- Controllers depend on the `BaseController` abstraction
- Services depend on the `BaseService` abstraction
- Dependency injection container manages object creation

## Key Components

### BaseController
A generic controller class that provides common CRUD operations:
- `getAll()`: Fetch all records from a table
- `getById()`: Fetch a single record by ID
- `create()`: Create a new record
- `update()`: Update an existing record
- `delete()`: Delete a record
- `sendSuccess()`: Send successful responses
- `sendError()`: Send error responses
- `sendNotFound()`: Send not found responses

### BaseService
A generic service class that provides common database operations:
- `findAll()`: Fetch all records from a table
- `findById()`: Fetch a single record by ID
- `create()`: Create a new record
- `update()`: Update an existing record
- `delete()`: Delete a record
- `findByCriteria()`: Find records by criteria
- `findOneByCriteria()`: Find a single record by criteria

### Dependency Injection Container
Manages object creation and dependency resolution:
- `container.ts`: Centralized dependency management
- Singleton instances for shared services
- Factory functions for creating instances with dependencies

### Module Structure
Organizes code by feature domains:
- Each module contains related controllers, services, and routes
- Clear separation between different business domains
- Easy to extend with new modules

## Benefits of Refactoring

1. **Reduced Code Duplication**: Common operations are implemented once in base classes
2. **Improved Maintainability**: Changes to common functionality only need to be made in one place
3. **Better Testability**: Dependencies can be easily mocked for unit testing
4. **Enhanced Scalability**: New features can be added without modifying existing code
5. **Clearer Architecture**: Code organization follows business domain boundaries
6. **Type Safety**: TypeScript interfaces ensure type consistency across the application

## Usage Examples

### Creating a New Controller
```typescript
import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { League } from '../interfaces';
import { catchAsync } from '../middleware/errorHandler';
import container from '../config/container';

const baseController = container.baseController;

export const getAllLeagues = catchAsync(async (req: Request, res: Response) => {
  return await baseController.getAll<League>(res, container.supabase, 'leagues', 'name');
});
```

### Creating a New Service
```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { League } from '../interfaces';

export class LeagueService extends BaseService {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  // Add league-specific methods here
}
```

### Adding a New Module
1. Create a new directory in `src/modules/`
2. Add controller and route files
3. Register routes in `server.ts`

## Error Handling
The refactored API uses a centralized error handling middleware:
- `errorHandler.ts`: Catches and processes all application errors
- `ApiError`: Custom error class for API-specific errors
- `catchAsync`: Utility for handling async errors in Express routes

This ensures consistent error responses across the entire API.