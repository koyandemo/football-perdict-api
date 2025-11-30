# Football Prediction API

This is the backend API for the Football Prediction application.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the required values:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - JWT_SECRET
   - PORT (default: 3001)

3. Run database migrations:
   Apply the SQL migrations in the `supabase/migrations` folder in order.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The API will be available at `http://localhost:3001`

## API Endpoints

- `/api/leagues` - League management
- `/api/teams` - Team management
- `/api/matches` - Match management
- `/api/users` - User management
- `/api/predictions` - Prediction management
- `/api/comments` - Comment management

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Admin Users

Default admin user:
- Email: admin@example.com
- Password: admin123

Additional admin user:
- Email: admin@gmail.com
- Password: admin123