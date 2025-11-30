# User Authentication API

This document describes the user authentication system for the Football Prediction API.

## Database Schema

The users table has the following structure:

```sql
CREATE TABLE IF NOT EXISTS public.users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(20) CHECK (provider IN ('google', 'facebook', 'twitter', 'email')) NOT NULL,
  password VARCHAR(255),
  type VARCHAR(10) CHECK (type IN ('user', 'admin', 'seed')) DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### User Registration

**POST** `/api/users/register`

Registers a new user.

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "provider": "email",
  "type": "user"
}
```

#### Response
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "email",
    "type": "user",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### User Login

**POST** `/api/users/login`

Logs in a user with email and password.

#### Request Body
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Response
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "email",
    "type": "user",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### Get User Profile

**GET** `/api/users/profile`

Retrieves the authenticated user's profile.

#### Headers
```
Authorization: Bearer jwt_token_here
```

#### Response
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "email",
    "type": "user",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### Admin Access

**GET** `/api/users/admin`

Verifies admin access for the authenticated user.

#### Headers
```
Authorization: Bearer jwt_token_here
```

#### Response
```json
{
  "success": true,
  "message": "Admin access granted",
  "user": {
    "user_id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "provider": "email",
    "type": "admin",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

## Environment Variables

The following environment variables are used for authentication:

```
JWT_SECRET=football_prediction_jwt_secret_key
JWT_EXPIRES_IN=24h
```

## Default Admin User

A default admin user is created with the following credentials:

- Email: `admin@example.com`
- Password: `admin123`
- Type: `admin`

**Important:** Change the default admin password in production!